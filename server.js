var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
//timeout interval: 2000/1000 = 2 seconds
io.set('heartbeat interval', 1000);
io.set('heartbeat timeout', 2000);

var users = [];

var secret = require('./secret');

server.listen(secret.testport, function () {
    console.log("Server is now running on port " + secret.testport);
});


io.on('connection', function (socket) {
    console.log(socket.request._query.nick + " is trying to connect");
    if (isAuthorized(socket.request._query.authkey)) {
        checkNick(socket, socket.request._query.nick);
    } else {
        console.log("Authorization failed for " + socket.request._query.nick);
        socket.disconnect();
    }

    socket.on('new_globalmessage', function (data, ack) {
        var send = new Object();
        send.from = getUser(socket.id).name;
        send.msg = data.msg;
        send.date = data.date;
        socket.broadcast.emit('globalmessage', send);
        console.log("[Global message] from: " + send.from + ", message: " + send.msg);
        ack();
    });

    socket.on('new_privatemessage', function (data) {
        var send = new Object();
        send.from = getUser(socket.id).name;
        send.msg = data.msg;
        io.to(getUserFromName(data.receiver).id).emit('privatemessage', send);
        console.log("[Private message] from: " + send.from + ", to: " + getUserFromName(data.receiver).name + ", message: " + send.msg);
        //io.to(socket.id).emit();
    });

    socket.on('change_nick', function (data, ack) {
        var new_nick = data.nick;
        var user = getUser(socket.id);
        console.log("[Nick change] " + user.name + " changed nick to " + new_nick);
        user.name = new_nick;
        ack();
    });

    socket.on('getUsers', function () {
        io.to(socket.id).emit('allUsers', users);
        console.log("Updating all Users to " + getUser(socket.id).name);
    });

    socket.on('disconnect', function () {
        console.log(getUser(socket.id).name + " disconnected!");
        io.sockets.emit('userDisconnect', getUser(socket.id));
        removeUser(socket.id);
    });
});

function getUser(id) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            return users[i];
        }
    }
}

function getUserFromName(name) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].name == name) {
            return users[i];
        }
    }
}

function removeUser(id) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            users.splice(i, 1);
        }
    }
}

function containsNick(nick) {
    for (var i = 0; i < users.length; i++) {
        if (matchIgnoreCase(users[i].name, nick)) {
            return true;
        }
    }
    return false;
}

function matchIgnoreCase(str1, str2) {
    if (str1.toLowerCase() == str2.toLowerCase()) {
        return true;
    } else {
        return false;
    }
}

function isAuthorized(key) {
    if (key == secret.authKey) {
        return true;
    } else {
        return false;
    }
}

function checkNick(socket, nick) {
    console.log("Checking nick...");
    if (!containsNick(nick)) {
        io.to(socket.id).emit('suclogin');
        var newbie = new user(socket.id, nick);
        socket.broadcast.emit('userConnect', newbie);
        users.push(newbie);
        console.log("New User: " + newbie.name);
    } else {
        io.to(socket.id).emit('nologin');
        console.log('[I] Username: ' + nick + ' is already taken');
    }
}

function user(id, name) {
    this.id = id;
    this.name = name;
}

function connectDatabase() {
    dbconnector.connection.connect(function (err) {
        if (err) throw err;
        console.log("Database connected!");
        dbconnector.connection.query("SELECT nick,deviceid FROM users",
            function (err, result) {
                if (err) throw err;
                result.forEach(function (row) {
                    offline_users.push(new offline_user(row.nick, row.deviceid));
                });
            });
    });
}