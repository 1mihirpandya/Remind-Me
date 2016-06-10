var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    console.log('works');
    if (req.query['hub.verify_token'] === 'ultramagnus_prime') {
        console.log('works');
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});
