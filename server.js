var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'ultramagnus_prime') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});


var items = [];
var item_descriptions = [];


function convert_to_list()
{
    listed = "";
    if (items.length == 0)
        {
            return "Empty list!"
        }
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
        listed = listed + "-" + item_descriptions[val][i] + "\n"; 
    }
    return listed;
}


app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            
            
            
            
            
            if ((event.message.text).substr(0,15) === "add summary for")
            {
                index = parseInt(((event.message.text).substr(((event.message.text).indexOf("for") + 3),((event.message.text).indexOf(":"))).trim())) - 1;
                item_descriptions[index].push(((event.message.text).substr((event.message.text).indexOf(":") + 1)).trim());
                sendMessage(event.sender.id, {text: "Summary added!"});
            }
            
            
            
            
            
            else if (((event.message.text).trim()).substr(0,12) === "instructions")
                {
                    var item1 = "You can add items onto your to-do list and descriptions for each item. ";
                    var item2 = "To add an item to your to-do list, simply type 'add' before the item's title. ";
                    var item3 = "To remove an item from your to-do list, simply type 'remove' followed by the item's number on the list. ";
                    var item4 = "You can see the entire list and their corresponding numbers by typing 'list'. ";
                    var item5 = "To add a description for an item, type 'add summary for' followed by the item number and a colon. ";
                    var item6 = "To find out what the description for an item is, type 'describe' followed by the item number. ";
                    var item7 = "To clear the entire list, type 'clear'.";
                    var final_instruction = item1 + item2 + item3 + item4 + item5 + item6 + item7;
                    sendMessage(event.sender.id, {text: "" + final_instruction});
                }
            else if ((event.message.text).substr(0,3) === "add")
            {
                var addition = (event.message.text).substr(3);
                        items.push(addition);
                        item_descriptions.push([]);
                        sendMessage(event.sender.id, {text: "Item added!"});
            }
            else if (((event.message.text).trim()).substr(0,6) === "remove")
            {
                index = parseInt(((event.message.text).split(" "))[1]) - 1;
                if (index < items.length) 
                {
                    items.splice(index, 1);
                    item_descriptions.splice(index, 1);
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
                if (items.length == 0)
                    {
                        sendMessage(event.sender.id, {text: "Sorry! The list is empty."});
                    }
                else
                    {
                        index = parseInt(((event.message.text).split(" "))[1]) - 1;
                        to_do_list = convert_to_summary(index);
                        sendMessage(event.sender.id, {text: to_do_list + ""});
                    }
            }
            else if (((event.message.text).trim()).substr(0,5) === "clear")
            {
                if (items.length == 0)
                    {
                        sendMessage(event.sender.id, {text: "The to-do list is already empty."});
                    }
                else
                {
                    items = [];
                    item_descriptions = [];
                    sendMessage(event.sender.id, {text: "To-do list cleared!"});
                }
                
            }
            else
                {
                    sendMessage(event.sender.id, {text: to_do_list + "Sorry! Your command was not recognized."});
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