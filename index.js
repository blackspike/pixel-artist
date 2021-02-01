const Jimp = require('jimp')
const rgba = require('rgba-convert');
const uniqueRandomArray = require('unique-random-array');
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path');
app.use(cors())
const port_number = process.env.PORT || 6451


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

async function makePixels(imageURL, cols = 32) {

  try {

    const pixelMultiArray = new Array();
    // Set up and create a unique array to avoid showing dupes
    const currentRandomImage = randomImage();

    // If no image url passed, just show one of the demo images
    const fileOrUrl = imageURL ? encodeURI(imageURL) : path.join(__dirname + '/static/art/' + currentRandomImage.file);

    // Set col min/max
    if(cols > 64) {
      cols = 64
    } else if (cols < 4) {
      cols = 4
    }

    // Read and resize image
    const imageRead = await Jimp.read(fileOrUrl);
    const imageResizedInfo = await imageRead.resize(cols, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR);
    const imageWidth = imageResizedInfo.bitmap.width;
    const imageHeight = imageResizedInfo.bitmap.height;


    // Loop through the array row at at atime
    for  (let indexY = 0; indexY < imageHeight ; indexY++) {

        pixelMultiArray[indexY] = new Array();

        for  (let indexX = 0; indexX < imageWidth; indexX++) {

            // Get pixel colour and convert to rgb
            const pixelColor = imageRead.getPixelColor(indexX, indexY);
            const pixelColorRGBA = Jimp.intToRGBA(pixelColor);
            const pixelColorRGBCSS = rgba.css(pixelColorRGBA)

            if (pixelMultiArray[indexY] == null){
              pixelMultiArray[indexY] = indexX;
            } else {
              pixelMultiArray[indexY].push(pixelColorRGBCSS);
            }

        }

      }


      return {pixels: pixelMultiArray, meta: {cols: imageWidth, rows: imageHeight, title: currentRandomImage.title}}

    } catch (error) {

      console.error(error)
      return {error}
    }

  }

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

app.get('/api', async (req, res) => {
  const { url, cols } =  req.query;
  const pixels = await makePixels(url, parseInt(cols));

  // Catch errors
  if(pixels.error) {

    return res.status(400).send({
      message: `There was an issue with the image ${url}`
    });
  }

  res.status(200).json(pixels)
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
