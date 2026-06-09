import Fastify from 'fastify'
import fastifySession from '@fastify/session'
import fastifyCookie from '@fastify/cookie'
import { Pool } from 'pg'

import { getServerTokenFrom42OAuth } from '../api/oauth42/token'
import { registerRoutes } from '../api/routes'

export async function buildFastifyInstance() {

    // Coloured logging is ok in development but wastes CPU cycles in production
    const fastify = Fastify({
        logger: process.env.NODE_ENV === 'development' ? {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss',
                    ignore: 'pid,hostname'
                }
            }
        } : true
    })


    // Client ID and secret are both needed, exit if missing
    const client_id = process.env.API_UID
    const client_secret = process.env.API_KEY
    if (!client_id || !client_secret) {
        fastify.log.error('API_UID and API_KEY must be set in the environment variables')
        process.exit(1)
    }
    fastify.decorate('client_id', client_id)
    fastify.decorate('client_secret', client_secret)


    // Obtain an access token from 42 OAuth2 for server-to-server communication with the 42 API
    const token = await getServerTokenFrom42OAuth(fastify)
    if (!token) {
        fastify.log.error('Failed to obtain access token from 42 OAuth2')
        process.exit(1)
    }
    fastify.decorate('token', token)


    // Set up PostgreSQL connection pool and decorate Fastify instance with it
    const pool = new Pool({
        host: process.env.POSTGRES_HOST || 'postgresql',
        port: process.env.POSTGRES_PORT || 5432,
        database: process.env.POSTGRES_DATABASE || 'talentgraph',
        user: process.env.POSTGRES_USER || 'talentgraph',
        password: process.env.POSTGRES_PASSWORD || 'talentgraph'
    })
    fastify.decorate('pool', pool)


    fastify.register(fastifyCookie);
    fastify.register(fastifySession, {
        secret: process.env.FASTIFY_SESSION_SECRET,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    });

    registerRoutes(fastify)

    return fastify
}
