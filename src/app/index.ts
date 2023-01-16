
import express from 'express'
import configure from './middleware/default'
import { authoriseRouter, guildRouter } from './routers/index'
import { Guild, User } from '../lib/discord'
import OAuth from '../lib/OAuth'

const app = express()
configure(app)

app.use(OAuth.authPath, authoriseRouter)
app.use('/guild', guildRouter)

app.get('/', async (request, response) => {

    let user = null

    if (request.cookies.access_token) {

        user = await User.fetch(request.cookies.access_token)
    }

    return response.render('home/main', {

        user
    })
})

app.get('/dashboard', async (request, response) => {

    if (!request.cookies.access_token) {

        return response.redirect(OAuth.authPath)
    }

    let user = await User.fetch(request.cookies.access_token)
    let guilds = await Guild.fetch(request.cookies.access_token)

    guilds = guilds.filter((guild: any) => guild.permissions == 2147483647)

    return response.render('dashboard/main', {

        user,
        guilds
    })
})

app.get('/logout', async (request, response) => {

    response.clearCookie('access_token')

    response.redirect('/')
})

export default app
