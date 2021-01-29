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

    const arr = []

    const fileOrUrl = imageURL ? imageURL : 'american-gothic-LARGE.jpg';


    console.log({fileOrUrl});

    const imageRead = await Jimp.read(fileOrUrl);

    await imageRead.resize(34, 43, Jimp.RESIZE_NEAREST_NEIGHBOR);

    for  (let indexY = 0; indexY < 43; indexY++) {
      for  (let indexX = 0; indexX < 34; indexX++) {

        // returns the colour of that pixel e.g. 0xFFFFFFFF
        const pixelColor = imageRead.getPixelColor(indexX, indexY);
        const pixelColorRGBA = Jimp.intToRGBA(pixelColor);
        const pixelColorRGBCSS = rgba.css(pixelColorRGBA)

        arr.push(pixelColorRGBCSS);

      }
    }

    return arr

  } catch (error) {

    console.error(error)
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
  console.log(`Example app listening at http://localhost:${port_number}`)
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
