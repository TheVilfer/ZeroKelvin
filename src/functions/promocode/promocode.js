module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  const data = JSON.parse(event.body);
  if (data.promo == "Boo") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "ok",
      }),
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "ok",
    }),
  };
};
