const PromoCore = require("../scripts/modules/PromoSystemCore.js");

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  const res = await PromoCore.Validator(data.cart, data.promo);
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};
