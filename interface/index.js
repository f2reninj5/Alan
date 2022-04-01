
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const app = express()

const { Client } = require('../app')
const { port } = require('./config.json') // PATH: config

app.set('views', path.resolve(__dirname, './views')) // PATH: views
app.set('view engine', 'ejs')

app.use(express.static(path.resolve(__dirname, './public'))) // PATH: public

app.use((request, response, next) => {
	
	response.locals.partialsDir = path.resolve(__dirname, './views/partials') // PATH: views/partials
	
	request.fullHost = request.protocol + '://' + request.headers.host
	request.fullURL = request.fullHost + request.originalUrl

	let uri = encodeURIComponent(request.fullHost + '/authorise')
	let scope = 'guilds identify'
	request.authURI = `https://discord.com/api/oauth2/authorize?client_id=${Client.user.id}&redirect_uri=${uri}&response_type=code&scope=${encodeURIComponent(scope)}`
	next()
})

app.get('/', (request, response) => {

	console.log(Client)

	response.render('home/main.ejs')
})

app.get('/authorise', async (request, response) => {

	let code = request.query.code

	if (!code) {

		response.redirect(request.authURI)

		return
	}

	// post request

	let data = {
		
		'client_id': Client.user.id,
		'client_secret': require('../tokens.json').token,
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': request.authURI
	}

	let headers = {

		'Content-Type': 'application/x-www-form-urlencoded'
	}

	let tokenResponse = await fetch(`https://discord.com/api/v8/oauth2/token`, {

		method: 'POST',
		body: new URLSearchParams(data),
		headers: headers
	})

	console.log(tokenResponse)

	// save access token as cookie

	// redirect to dashboard

	response.send('<link href="/styles.css" rel="stylesheet" type="text/css">' + request.query.code)
})

module.exports = app.listen(port, () => {

	console.log(`Listening on http://localhost:${port}`)
})