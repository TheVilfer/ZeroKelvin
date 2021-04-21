// fork code made by @stephencookdev. Thx <3
const mongoUtil = require("mongodb")
const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'kelvinsite';

let cachedDb = null;

const connectToDatabase = async (uri) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db(DB_NAME);

  return cachedDb;
};

const queryDatabase = async (db, data) => {
  let response = null;
  try {
    response = await db.collection("products").find(new mongoUtil.ObjectID(data.id)).toArray();
  } catch (err) {
    console.error(err);
    response = {
      "error": "fail to parse id",
      "detail": err
    }
  }


  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  };
};

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);

  const db = await connectToDatabase(MONGODB_URI);
  return queryDatabase(db, data);
};