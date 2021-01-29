const Jimp = require('jimp')
const rgba = require('rgba-convert');
const uniqueRandomArray = require('unique-random-array');
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
app.use(cors())
const port_number = process.env.PORT || 3000


// Images

const demoImages = [
  {title: 'Venus, Botticelli', file: 'botticelli-venus.jpg'},
  {title: 'Mona Lisa, Da Vinci', file: 'da-vinci-mona-lisa.jpg'},
  {title: 'Tsunami, Hokusai', file: 'hokusai-tsunami.jpg'},
  {title: 'Nighthawks, Hopper', file: 'hopper-nighthawks.jpg'},
  {title: 'Pipe, Magritte', file: 'magritte-pipe.jpg'},
  {title: 'Son Of Man, Magritte', file: 'magritte-son-of-man.jpg'},
  {title: 'Old Guitarist, Picasso', file: 'picasso-old-guitarist.jpg'},
  {title: 'Shadowplay, Riley', file: 'riley-shadowplay.jpg'},
  {title: 'Starry Night, Van Gogh', file: 'van-gogh-starry-night.jpg'},
  {title: 'Pearl Earring, Vermeer', file: 'vermeer-pearl-earring.jpg'},
  {title: 'American Gothic, Wood', file: 'wood-american-gothic.jpg'},
]

const randomImage = uniqueRandomArray(demoImages);


// -----------------------------------------------------------------------------
// Main makePixels function
// -----------------------------------------------------------------------------

async function makePixels(imageURL) {

  try {

    // Set up and create a unique array to avoid showing dupes
    const pixelsArray = []
    const currentRandomImage = randomImage();
    const fileOrUrl = imageURL ? encodeURI(imageURL) : path.join(__dirname + '/static/art/' + currentRandomImage.file);
    console.log({fileOrUrl});

    // Read and resize image
    const imageRead = await Jimp.read(fileOrUrl);
    const imageResizedInfo = await imageRead.resize(34, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);
    const imageWidth = imageResizedInfo.bitmap.width;
    const imageHeight = imageResizedInfo.bitmap.height;

    // Loop through the array row at at atime
    for  (let indexY = 0; indexY < imageHeight; indexY++) {
      for  (let indexX = 0; indexX < imageWidth; indexX++) {

        // Get pixel colour and convert to rgb
        const pixelColor = imageRead.getPixelColor(indexX, indexY);
        const pixelColorRGBA = Jimp.intToRGBA(pixelColor);
        const pixelColorRGBCSS = rgba.css(pixelColorRGBA)

        pixelsArray.push(pixelColorRGBCSS);

      }
    }

    return {pixels: pixelsArray, imageWidth, imageHeight, title: currentRandomImage.title}

  } catch (error) {

    console.error(error)
    return {error}
  }

}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

app.get('/api', async (req, res) => {
  const { url } =  req.query;
  const pixels = await makePixels(url)

  // Catch errors
  if(pixels.error) {
    res.send({error: pixels.error});
    return
  }

  res.json(pixels)
})

// -----------------------------------------------------------------------------
// Serve index.html
// -----------------------------------------------------------------------------

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname + '/static/index.html'));
})

// -----------------------------------------------------------------------------
// Listen
// -----------------------------------------------------------------------------

app.listen(port_number, () => {
  console.log(`PixelArtist listening on http://localhost:${port_number}`)
})
