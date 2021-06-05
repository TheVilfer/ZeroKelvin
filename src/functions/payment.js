module.exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }
    context.callbackWaitsForEmptyEventLoop = false;
    const data = event.body;
    console.log(data);

    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
};