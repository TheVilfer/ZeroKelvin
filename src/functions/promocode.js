const PromoCore = require("../scripts/modules/PromoSystemCore.js");

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  console.log(data);
  console.log("Корзина - " + data.cart);
  console.log("Промик - " + data.promo);
  try {
    let res = await PromoCore.Validator(data.cart, data.promo);
    res.status = "ok";
    return {
      statusCode: 200,
      body: JSON.stringify(res),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        error: error,
      }),
    };
  }
};
