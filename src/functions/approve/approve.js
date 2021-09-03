const nodemailer = require("nodemailer");
const nunjucks = require("nunjucks");
nunjucks.configure(__dirname);
const Amo = require("../../scripts/modules/AmoLibrary.js");
const md5 = require("blueimp-md5");
const querystring = require("querystring");
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

let transporter = nodemailer.createTransport({
  host: "smtp.yandex.ru",
  port: 465,
  secure: true,
  auth: {
    user: "info@zerokelvin.ru",
    pass: process.env.MAIL_PASSWORD,
  },
});

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  let respAmo = Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  const data = querystring.parse(event.body);
  const newSV = md5(
    `${data.OutSum}:${data.InvId}:${process.env.PASSWORD_TWO}`
  ).toUpperCase();
  if (data.SignatureValue != newSV) {
    console.error("INVALID SIGNATURE VALUE");
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "text/plain",
      },
      body: "INVALID SIGNATURE VALUE",
    };
  }

  let respBot = bot.telegram.sendMessage(
    378376869,
    `Пришел заказ! #${data.InvId}\nНа сумму: ${data.OutSum} руб.\nE-mail покупателя: ${data.EMail}\nСкорее в AMO!\nhttps://zerokelvin1.amocrm.ru/leads/detail/${data.InvId}`,
    {}
  );
  await respAmo;
  respAmo = Promise.all([
    Amo.Patch("/api/v4/leads/" + data.InvId, {
      name: "Заказ с сайта #" + data.InvId,
      status_id: 142,
    }),
    Amo.Get(`/api/v4/leads/${data.InvId}?with=catalog_elements`),
  ]);
  let listIds = await respAmo;
  console.log(listIds[1]["_embedded"]["catalog_elements"][0]["id"]);
  respAmo = Amo.Patch(
    `/api/v4/catalogs/8693/elements/${listIds[1]["_embedded"]["catalog_elements"][0]["id"]}`,
    {
      name: `Счет к заказу #${listIds[1]["_embedded"]["catalog_elements"][0]["id"]}`,
      custom_fields_values: [
        {
          field_id: 982493,
          values: [
            {
              value: "Оплачен",
            },
          ],
        },
      ],
    }
  );
  let htmlMail = nunjucks.render("mail.html", {
    orderNumber: data.InvId,
  });
  try {
    let info = await transporter.sendMail({
      from: '"Ноль Кельвин 🧬" <info@zerokelvin.ru>',
      to: `${data.EMail}`,
      subject: "Оповещение о заказе",
      html: htmlMail,
    });
  } catch (error) {
    console.error("Проблема с данными, письмо клиенту не ушло " + error);
  }
  await respAmo;
  console.log(respAmo);
  await respBot;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: "OK" + data.InvId,
  };
};
