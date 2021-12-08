const Notion = require("../scripts/modules/NotionLibrary.js");
// Статусы ответов
// 200  - ОК (трек-номер найден)
// 404 - не найден, либо ошибка во время исполнения
module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  console.log(data);
  let order = new Notion.OrderDB("8a127df18f15497db0ef5d423b746ac5");
  let trackNumber = (await order.Find(data.orderId)).properties["Трек-номер"][
    "rich_text"
  ][0]["plain_text"];
  console.log(trackNumber);
  const response = {
    status: 200,
    message: trackNumber,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
