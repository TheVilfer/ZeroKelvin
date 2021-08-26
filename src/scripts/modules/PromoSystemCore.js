const db = require("./dbCore.js");
const cartUtils = require("./CartUtils.js");
const collection = "promocodes";
const GetPromoFromDb = async (promocode) => {
  try {
    return await db.QueryOne(collection, { code: promocode });
  } catch (error) {
    throw new Error("invalid promocode");
  }
};

module.exports.Validator = async (cart, promo) => {
  const totalPrice = cartUtils.GetTotalPrice(cart);
  const promoData = await GetPromoFromDb(promo);
  switch (promoData.type) {
    case 1:
      const discount = (totalPrice / 100) * promoData.interest;
      return {
        discount: discount,
        cart: cartUtils.SetInterest(cart, promoData.interest),
        totalprice: totalPrice - discount,
      };
      break;

    default:
      break;
  }
};
