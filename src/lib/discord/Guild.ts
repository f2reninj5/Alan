
import { fetch } from '../Fetch'

export default class Guild {

    static async fetch(accessToken: string) {

        let guild = await fetch('https://discord.com/api/users/@me/guilds', {

            headers: {

                authorization: `Bearer ${accessToken}`
            }
        })

        return guild.json()
    }
}
