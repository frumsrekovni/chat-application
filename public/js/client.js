var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');
var questions = [];
var quiz = document.getElementById("quiz_container");
var player_answers = document.querySelectorAll('input[name="answer"]');
var element_question = document.getElementById("the_question");
var question_label_a = document.getElementById("label_a");
var question_label_b = document.getElementById("label_b");
var question_label_c = document.getElementById("label_c");
var question_options = document.getElementById("question_options");
var lobby_settings = document.getElementById("lobby_settings");
var done_button = document.getElementById("done_button");
var rematch_button = document.getElementById("rematch_button");
var submit_button = document.getElementById("submit_button");
var current_room = document.querySelector(".current_room span");
var quiz_timer = document.getElementById("quiz_timer");
var cur_quiz = 0;
var cur_score = 0;
var max_quiz_timer = 0;
var current_quiz_timer = 0;
var interval;
var quiz_started = false;
var inserted_name = "Error: No name entered";
var room_code = "Error: No room code entered";
// do{
//     inserted_name = prompt('What username do you want?');
//     room_code = prompt('What room code do you want to join/create?'); 
// } while(inserted_name === "" || room_code === "")
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
    socket.on('load-quiz', function (_a) {
        var made_quiz = _a.made_quiz, time = _a.time;
        questions = made_quiz;
        load_quiz();
        quiz_started = true;
        cur_quiz = 0;
        cur_score = 0;
        rematch_button === null || rematch_button === void 0 ? void 0 : rematch_button.style.display = "none";
        done_button === null || done_button === void 0 ? void 0 : done_button.innerText = "Next Question";
        done_button === null || done_button === void 0 ? void 0 : done_button.style.display = "flex";
        question_options === null || question_options === void 0 ? void 0 : question_options.style.display = "block";
        lobby_settings === null || lobby_settings === void 0 ? void 0 : lobby_settings.style.display = "none";
        max_quiz_timer = time;
        current_quiz_timer = max_quiz_timer;
        clearInterval(interval); // This needs to happen since this load-quiz function can be run more than once depending on the network
        interval = setInterval(update_timer, 1000); // Start the timer and so it updates every 1000ms
        console.log("I am now RECEIVING a load quiz");
    });
});
/* ##### QUIZ LOGIC ##### */
function load_quiz() {
    var cur_quiz_data = questions[cur_quiz];
    if (cur_quiz_data == undefined) {
        socket.emit("load-quiz", { number_of_questions: Number(document.getElementById("question_amount").value),
            time_between_questions: Number(document.getElementById("question_time_interval").value) });
    }
    else {
        element_question.innerText = cur_quiz_data.question;
        question_label_a.innerText = cur_quiz_data.a;
        question_label_b.innerText = cur_quiz_data.b;
        question_label_c.innerText = cur_quiz_data.c;
    }
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
    if (!quiz_started) {
        // When clicking start. The chosen parameters are sent to everyone in the same room
        socket.emit("load-quiz", { number_of_questions: Number(document.getElementById("question_amount").value),
            time_between_questions: Number(document.getElementById("question_time_interval").value) });
    }
    else {
        check_player_answer();
        cur_quiz++;
        if (cur_quiz < questions.length) {
            load_quiz(); // This loads the next question
            current_quiz_timer = max_quiz_timer;
            quiz_timer === null || quiz_timer === void 0 ? void 0 : quiz_timer.innerHTML = current_quiz_timer;
        }
        else {
            quiz_started = false;
            clearInterval(interval); // Stop the countdown timer
            //quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
            element_question === null || element_question === void 0 ? void 0 : element_question.innerText = "You got " + cur_score + " out of " + questions.length;
            done_button === null || done_button === void 0 ? void 0 : done_button.style.display = "none";
            question_options === null || question_options === void 0 ? void 0 : question_options.style.display = "none";
            rematch_button === null || rematch_button === void 0 ? void 0 : rematch_button.style.display = "flex";
            lobby_settings === null || lobby_settings === void 0 ? void 0 : lobby_settings.style.display = "block";
        }
    }
});
rematch_button.addEventListener("click", function () {
    socket.emit("load-quiz", { number_of_questions: Number(document.getElementById("question_amount").value),
        time_between_questions: Number(document.getElementById("question_time_interval").value) });
});
submit_button.addEventListener("click", function () {
    var name = document.getElementById("username");
    var code = document.getElementById("roomcode");
    if (name.value !== "" && code.value !== "") {
        inserted_name = name.value;
        room_code = code.value;
        socket.emit('new-user', { name: inserted_name, room: room_code });
        current_room.innerText = room_code;
        socket.emit("scoreboard-update", cur_score);
        document.getElementsByClassName('login_container')[0].style.display = 'none';
    }
    else {
        name.placeholder = "Username Required!";
        code.placeholder = "Room code Required!";
    }
});
function update_timer() {
    var _a;
    current_quiz_timer--;
    quiz_timer === null || quiz_timer === void 0 ? void 0 : quiz_timer.innerHTML = current_quiz_timer;
    if (current_quiz_timer <= 0) {
        (_a = document.getElementById("done_button")) === null || _a === void 0 ? void 0 : _a.click(); // Continue to next question if timer runs out
        current_quiz_timer = max_quiz_timer;
    }
}
/* ##### END OF QUIZ LOGIC ##### */ 
