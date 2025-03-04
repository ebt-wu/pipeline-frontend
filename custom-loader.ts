import http from 'http'
import open from 'open'
import * as OIDC from 'openid-client'
import { buildClientSchema, getIntrospectionQuery, IntrospectionQuery } from 'graphql'

const API_URL = process.env.API_URL || 'https://api.portal.d1.hyperspace.tools.sap/pipeline/query'
const issuerUrl = 'https://hyperspacedev.accounts.ondemand.com'
const clientId = 'f2cf17ca-5599-46f9-866b-fee5e8af96e8'
const port = 8000
const redirectUri = `http://localhost:${port}/`

export default async function customLoader() {
  const code_verifier = OIDC.randomPKCECodeVerifier()
  const code_challenge = await OIDC.calculatePKCECodeChallenge(code_verifier)
  const code_challenge_method = 'S256'
  const issuer = await OIDC.discovery(new URL(issuerUrl), clientId)

  const parameters: Record<string, string> = {
    redirect_uri: redirectUri,
    code_challenge,
    code_challenge_method,
    scope: 'openid',
  }

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const currentURL = new URL(req.url, redirectUri)
        const tokenSet = OIDC.authorizationCodeGrant(issuer, currentURL, {
          pkceCodeVerifier: code_verifier,
        })

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`<html lang="trash"><head><title></title></head>
<body>Authentication successful! You can close this window.<script>window.close()</script></body></html>`)
        server.close()
        resolve(tokenSet.then((x) => tokenResponse(x)))
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(`Authentication failed. Server return an error.`)
        server.close()
        reject(e)
      }
    })

    server.listen(port, () => {
      const authUrl = OIDC.buildAuthorizationUrl(issuer, parameters)

      void open(authUrl.href)
    })
  })
}

interface ResponseData {
  data: IntrospectionQuery
}

async function tokenResponse(tokenSet: OIDC.TokenEndpointResponse) {
  const introspectionQuery = getIntrospectionQuery()
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenSet.id_token}`,
    },
    body: JSON.stringify({ query: introspectionQuery }),
  })

  const result = (await response.json()) as ResponseData
  return buildClientSchema(result.data)
}
