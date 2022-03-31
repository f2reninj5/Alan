
const path = require('path')
const express = require('express')
const app = express()

const { port } = require('./config.json') // PATH: config

app.set('views', path.resolve(__dirname, './views')) // PATH: views
app.set('view engine', 'ejs')

app.use(express.static(path.resolve(__dirname, './public'))) // PATH: public

app.use((request, response, next) => {
	
	response.locals.partialsDir = path.resolve(__dirname, './views/partials') // PATH: views/partials
	
	request.fullHost = request.protocol + '://' + request.headers.host
	request.fullURL = request.fullHost + request.originalUrl
	next()
})

app.get('/', (request, response) => {

	response.render('home/main.ejs')
})

app.get('/authorise', (request, response) => {

	let code = request.query.code

	if (!code) {

		let clientId = '955116702419542036'
		let uri = encodeURIComponent(request.fullHost + '/authorise')
		let scope = 'guilds identify'

		response.redirect(`https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${uri}&response_type=code&scope=${encodeURIComponent(scope)}`)

		return
	}

	// post request

	// save access token as cookie

	// redirect to dashboard

	response.send('<link href="/styles.css" rel="stylesheet" type="text/css">' + request.query.code)
})

module.exports = app.listen(port, () => {

	console.log(`Listening on http://localhost:${port}`)
})