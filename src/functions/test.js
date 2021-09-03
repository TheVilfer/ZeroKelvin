// const fetch = require('node-fetch');
// const Moysklad = require('moysklad');
// const ms = Moysklad({
//     fetch
// })
// module.exports.handler = async (event, context) => {
//     const productsCollection = await ms.GET('entity/product', {
//         expand: "images"
//     })
//     return {
//         statusCode: 200,
//         body: JSON.stringify(productsCollection)
//     };
// };
const Amo = require("../scripts/modules/AmoLibrary.js");
const DbCore = require("../scripts/modules/dbCore.js");
module.exports.handler = async (event, context) => {
  await Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  const resp = await Amo.Patch(`/api/v4/catalogs/${8693}/elements/${1175381}`, {
    name: `Счет к заказу #${1175381}`,
    custom_fields_values: [
      {
        field_id: 982493,
        values: [
          {
            value: "Оплачен",
          },
        ],
      },
    ],
  });
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
