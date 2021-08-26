const mongoUtil = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

let cachedDb = null;

const connectToDatabase = async (uri) => {
  if (cachedDb) return cachedDb;

  const client = await MongoClient.connect(uri, {
    useUnifiedTopology: true,
  });

  cachedDb = client.db(DB_NAME);

  return cachedDb;
};

module.exports.Query = async (collection, data = undefined) => {
  try {
    const db = await connectToDatabase(MONGODB_URI);
    let response;
    if (data == undefined) {
      response = await db.collection(collection).find().toArray();
    } else {
      response = await db.collection(collection).find(data).toArray();
    }
    return response;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
module.exports.QueryOne = async (collection, data) => {
  const db = await connectToDatabase(MONGODB_URI);
  let response = await db.collection(collection).findOne(data);
  if (response == null) {
    throw new Error("not found in DataBase");
  }
  return response;
};