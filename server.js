var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var Server = require("socket.io").Server;
var io = new Server(server);
var all_players_data = new Map();
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
    });
    socket.on('scoreboard-update', function (new_score) {
        var _a;
        (_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[0] = new_score;
        var scoreboard;
        var temp;
        temp = [2, 'fuckingtest'];
        scoreboard.push(temp);
        console.log(scoreboard);
        // for (let [score,name] of all_players_data.values()) {
        //   let temp: player_data;
        //   temp = [score, name];
        //   scoreboard.push(temp);
        // };
        socket.emit('scoreboard-update', scoreboard);
    });
    socket.on('new-user', function (name) {
        var user;
        user = [0, name];
        all_players_data.set(socket.id, user);
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('disconnect', function () {
        var _a;
        io.emit('user-disconnected', (_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[1]);
        all_players_data["delete"](socket.id);
    });
});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }
server.listen(3000, function () {
    console.log('listening on *:3000');
});
