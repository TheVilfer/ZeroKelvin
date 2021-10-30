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
module.exports.handler = async (event, context) => {
  try {
    await Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  } catch (error) {
    return {
      statusCode: 400,
      body: error,
    };
  }
  const resp = null;
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
