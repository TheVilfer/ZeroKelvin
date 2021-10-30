const Amo = require("../scripts/modules/AmoLibrary.js");
let resp = undefined;
module.exports.handler = async (event, context) => {
  try {
    resp = await Amo.Init("tokens", "60c0e125e35a6baee25a652e");
  } catch (error) {
    return {
      statusCode: 400,
      body: error,
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(resp),
  };
};
