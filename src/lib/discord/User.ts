
import { fetch } from '../Fetch'
import Guild from './Guild'

export default class User {

    static async fetch(accessToken: string) {

        let user = await fetch('https://discord.com/api/users/@me', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return user.json()
    }

    static async hasPermissionInGuild(accessToken: string, guildId: string) {

        let guilds = await Guild.fetch(accessToken)

        return guilds.find((guild: any) => guild.id == guildId && guild.permissions == 2147483647)
    }
}
