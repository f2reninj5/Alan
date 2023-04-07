
import { fetch } from '../Fetch'

export default class User {

    public static async fetch(accessToken: string) {

        let user = await fetch('https://discord.com/api/users/@me', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return user.json()
    }

    public static async fetchGuilds(accessToken: string) {

        let guilds = await fetch('https://discord.com/api/users/@me/guilds', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return guilds.json()
    }

    public static async hasPermissionInGuild(accessToken: string, guildId: string) {

        let guilds = await User.fetchGuilds(accessToken)

        try {

            return guilds.find((guild: any) => guild.id == guildId && guild.permissions == 2147483647)

        } catch (error) {

            return false
        }
    }
}
