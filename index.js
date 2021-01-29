const Jimp = require('jimp')
const colorConvert = require('color-convert');
const express = require('express')
const app = express()
const port = 3000


async function makePixels(imageURL) {




  const all = await Jimp.read("pearl_earring.png", async function (err, image) {

    const arr = []

    for  (let indexY = 0; indexY < 43; indexY++) {
      for  (let indexX = 0; indexX < 34; indexX++) {

        const c = image.getPixelColor(indexX, indexY); // returns the colour of that pixel e.g. 0xFFFFFFFF

        arr.push("#" + (c.toString(16)).slice(0,-1))

      }
    }

    return arr
    // console.log(arr);

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

    // console.log(arr);

  } )


console.log(all);

  return all





}

app.get('/', async (req, res) => {
  const { url } =  req.query;

  const pixels = await makePixels(url)


  res.send(pixels)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
