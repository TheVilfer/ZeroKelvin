const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  await bot.telegram.sendMessage(
    378376869,
    `Оставили заявку Номер: ${data.tel}`,
    {}
  );
  return {
    statusCode: 200,
    body: "Done",
  };
};
