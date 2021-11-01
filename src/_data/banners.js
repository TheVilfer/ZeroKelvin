module.exports = function () {
  let data = require("../subdata/banners.json");
  for (let index = 0; index < data.banners.length; index++) {
    data.banners[index].img = data.banners[index].img.replace("src", "");
    data.banners[index].img_compressed = data.banners[
      index
    ].img_compressed.replace("src", "");
  }
  return data.banners;
};
