const fetch = require("node-fetch");
const DbCore = require("./dbCore.js");
let Tokens = {
  access_token: null,
  refresh_token: null,
};
let TokensConfig = {
  collection: null,
  id: null,
};
const CLIENT_ID = process.env.AMO_CLIENT_ID;
const CLIENT_SECRET = process.env.AMO_CLIENT_SECRET;

const FixToken = async () => {
  Tokens = await this.Request("/oauth2/access_token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: Tokens.refresh_token,
    redirect_uri: "https://zerokelvin.ru",
  });
  await DbCore.UpdateOne(TokensConfig.collection, Tokens, TokensConfig.id);
};

const IsError = async () => {
  const data = await this.Get("/api/v4/account");
  if (data.name != "zerokelvin1") {
    console.error("Tokens are invalid or AmoCRM is bullshit");
    await FixToken();
  }
};

module.exports.Init = async (collection, id) => {
  TokensConfig.collection = collection;
  TokensConfig.id = id;
  try {
    Tokens = await DbCore.QueryOne(TokensConfig.collection, {
      _id: DbCore.ConvertToObjectID(TokensConfig.id),
    });
  } catch (error) {
    console.error(error);
    throw new Error("Init fail: " + error);
  }
  await IsError();
};

module.exports.Request = async (url, data) => {
  try {
    return (
      await fetch("https://zerokelvin1.amocrm.ru" + url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: "Bearer " + Tokens.access_token,
        },
        body: JSON.stringify(data),
      })
    ).json();
  } catch (error) {
    console.error(error);
    throw new Error("Request(POST) fail: " + error);
  }
};

module.exports.Get = async (url) => {
  try {
    return (
      await fetch("https://zerokelvin1.amocrm.ru" + url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: "Bearer " + Tokens.access_token,
        },
      })
    ).json();
  } catch (error) {
    console.error(error);
    throw new Error("Request(GET) fail: " + error);
  }
};

module.exports.Patch = async (url, data) => {
  try {
    return (
      await fetch("https://zerokelvin1.amocrm.ru" + url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: "Bearer " + Tokens.access_token,
        },
        body: JSON.stringify(data),
      })
    ).json();
  } catch (error) {
    console.error(error);
    throw new Error("Request(POST) fail: " + error);
  }
};
