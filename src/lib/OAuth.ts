
import { Request } from 'express'
import Client from './Client'
import { fetch } from './Fetch'
import { authPath, scope } from '../etc/oAuth.json'
import { secret } from '../etc/client.json'

export default class OAuth {

    static host(request: Request): string {

        return request.protocol + '://' + request.headers.host
    }

    static fullURL(request: Request): string {

        return OAuth.host(request) + request.originalUrl
    }

    static authRoute(request: Request) {

        return OAuth.host(request) + authPath
    }

    static authURL(clientId: string, scope: string, options: { name: string, value: string }[]): string {

        let parameters = new URLSearchParams({

            client_id: clientId,
            scope: scope
        })

        for (let { name, value } of options) {

            parameters.set(name, value)
        }

        let authURL = 'https://discord.com/oauth2/authorize?' + parameters.toString()

        return authURL
    }

    static defaultAuthURL(request: Request) {

        return OAuth.authURL(Client.user!.id, scope, [

            {
                name: 'response_type',
                value: 'code'
            },
            {
                name: 'redirect_uri',
                value: OAuth.authRoute(request)
            }
        ])
    }

    static async fetchAccessToken(request: Request, code: any) {

        let data = await fetch('https://discord.com/api/oauth2/token', {

            method: 'POST',
            body: new URLSearchParams({

                client_id: Client.user!.id,
                client_secret: secret,
                code,
                grant_type: 'authorization_code',
                redirect_uri: OAuth.authRoute(request),
                scope
            }),
            headers: {

                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        return data.json()
    }
}
