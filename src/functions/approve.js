const Amo = {};
const fetch = require('node-fetch');
const mongoUtil = require("mongodb")
const md5 = require("blueimp-md5");
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const querystring = require('querystring');
const {
    Telegraf
} = require('telegraf')
const bot = new Telegraf(process.env.BOT_TOKEN)

let cachedDb = null;

const FixToken = async (db) => {
    Amo.tokens = await Amo.request("/oauth2/access_token", {
        "client_id": "ce05d186-002c-4012-8df0-5c128dd5bc92",
        "client_secret": "znFxl3nHXLdK6Hu98WuBu3klUDs66606Q4jYvsfSSBsQjxiTTx1ugTGDOVkJFpCy",
        "grant_type": "refresh_token",
        "refresh_token": Amo.tokens.refresh_token,
        "redirect_uri": "https://zerokelvin.ru"
    })
    await insertDatabase(db, Amo.tokens);
}
const CheckError = (res) => {
    if (res.name == "zerokelvin1") {
        return false
    }
    console.error("token is unvalid or AmoCRM is bullshit")
    return true
}
const connectToDatabase = async (uri) => {
    if (cachedDb) return cachedDb;

    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true,
    });

    cachedDb = client.db(DB_NAME);

    return cachedDb;
};
const queryDatabase = async (db) => {
    let response = await db.collection("tokens").findOne({
        _id: new mongoUtil.ObjectID("60c0e125e35a6baee25a652e")
    });
    return response;
};
const insertDatabase = async (db, tokens) => {
    let response = await db.collection("tokens").updateOne({
        _id: new mongoUtil.ObjectID("60c0e125e35a6baee25a652e")
    }, {
        $set: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        }
    });
    return response;
};


Amo.request = async (url, datas) => {
    try {
        const response = await fetch('https://zerokelvin1.amocrm.ru' + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': 'Bearer ' + Amo.tokens.access_token,
            },
            body: JSON.stringify(datas)
        });
        return response.json();
    } catch (e) {
        console.error(e);
        return e.json();
    }
}
Amo.get = async (url) => {
    try {
        const response = await fetch('https://zerokelvin1.amocrm.ru' + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': 'Bearer ' + Amo.tokens.access_token,
            },
        });
        return response.json();
    } catch (e) {
        console.error(e)
        return e.json();
    }
}
Amo.patch = async (url, datas) => {
    try {
        const response = await fetch('https://zerokelvin1.amocrm.ru' + url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': 'Bearer ' + Amo.tokens.access_token,
            },
            body: JSON.stringify(datas)
        });
        return response.json();
    } catch (e) {
        console.error(e);
        return e.json();
    }
}
module.exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }
    context.callbackWaitsForEmptyEventLoop = false;
    console.log(querystring.parse(event.body))
    const data = querystring.parse(event.body);
    if (data.SignatureValue != md5(`${data.OutSum}:${data.InvId}:${process.env.PASSWORD_TWO}`)) {
        return {
            statusCode: 400
        }
    }
    const db = await connectToDatabase(MONGODB_URI);
    Amo.tokens = await queryDatabase(db);
    if (CheckError(await Amo.get("/api/v4/account"))) {
        await FixToken(db);
    }
    bot.telegram.sendMessage(362841815, `Пришел заказ! #${data.InvId}\n На сумму ${data.OutSum}\n E-mail покупателя:${data.EMail}\n Скорее в AMO!\n https://zerokelvin1.amocrm.ru/leads`, {})
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "text/plain",
        },
        body: "OK" + data.InvId,
    };
};