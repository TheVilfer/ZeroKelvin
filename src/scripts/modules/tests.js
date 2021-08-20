//tests
const PromoCore = require("./PromoSystemCore.js");
const cart = {
  "3434rfefef4r4r": {
    price: 200,
    count: 2,
  },
  "3434rrererfeefefefef4r4r": {
    price: 150,
    count: 6,
  },
};
PromoCore.Validator(cart, "math").then((res) => console.log(res));
