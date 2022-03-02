const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}
const scores = {}
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
      scores[socket.id] = new_score;
      socket.emit('scoreboard-update', users);
      //socket.broadcast.emit('update-score', new_score);
      });
    socket.on('new-user', name => {
      users[socket.id] = name;
      scores[socket.id] = 0;
      socket.broadcast.emit('user-connected',name);
      });    
    socket.on('disconnect', () => {
      io.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      delete scores[socket.id];
      });
    

});

// function printUsers(){
//   console.log(users);
//   console.log(scores);
// }

server.listen(3000, () => {
  console.log('listening on *:3000');
});