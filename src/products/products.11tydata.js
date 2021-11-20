const fs = require("fs");
const path = require("path");

const getImages = (url, image) => {
  let dirFiles = [];
  let artworks = "";
  try {
    if (image != undefined) {
      artworks = path.basename(image);
      let tt = path.resolve(path.dirname(url), "images/");
      tt = tt.replace("src", "dist");
      fs.readdirSync(tt).forEach((file) => {
        console.log(file);
        if (file == ".DS_Store") return;
        if (file != artworks) {
          dirFiles.push(path.join("images/", file));
        }
      });
    }
  } catch (error) {
    console.error(error);
  }

  return dirFiles;
};

module.exports = {
  eleventyComputed: {
    images: (data) => getImages(data.page.inputPath, data.artwork),
    artwork: (data) => {
      let paths = path.dirname(data.page.filePathStem);
      paths = paths + "/" + data.artwork;
      return paths;
    },
    priority: (data) => {
      if (data.priority === undefined) return 0;
      return data.priority;
    },
  },
};
