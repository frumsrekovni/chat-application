const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
        console.log('message: ' + msg);
        });
    socket.on('new-user', name => {
      users[socket.id] = name
      io.emit('user-connected', name)
      console.log(name,'connected');
    });    
    socket.on('disconnect', () => {
        console.log(users[socket.id],'disconnected');
        });
    

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});