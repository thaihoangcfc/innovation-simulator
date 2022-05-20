// Load Node modules
var express = require('express');
const ejs = require('ejs');
const axios = require('axios');
const bodyParser = require('body-parser');
var parser = bodyParser.urlencoded({extended: true});
// Initialise Express
var app = express();
// Set the view engine to ejs
app.set('view engine', 'ejs');
// Render static files
app.use(express.static('public'));
// Dapr endpoint for statestore
const state_endpoint = "http://localhost:3500/v1.0/state/statestore"
const dapr_url = "http://localhost:3500/v1.0/invoke/node-docker-api/method/user"

// *** GET Routes - display pages ***
// Root Route
app.get('/', function (req, res) {
    // Redirect to DB configurator page since we have no index
    res.redirect(301, '/dbconfigurator');
});

// DB configurator interface
app.get('/dbconfigurator', function (req, res) {
    res.render('pages/dbconfigurator');
});

// Workload generator interface
app.get('/workloadgenerator', function (req, res) {
    res.render('pages/workloadgenerator', { statusClass : "alert alert-primary",
        status : "Generate workload and observe response" });
});

// *** POST Routes - handle forms ***
// Response time submission
app.post('/dbconfigurator', parser, function(req, res) {
    const time = req.body.time;
    setState('responseTime', time);
    res.render('pages/dbconfigurator', {req: req.body});
});

// Request timeout submission
app.post('/setreqtimeout', parser, function(req, res) {
    const timeout = req.body.timeout;
    setState('reqTimeout', timeout);
    res.render('pages/dbconfigurator', {req: req.body})
});

// Generate workload submission
app.post('/apiload', parser, async function(req, res) {
    const workloadType = req.body.workloadType;
    const interval = req.body.interval;
    await setState("interval", interval);
    await setState("workloadType", workloadType);
    var statusClass = "";
    var status = "";

    generateWorkload().then(results => {
        statusClass = 'alert alert-primary';
        status = "Workload has been initiated";
    }).catch(err => {
        console.log(err.response.status);
    });

    res.render('pages/workloadgenerator', { statusClass : statusClass,status : status });
});

// Stop workload submission
app.post('/stopapiload', parser, async function(req, res) {
    var statusClass = "";
    var status = "";

    var reqStatus = await setState("workloadStatus", "stopped");
    if (reqStatus === 204)
    {
        statusClass = 'alert alert-primary';
        status = "Workload has been stopped";
    }
    else
    {
        statusClass = 'alert alert-warning';
        status = "Workload cannot be stopped. Check state store connection.";
    }

    res.render('pages/workloadgenerator', { statusClass : statusClass,status : status });
});

// Generate workload
async function generateWorkload() {
    const results = [];
    var reqStatus = await setState("workloadStatus","running");
    if (reqStatus === 204)
    {
        let workloadType = await getState("workloadType");
        let interval = await getState("interval");
        let workloadStatus = "running";
        while (workloadStatus === "running")
        {
            if (workloadType == "random")
            {
                let rndInt = Math.floor(Math.random() * 1000) + 1;
                await setState("responseTime", rndInt);
            }
            workloadStatus = await getState("workloadStatus");
            await delay(interval);
            let data = await axios.get(dapr_url);
            results.push(data);
        }
    }
    
    return results;
}

// Set state
function setState(key, value) {
    return new Promise((resolve, reject) => {
        axios.post(state_endpoint, [{
            'key': key,
            'value': value
        }])
        .then(response => {
            console.log(`State stored: { ${key} : ${value} }`);
            console.log(`State store statusCode: ${response.status}`);
            resolve(response.status);
        })
        .catch(error => {
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

// Delay function
function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

const port = 3333
app.listen(port, () => console.log(`listening on port ${port}`))