var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var fs = require('fs');

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

var items_all = [];
var items = [];
var item_descriptions_all = [];
var item_descriptions = [];
var instruction_list = ["You can add items onto your to-do list and descriptions for each item. ", "To add an item to your to-do list, simply type 'add' before the item's title. ", "To remove an item from your to-do list, simply type 'remove' followed by the item's number on the list. ", "You can see the entire list and their corresponding numbers by typing 'list'. ", "To add a description for an item, type 'add summary for' followed by the item number and a colon. ", "To find out what the description for an item is, type 'describe' followed by the item number. ", "To clear the entire list, type 'clear'."];
var user_index = 0;





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
        listed = listed + String(item_number) + ". " + items[i] + "\n"; 
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


function txt_to_id(data, id)
{
    if (data === "") 
    {
        user_index = 0;
    }
    else 
    {
        var user_arr = data.split(":");
        user_index = user_arr.indexOf(id);
        if (user_index == -1) 
            {
                user_index = user_arr.length;
            }
    }
}

function txt_to_items(data)
{
    if (data === "")
        {
            items_all = [];
            items = [];
        }
    else
        {
            items_all = (data.split(":"));
            for (x = 0; x < items_all.length; x++)
            {
                items_all[x] = items_all[x].split(",");
            }
            items = items_all[user_index];
        }
}


function txt_to_item_descriptions(data)
{
    if (data === "")
        {
            item_descriptions_all = [];
            item_descriptions = [];
        }
    else
        {
            item_descriptions_all = (data.split(":"));
            for (x = 0; x < item_descriptions_all.length; x++)
            {
                item_descriptions_all[x] = item_descriptions_all[x].split(",");
                for (y = 0; y < item_descriptions_all[x].length; y++)
                {
                    item_descriptions_all[x][y] = item_descriptions_all[x][y].split(";");
                }
            }
            item_descriptions = item_descriptions_all[user_index];
        }
}

function convert_items()
{
    items_copy = items_all;
    temp_str = "";
    for (x = 0; x < items_copy.length; x++)
        {
            for (y = 0; y < items_copy[x].length; y++)
                {
                	if (y != 0)
                		{
                    		temp_str = temp_str + "," + items_copy[x][y];
                		}
                	else
                		{
                			temp_str = temp_str + items_copy[x][y];
                		}
                }
            if (x != items_copy.length - 1)
            	{
            		temp_str = temp_str + ":";
            	}
        }
    return temp_str;
}


function convert_items()
{
    items_copy = item_descriptions_all;
    temp_str = "";
    for (x = 0; x < items_copy.length; x++)
        {
            for (y = 0; y < items_copy[x].length; y++)
                {
                	for (z = 0; z < items_copy[x][y].length; z++)
                		{
                			console.log(temp_str);
							if (z != 0)
                				{
                    				temp_str = temp_str + ";" + items_copy[x][y][z];
                				}
                			else
                				{
                					temp_str = temp_str + items_copy[x][y][z];
                				}
                		}
                	if (y != items_copy.length - 1)
                		{
                    		temp_str = temp_str + ",";
                		}
                }
            if (x != items_copy.length - 1)
            	{
            		temp_str = temp_str + ":";
            	}
        }
    return temp_str;
}

function read_data(id)
{
                        fs.readFile("id.txt", function (error, data) 
                    {
                        txt_to_id(data.toString(), event.sender.id);
                    });
                    fs.readFile("items.txt", function (error, data) 
                    {
                        txt_to_items(data.toString());
                    });
                    fs.readFile("item_descriptions.txt", function (error, data) 
                    {
                        txt_to_item_descriptions(data.toString());
                    });
    sendMessage(id, {text: "downloaded"});
}


app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            
            //read_data(event.sender.id);
            
            if ((event.message.text).substr(0,15) === "add summary for")
            {
                index = parseInt(((event.message.text).substr(((event.message.text).indexOf("for") + 3),((event.message.text).indexOf(":"))).trim())) - 1;
                item_descriptions[index].push(((event.message.text).substr((event.message.text).indexOf(":") + 1)).trim());
                sendMessage(event.sender.id, {text: "Summary added!"});
                item_descriptions_all[user_index] = item_descriptions;
            }
            
            
            
            
            
            else if (((event.message.text).trim()).substr(0,12) === "instructions")
                {
                    for (z = 0; z < instruction_list.length; z++)
                    {
                        sendMessage(event.sender.id, {text: "" + instruction_list[z]});
                    }
                }
            else if ((event.message.text).substr(0,3) === "add")
            {
                var addition = ((event.message.text).substr(3)).trim();
                items.push(addition);
                item_descriptions.push([]);
                sendMessage(event.sender.id, {text: "Item added!"});
                items_all[user_index] = items;
            }
            else if (((event.message.text).trim()).substr(0,6) === "remove")
            {
                index = parseInt(((event.message.text).split(" "))[1]) - 1;
                if (index < items.length) 
                {
                    items.splice(index, 1);
                    item_descriptions.splice(index, 1);
                    sendMessage(event.sender.id, {text: "Item removed!"});
                    items_all[user_index] = items;
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
                        var to_do_list = convert_to_summary(index);
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
                    items_all[user_index] = items;
                    item_descriptions_all[user_index] = item_descriptions;
                    sendMessage(event.sender.id, {text: "To-do list cleared!"});
                }
                
            }
            else
            {
                sendMessage(event.sender.id, {text: "Sorry! Your command was not recognized."});
            }
            //
            //
            //
            //
            //
            //
//            var final_items = convert_items();
//            var final_item_descriptions = convert_item_descriptions();
//            fs.writeFile('items.txt', final_items, function (err) 
//            {
//                if (err) return console.log(err);
//                //console.log('Hello World > helloworld.txt');
//            });
//            fs.writeFile('items_descriptions.txt', final_item_descriptions, function (err) 
//            {
//                if (err) return console.log(err);
//                //console.log('Hello World > helloworld.txt');
//            });
            //
            //
            //
            //
            //
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