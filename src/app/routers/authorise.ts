
import express from 'express'
import OAuth from '../../lib/OAuth'

const router = express.Router()

router.get('/', async (request, response) => {

    if (request.cookies.access_token) {

        return response.redirect('/')
    }

    let code = request.query.code

    if (!code) {

        return response.redirect(OAuth.defaultAuthURL(request))
    }

    let authData = await OAuth.fetchAccessToken(request, code)

    response.cookie('access_token', authData.access_token, { maxAge: 1000 * authData.expires_in })

    return response.redirect('/')
})

export default router
