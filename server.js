var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var Server = require("socket.io").Server;
var io = new Server(server);
var fs = require('fs');
var quiz_question = /** @class */ (function () {
    function quiz_question(question, a, b, c, correct) {
        if (question === void 0) { question = "No Question Set"; }
        if (a === void 0) { a = "No Option Set"; }
        if (b === void 0) { b = "No Option Set"; }
        if (c === void 0) { c = "No Option Set"; }
        if (correct === void 0) { correct = "No Correct Option Set"; }
        this.question = question;
        this.a = a;
        this.b = b;
        this.c = c;
        this.correct = correct;
    }
    return quiz_question;
}());
;
var country = /** @class */ (function () {
    function country(name, total_area, population) {
        if (name === void 0) { name = "No Country"; }
        if (total_area === void 0) { total_area = 0; }
        if (population === void 0) { population = 0; }
        this._name = name;
        this.total_area = total_area;
        this.population = population;
    }
    ;
    Object.defineProperty(country.prototype, "area", {
        get: function () {
            return this.total_area;
        },
        enumerable: false,
        configurable: true
    });
    ;
    Object.defineProperty(country.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    ;
    return country;
}());
;
var country_data = [];
var server_quiz = [];
function make_quiz() {
    server_quiz.splice(0, server_quiz.length);
    for (var i = 0; i < 10; i++) {
        var option_a = country_data.at(Math.floor(Math.random() * (country_data.length)));
        var option_b = country_data.at(Math.floor(Math.random() * (country_data.length)));
        var option_c = country_data.at(Math.floor(Math.random() * (country_data.length)));
        var max = Math.max(option_a.total_area, option_b.total_area, option_c.total_area);
        var correct_option = "No Correct Option Set";
        if (option_a.area == max) {
            correct_option = "a";
        }
        else if (option_b.area == max) {
            correct_option = "b";
        }
        else {
            correct_option = "c";
        }
        //console.log(option_a.name, option_a.area, option_b.name, option_b.area, option_c.name, option_c.area, correct_option);
        server_quiz.push(new quiz_question("What country is the largest by area?", option_a.name, option_b.name, option_c.name, correct_option));
    }
    ;
    return server_quiz;
}
;
fs.readFile('countrydata.txt', 'utf8', function (err, data) {
    if (err) {
        console.error(err);
        return;
    }
    data = data.split("\r").join(""); // Remove all \r and \n characters from the data
    data = data.split("\n").join("");
    while (data.length > 0) {
        var country_name = data.substring(0, data.search(":"));
        var country_area = data.substring(data.search(":") + 1, data.search(","));
        while (country_name.at(0) == " ") { // If the first character in the country name is space then remove it
            country_name = country_name.substring(1);
        }
        country_data.push(new country(country_name, Number(country_area)));
        data = data.substring(data.search(",") + 1, data.length);
    }
    // for(var i = 0; i < country_data.length; i++){
    //   console.log(country_data.at(i));
    // }
});
var all_players_data = new Map();
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        var _a, _b;
        io.to((_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[2]).emit('chat message', ((_b = all_players_data.get(socket.id)) === null || _b === void 0 ? void 0 : _b[1]) + "\n" + msg); // Only sends the message to other sockets with the same room id. Effectively working as private instances of quiz battles
    });
    socket.on('scoreboard-update', function (new_score) {
        var _a, _b;
        (_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[0] = new_score;
        var temp_scoreboard = [];
        all_players_data.forEach(function (value) {
            var _a;
            if (value[2] == ((_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[2])) { // Only send a scoreboard update if they are in the same room
                var temp_var = [value[0], value[1]];
                temp_scoreboard.push(temp_var);
            }
        });
        console.log(temp_scoreboard);
        io.to((_b = all_players_data.get(socket.id)) === null || _b === void 0 ? void 0 : _b[2]).emit('scoreboard-update', temp_scoreboard);
    });
    socket.on('disconnect', function () {
        var _a, _b;
        io.to((_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[2]).emit('user-disconnected', (_b = all_players_data.get(socket.id)) === null || _b === void 0 ? void 0 : _b[1]);
        all_players_data["delete"](socket.id);
    });
    socket.on('new-user', function (_a) {
        var _b;
        var name = _a.name, room = _a.room;
        var user;
        user = [0, name, room]; // When a new user joins they have the score 0
        all_players_data.set(socket.id, user); // Put that new user in the players data map
        socket.join(room);
        io.to((_b = all_players_data.get(socket.id)) === null || _b === void 0 ? void 0 : _b[2]).emit('user-connected', name);
    });
    socket.on('load-quiz', function () {
        var _a;
        io.to((_a = all_players_data.get(socket.id)) === null || _a === void 0 ? void 0 : _a[2]).emit('load-quiz', make_quiz());
    });
});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }
server.listen(process.env.PORT, function () {
    //console.log('listening on *:3000');
});
