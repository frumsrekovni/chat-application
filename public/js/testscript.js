var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var questions = [];
var questions2 = [
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
var quiz = document.getElementById("quiz_container");
var player_answers = document.querySelectorAll('input[name="answer"]');
var element_question = document.getElementById("the_question");
var question_label_a = document.getElementById("label_a");
var question_label_b = document.getElementById("label_b");
var question_label_c = document.getElementById("label_c");
var done_button = document.getElementById("done_button");
var current_room = document.querySelector(".current_room span");
var cur_quiz = 0;
var cur_score = 0;
var quiz_started = false;
var inserted_name = "Error: No name entered";
var room_code = "Error: No room code entered";
do {
    inserted_name = prompt('What username do you want?');
    room_code = prompt('What room code do you want to join/create?');
} while (inserted_name === "" || room_code === "");
socket.emit('new-user', { name: inserted_name, room: room_code });
current_room.innerText = room_code;
socket.emit("scoreboard-update", cur_score);
document.getElementById("form").addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = ''; // Empty the input buffer
    }
});
socket.on('chat message', function (msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    var chat_messages = document.getElementById('messages');
    chat_messages === null || chat_messages === void 0 ? void 0 : chat_messages.appendChild(item);
    chat_messages.scrollTop = chat_messages.scrollHeight;
});
socket.on('user-connected', function (name) {
    var item = document.createElement('li');
    item.textContent = 'New user connected: ' + name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
    socket.emit("scoreboard-update", cur_score);
});
socket.on('user-disconnected', function (name) {
    var item = document.createElement('li');
    item.textContent = 'User disconnected: ' + name;
    messages.appendChild(item);
    var chat_messages = document.getElementById('messages');
    chat_messages.scrollTop = chat_messages.scrollHeight;
    socket.emit("scoreboard-update", cur_score);
});
socket.on('scoreboard-update', function (input_scoreboard) {
    while (opponent_score.hasChildNodes()) {
        opponent_score.removeChild(opponent_score.firstChild);
    }
    var scoreboard;
    scoreboard = input_scoreboard;
    scoreboard.forEach(function (element) {
        var username = document.createElement('li');
        username.textContent = ((element === null || element === void 0 ? void 0 : element[1]) + ": " + (element === null || element === void 0 ? void 0 : element[0]));
        opponent_score.appendChild(username);
    });
    socket.on('load-quiz', function (quiz) {
        questions = quiz;
        load_quiz();
    });
});
/* ##### QUIZ LOGIC ##### */
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
                socket.emit("scoreboard-update", cur_score);
            }
            answer.checked = false;
        }
    });
}
done_button.addEventListener("click", function () {
    var _a;
    if (!quiz_started) {
        quiz_started = true;
        (_a = document.getElementById("done_button")) === null || _a === void 0 ? void 0 : _a.innerText = "Next Question";
        socket.emit("load-quiz");
    }
    else {
        check_player_answer();
        cur_quiz++;
        if (cur_quiz < questions.length) {
            load_quiz();
        }
        else {
            quiz.innerHTML = "<div>You got ".concat(cur_score, " out of ").concat(questions.length, " </div><button onclick=\"location.reload()\">Reload</button>");
        }
    }
});
/* ##### END OF QUIZ LOGIC ##### */ 
