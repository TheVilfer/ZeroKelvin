// const nodemailer = require("nodemailer");
// let transporter = nodemailer.createTransport({
//     host: "smtp.yandex.ru",
//     port: 465,
//     secure: true, // true for 465, false for other ports
//     auth: {
//         user: "info@zerokelvin.ru", // generated ethereal user
//         pass: process.env.MAIL_PASSWORD, // generated ethereal password
//     },
// });
const nunjucks = require("nunjucks");
nunjucks.configure(__dirname + "/mail/");
let res = nunjucks.render('mail.html', {
    orderNumber: 12345
});

module.exports.handler = async (event, context) => {
    // let info = await transporter.sendMail({
    //     from: '"Ноль Кельвин 👻" <info@zerokelvin.ru>', // sender address
    //     to: "polincool1@mail.ru", // list of receivers
    //     subject: "Hello ✔", // Subject line
    //     text: "Hello world?", // plain text body
    //     html: "<b>Hello world?</b>", // html body
    // });
    console.log(res)
    return {
        statusCode: 200,
        body: res,
    };
}