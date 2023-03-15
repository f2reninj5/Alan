
import express from 'express'
import Client from '../../lib/Client'
import { User } from '../../lib/discord'
import Guild from '../../lib/models/Guild'
import OAuth from '../../lib/OAuth'

const router = express.Router()

router.use((request, response, next) => {

    if (!request.cookies.access_token) {

        return response.redirect(OAuth.authPath)
    }

    next()
})

router.route('/add')
    .get(async (request, response) => {

        let guildId = request.query.guildId || request.query.guild_id
        let code = request.query.code

        if (typeof guildId !== 'string') {

            return response.redirect('/dashboard')
        }

        if (!code) {

            return response.redirect(OAuth.botInviteAuthURL(request, guildId))
        }

        let guild = await Client.guilds.fetch(guildId)

        return response.render('guild/add', {

            guild
        })
    })
    .post(async (request, response) => {

        let body = request.body
        let guildId = body.guildId

        if (!(await User.hasPermissionInGuild(request.cookies.access_token, guildId))) {

            return response.redirect('/dashboard')
        }

        let guild = await Client.guilds.fetch(guildId)

        let guildData = {

            name: guild.name,
            icon_url: guild.iconURL() || undefined,
            member_count: guild.memberCount,
        }

        let guildSettingsData = {

            alert_channel_id: body.alertChannelId || null,
            log_channel_id: body.logChannelId || null,
            region: ((body.region % 24) + 24) % 24 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
        }

        if (body.enableAutoChannels) {


        }

        await Guild.upsert(guildId, guildData)
        await Guild.upsertSettings(guildId, guildSettingsData)

        return response.redirect(`/guild/${guildId}`)
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

        let query = new URLSearchParams({ guildId: guildId })

        return response.redirect(`/guild/add?${query.toString()}`)
    }

    let user = await User.fetch(request.cookies.access_token)

    return response.render('guild/main', { // database stuff too

        user,
        guild
    })
})

export default router
