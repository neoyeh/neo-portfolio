import path from 'path';
import { fileURLToPath } from 'url';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
