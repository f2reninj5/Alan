
const Discord = require('discord.js')

const client = new Discord.Client({ intents: [] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }

client.login(require('../tokens.json').token)

module.exports = client