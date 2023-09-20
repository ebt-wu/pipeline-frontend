const { buildClientSchema, getIntrospectionQuery } = require('graphql')
const { Issuer, generators } = require('openid-client')
const http = require('http')

const API_URL = "https://api.portal.d1.hyperspace.tools.sap/pipeline/query"

module.exports = async () => {

    const issuer = await Issuer.discover("https://hyperspacedev.accounts.ondemand.com")

    const client = new issuer.Client({
        client_id: 'f2cf17ca-5599-46f9-866b-fee5e8af96e8',
        redirect_uris: ['http://localhost:8000'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none'
    });

    // Generate code challenge
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);

    // Generate authorization url, that we will open for the user
    const authorizationUrl = await client.authorizationUrl({
        scope: 'openid',
        code_challenge,
        code_challenge_method: 'S256',
    });

    let params

    // Very simple webserver, using Nodes standard http module
    const server = http.createServer((req, res) => {
        // In here when the server gets a request
        if (req.url.startsWith('/?')) {
            // The parameters could be parsed manually, but the openid-client offers a function for it
            params = client.callbackParams(req);
            res.setHeader('Content-Type', 'text/html')
            res.end('You can close this browser now.<script>window.close()</script>')
        } else {
            res.end('Unsupported')
        }
    }).listen(8000) // static local port

    // Open authorization url in preferred browser, works cross-platform
    const opn = await import('open')
    opn.default(authorizationUrl)

    // Recheck every 500ms if we received any parameters
    // This is a simple example without a timeout
    while (params === undefined) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    const tokenSet = await client.callback('http://localhost:8000', params, { code_verifier })
    server.close()

    const introspectionQuery = getIntrospectionQuery()

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenSet.id_token}`
        },
        body: JSON.stringify({ query: introspectionQuery })
    })

    const data = await response.json()

    return buildClientSchema(data.data)
}