
import express from 'express'
import Client from '../../lib/Client'
import { User } from '../../lib/discord'
import OAuth from '../../lib/OAuth'

const router = express.Router()

router.use((request, response, next) => {

    if (!request.cookies.access_token) {

        return response.redirect(OAuth.authPath)
    }

    next()
})

router.get('/:guildId', async (request, response) => {

    let guildId = request.params.guildId
    let guild

    if (!(await User.hasPermissionInGuild(request.cookies.access_token, guildId))) {

        return response.redirect('/dashboard')
    }

    try {

        guild = await Client.guilds.fetch(guildId)

    } catch (error: any) { // replace with better check

        if (error.httpStatus != 404) {

            return response.redirect('/dashboard')
        }

        return response.redirect(`/guild/${guildId}/add`)
    }

    let user = await User.fetch(request.cookies.access_token)

    return response.render('guild/main', { // database stuff too

        user,
        guild
    })
})

router.get('/:guildId/add', async (request, response) => {

    let guildId = request.params.guildId
    let code = request.query.code

    if (!code) {

        return response.redirect(OAuth.botInviteAuthURL(request, guildId))
    }

    let guild = await Client.guilds.fetch(guildId)

    return response.render('guild/add', {

        guild
    })
})

router.post('/:guildId/add', async (request, response) => {

    let guildId = request.params.guildId

    if (!(await User.hasPermissionInGuild(request.cookies.access_token, guildId))) {

        return response.redirect('/dashboard')
    }

    // let guild = await Client.guilds.fetch(guildId)

    // get config settings from post body
    // add guild to database

    return response.redirect(`/guild/${guildId}`)
})

export default router
