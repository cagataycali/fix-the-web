const express = require('express')
const app = express()
const port = process.env.PORT || 3000
var url = require('url');
const Gun = require('gun')
const SEA = Gun.SEA;

const gun = Gun(["https://cc-gun.herokuapp.com/gun"])
const user = gun.user()
// Generated with: await SEA.pair()
const pair = { // DO NOT PUBLISH THIS ANYONE
    epriv: "V5EzJhGjXm1k_mKmHwS8FI3hzP1-pNAYg38LzhA6DUQ",
    epub: "nwXLRQTgk43kNpGk5WnZ3Mf1TW5s-oRpR-ep-JoCq28.wcbBXgpwFiuJy7o2AP_VLFHH_2AjDaYjeteLlDEXfZI",
    priv: "ubmM22xW4b7nYdEnPDciUzKV20icdhxpVF7BmGNVs3Q",
    pub: "9B5FS6vH8-Z1ZjGmFdwiZArGHuTj6q1zExLs9zFIRKc.JO_gRqJdlLQ2ZRwUcWcG64zvve0Z2GeDDSItCxjnv5M"
}

function fullUrl(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });
}

const publish = (request, response) => {
    user.auth(pair)
    user.get(fullUrl(request)).put(response)
}

app.use(express.static('public'))

// Middleware
app.use((req, res, next) => {
    res.set('CC', true);
    res.set('CC-PUBLIC', pair.pub);
    next()
})

app.get('/', (request, response) => response.sendfile('index.html'))

app.get('/api', (request, response) => {
    // Test API: just we want to p2p serveable.
    const payload = {
        hello: "peer"
    }
    publish(request, payload)

    response.json(payload)
})

app.get('/api-non-p2p', (request, response) => {
    // Test API: just we don't want to p2p serveable.
    const payload = {
        hello: "world"
    }

    response.json(payload)
})

app.listen(port, () => console.log(`P2P CC app listening on port ${port}!`))