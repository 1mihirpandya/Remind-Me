var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();



var user_data = {};



app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('Mihir Pandya');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'ultramagnus_prime') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

app.post('/webhook', function (req, res) 
{
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) 
    {
        var event = events[i];
        if (event.message && (event.message.text === 'hello')) 
        {
            user_data[String(event.sender.id)] = [];
            sendMessage(event.sender.id, "To add something to you list of reminders, begin your message with the word 'add'. To remove something from your list of reminders, begin your message with the word 'remove'.");
        }
//        else if (event.message && event.message.text) 
//        {
//            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
//        }
        else 
        {
            var word = ((event.message.text).split(" "))[0];
            if (event.message && (word.toLowerCase === 'add')) 
            {
                user_data[String(event.sender.id)].push((event.message.text).substr(4));
                sendMessage(event.sender.id, "The item has been added!");
            }   
            else if (event.message && (word.toLowerCase === 'remove')) 
            {
                sendMessage(event.sender.id, "The item has been removed!");
            } 
            else if (event.message && (word.toLowerCase === 'list')) 
            {
                sendMessage(event.sender.id, "The item has been added!");
            }  
        }
    }
    res.sendStatus(200);
});


function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};