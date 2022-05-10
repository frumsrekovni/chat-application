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
const question_options = document.getElementById("question_options");
const lobby_settings = document.getElementById("lobby_settings");
const done_button = document.getElementById("done_button");
const rematch_button = document.getElementById("rematch_button");
const submit_button = document.getElementById("submit_button");
const current_room = document.querySelector(".current_room span");
const quiz_timer = document.getElementById("quiz_timer");
let cur_quiz:number = 0;
let cur_score:number = 0;
var max_quiz_timer:number = 0;
var current_quiz_timer:number =0;
let interval:NodeJS.Timer;
let quiz_started:boolean = false;
let inserted_name:string = "Error: No name entered";
let room_code:string = "Error: No room code entered";
// do{
//     inserted_name = prompt('What username do you want?');
//     room_code = prompt('What room code do you want to join/create?'); 
// } while(inserted_name === "" || room_code === "")


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
socket.on('load-quiz', ({made_quiz, time}) => {
    questions = made_quiz;
    load_quiz();
    quiz_started = true;
    cur_quiz = 0;
    cur_score = 0;
    socket.emit("scoreboard-update",cur_score);
    rematch_button?.style.display = "none";
    done_button?.innerText = "Next Question";
    done_button?.style.display = "flex";
    question_options?.style.display = "block";
    lobby_settings?.style.display = "none";
    max_quiz_timer = time;
    current_quiz_timer = max_quiz_timer;
    clearInterval(interval); // This needs to happen since this load-quiz function can be run more than once depending on the network
    interval = setInterval(update_timer, 1000); // Start the timer and so it updates every 1000ms
    console.log("I am now RECEIVING a load quiz");
    });     
}); 



/* ##### QUIZ LOGIC ##### */
function load_quiz() {
    const cur_quiz_data = questions[cur_quiz];
    if(cur_quiz_data == undefined){
        socket.emit("load-quiz",
        {number_of_questions:Number((document.getElementById("question_amount") as HTMLInputElement).value),
        time_between_questions:Number((document.getElementById("question_time_interval") as HTMLInputElement).value)});
    }
    else{
        element_question.innerText = cur_quiz_data.question;
        question_label_a.innerText = cur_quiz_data.a;
        question_label_b.innerText = cur_quiz_data.b;
        question_label_c.innerText = cur_quiz_data.c;
    }
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
        // When clicking start. The chosen parameters are sent to everyone in the same room
        socket.emit("load-quiz",
        {number_of_questions:Number((document.getElementById("question_amount") as HTMLInputElement).value),
        time_between_questions:Number((document.getElementById("question_time_interval") as HTMLInputElement).value)});
    }
    else{
        check_player_answer();
        cur_quiz++;
        
        if (cur_quiz < questions.length) {
            load_quiz(); // This loads the next question
            current_quiz_timer = max_quiz_timer;
            quiz_timer?.innerHTML = current_quiz_timer;
        }
        else {
            quiz_started = false;
            clearInterval(interval); // Stop the countdown timer
            //quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
            element_question?.innerText = "You got "+cur_score+" out of "+questions.length;
            done_button?.style.display = "none";
            question_options?.style.display = "none";
            rematch_button?.style.display = "flex";
            lobby_settings?.style.display = "block";
        }
    }
});
rematch_button.addEventListener("click", () => {
    socket.emit("load-quiz",
    {number_of_questions:Number((document.getElementById("question_amount") as HTMLInputElement).value),
    time_between_questions:Number((document.getElementById("question_time_interval") as HTMLInputElement).value)});
});
submit_button.addEventListener("click", () => {
    let name = (document.getElementById("username") as HTMLInputElement);
    let code = (document.getElementById("roomcode") as HTMLInputElement);
    if(name.value !== "" && code.value !== ""){
        inserted_name = name.value;
        room_code = code.value;
        socket.emit('new-user', { name: inserted_name, room: room_code });
        current_room!.innerText = room_code;
        socket.emit("scoreboard-update",cur_score);
        document.getElementById("bg_blocker")?.style.display = "none";
        (document.getElementsByClassName('login_container')[0] as HTMLElement).style.display = 'none';
    }
    else{
        name.placeholder = "Username required!";
        code.placeholder = "Room code required!"
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