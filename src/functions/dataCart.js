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
let link = "";

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
  let response = await db.collection("products").find({
    _id: {
      $in: query
    }
  }).toArray();
  return response;
};
const CalculateOutSum = async (data, counts) => {
  //outSum = 
  data.forEach(el => outSum += el.price * counts[el._id])
  console.log(outSum)
}
const GenerateSignatureValue = async () => {
  signatureValue = md5(MERCHANTLOGIN + ":" + outSum + "::" + PASSWORD_ONE);
}
const GenerateLink = async () => {
  link = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MERCHANTLOGIN}&OutSum=${outSum}&Description=Testing&SignatureValue=${signatureValue}&IsTest=1`;
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
  let ids = [];
  for (const [key, value] of Object.entries(data)) {
    ids.push(key)
  }
  console.log("Пришли данные:" + ids);

  const db = await connectToDatabase(MONGODB_URI);
  await CalculateOutSum(await queryDatabase(db, ids), data);
  await GenerateSignatureValue();
  await GenerateLink();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "link": link
    }),
  };
};