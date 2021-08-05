const fs = require("fs");
const path = require("path");

const getImages = (url, image) => {
  let dirFiles = [];
  let artworks = "";
  if (image != undefined) {
    artworks = path.basename(image);
    let tt = path.resolve(__dirname, path.dirname(image));
    fs.readdirSync(tt).forEach((file) => {
      if (file == ".DS_Store") return;
      if (file != artworks) {
        dirFiles.push(path.join("images/", file));
      }
    });
  }
  return dirFiles;
};

module.exports = {
  eleventyComputed: {
    images: (data) => getImages(data.page.inputPath, data.artwork),
  },
};
