
import { fetch } from '../Fetch'

export default class User {

    static async fetch(accessToken: string) {

        let user = await fetch('https://discord.com/api/users/@me', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return user.json()
    }

    static async fetchGuilds(accessToken: string) {

        let guilds = await fetch('https://discord.com/api/users/@me/guilds', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return guilds.json()
    }

    static async hasPermissionInGuild(accessToken: string, guildId: string) {

        let guilds = await User.fetchGuilds(accessToken)

        return guilds.find((guild: any) => guild.id == guildId && guild.permissions == 2147483647)
    }
}
