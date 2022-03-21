
const path = require('path')
const express = require('express')
const app = express()

const { port } = require('./config.json')

app.use(express.static('public'))
app.use((request, response, next) => {

	response.locals.partialsDir = path.resolve(__dirname, './views/partials')
	next()
})

app.set('view engine', 'ejs')

app.get('/', (request, response) => {

	response.render('home/main.ejs')
})

let server = app.listen(port, () => {

	console.log(`Listening on http://localhost:${port}`)
})