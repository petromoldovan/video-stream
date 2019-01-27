const express = require("express")
const fs = require("fs")
const http = require("http")
const https = require("https")
const config = require('config')
const router = require('./router')

const app = express()
app.use(router)

app.use(express.static("public"))

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
    console.log(`Starting a ${config.get('server.protocol')} server on port: `, PORT)
  })
}

createServer(app)
