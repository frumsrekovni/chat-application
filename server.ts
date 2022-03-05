const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

type player_data = [number, string]; // Tuple of player name and score
let all_players_data = new Map<string, player_data>(); 

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      console.log('message: ' + msg);
      });
    socket.on('scoreboard-update', new_score => {
      all_players_data.get(socket.id)?.[0] = new_score;
      let temp_scoreboard: string[] = [];
      let temp_data: string;
      temp_data = "3934jj";
      temp_scoreboard.push("aas");
      console.log(temp_scoreboard);  

      // let scoreboard: player_data[];
      // let temp: player_data;
      // temp = [2, 'fuckingtest'];
      // scoreboard.push(temp);
      // console.log(scoreboard);
      
      // for (let [score,name] of all_players_data.values()) {
      //   let temp: player_data;
      //   temp = [score, name];
      //   scoreboard.push(temp);
      // };
      
      //socket.emit('scoreboard-update', scoreboard);


      });
    socket.on('new-user', name => {
      var user: player_data;
      user = [0,name]; // When a new user joins they have the score 0
      all_players_data.set(socket.id,user); // Put that new user in the players data map
      socket.broadcast.emit('user-connected',name);
      });    
    socket.on('disconnect', () => {
      io.emit('user-disconnected', all_players_data.get(socket.id)?.[1]);
      all_players_data.delete(socket.id);
      });
    

});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }

server.listen(3000, () => {
  console.log('listening on *:3000');
});