var socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');
let questions = [];

const quiz = document.getElementById("quiz_container");
const player_answers = document.querySelectorAll('input[name="answer"]');
const element_question = document.getElementById("the_question");
const question_label_a = document.getElementById("label_a");
const question_label_b = document.getElementById("label_b");
const question_label_c = document.getElementById("label_c");
const done_button = document.getElementById("done_button");
const current_room = document.querySelector(".current_room span");
const quiz_timer = document.getElementById("quiz_timer");
var cur_quiz = 0;
var cur_score = 0;
var max_quiz_timer:number = 0;
var current_quiz_timer:number =0;
let interval:NodeJS.Timer;
let quiz_started:boolean = false;
let inserted_name:string = "Error: No name entered";
let room_code:string = "Error: No room code entered";
do{
    inserted_name = prompt('What username do you want?');
    room_code = prompt('What room code do you want to join/create?'); 
} while(inserted_name === "" || room_code === "")

socket.emit('new-user', { name: inserted_name, room: room_code });
current_room!.innerText = room_code;

socket.emit("scoreboard-update",cur_score);


document.getElementById("form")!.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value) {
    socket.emit('chat message', input.value);
    input.value = ''; // Empty the input buffer
    }
});

socket.on('chat message', (msg: string) => {
    var item = document.createElement('li');
    item.textContent = msg;
    var chat_messages = document.getElementById('messages');
    chat_messages?.appendChild(item);
    chat_messages.scrollTop = chat_messages.scrollHeight;
});
socket.on('user-connected', name => {
    var item = document.createElement('li');
    item.textContent = 'New user connected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
    socket.emit("scoreboard-update",cur_score);
});    
socket.on('user-disconnected', name => {
    var item = document.createElement('li');
    item.textContent = 'User disconnected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
    socket.emit("scoreboard-update",cur_score);
}); 
socket.on('scoreboard-update', input_scoreboard => {
    while (opponent_score.hasChildNodes()) {
        opponent_score.removeChild(opponent_score.firstChild);
    }
    let scoreboard: player_data[];
    scoreboard = input_scoreboard;
    scoreboard.forEach( (element) => {
        var username = document.createElement('li'); 
        username.textContent = (element?.[1]+": "+element?.[0]);
        opponent_score.appendChild(username); 
    });
socket.on('load-quiz', quiz => {
    questions = quiz;
    load_quiz();
    quiz_started = true;
    document.getElementById("done_button")?.innerText = "Next Question";
    document.getElementById("question_options")?.style.display = "block";
    max_quiz_timer = Number((document.getElementById("question_time_interval") as HTMLInputElement).value)
    current_quiz_timer = max_quiz_timer;
    });     
}); 



/* ##### QUIZ LOGIC ##### */
function load_quiz() {
    const cur_quiz_data = questions[cur_quiz];
    element_question.innerText = cur_quiz_data.question;
    question_label_a.innerText = cur_quiz_data.a;
    question_label_b.innerText = cur_quiz_data.b;
    question_label_c.innerText = cur_quiz_data.c;
}
function check_player_answer() {
    player_answers.forEach((answer) => {
        if((answer as HTMLInputElement).checked)
        {
            if((answer as HTMLInputElement).id === questions[cur_quiz].correct)
            {
                cur_score++;
                socket.emit("scoreboard-update",cur_score);
            }
            (answer as HTMLInputElement).checked = false;
        }
    });
}
done_button.addEventListener("click", () => {
    
    if(!quiz_started){
        quiz_started = true;
        document.getElementById("done_button")?.innerText = "Next Question";
        socket.emit("load-quiz");
        interval = setInterval(update_timer, 1000);
    }
    else{
        check_player_answer();
        cur_quiz++;
        if (cur_quiz < questions.length) {
            load_quiz();
            current_quiz_timer = max_quiz_timer;
            quiz_timer?.innerHTML = current_quiz_timer;
        }
        else {
            clearInterval(interval);
            quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
        }
    }
});
function update_timer(){
    current_quiz_timer--;
    quiz_timer?.innerHTML = current_quiz_timer;
    if(current_quiz_timer <= 0){
        document.getElementById("done_button")?.click(); // Continue to next question if timer runs out
        current_quiz_timer = max_quiz_timer;
    }
}
/* ##### END OF QUIZ LOGIC ##### */