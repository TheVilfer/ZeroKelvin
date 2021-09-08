const Amo = require("../scripts/modules/AmoLibrary.js");
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
  await Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  let trackNumber;
  try {
    const leadInfo = await Amo.Get(
      `/api/v4/leads/${data.orderId}?with=catalog_elements`
    );
    let catalogId = leadInfo["_embedded"]["catalog_elements"][0]["id"];
    const catalogInfo = await Amo.Get(
      `/api/v4/catalogs/${8693}/elements/${catalogId}`
    );
    trackNumber = catalogInfo["custom_fields_values"].find(
      (item) => item.field_id == 1015856
    ).values[0].value;
  } catch (error) {
    throw new Error("Track-code not found\n" + error);
  }

  const response = {
    status: 200,
    message: trackNumber,
  };
  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
