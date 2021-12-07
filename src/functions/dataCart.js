const md5 = require("blueimp-md5");
const PromoCore = require("../scripts/modules/PromoSystemCore.js");
const CartUtils = require("../scripts/modules/CartUtils.js");
const DbCore = require("../scripts/modules/dbCore.js");
const Notion = require("../scripts/modules/NotionLibrary.js");

const MERCHANTLOGIN = process.env.MERCHANTLOGIN;
const PASSWORD_ONE = process.env.PASSWORD_ONE;

let outSum = 0;
let description = "Покупка в научном магазине Ноль Кельвин";
let signatureValue = "";
let link = "";

module.exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  context.callbackWaitsForEmptyEventLoop = false;
  let ids = [];
  let ids_box = [];
  let ids_elBox = [];
  let cart = JSON.parse(event.body);
  console.log(cart);
  for (const key of Object.keys(cart.products)) {
    if (key.split(";")[0] == "box") {
      ids_elBox = Array.from(
        new Set(ids_elBox.concat(cart.products[key].subdata.ids))
      );
      ids_box.push(key);
      continue;
    }
    ids.push(key);
  }
  ids = Array.from(new Set(ids.concat(ids_elBox)));
  console.log(ids);
  (
    await DbCore.Query("products", {
      _id: { $in: DbCore.ConvertArrayToObjectID(ids) },
    })
  ).forEach((el) => {
    console.log(el);
    console.log(cart.products[el._id]);
    if (typeof cart.products[el._id] != "undefined") {
      cart.products[el._id].name = el.name;
      cart.products[el._id].price = el.price;
    }
    ids_box.forEach((idB) => {
      if (typeof cart.products[idB].subdata.items[el._id] != "undefined") {
        cart.products[idB].subdata.items[el._id].name = el.name;
        cart.products[idB].subdata.items[el._id].price = el.price;
      }
    });
  });
  ids_box.forEach((el) => {
    let tPrice = 0;
    let tDesc = "Состав бокса: ";
    for (let lTem in cart.products[el].subdata.items) {
      tDesc += cart.products[el].subdata.items[lTem].name + ", ";
      tPrice += cart.products[el].subdata.items[lTem].price;
    }
    tDesc = tDesc.slice(0, tDesc.length - 2);
    cart.products[el].price = tPrice;
    cart.contact.comment += "\n" + tDesc;
  });
  cart.contact.comment +=
    "\n" + "Способ доставки: " + cart.contact["deleveryService"];
  console.log(cart.products);
  if (cart.detail.promocode == "") {
    cart.products["delivery"] = {};
    cart.products["delivery"].name = "Доставка";
    cart.products["delivery"].count = 1;
    cart.products["delivery"].price = await CartUtils.GetDeliveryPrice(cart);
    cart.detail.totalprice = CartUtils.GetTotalPrice(cart.products);
  } else {
    const DeliveryPrice = await CartUtils.GetDeliveryPrice(cart);
    let PromoData = await PromoCore.Validator(
      cart.products,
      cart.detail.promocode
    );
    cart.products = PromoData.cart;
    cart.detail.totalprice = PromoData.totalprice;
    cart.products["delivery"] = {};
    cart.products["delivery"].name = "Доставка";
    cart.products["delivery"].count = 1;
    cart.products["delivery"].price = DeliveryPrice;
    cart.detail.totalprice += DeliveryPrice;
  }
  outSum = cart.detail.totalprice;
  let lead = await AddOrderToNotion(cart);
  await GenerateSignatureValue(lead);
  await GenerateLink(lead);
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      link: link,
    }),
  };
};
const GenerateSignatureValue = async (lead_id) => {
  signatureValue = md5(
    MERCHANTLOGIN + ":" + outSum + ":" + lead_id + ":" + PASSWORD_ONE
  );
};
const GenerateLink = async (lead_id) => {
  link = `https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=${MERCHANTLOGIN}&OutSum=${outSum}&InvoiceID=${lead_id}&Description=${description}&SignatureValue=${signatureValue}`;
};
const AddOrderToNotion = async (cart) => {
  try {
    let res = await DbCore.QueryOne("utils", {
      _id: DbCore.ConvertToObjectID("61afc65e88146e88f5e79ab8"),
    });
    res.correctOrder++;
    await DbCore.UpdateOne(
      "utils",
      {
        correctOrder: res.correctOrder,
      },
      "61afc65e88146e88f5e79ab8"
    );
    let contact = new Notion.ContactDB("43c93433c619428ebe683115baa214ba");
    let order = new Notion.OrderDB("8a127df18f15497db0ef5d423b746ac5");
    if (!(await contact.Find(cart.contact.tel))) await contact.Add(cart);
    await order.Add(cart, contact.id, res.correctOrder);
    await order.CreateDbListOrder();
    await order.AddElementToListOrder(cart);
    return res.correctOrder;
  } catch (error) {
    throw new Error("Ошибка при добавлении данных в ноушен: " + error);
  }
};
