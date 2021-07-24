const fetch = require('node-fetch');
const f = () => {
    const res = fetch('https://online.moysklad.ru/api/remap/1.2/entity/product?limit=100&expand=images', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Bearer ' + 'f13e380c4cc8d4194d5c78aa715f55af346f0dc4',
        }
    })
    return res;
}
module.exports = function () {
    return console.log(f())
};