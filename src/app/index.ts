
import express from 'express'
import configure from './middleware/default'
import { authoriseRouter } from './routers/index'
import { authPath } from '../etc/oAuth.json'
import { User } from '../lib/discord/index'

const app = express()
configure(app)

app.use(authPath, authoriseRouter)

app.get('/', async (request, response) => {

    let user = null

    if (request.cookies.access_token) {

        user = await User.fetch(request.cookies.access_token)
    }

    return response.render('home/main', {

        user
    })
})

export default app
