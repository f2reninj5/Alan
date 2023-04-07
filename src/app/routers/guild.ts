
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
        let channels = await guild.channels.fetch()
        let textChannels = channels.filter((channel) => channel!.type == 0)

        return response.render('guild/add', {

            guild,
            channels: textChannels.map((channel) => { return { id: channel!.id, name: channel!.name } })
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

        function mod(a: number, b: number): number { return ((a % b) + b) % b }

        let guildSettingsData = {

            alert_channel_id: body.alertChannelId || null,
            log_channel_id: body.logChannelId || null,
            region: mod((body.region + 11), 24) - 11 // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
        }

        if (body.enableAutoChannels) {


        }

        await Guild.upsert(guildId, guildData)
        await Guild.upsertChannel(body.alertChannelId, guildId, { type: 0 })

        if (body.logChannelId) {

            await Guild.upsertChannel(body.logChannelId, guildId, { type: 0 })
        }

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

        if (error.status != 404) {

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

router.post('/:guildId/channels', async (request, response) => {

    let guildId = request.params.guildId
    let access_token = request.body.access_token

    if (!(await User.hasPermissionInGuild(access_token, guildId))) {

        return response.status(403).json({})
    }

    let guild = await Client.guilds.fetch(guildId)
    let channels = await guild.channels.fetch()
    let textChannels = channels.filter((channel) => channel!.type == 0)

    return response.send(textChannels.map((channel) => { return { id: channel!.id, name: channel!.name } }))
})

export default router
