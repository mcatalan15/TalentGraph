

async function getTokenFrom42OAuth(server: any): Promise<string | null> {
  const api_uid = process.env.API_UID
  const api_key = process.env.API_KEY
  const url = 'https://api.intra.42.fr/oauth/token'

  if (!api_uid || !api_key) {
    server.fastify?.log.error('API_UID and API_KEY must be set in the environment variables')
    return null
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `client_id=${api_uid}&client_secret=${api_key}&grant_type=client_credentials`
    })
    const token = await response.json()
    console.log('Obtained access token from 42 OAuth2: ', token.access_token)
    return token.access_token
  } catch (err) {
    server.fastify?.log.error('Failed to obtain access token from 42 OAuth2?', err)
    return null
  }
}

export { getTokenFrom42OAuth }