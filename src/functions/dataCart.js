// fork code made by @stephencookdev. Thx <3
const mongoUtil = require("mongodb")
const MongoClient = require("mongodb").MongoClient;
const md5 = require("blueimp-md5");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const MERCHANTLOGIN = process.env.MERCHANTLOGIN;
const PASSWORD_ONE = process.env.PASSWORD_ONE;

let cachedDb = null;
let outSum = 0;
let description = "";
let signatureValue = "";

const connectToDatabase = async (uri) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db(DB_NAME);

  return cachedDb;
};

const queryDatabase = async (db, data) => {
  let query = [];
  data.forEach(element => query.push(new mongoUtil.ObjectID(element)));
  console.log("Запрос: " + query);
  console.log("Хэш" + md5(1));
  let response = null;
  try {
    response = await db.collection("products").find({
      _id: {
        $in: query
      }
    }).toArray();
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
const CalculateOutSum = () => {

}
const GenerateLink = (data) => {

}

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  const data = JSON.parse(event.body);
  console.log("Пришли данные:" + data);

  const db = await connectToDatabase(MONGODB_URI);
  return queryDatabase(db, data);
};