const Amo = require("../scripts/modules/AmoLibrary.js");

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  await Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  const leadInfo = await Amo.Get(
    `/api/v4/leads/${data.orderId}?with=catalog_elements`
  );
  const catalogId = leadInfo["_embedded"]["catalog_elements"][0]["id"];
  const catalogInfo = await Amo.Get(
    `/api/v4/catalogs/${8693}/elements/${catalogId}`
  );
  const trackNumber = catalogInfo["custom_fields_values"].find(
    (item) => item.field_id == 1015856
  ).values[0].value;
  return {
    statusCode: 200,
    body: JSON.stringify(trackNumber),
  };
};
