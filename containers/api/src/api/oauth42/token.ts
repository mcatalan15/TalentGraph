

export async function getServerTokenFrom42OAuth(server: any): Promise<string | null> {

  const api_uid = server.client_id
  const api_key = server.client_secret
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

    server.fastify?.log.error('Failed to obtain access token from 42 OAuth2', err)
    return null

  }
}

export async function getUserTokenFrom42OAuth(
  api_uid: string,
  api_key: string,
  code: string): 
  
  Promise<string | null> {

  const url = 'https://api.intra.42.fr/oauth/token'

  if (!api_uid || !api_key) {
    return null
  }

  try {

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `client_id=${api_uid}&client_secret=${api_key}&grant_type=authorization_code&code=${code}&redirect_uri=https://talentgraph.localhost:8443/api/auth/callback`
    })

    if (!response.ok) {
      throw new Error(`42 OAuth2 token endpoint responded with status ${response.status}`)
    }

    const token = await response.json()
    

    
    return token.access_token

  } catch (err) {

    console.error('Failed to obtain user access token from 42 OAuth2 callback', err)
    return null

  }
}