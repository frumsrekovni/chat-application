const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      console.log('message: ' + msg);
      });
    socket.on('update-score', new_score => {
      console.log("I AM RECEIVING UPDATED SCORES");
      socket.broadcast.emit('update-score', new_score);
      });
    socket.on('new-user', name => {
      users[socket.id] = name;
      socket.broadcast.emit('user-connected',name);
      console.log(name,'connected');
      });    
    socket.on('disconnect', () => { //Need to fix this.. Function???
      io.emit('user-disconnected', users[socket.id]);
      delete users[socket.id];
      console.log(users[socket.id],'disconnected');



      });
    

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});