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
        correct: "a"
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
