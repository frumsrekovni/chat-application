const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs')

class quiz_question{
  question:string;
  a:string;
  b:string;
  c:string;
  correct:string;
constructor(question = "No Question Set", a="No Option Set",b="No Option Set",c="No Option Set",correct="No Correct Option Set"){
  this.question = question;
  this.a = a;
  this.b = b;
  this.c = c;
  this.correct = correct;
}
};

class country{
  _name:string;
  total_area:number;
  population:number;
  constructor(name = "No Country", total_area=0,population=0){
    this._name = name;
    this.total_area = total_area;
    this.population = population;
    };
    public get area() {
      return this.total_area;
    };
    public get name() {
      return this._name;
    };
};

const country_data:country[] = [];
const server_quiz:quiz_question[] = [];

function make_quiz(){
  server_quiz.splice(0,server_quiz.length);
  for(let i = 0; i < 3; i++){
    let option_a:country = country_data.at(Math.floor(Math.random() * (country_data.length))) as country;
    let option_b:country = country_data.at(Math.floor(Math.random() * (country_data.length))) as country;
    let option_c:country = country_data.at(Math.floor(Math.random() * (country_data.length))) as country;
    let max:number = Math.max(option_a.total_area, option_b.total_area, option_c.total_area);
    let correct_option:string = "No Correct Option Set";
    if(option_a.area == max){
      correct_option = "a";
    } else if(option_b.area == max){
      correct_option = "b";
    } else{
      correct_option = "c";
    }
    server_quiz.push(new quiz_question("What country is the largest by area?",option_a.name,option_b.name,option_c.name,correct_option));
  };
  return server_quiz;
};


fs.readFile('countrydata.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
  data = data.split("\r").join("");// Remove all \r and \n characters from the data
  data = data.split("\n").join("");
  while(data.length > 0){
    let country_name:string = data.substring(0,data.search(":"));
    let country_area:string = data.substring(data.search(":")+1, data.search(","));
    while(country_name.at(0) == " "){ // If the first character in the country name is space then remove it
      country_name = country_name.substring(1);
    }

    country_data.push(new country(country_name, Number(country_area)));
    data = data.substring(data.search(",")+1, data.length);
  }
  // for(var i = 0; i < country_data.length; i++){
  //   console.log(country_data.at(i));
  // }
});
type player_data = [number, string, string]; // Tuple of player score, name and room
type scoreboard_data = [number, string]
let all_players_data = new Map<string, player_data>();

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

io.on('connection', socket => {

    socket.on('chat message', (msg: string) => {
      io.to(all_players_data.get(socket.id)?.[2]).emit('chat message', all_players_data.get(socket.id)?.[1]+"\n"+msg); // Only sends the message to other sockets with the same room id. Effectively working as private instances of quiz battles
      });
    socket.on('scoreboard-update', (new_score: number) => {
      all_players_data.get(socket.id)?.[0] = new_score;
      let temp_scoreboard: scoreboard_data[] = [];
      all_players_data.forEach((value) => {
        if(value[2] == all_players_data.get(socket.id)?.[2]){ // Only send a scoreboard update if they are in the same room
          let temp_var: scoreboard_data = [value[0],value[1]];
          temp_scoreboard.push(temp_var);
        }
      });
      console.log(temp_scoreboard);
      io.to(all_players_data.get(socket.id)?.[2]).emit('scoreboard-update', temp_scoreboard);
      });   
    socket.on('disconnect', () => {
      io.to(all_players_data.get(socket.id)?.[2]).emit('user-disconnected', all_players_data.get(socket.id)?.[1]);
      all_players_data.delete(socket.id);
      });   
    
    socket.on('new-user', ({ name, room }) => {
        var user: player_data;
        user = [0,name,room]; // When a new user joins they have the score 0
        all_players_data.set(socket.id,user); // Put that new user in the players data map
        socket.join(room);
        io.to(all_players_data.get(socket.id)?.[2]).emit('user-connected',name);
      });   
    socket.on('load-quiz', () => {
        let quiz = make_quiz();
        io.to(all_players_data.get(socket.id)?.[2]).emit('load-quiz',quiz);
      });         
});
// setInterval(printUsers,2000);
// function printUsers(){
//   console.log(all_players_data);
// }

server.listen(3000, () => {
  console.log('listening on *:3000');
});