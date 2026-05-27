import Fastify from 'fastify'

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

fastify.get('/api/health', async () => {
  return { status: 'ok' }
})

fastify.get('/api', async () => {
  return {
    name: 'talentgraph-api',
    message: 'Fastify TypeScript API is running'
  }
})

async function start() {
  const port = Number(process.env.PORT ?? 3000)
  const host = process.env.ADDRESS ?? '0.0.0.0'

  try {
    const address = await fastify.listen({ port, host })
    fastify.log.info(`API listening on ${address}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

void start()