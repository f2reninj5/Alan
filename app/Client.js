
const Discord = require('discord.js')

const Client = new Discord.Client({ intents: [] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }
Client.login(require('../tokens.json').token)

module.exports = Client
