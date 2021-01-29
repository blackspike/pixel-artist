const Jimp = require('jimp')
const rgba = require('rgba-convert');
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const port_number = process.env.PORT || 3000


async function makePixels(imageURL) {

  const arr = []

  const fileOrUrl = imageURL ? imageURL : 'pearl_earring.png';

  console.log({fileOrUrl});


  const imageRead = await Jimp.read(fileOrUrl);

  for  (let indexY = 0; indexY < 43; indexY++) {
    for  (let indexX = 0; indexX < 34; indexX++) {

      // returns the colour of that pixel e.g. 0xFFFFFFFF
      const pixelColor = imageRead.getPixelColor(indexX, indexY);

      const hex = rgba.hex(pixelColor)

      arr.push(hex);

    }
  }

  return arr
}

app.get('/', async (req, res) => {
  const { url } =  req.query;

  const pixels = await makePixels(url)

  res.json(pixels)

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
