module.exports.GetTotalPrice = (cart) => {
  let TotalPrice = 0;
  for (const value of Object.values(cart)) {
    TotalPrice += value.price * value.count;
  }
  return TotalPrice;
};
module.exports.SetInterest = (cart, interest) => {
  for (const key of Object.keys(cart)) {
    cart[key].price -= (cart[key].price / 100) * interest;
  }
  return cart;
};
module.exports.GetDeliveryPrice = async (cart) => {
  let local_shopper = 0;
  let local_stickers = 0;
  let local_cards = 0;
  let local_kits = 0;
  let local_pin = 0;
  let local_boxs = 0;
  for (const value of Object.values(cart.products)) {
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
    return "Доставка недоступна";
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
  throw new Error("Invalid cart elements");
};
module.exports.ParseBoxConstructorForm = (FormData) => {
  let result = {};
  result.data = {};
  let totalprice = 0;
  for (var value of FormData.values()) {
    let id = value.split(";")[0];
    let price = value.split(";")[1];
    totalprice += parseInt(price);
    console.log(value.split(";")[2]);
  }
  return totalprice;
};
module.exports.GetBoxPrice = (FormData) => {
  let totalprice = 0;
  for (var value of FormData.values()) {
    totalprice += parseInt(value.split(";")[1]);
  }
  return totalprice;
};
