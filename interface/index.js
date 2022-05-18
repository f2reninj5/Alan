
const path = require('path')
const fetch = require('node-fetch')
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

const { Client } = require('../app')
const { port } = require('./config.json') // PATH: config

app.enable('trust proxy')

app.set('views', path.resolve(__dirname, './views')) // PATH: views
app.set('view engine', 'ejs')

app.use(cookieParser())

app.use(express.static(path.resolve(__dirname, './public'))) // PATH: public

app.use((request, response, next) => {
	
	response.locals.partialsDir = path.resolve(__dirname, './views/partials') // PATH: views/partials
	
	request.fullHost = request.protocol + '://' + request.headers.host
	request.fullURL = request.fullHost + request.originalUrl

	request.authURI = request.fullHost + '/authorise'
	request.authScope = 'identify guilds'
	request.authURL = `https://discord.com/api/oauth2/authorize?client_id=${Client.user.id}&redirect_uri=${encodeURIComponent(request.authURI)}&response_type=code&scope=${encodeURIComponent(request.authScope)}`
	next()
})

app.get('/', async (request, response) => {

	if (!await request.cookies.access_token) {

		return response.render('home/main')
	}

	let user = await (await fetch('https://discord.com/api/users/@me', {

		headers: {

			authorization: `Bearer ${request.cookies.access_token}`
		}
	})).json()

	response.render('home/main-authorised', {
		
		user
	})
})

app.get('/dashboard', async (request, response) => {

	if (!await request.cookies.access_token) {

		return response.redirect(request.authURL)
	}

	let user = await (await fetch('https://discord.com/api/users/@me', {

		headers: {

			authorization: `Bearer ${request.cookies.access_token}`
		}
	})).json()

	let guilds = await (await fetch('https://discord.com/api/users/@me/guilds', {

		headers: {

			authorization: `Bearer ${request.cookies.access_token}`
		}
	})).json()

	guilds = guilds.filter(guild => guild.permissions == 2147483647)

	response.render('dashboard/main', {
		
		user,
		guilds
	})
})

app.get('/authorise', async (request, response) => {

	if (request.cookies.access_token) {

		return response.redirect('/')
	}

	let code = request.query.code

	if (!code) {

		return response.redirect(request.authURL)
	}

	// post request

	let authData = await (await fetch('https://discord.com/api/oauth2/token', {

		method: 'POST',
		body: new URLSearchParams({

			client_id: Client.user.id,
			client_secret: require('../tokens.json').secret,
			code,
			grant_type: 'authorization_code',
			redirect_uri: request.authURI,
			scope: request.authScope,
		}),
		headers: {

			'Content-Type': 'application/x-www-form-urlencoded',
		},
	})).json()

	response.cookie('access_token', authData.access_token, { expires: new Date(Date.now() + (1000 * authData.expires_in)) })

	response.redirect('/')
})

app.get('/logout', async (request, response) => {

	response.clearCookie('access_token')

	response.redirect('/')
})

module.exports = app.listen(port, () => {

	console.log(`Listening on http://localhost:${port}`)
})