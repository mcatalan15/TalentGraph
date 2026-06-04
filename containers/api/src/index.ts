import Fastify from 'fastify'
import { getTokenFrom42OAuth } from './api/oauth42/token'

const server = {
  fastify: null as ReturnType<typeof Fastify> | null,
  token: null as Promise<string | null> | null
}

server.fastify = Fastify({
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


server.fastify.get('/api/health', async () => {
  return { status: 'ok' }
})

server.fastify.get('/api', async () => {
  return {
    name: 'talentgraph-api',
    message: 'Fastify TypeScript API is running'
  }
})

/* 
  This endpoint fetches all students from Barcelona campus via the 42 API.
  It requires a valid access token obtained through the 42 OAuth2 flow,
  which is handled in the getTokenFrom42OAuth function.
*/
server.fastify.get('/api/get-students', async () => {
  const token = await server.token
  if (!token) {
    server.fastify?.log.error('No access token available for 42 API')
    throw new Error('Failed to obtain access token for 42 API')
  }
  const apiUrl = 'https://api.intra.42.fr/v2/campus/46/users?per_page=100'

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      server.fastify?.log.error('Failed to fetch students from 42 API, status:', response.status)
      throw new Error(`Failed to fetch students from 42 API, status: ${response.status}`)
    }
    const students = await response.json()

    console.log('Fetched students from 42 API:', students)

    return students
  } catch (err) {
    server.fastify?.log.error('Error fetching students from 42 API?', err)
    throw new Error('Failed to fetch students from 42 API', { cause: err })
  }
})

async function start() {
  const port = Number(process.env.PORT ?? 3000)
  const host = process.env.ADDRESS ?? '0.0.0.0'

  const api_uid = process.env.API_UID
  const api_key = process.env.API_KEY

  if (!api_uid || !api_key) {
    server.fastify.log.error('API_UID and API_KEY must be set in the environment variables')
    process.exit(1)
  }

  server.token = getTokenFrom42OAuth(server)

  try {
    const address = await server.fastify.listen({ port, host })
    server.fastify.log.info(`API listening on ${address}`)
  } catch (err) {
    server.fastify.log.error(err)
    process.exit(1)
  }
}

void start()