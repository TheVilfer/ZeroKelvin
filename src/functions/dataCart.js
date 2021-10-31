const md5 = require("blueimp-md5");
const mongoUtil = require("mongodb");
const PromoCore = require("../scripts/modules/PromoSystemCore.js");
const CartUtils = require("../scripts/modules/CartUtils.js");
const DbCore = require("../scripts/modules/dbCore.js");
const Amo = require("../scripts/modules/AmoLibrary.js");

const MERCHANTLOGIN = process.env.MERCHANTLOGIN;
const PASSWORD_ONE = process.env.PASSWORD_ONE;

let outSum = 0;
let description = "Покупка в научном магазине Ноль Кельвин";
let signatureValue = "";
let link = "";

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  let ids = [];
  let ids_box = [];
  let ids_elBox = [];
  let cart = JSON.parse(event.body);
  console.log(cart);
  for (const key of Object.keys(cart.products)) {
    if (key.split(";")[0] == "box") {
      ids_elBox = Array.from(
        new Set(ids_elBox.concat(cart.products[key].subdata.ids))
      );
      ids_box.push(key);
      continue;
    }
    ids.push(key);
  }
  ids = Array.from(new Set(ids.concat(ids_elBox)));
  console.log(ids);
  (
    await DbCore.Query("products", {
      _id: { $in: DbCore.ConvertArrayToObjectID(ids) },
    })
  ).forEach((el) => {
    console.log(el);
    console.log(cart.products[el._id]);
    if (typeof cart.products[el._id] != "undefined") {
      cart.products[el._id].name = el.name;
      cart.products[el._id].price = el.price;
    }
    ids_box.forEach((idB) => {
      if (typeof cart.products[idB].subdata.items[el._id] != "undefined") {
        cart.products[idB].subdata.items[el._id].name = el.name;
        cart.products[idB].subdata.items[el._id].price = el.price;
      }
    });
  });
  ids_box.forEach((el) => {
    let tPrice = 0;
    let tDesc = "Состав бокса: ";
    for (let lTem in cart.products[el].subdata.items) {
      tDesc += cart.products[el].subdata.items[lTem].name + ", ";
      tPrice += cart.products[el].subdata.items[lTem].price;
    }
    tDesc = tDesc.slice(0, tDesc.length - 2);
    cart.products[el].price = tPrice;
    cart.contact.comment += "\n" + tDesc;
  });
  console.log(cart.products);
  if (cart.detail.promocode == "") {
    cart.products["delivery"] = {};
    cart.products["delivery"].name = "Доставка";
    cart.products["delivery"].count = 1;
    cart.products["delivery"].price = await ChooseDelivery(cart.products);
    cart.detail.totalprice = CartUtils.GetTotalPrice(cart.products);
  } else {
    const DeliveryPrice = await ChooseDelivery(cart.products);
    let PromoData = await PromoCore.Validator(
      cart.products,
      cart.detail.promocode
    );
    cart.products = PromoData.cart;
    cart.detail.totalprice = PromoData.totalprice;
    cart.products["delivery"] = {};
    cart.products["delivery"].name = "Доставка";
    cart.products["delivery"].count = 1;
    cart.products["delivery"].price = DeliveryPrice;
    cart.detail.totalprice += DeliveryPrice;
  }
  outSum = cart.detail.totalprice;
  let lead = await AddOrderToAmo(cart);
  await GenerateSignatureValue(lead);
  await GenerateLink(lead);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: link,
    }),
  };
};
const GenerateSignatureValue = async (lead_id) => {
  signatureValue = md5(
    MERCHANTLOGIN + ":" + outSum + ":" + lead_id + ":" + PASSWORD_ONE
  );
};
const GenerateLink = async (lead_id) => {
  link = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MERCHANTLOGIN}&OutSum=${outSum}&InvoiceID=${lead_id}&Description=${description}&SignatureValue=${signatureValue}`;
};
const AddOrderToAmo = async (cart) => {
  const lead_complex = [
    {
      name: "Заказ с сайта",
      price: cart.detail.totalprice,
      status_id: 39483091,
      pipeline_id: 4202485,
      _embedded: {
        contacts: [
          {
            first_name: cart.contact["given-name"],
            last_name: cart.contact["family-name"],
            custom_fields_values: [
              {
                field_id: 28481,
                values: [
                  {
                    value: cart.contact.tel,
                    enum_code: "MOB",
                  },
                ],
              },
              {
                field_id: 28483,
                values: [
                  {
                    value: cart.contact.email,
                    enum_code: "PRIV",
                  },
                ],
              },
              {
                field_id: 988783,
                values: [
                  {
                    value:
                      "Улица: " +
                      cart.contact.street +
                      "корпус " +
                      cart.contact.housing,
                    enum_id: 1,
                  },
                  {
                    value: "Квартира: " + cart.contact.room,
                    enum_id: 2,
                  },
                  {
                    value: "Город: " + cart.contact.city,
                    enum_id: 3,
                  },
                  {
                    value: "Область: " + cart.contact.state,
                    enum_id: 4,
                  },
                  {
                    value: "Индекс: " + cart.contact.postalcode,
                    enum_id: 5,
                  },
                  {
                    value: cart.contact.country,
                    enum_id: 6,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ];
  try {
    let prom = Amo.Init("tokens", "60c0e125e35a6baee25a652e");
    console.log("babaka");
    let invoice_elements = [];
    for (const value of Object.values(cart.products)) {
      invoice_elements.push({
        value: {
          description: value.name,
          unit_price: value.price,
          quantity: value.count,
          unit_type: "шт.",
        },
      });
    }
    let invoice = [
      {
        name: "Cчет",
        custom_fields_values: [
          {
            field_id: 982493,
            values: [
              {
                value: "Создан",
              },
            ],
          },
          {
            field_id: 982503,
            values: invoice_elements,
          },
          {
            field_id: 982505,
            values: [
              {
                value: cart.contact.comment,
              },
            ],
          },
          {
            field_id: 982507,
            values: [
              {
                value: cart.detail.totalprice,
              },
            ],
          },
          {
            field_id: 1023598,
            values: [
              {
                value: cart.detail.promocode,
              },
            ],
          },
        ],
      },
    ];
    await prom;
    prom = Promise.all([
      Amo.Request("/api/v4/leads/complex", lead_complex),
      Amo.Request("/api/v4/catalogs/8693/elements", invoice),
    ]);
    let list = await prom;
    const AmoId = {
      lead_id: list[0][0]["id"],
      invoice_id: list[1]["_embedded"]["elements"][0]["id"],
    };
    const AmoLink = [
      {
        to_entity_id: AmoId.invoice_id,
        to_entity_type: "catalog_elements",
        metadata: {
          catalog_id: 8693,
        },
      },
    ];
    prom = Promise.all([
      Amo.Request("/api/v4/leads/" + AmoId.lead_id + "/link", AmoLink),
    ]);
    list = await prom;
    console.log(JSON.stringify(list));
    return AmoId.lead_id;
  } catch (error) {
    console.error("Failed add order to Amo: " + error);
    throw new Error("Failed add order to Amo: " + error);
  }
};
const ChooseDelivery = async (cart) => {
  let local_shopper = 0;
  let local_stickers = 0;
  let local_cards = 0;
  let local_kits = 0;
  let local_pin = 0;
  let local_boxs = 0;
  for (const [key, value] of Object.entries(cart)) {
    if (value.type == "СТИКЕРЫ") {
      local_stickers += 1 * value.count;
      continue;
    }
    if (value.type == "ШОППЕРЫ") {
      local_shopper += 1 * value.count;
      continue;
    }
    if (value.type == "ЗНАЧКИ") {
      local_pin += 1 * value.count;
      continue;
    }
    if (value.type == "АКЦИИ") {
      local_kits += 1 * value.count;
      continue;
    }
    if (value.type == "ОТКРЫТКИ") {
      local_cards += 1 * value.count;
      continue;
    }
    if (value.type == "БОКСЫ") {
      local_boxs += 1 * value.count;
      continue;
    }
  }
  if (local_shopper > 2) {
    return 0;
  }
  if (local_shopper > 0 || local_boxs > 0) {
    return 350;
  }
  if (local_pin > 0 || local_stickers > 19) {
    return 250;
  }
  if (local_stickers > 0 || local_cards > 0 || local_kits > 0) {
    return 120;
  }
  return 0;
};
