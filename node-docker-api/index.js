const express = require('express')
const os = require('os')
const axios = require('axios')

const app = express()

const state_endpoint = "http://localhost:3500/v1.0/state/statestore"
const dapr_url = "http://localhost:3500/v1.0/invoke/node-docker-api-2/method/me"

app.get('/', (req, res) => {
    res.send(`You are getting response from API 1, pod ${os.hostname()}!`)
})

app.get('/user', async function (req, res) {
    let timeout = await getState('reqTimeout');
    axios.post(dapr_url, {
        name: 'Hoang Nguyen'
    }, { timeout: timeout })
    .then(response => {
        res.send(response.data);
        console.log(`statusCode: ${response.status}`);
    })
    .catch(error => {
        res.send(error);
        console.log(`error message: ${error.message}`)
    });
})


// Calculate response time
axios.interceptors.request.use( x => {
        // to avoid overwriting if another interceptor
        // already defined the same object (meta)
    x.meta = x.meta || {}
    x.meta.requestStartedAt = new Date().getTime();
    return x;
})

axios.interceptors.response.use(x => {
    if (!x.config.url.includes('statestore'))
    {
        console.log(`Execution time for: ${x.config.url} - ${new Date().getTime() - x.config.meta.requestStartedAt} ms`)
    }
    return x;
},
// Handle 4xx & 5xx responses
x => {
    if (!x.config.url.includes('statestore'))
    {
        console.error(`Execution time for: ${x.config.url} - ${new Date().getTime() - x.config.meta.requestStartedAt} ms`)
    }
    throw x;
})

function getRequestTimeout() {
    return new Promise((resolve, reject) => {
        axios.get(state_endpoint + '/reqTimeout')
        .then(response => {
            resolve(response.data);
        })
        .catch(error => {
            console.log("Internal server error");
            reject(error.response.status);
        });
    })
}

// Get state
function getState(key) {
    return new Promise((resolve, reject) => {
        axios.get(state_endpoint + '/' + key)
        .then(response => {
            resolve(response.data);
        })
        .catch(error => {
            console.log("Internal server error");
            reject(error.response.status);
        });
    })
}

const port = 3000
app.listen(port, () => console.log(`listening on port ${port}`))