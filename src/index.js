const express = require("express")
const fs = require("fs")
const http = require("http")
const {authRoute} = require('./helpers/auth_utils')

const app = express()

app.use(express.static("public"))

app.get("/ping", (req, res, next) => {
  return res.status(200).send({message: "ok"})
})

app.get("/proxy", authRoute, (req, res) => {
  return res.status(200).send({message: "ok"})
})

app.get("/video", (req, res, next) => {
  console.log("requesting video")
  const path = "public/test.mp4"
  const stats = fs.statSync(path)
  const range = req.headers.range
  console.log("req", req.headers.range)
  console.log("size", stats.size)

  const fileSize = stats.size

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    /*const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1*/

    let chunk =  fileSize / 5
    chunk = parseInt(parts[0], 10)
    const end = start + chunk

    //const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})



    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunk,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

const serverHTTP = http.createServer(app)

const PORT = 3000
serverHTTP.listen(PORT, () => {
  console.log("listening on port: ", PORT)
})
