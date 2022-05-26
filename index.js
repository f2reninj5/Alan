
process.env.TOKEN = require('./tokens.json').token
process.env.PORT = require('./interface/config.json').port

let server = require('./interface')
let app = require('./app')