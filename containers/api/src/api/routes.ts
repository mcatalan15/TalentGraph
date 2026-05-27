import Fastify from 'fastify'
import { Pool } from 'pg'

async function registerRoutes(fastify: ReturnType<typeof Fastify>) {

    const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'postgresql',
    port: process.env.POSTGRES_PORT || 5432,
    database: process.env.POSTGRES_DATABASE || 'talentgraph',
    user: process.env.POSTGRES_USER || 'talentgraph',
    password: process.env.POSTGRES_PASSWORD || 'talentgraph'
    });

    fastify.get('/api/health', async () => {
        return { status: 'ok' }
    })

    fastify.get('/api', async () => {
        return {
            name: 'talentgraph-api',
            message: 'Fastify TypeScript API is running'
        }
    })

    fastify.get('/api/students', async () => {
        try {
            const res = await pool.query('SELECT id, name, login, email FROM students')
            return res.rows
        } catch (err) {
            fastify.log.error(err)
            throw new Error('Failed to fetch students', { cause: err })
        }
    })
}

export { registerRoutes }