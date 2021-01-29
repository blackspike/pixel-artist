const Jimp = require('jimp')
const rgba = require('rgba-convert');
const express = require('express')
const cors = require('cors')
const app = express()
const path = require('path');
app.use(cors())
const port_number = process.env.PORT || 3000


async function makePixels(imageURL) {

  try {

    const pixelsArray = []

    const fileOrUrl = imageURL ? imageURL : 'pearl_earring.png';

    console.log({fileOrUrl});

    const imageRead = await Jimp.read(fileOrUrl);

    const imageResizedInfo = await imageRead.resize(34, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);
    const imageWidth = imageResizedInfo.bitmap.width;
    const imageHeight = imageResizedInfo.bitmap.height;

    for  (let indexY = 0; indexY < imageHeight; indexY++) {
      for  (let indexX = 0; indexX < imageWidth; indexX++) {

        // returns the colour of that pixel e.g. 0xFFFFFFFF
        const pixelColor = imageRead.getPixelColor(indexX, indexY);
        const pixelColorRGBA = Jimp.intToRGBA(pixelColor);
        const pixelColorRGBCSS = rgba.css(pixelColorRGBA)

        pixelsArray.push(pixelColorRGBCSS);

      }
    }

    return {pixels: pixelsArray, imageWidth, imageHeight }

  } catch (error) {

    console.error(error)
    return error
  }

}

app.get('/api', async (req, res) => {
  const { url } =  req.query;
  const pixels = await makePixels(url)
  res.json(pixels)
})
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname + '/static/index.html'));
})


app.listen(port_number, () => {
  console.log(`PixelArtist listening on http://localhost:${port_number}`)
})


/**
   * Write to file TODO
   *
 */


// Write json to file
// require('fs').writeFile(

//   './mona.json',

//   JSON.stringify(arr),

//   function (err) {
//     if (err) {
//       console.error('Crap happens');
//     }
//   }
// );
