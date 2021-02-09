const path = require('path');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const inputPath = path.join(__dirname, 'src/images/*.jpg');
const outPath = path.join(__dirname, 'dist/img');

 
(async () => {
    const files = await imagemin([inputPath], {
        destination: outPath,
        plugins: [
          imageminMozjpeg({quality: 90}),
        ]

    });
 
    console.log(files);
    //=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
})();