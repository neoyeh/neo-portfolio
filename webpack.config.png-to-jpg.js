const path = require('path');

const imagemin = require('imagemin');
const pngToJpeg = require('png-to-jpeg');
const inputPath = path.join(__dirname, 'src/images/*.png');
const outPath = path.join(__dirname, 'dist/img');

imagemin(['images/*.png'], 'build/images', {
  destination: 'build/images',
  plugins: [
      pngToJpeg({quality: 90})
  ]
}).then((files) => {
  // Please keep in mind that all files now have the wrong extension
  // You might want to change them manually
  console.log('PNGs converted to JPEGs:', files);
});