var socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');


const country_area_data = [ // This is by total area in square km (land+water)
    {Russia:17098246},
    {Canada:9984670},
    {China:9596961 },
    {USA:9833517},
    {Brazil:8515767},
    {Australia:7692024},
    {India:3287263},
    {Argentina:2780400},
    {Kazakhstan:2724900},
    {Algeria:2381741},
    {Democratic_Republic_of_the_Congo:2344858},
    {Kingdom_of_Denmark:2220093},
    {Saudi_Arabia:2149690},
    {Mexico:1964375},
    {Indonesia:1904569},
    {Sudan:1861484},
    {Libya:1759540},
    {Iran:1648195},
    {Mongolia:1564110},
    {Peru:1285216},
    {Chad:1284000},
    {Niger:1267000},
    {Lesotho:30355},
    {Switzerland:41284},
    {Monaco:2},
];
const questions = [
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
var cur_quiz = 0;
var cur_score = 0;

const inserted_name = prompt('What username do you want?');
const room_code = prompt('What room code do you want to join/create?');
socket.emit('new-user', { name: inserted_name, room: room_code });

socket.emit("scoreboard-update",cur_score);

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
    }
});

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
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
}); 
socket.on('scoreboard-update', input_scoreboard => {
    while (opponent_score.hasChildNodes()) {
        opponent_score.removeChild(opponent_score.firstChild);
    }
    let scoreboard: player_data[];
    scoreboard = input_scoreboard;
    scoreboard.forEach( (element) => {
        var username = document.createElement('li');
        var score = document.createElement('li');  
        username.textContent = (element?.[1]+": "+element?.[0]);
        opponent_score.appendChild(username); 
    });
}); 



/* ##### QUIZ LOGIC ##### */

load_quiz();
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
    check_player_answer();
    cur_quiz++;
    if (cur_quiz < questions.length) {
        load_quiz();
    }
    else {
        quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
    }
});

/* ##### END OF QUIZ LOGIC ##### */