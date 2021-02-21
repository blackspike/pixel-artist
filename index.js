const Jimp = require('jimp')
const rgba = require('rgba-convert')
const uniqueRandomArray = require('unique-random-array')
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')
app.use(cors())
app.use(express.static(path.join(__dirname, '/public')))
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

const randomImage = uniqueRandomArray(demoImages)


// -----------------------------------
// Main makePixels function
// -----------------------------------

async function makePixels(imageURL = undefined, cols = 32) {


  try {

    const pixelMultiArray = new Array()
    // Set up and create a unique array to avoid showing dupes
    const currentRandomImage = randomImage()

    // If no image url passed, just show one of the demo images
    const fileOrUrl = imageURL ? encodeURI(imageURL) : path.join(__dirname + '/public/art/' + currentRandomImage.file)

    console.log({fileOrUrl});


    // Set col min/max
    if(cols > 64) {
      cols = 64
    } else if (cols < 4) {
      cols = 4
    }

    // Read and resize image
    const imageRead = await Jimp.read(fileOrUrl)
    const imageResizedInfo = await imageRead.resize(cols, Jimp.AUTO, Jimp.RESIZE_NEAREST_NEIGHBOR)
    const imageWidth = imageResizedInfo.bitmap.width
    const imageHeight = imageResizedInfo.bitmap.height

    // Loop through the array row at at atime
    for  (let indexY = 0; indexY < imageHeight ; indexY++) {

        pixelMultiArray[indexY] = new Array()

        for  (let indexX = 0; indexX < imageWidth; indexX++) {

            // Get pixel colour and convert to rgb
            const pixelColor = imageRead.getPixelColor(indexX, indexY)
            const pixelColorRGBA = Jimp.intToRGBA(pixelColor)
            const pixelColorRGBCSS = rgba.css(pixelColorRGBA)

            if (pixelMultiArray[indexY] == null){
              pixelMultiArray[indexY] = indexX
            } else {
              pixelMultiArray[indexY].push(pixelColorRGBCSS)
            }

        }

      }


      return {pixels: pixelMultiArray, meta: {cols: imageWidth, rows: imageHeight, title: currentRandomImage.title}}

    } catch (error) {

      console.error(error)
      return {error}
    }

  }

// -----------------------------------
// Make an SVG
// -----------------------------------

async function makeSVG(pixels, size = 12, gap = 2, background = undefined, shape = 'circle') {

  try {

    const sizeIncGap = size + gap
    let svgDots = ''
    // If a background is passed, create a rect with that fill
    const backgroundRect = background === undefined ? '' : `<rect width="100%" height="100%" fill="${background}"/>`
    const circlePosOffset = shape === 'circle' ? size / 2 : 0

    // Loop through nested array rows/cols and append the circles
    await pixels.pixels.map((pixelArrayRows, rowsIndex) => {

      pixelArrayRows.map((pixelArrayCols, colsIndex) => {

        if(shape === 'circle') {
          svgDots += `
        <circle
          cx="${colsIndex * sizeIncGap}"
          cy="${rowsIndex * sizeIncGap}"
          r="${size / 2}"
          fill="${pixelArrayCols}"
        />`
        } else {
          svgDots += `
        <rect
          height="${size}"
          width="${size}"
          x="${colsIndex * sizeIncGap}"
          y="${rowsIndex * sizeIncGap}"
          fill="${pixelArrayCols}"
        />`
        }

      })

    })

    return `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${(pixels.meta.cols * sizeIncGap) - gap} ${(pixels.meta.rows * sizeIncGap - gap)}">

  ${backgroundRect}

  <g transform="translate(${circlePosOffset},${circlePosOffset})">
    ${svgDots}
  </g>

</svg>`

  } catch (error) {
    return error
  }

}


// -----------------------------------
// API
// -----------------------------------

app.get('/api', async (req, res) => {
  const { url, cols = 32 } = req.query
  const pixels = await makePixels(url, parseInt(cols))

  // Catch errors
  if (pixels.error) {

    return res.status(400).send({
      message: `There was an issue with the image ${url}`
    })
  }

  res.status(200).json(pixels)
})

// -----------------------------------
// SVG API
// pixels, size = 12, gap = 2, background = undefined, shape =
// -----------------------------------

app.get('/svg', async (req, res) => {
  const { url, cols = 32, size = 12, gap = 2, background = undefined, shape = 'circle' } = req.query
  const pixels = await makePixels(url, parseInt(cols))

  // Catch errors
  if (pixels.error) {

    return res.status(400).send({
      message: `There was an issue with the image ${url}`
    })
  }

  // Call makessvg with defaults pixels, size = 12, gap = 2, background = undefined, shape = 'circle'

  const svg = await makeSVG(pixels, parseInt(size), parseInt(gap), background, shape)

  res.header('Content-Type', 'image/svg+xml')
  res.send(svg)

})


// -----------------------------------
// Serve index.html
// -----------------------------------

  app.get('/', (req, res) => {
      res.send('Hello World!')
  })

// -----------------------------------
// Listen
// -----------------------------------

app.listen(port_number, () => {
  console.log(`PixelArtist listening on http://localhost:${port_number}`)
})
