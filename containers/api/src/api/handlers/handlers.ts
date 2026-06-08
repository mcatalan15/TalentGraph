import crypto from 'crypto'

import { getUserTokenFrom42OAuth } from '../oauth42/token'
import { checkAndInsertStudent } from '../db/queries'

export async function healthCheck() {
    return { status: 'ok' }
}

export async function getStudents(request: any, reply: any) {

    try {

        const res = await request.server.pool.query('SELECT id, name, login, email FROM students')
        return reply.send(res.rows)

    } catch (err) {

        request.log.error(err)
        throw new Error('Failed to fetch students', { cause: err })

    }
}

export async function getUserData(request: any, reply: any) {

    try {

        const res = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${request.session.userToken}`
            }
        })
        if (!res.ok) {
            request.log.error('42 API responded with status', res.status)
            return reply.status(401).send({ error: 'Unauthorized' })
        }
        const userData = await res.json()

        if (!userData) {
            request.log.error('No user data found in 42 API response')
            return reply.status(404).send({ error: 'User data not found in 42 API response' })
        }

        const resFromDb = await checkAndInsertStudent(request, userData)

        if (resFromDb) {
            request.log.info('Checked/inserted student in database successfully')
        } else {
            request.log.error('Failed to check/insert student in database')
        }

        return reply.send(userData)

    } catch (err) {
        request.log.error('Error fetching user data from 42 API', err)
        return reply.status(500).send({ error: 'Failed to fetch user data from 42 API' })
    }
}

export async function handleOAuthCallback(request: any, reply: any) {

    const { code } = request.query as { code?: string }
    if (!code) {
        request.log.error('No code query parameter provided in OAuth callback')
        throw new Error('Missing code query parameter in OAuth callback')
    }

    try {

        request.session.token = crypto.randomBytes(32).toString('hex')

        reply.setCookie('session', request.session.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })

        const userToken = await getUserTokenFrom42OAuth(
            request.server.client_id,
            request.server.client_secret,
            code
        )

        if (!userToken) {
            request.log.error('Failed to obtain user token from 42 OAuth callback')
            throw new Error('Failed to obtain user token from 42 OAuth callback')
        }

        const data = await fetch('https://api.intra.42.fr/v2/me', {
            headers: {
                Authorization: `Bearer ${userToken}`
            }
        })

        if (!data.ok) {
            throw new Error(`Failed to fetch user data from 42 API with obtained access token, status ${data.status}`)
        }

        const userData = await data.json()
        console.log('Fetched user data from 42 API using access token: ', userData)

        request.session.userToken = userToken

        const login = userData.login

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .popup {
                        background: white;
                        padding: 40px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        max-width: 400px;
                    }
                    .popup h1 {
                        color: #333;
                        margin: 0 0 10px 0;
                    }
                    .popup p {
                        color: #666;
                        font-size: 16px;
                        margin: 10px 0 30px 0;
                    }
                    .popup button {
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    .popup button:hover {
                        background: #764ba2;
                    }
                </style>
            </head>
            <body>
                <div class="popup">
                    <h1>Welcome, ${login}!</h1>
                    <p>Your wallet is now linked to your 42 account.</p>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
            </html>
        `

        return reply.type('text/html').send(htmlContent)

    } catch (err) {

        request.log.error('Error handling OAuth callback', err)
        throw new Error('Failed to handle OAuth callback', { cause: err })

    }
}

/* 
  This endpoint fetches all students from Barcelona campus via the 42 API.
  It requires a valid access token obtained through the 42 OAuth2 flow,
  which is handled in the getTokenFrom42OAuth function.
*/
export async function getStudentsFrom42(request: any, reply: any) {

    const token = request.server.token

    console.log('Using access token for 42 API: ', token)

    if (!token) {
        request.log.error('No access token available for 42 API')
        throw new Error('Failed to obtain access token for 42 API')
    }
    const apiUrl = 'https://api.intra.42.fr/v2/campus/46/users?per_page=100'

    try {

        const students: any[] = []
        let page = 0

        while (true) {

            const res = await fetch(apiUrl + `&page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (!res.ok) {
                throw new Error(`42 API responded with status ${res.status}`)
            }
            const newStudents = await res.json()
            if (newStudents.length === 0) {
                break
            }
            students.push(...newStudents)
            page++
        }

        console.log(`Fetched ${students.length} students from 42 API`)

        return reply.send(students)

    } catch (err) {
        request.log.error('Error fetching students from 42 API?', err)
        throw new Error('Failed to fetch students from 42 API', { cause: err })
    }
}
