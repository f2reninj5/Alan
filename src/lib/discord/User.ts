
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
}
