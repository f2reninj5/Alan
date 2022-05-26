
const path = require('path')
const { fetchBuilder, MemoryCache } = require('node-fetch-cache')
const fetch = fetchBuilder.withCache(new MemoryCache({ ttl: 1000 * 60 * 5 }))
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

const { Client } = require('../app')
const TOKEN = process.env.TOKEN
const PORT = process.env.PORT

app.enable('trust proxy')

app.set('views', path.resolve(__dirname, './views')) // PATH: views
app.set('view engine', 'ejs')

app.use(cookieParser())

app.use(express.static(path.resolve(__dirname, './public'))) // PATH: public

function generateOAuthURL(clientId, scope, options) {

	let oAuthURL = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}`

	for (let option of options) {

		oAuthURL += `&${option.name}=${option.value}`
	}

	return oAuthURL
}

app.use((request, response, next) => {
	
	response.locals.partialsDir = path.resolve(__dirname, './views/partials') // PATH: views/partials
	
	request.fullHost = request.protocol + '://' + request.headers.host
	request.fullURL = request.fullHost + request.originalUrl

	request.authURI = request.fullHost + '/authorise'
	request.authScope = 'identify guilds'
	request.authURL = generateOAuthURL(Client.user.id, 'identify guilds', [

		{
			name: 'response_type',
			value: 'code'
		},
		{
			name: 'redirect_uri',
			value: request.fullHost + '/authorise'
		}
	])
	next()
})

app.get('/', async (request, response) => {
	
	let user = null
	
	if (request.cookies.access_token) {

		user = await (await fetch('https://discord.com/api/users/@me', {

			headers: {
	
				authorization: `Bearer ${request.cookies.access_token}`
			}
		})).json()
	}

	response.render('home/main', {
		
		user
	})
})

app.get('/dashboard', async (request, response) => {

	if (!request.cookies.access_token) {

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

app.get('/return', async (request, response) => {

	let code = request.query.code

	if (!code) {

		return response.redirect('/')
	}

	let guildId = request.query.guild_id

	if (guildId) {

		return response.redirect(`/guilds/${guildId}`)
	}

	response.send('Success!')
})

app.get('/guilds/:guildId', async (request, response) => {

	if (!request.cookies.access_token) {

		return response.redirect(request.authURL)
	}

	let guildId = request.params.guildId
	let guild

	let guilds = await (await fetch('https://discord.com/api/users/@me/guilds', {

		headers: {

			authorization: `Bearer ${request.cookies.access_token}`
		}
	})).json()

	if (guilds.filter(guild => guild.id == guildId).length == 0) {

		return response.redirect('/dashboard')
	}

	try {

		guild = await Client.guilds.fetch(guildId)

	} catch (err) {

		if (err.httpStatus == 403) {
		
			return response.redirect(generateOAuthURL(Client.user.id, 'bot applications.commands', [
	
				{
					name: 'response_type',
					value: 'code'
				},
				{
					name: 'permissions',
					value: '8'
				},
				{
					name: 'guild_id',
					value: guildId
				},
				{
					name: 'redirect_uri',
					value: request.fullHost + '/return'
				}
			]))
		}
	}

	let user = await (await fetch('https://discord.com/api/users/@me', {

		headers: {

			authorization: `Bearer ${request.cookies.access_token}`
		}
	})).json()

	response.render('guilds/main', {

		user,
		guild
	})
})

app.get('/logout', async (request, response) => {

	response.clearCookie('access_token')

	response.redirect('/')
})

module.exports = app.listen(PORT, () => {

	console.log(`Listening on http://localhost:${PORT}`)
})