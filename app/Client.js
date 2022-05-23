
const Discord = require('discord.js')

const Client = new Discord.Client({ intents: ['GUILDS'] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }
Client.login(require('../tokens.json').token)

module.exports = Client

Client.on('ready', () => {

    console.log('Online.')
})