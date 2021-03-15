// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://dbZero:2JRbWHDlAfun5n1N@clusterzk.kcwyc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const getData = async() => {
//     await client.connect();
//     const collection = client.db("kelvinsite").collection("products");
//     return await collection.find().toArray();
// };

// module.exports = function() {
//     return getData();
// };