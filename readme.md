# OAuth 2 Demo Server

## Instructions

1. npm install && npm start
2. create a new user at /api/users with username and password at req.body
3. use username and password to create a new client at /api/clients
4. goto http://localhost:3000/api/oauth2/authorize?client_id="clientid"&response_type=code&redirect_uri=http://localhost:3000
5. enter username and password to oauth
6. send a post to http://localhost:3000/api/oauth2/token, with code, grant_type: authorization_code, redeirect_uri: htttp://localhost:3000 using basic auth using clientid and secret as username and password
