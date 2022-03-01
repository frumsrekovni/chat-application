var socket = io();

var form = document.getElementById('form');
var input = document.getElementById('input');

var questions = [
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
    }
];
var quiz = document.getElementById("quiz_container");
var player_answers = document.querySelectorAll('input[name="answer"]');
var element_question = document.getElementById("the_question");
var question_label_a = document.getElementById("label_a");
var question_label_b = document.getElementById("label_b");
var question_label_c = document.getElementById("label_c");
var done_button = document.getElementById("done_button");
var cur_quiz = 0;
var cur_score = 0;

const inserted_name = prompt('What is your name?')
socket.emit('new-user', inserted_name)
update_scoreboard();

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
socket.on('update-score', new_score => {
    document.getElementById("opponent_score").innerHTML = "".concat(new_score);
});
socket.on('user-connected', name => {
    var item = document.createElement('li');
    item.textContent = 'New user connected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
    update_scoreboard();
});   
socket.on('user-disconnected', name => {
    var item = document.createElement('li');
    item.textContent = 'User disconnected: '+name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
}); 
socket.on('scoreboard-update', users => {
    while (opponent_score.hasChildNodes()) {
        opponent_score.removeChild(opponent_score.firstChild);
    }
    for (const [key, value] of Object.entries(users)) {
        var username = document.createElement('li');
        username.textContent = value;
        opponent_score.appendChild(username);   
    }
}); 



function update_scoreboard(){
    socket.emit("scoreboard-update",cur_score);
};


/* ##### QUIZ LOGIC ##### */

load_quiz();
function load_quiz() {
    var cur_quiz_data = questions[cur_quiz];
    element_question.innerText = cur_quiz_data.question;
    question_label_a.innerText = cur_quiz_data.a;
    question_label_b.innerText = cur_quiz_data.b;
    question_label_c.innerText = cur_quiz_data.c;
}
function check_player_answer() {
    player_answers.forEach(function (answer) {
        if (answer.checked) {
            if (answer.id === questions[cur_quiz].correct) {
                cur_score++;
                socket.emit('update-score', cur_score);
            }
            answer.checked = false;
        }
    });
}
done_button.addEventListener("click", function () {
    check_player_answer();
    cur_quiz++;
    if (cur_quiz < questions.length) {
        document.getElementById("your_score").innerHTML = "".concat(cur_score);
        load_quiz();
    }
    else {
        quiz.innerHTML = "<div>You got ".concat(cur_score, " out of ").concat(questions.length, " </div><button onclick=\"location.reload()\">Reload</button>");
    }
});

/* ##### END OF QUIZ LOGIC ##### */