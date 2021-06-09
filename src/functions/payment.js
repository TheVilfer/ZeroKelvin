const Amo = {};
// process.env.TEST = 23456;
console.log(process.env.TEST)
const fetch = require('node-fetch');
const fs = require('fs');
console.log(__dirname);
Amo.tokens = require('../token.json');
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
        console.log(e);
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
        console.log(e)
        return e.json();
    }
}
const FixToken = async () => {
    Amo.tokens = await Amo.request("/oauth2/access_token", {
        "client_id": "ce05d186-002c-4012-8df0-5c128dd5bc92",
        "client_secret": "znFxl3nHXLdK6Hu98WuBu3klUDs66606Q4jYvsfSSBsQjxiTTx1ugTGDOVkJFpCy",
        "grant_type": "refresh_token",
        "refresh_token": Amo.tokens.refresh_token,
        "redirect_uri": "https://zerokelvin.ru"
    })

    fs.writeFileSync('../token.json', JSON.stringify(Amo.tokens), 'utf8', error => console.log(error));
    console.log(Amo.tokens)
}
const CheckError = (data) => {
    if (data.status == "200") {
        return false
    }
    console.error("token is unvalid or AmoCRM is bullshit")
    return true
}
module.exports.handler = async (event, context) => {
    // if (event.httpMethod !== "POST") {
    //     return {
    //         statusCode: 405,
    //         body: "Method Not Allowed"
    //     };
    // }
    context.callbackWaitsForEmptyEventLoop = false;
    if (CheckError(Amo.get("/api/v4/account"))) {
        await FixToken();

    }
    // const data = event.body;
    let data = {};
    data.contact = {
        'name': 'Андрей Андреев',
        'first_name': 'Андрей',
        'last_name': 'Андреев',
        'phone': '+79995624259',
        'email': 'example@uu.ru'
    };
    data.products = [{
        "name": "Стикерпак 'Физика'",
        "price": 270,
        "count": 1,
        "id": 'frfrf444444'
    }];

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
    // contact = contact._embedded.contacts[0].id
    // const result = await Amo.get('/api/v4/leads/6213289?with=catalog_elements');
    // const result = await Amo.get('/api/v2/catalog_elements?catalog_id=8693');
    // const result = await Amo.get('/api/v4/catalogs/8693/elements'); //field_id
    // const result = await Amo.request('/api/v4/leads', [{
    //     "name": 'Покупка в интернет - магазине',
    //     "price": 270,
    //     "status_id": 39483091,
    //     "pipeline_id": 4202485,
    //     "_embedded": {
    //         "contacts": [{
    //             "id": contact
    //         }]
    //     }
    // }]);
    // invoice_product = []
    // data.products.forEach(e => {
    //     invoice_product.push({
    //         "value": {
    //             "description": e.name,
    //             "unit_price": e.price,
    //             "unit_type": "шт",
    //             "quantity": e.count,
    //             "vat_rate_id": 0,
    //             "vat_rate_value": 20,
    //         }
    //     })
    // })
    // let invoice = [{
    //     "name": "Заказ с Интернет магазина #456",
    //     "custom_fields_values": [{
    //         "field_id": 982493,
    //         "values": invoice_product,
    //     }, ]
    // }];

    // const result = await Amo.request('/api/v4/catalogs/8693/elements', invoice);
    const result = contact
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(result),
    };
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
        console.log(e);
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
        console.log(e)
        return e.json();
    }
}