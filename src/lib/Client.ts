
import Discord from 'discord.js'
import { token } from '../etc/client.json'

const Client = new Discord.Client({ intents: ['GUILDS'] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }

Client.login(token)

export default Client
