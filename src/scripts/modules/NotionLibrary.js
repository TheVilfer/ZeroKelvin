const Notion = require("@notionhq/client");
const moment = require("moment");
let online = false;
class DataBase {
  constructor(
    DbId,
    key = "secret_oGbsIM9Pl1v5VluIik0cZq7gseywmxkBgnqGRWQ9EZv"
  ) {
    this._dbId = DbId;
    this._client = new Notion.Client({
      auth: process.env.NOTION_API_KEY || key,
    });
    this.Connect();
  }
  Connect() {
    if (!online) {
      return true;
    }
    try {
      this._client.users.list();
      online = true;
      return true;
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при подключении: " + error);
    }
  }
  async Add(data) {
    try {
      return await this._client.pages.create(data);
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при добавлении данных: " + error);
    }
  }
  async Get(data) {
    try {
      return await this._client.databases.query(data);
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при получении данных: " + error);
    }
  }
  async CreateDataBase(data) {
    try {
      return await this._client.databases.create(data);
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при создании базы данных: " + error);
    }
  }

  async GetPageContent(data) {
    try {
      return await this._client.blocks.children.list(data);
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при получении данных: " + error);
    }
  }

  async Update(data) {
    try {
      return await this._client.pages.update(data);
    } catch (error) {
      throw new Error("[Notion CRM] Ошибка при получении данных: " + error);
    }
  }
  _dbId = 0;
  _client;
}
class OrderDB extends DataBase {
  constructor(DbId) {
    super(DbId);
  }
  async Add(cart, contactId, orderId) {
    let data = {
      parent: {
        database_id: this._dbId,
      },
      properties: {
        Статус: {
          select: {
            name: "⏳ Оплачивается",
          },
        },
        "Номер заказа": {
          title: [
            {
              text: {
                content: orderId + "",
              },
            },
          ],
        },
        Сумма: {
          number: parseInt(cart.detail.totalprice),
        },
        Покупатель: {
          relation: [
            {
              id: contactId,
            },
          ],
        },
        "Дата создание заказа": {
          date: {
            start: moment().format(),
          },
        },
        Промокод: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "" + cart.detail.promocode,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            text: [
              {
                type: "text",
                text: {
                  content: `Страна: ${cart.contact.country}\nОбласть: ${cart.contact.state}\nГород: ${cart.contact.city}\nУлица: ${cart.contact.street}\nКорпус: ${cart.contact.housing}\nКвартира: ${cart.contact.room}\nИндекс: ${cart.contact.postalcode}`,
                },
              },
            ],
          },
        },
        {
          object: "block",
          type: "callout",
          callout: {
            text: [
              {
                type: "text",
                text: {
                  content: "" + cart.contact.comment,
                },
              },
            ],
            icon: {
              emoji: "⭐",
            },
          },
        },
      ],
    };
    let responce = await super.Add(data);
    this._orderPageId = responce.id;
    return responce;
  }
  async AddElementToListOrder(cart) {
    if (typeof this._orderListId == "undefined") {
      throw new Error("[Notion CRM] Не найден ID листа заказа");
    }
    Object.values(cart.products).forEach(async (el) => {
      await super.Add({
        parent: {
          database_id: this._orderListId,
        },
        properties: {
          "Название товара": {
            title: [
              {
                text: {
                  content: el.name,
                },
              },
            ],
          },
          Количество: {
            number: parseInt(el.count),
          },
          Цена: {
            number: parseInt(el.price * el.count),
          },
        },
      });
    });
  }
  async CreateDbListOrder() {
    if (typeof this._orderPageId == "undefined") {
      throw new Error("[Notion CRM] Не найден ID страницы заказа");
    }
    let resp = await super.CreateDataBase({
      parent: {
        type: "page_id",
        page_id: this._orderPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: "Товары в заказе",
            link: null,
          },
        },
      ],
      properties: {
        "Название товара": {
          title: {},
        },
        Количество: {
          number: {},
        },
        Цена: {
          number: {
            format: "ruble",
          },
        },
      },
    });
    this._orderListId = resp.id;
    return resp;
  }
  async UpdateStatus() {
    let resp = await super.Update({
      page_id: this._orderPageId,
      properties: {
        Статус: {
          select: {
            name: "✔️ Оплачено",
          },
        },
      },
    });
    return resp;
  }
  async Find(orderNum) {
    let resp = await super.Get({
      database_id: this._dbId,
      filter: {
        property: "Номер заказа",
        text: {
          contains: "" + orderNum,
        },
      },
    });
    this._orderPageId = resp.results[0].id;
    return resp.results[0];
  }

  _orderData = {};
  _orderPageId;
  _orderListId;
}

class ContactDB extends DataBase {
  constructor(dbId) {
    super(dbId);
  }
  async Add(cart) {
    let resp = await super.Add({
      parent: {
        database_id: this._dbId,
      },
      properties: {
        Имя: {
          title: [
            {
              text: {
                content: `${cart.contact["given-name"]} ${cart.contact["family-name"]}`,
              },
            },
          ],
        },
        "Номер телефона": {
          rich_text: [
            {
              type: "text",
              text: {
                content: `${cart.contact.tel}`,
              },
            },
          ],
        },
        email: {
          rich_text: [
            {
              type: "text",
              text: {
                content: `${cart.contact.email}`,
              },
            },
          ],
        },
      },
    });
    this._contactPageId = resp.id;
    return resp;
  }
  async Find(phone) {
    let resp = await super.Get({
      database_id: this._dbId,
      filter: {
        property: "Номер телефона",
        text: {
          contains: "" + phone,
        },
      },
    });
    if (resp.results.length > 0) {
      this._contactPageId = resp.results[0].id;
      return resp.results[0];
    } else {
      return false;
    }
  }
  get id() {
    return this._contactPageId;
  }
  _contactPageId;
}

async function main() {
  let contact = new ContactDB("43c93433c619428ebe683115baa214ba");
  //   let items = new OrderDB("8a127df18f15497db0ef5d423b746ac5");
  // console.log(
  //   (
  //     await items.GetPageContent({
  //       block_id: "a7b565d2-c5c0-4453-bee8-d36e0bed930e",
  //     })
  //   ).results
  // );
  // console.log(
  //   (
  //     await items.Get({
  //       database_id: "8a127df18f15497db0ef5d423b746ac5",
  //     })
  //   ).results[0].properties["Статус"]
  // );
  // console.log(await contact.Add({}));
  // console.log(await items.Add({}, contact.id));
  // console.log(await items.CreateDbListOrder());
  // console.log(
  //   await items.AddElementToListOrder([
  //     { title: "Тест", count: "5", price: "350" },
  //   ])
  // );
  // console.log(await items.UpdateStatus());
  console.log(await contact.Find("34423"));
  // console.log(await items.Find("54342342"));
  // console.log(await items.UpdateStatus());
}

(async () => {
  await main();
})();

module.exports = {
  ContactDB: ContactDB,
  DataBase: DataBase,
  OrderDB: OrderDB,
};
