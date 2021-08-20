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
