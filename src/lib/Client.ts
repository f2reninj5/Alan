
import Discord from 'discord.js'
import { token } from '../etc/client.json'

class Client extends Discord.Client {

    constructor(options: Discord.ClientOptions) {

        super(options)
    }

    public async isInGuild(guildId: string): Promise<boolean> {

        let guild

        try {

            guild = await this.guilds.fetch(guildId)

        } catch (error: any) {

            if (error.httpStatus == 404) {

                return false

            } else {

                throw error
            }
        }

        return true
    }
}

const client = new Client({ intents: ['GUILDS'] }) // { intents: ['GUILDS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'] }

client.login(token)

client.on('guildCreate', (guild) => {

    console.log(guild.name)
})

export default client
