const Jimp = require('jimp')
const rgba = require('rgba-convert');
const express = require('express')
const app = express()
const port = 3000


async function makePixels(imageURL) {

  const arr = []

  const imageRead = await Jimp.read('pearl_earring.png');

  for  (let indexY = 0; indexY < 43; indexY++) {
    for  (let indexX = 0; indexX < 34; indexX++) {

      // returns the colour of that pixel e.g. 0xFFFFFFFF
      const pixelColor = imageRead.getPixelColor(indexX, indexY);

      const hex = rgba.hex(pixelColor)

      console.log(hex);


      arr.push(hex);

    }
  }

  console.log(arr);

  return arr
}

app.get('/', async (req, res) => {
  const { url } =  req.query;

  const pixels = await makePixels(url)

  res.send(pixels)

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
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
