const mongoUtil = require("mongodb");
const MongoClient = require("mongodb").MongoClient;

// const MONGODB_URI = process.env.MONGODB_URI;
// const DB_NAME = process.env.DB_NAME;

const MONGODB_URI =
  "mongodb+srv://dbZero:2JRbWHDlAfun5n1N@clusterzk.kcwyc.mongodb.net";
const DB_NAME = "kelvinsite";

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
  try {
    const db = await connectToDatabase(MONGODB_URI);
    let response = await db.collection(collection).findOne(data);
    return response;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
};
