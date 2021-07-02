const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "info@zerokelvin.ru", // generated ethereal user
        pass: "530c99ebb1dd", // generated ethereal password
    },
});
module.exports.handler = async (event, context) => {
    let info = await transporter.sendMail({
        from: '"Ноль Кельвин 👻" <info@zerokelvin.ru>', // sender address
        to: "polincool1@mail.ru", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
    });
    return {
        statusCode: 200,
        body: info.messageId,
    };
}