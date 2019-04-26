var http = require('http')
var fs = require('fs')
var express = require('express');
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/chat.html');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 10000);

/*
* connection is an event 
* socket - http server io has a port to listen to, socket is the instance of the server
*/
io.on('connection', function(socket) {
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Welcome!',id: 'server1' });//, id: socket.id 

    socket.on('i am client', console.log);//client side msg printing in server side - in terminal
    socket.on('message', function (from, msg) {//message is a userdefined event , values emitted from client side
        sendMsgToDB(msg);
	io.sockets.emit('new_message', {message : msg, username : from});
        console.log('I received a private message by ', from, ' saying ', msg);

    })

    });
  //});

/**
  * Method which sends the data sent from client to MongoDB database
  * @param clientMsg- The data sent from the client.
  */
function sendMsgToDB(clientMsg) {
    MongoClient.connect(url, function(err, db) {
    if (err) {
        console.log(err);
    } else {
        var dbo = db.db("reshu");
        var jsonString = "{\"data\":" + "\"" + clientMsg + "\"}"; //Jsonify the string passes
        var jsonObj = JSON.parse(jsonString);
        dbo.collection("customers").insertOne(jsonObj, function(err, res) {
        if (err) {
             console.log(err);
        } else {
            console.log("1 document inserted");
        }
        db.close();
        });
        
    }
 });
}

app.listen(3000);
