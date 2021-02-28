module.exports = function() {
  const filepath = './src/images/slider/';
  const fs = require('fs');
  const path = require('path');
  const resolve = require('path').resolve
  const slides = [];
  const testFolder = resolve(filepath);
  fs.readdirSync(testFolder).forEach(file => {
    slides.push(file); 
  });
  const result = slides.filter(function(file) {
    return path.extname(file).toLowerCase() === '.png';
  });
  return result.map(file => {
    return path.basename(file,'.png'); 
  });
};