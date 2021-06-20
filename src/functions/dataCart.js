// fork code made by @stephencookdev. Thx <3
const mongoUtil = require("mongodb")
const MongoClient = require("mongodb").MongoClient;
const md5 = require("blueimp-md5");
const fetch = require('node-fetch');
const orderid = require('order-id')('ELYA');
const unique_id = orderid.generate();

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
  let response = await db.collection("products").find({
    _id: {
      $in: query
    }
  }).toArray();
  return response;
};


module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  let ids = [];
  const db = await connectToDatabase(MONGODB_URI);
  let cart = JSON.parse(event.body);
  for (const [key, value] of Object.entries(cart.products)) {
    ids.push(key)
  }
  (await queryDatabase(db, ids)).forEach(el => {
    cart.products[el._id].name = el.name
    cart.products[el._id].price = el.price
  })
  CalculateOutSum(cart)
  let lead = await AddOrderToAmo(cart);
  await GenerateSignatureValue(lead["lead_id"]);
  await GenerateLink(lead["lead_id"]);
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
const CalculateOutSum = async (cart) => {
  outSum = 0;
  for (const [key, value] of Object.entries(cart.products)) {
    outSum += value.price * value.count
  }
  cart.detail.totalprice = outSum
}
const GenerateSignatureValue = async (lead_id) => {
  signatureValue = md5(MERCHANTLOGIN + ":" + outSum + ":" + lead_id + ":" + PASSWORD_ONE);
}
const GenerateLink = async (lead_id) => {
  link = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MERCHANTLOGIN}&OutSum=${outSum}&InvoiceID={lead_id}&Description=Testing&SignatureValue=${signatureValue}&IsTest=1`;
}
const AddOrderToAmo = async (cart) => {
  try {
    const response = await fetch('https://zerokelvin.ru/.netlify/functions/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(cart)
    });
    return response.json();
  } catch (e) {
    console.error(e);
    return e;
  }
}