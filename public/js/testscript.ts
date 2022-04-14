var socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');
let questions = [];
const questions2 = [
    {
        question: "What country is the largest by area?",
        a: "Canada",
        b: "USA",
        c: "China",
        correct: "a"
    },
    {
        question: "What country is the smallest by area?",
        a: "Lesotho",
        b: "Switzerland",
        c: "Monaco",
        correct: "c"
    },
    {
        question: "What country is the most populous?",
        a: "Bangladesh",
        b: "Nigeria",
        c: "Russia",
        correct: "b"
    },
    {
        question: "What country is the largest by area?",
        a: "Sweden",
        b: "Denmark",
        c: "Norway",
        correct: "b"
    },
    {
        question: "What country is the most populous?",
        a: "Spain",
        b: "Venezuela",
        c: "Morocco",
        correct: "b"
    },
    {
        question: "What country is closest to the equator?",
        a: "Egypt",
        b: "South Africa",
        c: "Yemen",
        correct: "c"
    }
];

const quiz = document.getElementById("quiz_container");
const player_answers = document.querySelectorAll('input[name="answer"]');
const element_question = document.getElementById("the_question");
const question_label_a = document.getElementById("label_a");
const question_label_b = document.getElementById("label_b");
const question_label_c = document.getElementById("label_c");
const done_button = document.getElementById("done_button");
const current_room = document.querySelector(".current_room span");
var cur_quiz = 0;
var cur_score = 0;

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
    }
    else{
        check_player_answer();
        cur_quiz++;
        if (cur_quiz < questions.length) {
            load_quiz();
        }
        else {
            quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
        }
    }
});

/* ##### END OF QUIZ LOGIC ##### */