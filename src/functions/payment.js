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
    const data = JSON.parse(event.body);
    let invoice_elements = []
    for (const [key, value] of Object.entries(data.products)) {
        invoice_elements.push({
            "value": {
                "description": value.name,
                "unit_price": value.price,
                "quantity": value.count,
                "unit_type": "шт.",
            }
        })
    }

    const leads = await Amo.request('/api/v4/leads/complex', [{
        "name": 'Покупка в интернет - магазине',
        "price": data.detail.totalprice,
        "_embedded": {
            "contacts": [{
                "name": data.contact['given-name'] + " " + data.contact['family-name'],
                "first_name": data.contact['given-name'] + "",
                "last_name": data.contact['family-name'] + "",
                'created_at': Date.now(),
                "custom_fields_values": [{
                        "field_id": 28481,
                        "values": [{
                            "value": data.contact.tel,
                            "enum_id": 13863,
                            "enum_code": "MOB"
                        }]
                    },
                    {
                        "field_id": 28483,
                        "values": [{
                            "value": data.contact.email,
                            "enum_id": 13873,
                            "enum_code": "PRIV"
                        }]
                    },
                    {
                        "field_id": 988783,
                        "values": [{
                                "value": data.contact.street,
                                "enum_id": 1,
                            },
                            {
                                "value": data.contact.housing,
                                "enum_id": 2,
                            },
                            {
                                "value": data.contact.city,
                                "enum_id": 3,
                            },
                            {
                                "value": data.contact.state,
                                "enum_id": 4,
                            },
                            {
                                "value": data.contact.postalcode,
                                "enum_id": 5,
                            },
                            {
                                "value": data.contact.country,
                                "enum_id": 6,
                            }
                        ]

                    }
                ],
            }]
        },
        "status_id": 39483091,
        "pipeline_id": 4202485,
    }]);
    leads.id = leads[0].id
    leads.contact = leads[0].contact_id
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
                    "value": data.contact.comment
                }]
            },
            {
                "field_id": 982507,
                "values": [{
                    "value": data.detail.totalprice
                }]
            },
            {
                "field_id": 982497,
                "values": [{
                    "value": {
                        "entity_id": leads.contact,
                        "entity_type": "contacts",
                    }
                }]
            }
        ]
    }]);
    invoice.id = invoice._embedded.elements[0].id
    let link = await Amo.request("/api/v4/leads/link", [{
        "entity_id": leads.id,
        "to_entity_id": invoice.id,
        "to_entity_type": "catalog_elements",
        "metadata": {
            "quantity": 1,
            "catalog_id": 8693
        }
    }, ])
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(link),
    };
};