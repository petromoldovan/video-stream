const express = require("express")
const fs = require("fs")
const http = require("http")
const https = require("https")
const {authRoute} = require('./helpers/auth_utils')
const config = require('config')
const { promisify } = require('util')

const app = express()

app.use(express.static("public"))

app.get("/ping", (req, res, next) => {
  return res.status(200).send({message: "ok"})
})

app.get("/copyfile-long-version", (req, res) => {
  const input = `${__dirname}/../public/test.mp4`
  const output = `${__dirname}/../public/copy.mp4`
  const readStream = fs.createReadStream(input)
  const writeStream = fs.createWriteStream(output)

  readStream.on('data', (chunk) => {
    const isReadyToWriteMore = writeStream.write(chunk)
    if (!isReadyToWriteMore) {
      console.log("backpreasure. Stoping read stream")
      readStream.pause()
    }
  })

  writeStream.on('drain', () => {
    console.log("drained")
    readStream.resume()
  })

  readStream.on('end', () => {
    console.log("file copied")
    writeStream.end()
  })
})

app.get("/copyfile-short-version", (req, res) => {
  const input = `${__dirname}/../public/test.mp4`
  const output = `${__dirname}/../public/copy.mp4`
  const readStream = fs.createReadStream(input)
  const writeStream = fs.createWriteStream(output)

  readStream.pipe(writeStream)
})

app.get("/proxy", authRoute, (req, res) => {
  return res.status(200).send({message: "ok"})
})

app.get("/video", async (req, res, next) => {
  const path = `${__dirname}/../public/test.mp4`
  const stats = fs.statSync(path)
  const range = req.headers.range
  const fileSize = stats.size
  const parts = range.replace(/bytes=/, "").split("-")
  const start = parseInt(parts[0], 10)
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

  const head = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': (end-start) + 1,
    'Content-Type': 'video/mp4',
  }
  res.writeHead(206, head)
  fs.createReadStream(path, {start, end}).pipe(res)
})

const createServer = (app) => {
  let server = http.createServer(app)
  if (config.get('server.protocol') === 'https') {
    const options = {
      key: fs.readFileSync('config/client-key.pem'),
      cert: fs.readFileSync('config/client-cert.pem')
    }
    server = https.createServer(options, app)
  }

  const PORT = config.get('server.port')
  server.listen(PORT, () => {
    console.log("listening on port: ", PORT)
  })
}

createServer(app)
