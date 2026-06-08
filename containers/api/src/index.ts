import { buildFastifyInstance } from './server/build'

const fastify = await buildFastifyInstance()

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