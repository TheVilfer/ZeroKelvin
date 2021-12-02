const Notion = require("@notionhq/client");
class DataBase {
  constructor(
    DbId,
    key = "secret_oGbsIM9Pl1v5VluIik0cZq7gseywmxkBgnqGRWQ9EZv"
  ) {
    this._dbId = DbId;
    this._client = new Notion.Client({
      auth: process.env.NOTION_API_KEY || key,
    });
  }
  async Connect() {
    try {
      await this._client.users.list();
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  _dbId = 0;
  _client;
}
async function main() {
  let items = new DataBase(5);
  console.log(await items.Connect());
}

(async () => {
  await main();
})();
