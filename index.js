
const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')
const app = express()

const { port, key, cert, ca } = require('./config.json')

app.use(express.static('public'))
app.use((request, response, next) => {

	response.locals.partialsDir = path.resolve(__dirname, './views/partials')
	next()
})

app.set('view engine', 'ejs')

app.get('/', (request, response) => {

	response.render('home/main.ejs')
})

let options = {
	
    key: fs.readFileSync(key),
    cert: fs.readFileSync(cert),
    ca: fs.readFileSync(ca)
}

let server = https.createServer(options, app).listen(port, () => {

	console.log(`Listening...`)
})