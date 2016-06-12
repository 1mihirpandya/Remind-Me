var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();



//var user_data = {};



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

//app.post('/webhook', function (req, res) {
//    var events = req.body.entry[0].messaging;
//    for (i = 0; i < events.length; i++) {
//        var event = events[i];
//        if (event.message && event.message.text) {
//            sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
//        }
//    }
//    res.sendStatus(200);
//});




//    request({
//        url: 'https://graph.facebook.com/v2.6/<PAGE_ID>/thread_settings?access_token=<PAGE_ACCESS_TOKEN>',
//        setting_type:"call_to_actions",
//        thread_state:"new_thread",
//        call_to_actions:[
//        {
//            message:{
//                text:'Welcome to RemindMe! To add something to your to-do list, simply write "add my-action". To remove something from your list, write "remove action-number". To list your to-do list, write "list".'
//            }
//        }]
//    });




var items = [];
var item_descriptions = [];

function convert_to_list()
{
    listed = "";
    for (i = 0; i < items.length; i++)
    {
        item_number = i + 1;
        listed = listed + String(item_number) + "." + items[i] + "\n"; 
    }
    return listed;
}


function convert_to_summary(val)
{
    listed = "";
    for (i = 0; i < item_descriptions[val].length; i++)
    {
        listed = listed "-" + item_descriptions[val][i] + "\n"; 
    }
    return listed;
}



app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) 
        {
            sendMessage(event.sender.id, {text: "testing"});
//            if ((event.message.text).substr(0,15) === "add summary for")
//            {
//                index = parseInt(((event.message.text).split(" "))[1]) - 1;
//                item_descriptions[index].push(((event.message.text).substr((event.message.text).indexOf(":"))).trim());
//                sendMessage(event.sender.id, {text: "Summary added!"});
//            }
//            else 
                if ((event.message.text).substr(0,3) === "add")
            {
                sendMessage(event.sender.id, {text: "testing"});
                items.push((event.message.text).substr(3));
                //item_descriptions.push([]);
                to_do_list = convert_to_list()
                sendMessage(event.sender.id, {text: "testing"});
                sendMessage(event.sender.id, {text: "Item added!"});
            }
            else if (((event.message.text).trim()).substr(0,6) === "remove")
            {
                index = parseInt(((event.message.text).split(" "))[1]) - 1;
                if (index < items.length) 
                {
                    items.splice(index, 1);
                    to_do_list = convert_to_list()
                    sendMessage(event.sender.id, {text: "Item removed!"});
                }
                else
                {
                    sendMessage(event.sender.id, {text: "Sorry! That item doesn't exist."});
                }
            }
            else if (((event.message.text).trim()).trim() === "list")
            {
                to_do_list = convert_to_list();
                sendMessage(event.sender.id, {text: to_do_list + ""});
            }
            else if (((event.message.text).trim()).substr(0,8) === "describe")
            {
                index = parseInt(((event.message.text).split(" "))[1]) - 1;
                item_summary = convert_to_summary(index);
                sendMessage(event.sender.id, {text: item_summary + ""});
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