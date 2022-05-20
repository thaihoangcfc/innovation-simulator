const express = require('express')
const os = require('os')
const axios = require('axios')
const bodyParser = require('body-parser')

const app = express()

var jsonParser = bodyParser.json()

// Dapr endpoint for statestore
const state_endpoint = "http://localhost:3500/v1.0/state/statestore"

// Set initial delay time
var delay = 0;

app.get('/', (req, res) => {
  res.send(`This is response from API 2 pod ${os.hostname()}!`)
})

app.post('/me', jsonParser, function (req, res) {
  const name = req.body.name;
  axios.get(state_endpoint + '/responseTime')
  .then(response => {
    console.log(`Get state { responseTime : ${response.data}`);
    delay = response.data;
    setTimeout(function() {
      res.send(`Hi ${name}, You are requesting your name on pod ${os.hostname()}!`);
    }, delay); 
  })
  .catch(error => {
    console.log(error);
  });
})

const port = 4000
app.listen(port, () => console.log(`listening on port ${port}`))
