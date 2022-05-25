# twitch-controller
Bunch of code to interact with Twitch

## Create an Application in your Twitch Developers console
https://dev.twitch.tv/console

## Server

### Create .env

```properties
# API
API_HOST="http://localhost"
API_PORT=8080
API_URI="${API_HOST}:${API_PORT}"
REDIRECT_URI="${API_URI}/token"

# React
REACT_HOST="http://localhost"
REACT_PORT=3000
REACT_URI="${REACT_HOST}:${REACT_PORT}"

# Chatbot
BOT_NAME="Bot account name"
BOT_OAUTH_TOKEN="Get your token on https://twitchapps.com/tmi/"

# Twitch Application
CLIENT_ID="Client id"
CLIENT_SECRET="Client secret"
HMAC_SECRET="A randomly generated string"
SCOPE="Scopes separated with '+' (https://dev.twitch.tv/docs/authentication/scopes)"

OAUTH_URI="https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}"
```

### Create SSL certificate

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
```

## Client

```properties
REACT_APP_API_HOST="http://localhost"
REACT_APP_API_PORT=8080
REACT_APP_API_URI="${REACT_APP_API_HOST}:${REACT_APP_API_PORT}"

# Endpoints
REACT_APP_VERIFY_URI="${REACT_APP_API_URI}/verify"
REACT_APP_CONNECT_URI="${REACT_APP_API_URI}/connect"
REACT_APP_DISCONNECT_URI="${REACT_APP_API_URI}/disconnect"
```