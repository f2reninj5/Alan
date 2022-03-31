
const path = require('path')
const express = require('express')
const app = express()

const { port } = require('./config.json')

app.use(express.static('public'))

app.use((request, response, next) => {

	response.locals.partialsDir = path.resolve(__dirname, './views/partials')
	next()
})

app.use((request, response, next) => {

	request.fullHost = request.protocol + '://' + request.headers.host
	request.fullURL = request.fullHost + request.originalUrl // encodeURIComponent()
	next()

	// https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
})

app.set('view engine', 'ejs')

app.get('/', (request, response) => {

	console.log(request.fullHost)

	response.render('home/main.ejs')
})

let server = app.listen(port, () => {

	console.log(`Listening on http://localhost:${port}`)
})