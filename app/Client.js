
const Discord = require('discord.js')

const TOKEN = process.env.TOKEN
const Client = new Discord.Client({ intents: ['GUILDS'] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }
Client.login(TOKEN)

module.exports = Client

Client.on('ready', () => {

    console.log('Online.')
})