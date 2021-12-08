const nodemailer = require("nodemailer");
const nunjucks = require("nunjucks");
nunjucks.configure(__dirname);
const md5 = require("blueimp-md5");
const querystring = require("querystring");
const { Telegraf } = require("telegraf");
const Notion = require("../../scripts/modules/NotionLibrary.js");

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
  let order = new Notion.OrderDB("8a127df18f15497db0ef5d423b746ac5");
  await order.Find(data.InvId);
  await order.UpdateStatus();
  let respBot = bot.telegram.sendMessage(
    378376869,
    `Пришел заказ! #${data.InvId}\nНа сумму: ${data.OutSum} руб.\nE-mail покупателя: ${data.EMail}\n`,
    {}
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
  await respBot;
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: "OK" + data.InvId,
  };
};
