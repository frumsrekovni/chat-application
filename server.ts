const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

type player_data = [number, string]; // Tuple of player name and score
let all_players_data = new Map<string, player_data>();
let all_player_rooms = new Map<string, string>();

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (socket) => {

    socket.on('chat message', (msg) => {
      io.to(all_player_rooms.get(socket.id)).emit('chat message', msg); // Only sends the message to other sockets with the same room id. Effectively working as private instances of quiz battles
      });
    socket.on('scoreboard-update', new_score => {
      all_players_data.get(socket.id)?.[0] = new_score;
      let temp_scoreboard: player_data[] = [];
      all_players_data.forEach((value) => {
        temp_scoreboard.push(value);
      });
      console.log(temp_scoreboard);
      //socket.emit('scoreboard-update', temp_scoreboard);
      io.to(all_player_rooms.get(socket.id)).emit('scoreboard-update', temp_scoreboard);
      });
    socket.on('new-room', room => {
      all_player_rooms.set(socket.id,room);
      socket.join(room);
      });  
    socket.on('new-user', name => {
      var user: player_data;
      user = [0,name]; // When a new user joins they have the score 0
      all_players_data.set(socket.id,user); // Put that new user in the players data map
      // socket.broadcast.emit('user-connected',name);
      io.to(all_player_rooms.get(socket.id)).emit('user-connected',name);
      });    
    socket.on('disconnect', () => {
      io.emit('user-disconnected', all_players_data.get(socket.id)?.[1]);
      all_players_data.delete(socket.id);
      all_player_rooms.delete(socket.id);
      });   

});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }

server.listen(3000, () => {
  console.log('listening on *:3000');
});