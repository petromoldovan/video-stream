const express = require("express")
const fs = require("fs")
const http = require("http")
const https = require("https")
const config = require('config')
const router = require('./router')
const session = require('express-session')
const pjson = require('../package')

const app = express()

const createServer = (app) => {
  let sess = {
    name: pjson.name,
    secret: config.get('server.session.secret'),
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000
    }
  }

  if (process.env.NODE_ENV === 'production') {
    // in case node server is behind some proxy
    app.set('trust proxy', 1)
  }

  app.use(session(sess))

  app.use(router)
  app.use(express.static("public"))

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
