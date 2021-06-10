const Amo = {};
const fetch = require('node-fetch');
const mongoUtil = require("mongodb")
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
const queryDatabase = async (db) => {
    let response = await db.collection("tokens").findOne({
        _id: new mongoUtil.ObjectID("60c0e125e35a6baee25a652e")
    });
    return response;
};
const insertDatabase = async (db, data) => {
    let response = await db.collection("tokens").updateOne({
        _id: new mongoUtil.ObjectID("60c0e125e35a6baee25a652e")
    }, {
        $set: {
            access_token: data.access_token,
            refresh_token: data.refresh_token,
        }
    });
    return response;
};
Amo.request = async (url, data) => {
    try {
        const response = await fetch('https://zerokelvin1.amocrm.ru' + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': 'Bearer ' + Amo.tokens.access_token,
            },
            body: JSON.stringify(data)
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
const CheckError = (data) => {
    if (data.name == "zerokelvin1") {
        return false
    }
    console.error("token is unvalid or AmoCRM is bullshit")
    return true
}
module.exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: "Method Not Allowed"
        };
    }
    context.callbackWaitsForEmptyEventLoop = false;
    const db = await connectToDatabase(MONGODB_URI);
    Amo.tokens = await queryDatabase(db);
    if (CheckError(await Amo.get("/api/v4/account"))) {
        await FixToken(db);
    }
    const data = event.body;
    // let data = {};
    // data.details = {}
    // data.contact = {
    //     'name': 'Андрей Андреев',
    //     'first_name': 'Андрей',
    //     'last_name': 'Андреев',
    //     'phone': '+79995624259',
    //     'email': 'example@uu.ru'
    // };
    // data.details.totalprice = 40
    let contact = await Amo.request('/api/v4/contacts', [{
        'name': data.contact.name,
        'first_name': data.contact.first_name,
        'last_name': data.contact.last_name,
        'created_at': Date.now(),
        "custom_fields_values": [{
                "field_id": 28481,
                "field_name": "Телефон",
                "field_code": "PHONE",
                "field_type": "multitext",
                "values": [{
                    "value": data.contact.phone,
                    "enum_id": 13863,
                    "enum_code": "MOB"
                }]
            },
            {
                "field_id": 28483,
                "field_name": "Email",
                "field_code": "EMAIL",
                "field_type": "multitext",
                "values": [{
                    "value": data.contact.email,
                    "enum_id": 13873,
                    "enum_code": "PRIV"
                }]
            }
        ],
    }])
    contact.id = contact._embedded.contacts[0].id
    const leads = await Amo.request('/api/v4/leads', [{
        "name": 'Покупка в интернет - магазине',
        "price": data.details.totalprice,
        "status_id": 39483091,
        "pipeline_id": 4202485,

    }]);
    leads.id = leads._embedded.leads[0].id
    const invoice_elements = [{
        "value": {
            "description": "Описание товара",
            "unit_price": 10,
            "quantity": 2,
            "unit_type": "шт.",
        }
    }, {
        "value": {
            "description": "Описание товара",
            "unit_price": 10,
            "quantity": 2,
            "unit_type": "шт.",
        }
    }]
    const invoice = await Amo.request('/api/v4/catalogs/8693/elements', [{
        "name": "Тестовая покупка",
        "custom_fields_values": [{
                "field_id": 982493,
                "values": [{
                    "value": "Создан"
                }]
            }, {
                "field_id": 982503,
                "values": invoice_elements
            }, {
                "field_id": 982505,
                "values": [{
                    "value": "Hello world"
                }]
            },
            {
                "field_id": 982507,
                "values": [{
                    "value": data.details.totalprice
                }]
            }
        ]
    }]);
    console.log(JSON.stringify(invoice))
    invoice.id = invoice._embedded.elements[0].id
    let link = await Amo.request("/api/v4/leads/link", [{
            "entity_id": leads.id,
            "to_entity_id": invoice.id,
            "to_entity_type": "catalog_elements",
            "metadata": {
                "quantity": 1,
                "catalog_id": 8693
            }
        },
        {
            "entity_id": leads.id,
            "to_entity_id": contact.id,
            "to_entity_type": "contacts",
            "metadata": {
                "is_main": true,
            }
        }
    ])
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(invoice),
    };
};