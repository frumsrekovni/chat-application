const questions = [
    {
        question:"What country is the largest by area?",
        a:"Canada",
        b:"USA",
        c:"China",
        correct:"a"
    },
    {
        question:"What country is the smallest by area?",
        a:"Lesotho",
        b:"Switzerland",
        c:"Monaco",
        correct:"c"
    },
    {
        question:"What country is the most populous?",
        a:"Bangladesh",
        b:"Nigeria",
        c:"Russia",
        correct:"b"
    },
    {
        question:"What country is the largest by area?",
        a:"Sweden",
        b:"Denmark",
        c:"Norway",
        correct:"b"
    },
    {
        question:"What country is the most populous?",
        a:"Spain",
        b:"Venezuela",
        c:"Morocco",
        correct:"a"
    }
];
const quiz = document.getElementById("quiz_container");
const player_answers = document.querySelectorAll('input[name="answer"]');
const element_question = document.getElementById("the_question");
const question_label_a =  document.getElementById("label_a");
const question_label_b = document.getElementById("label_b");
const question_label_c = document.getElementById("label_c");
const done_button = document.getElementById("done_button");

let cur_quiz:number = 0;
let cur_score:number = 0;

load_quiz();

function load_quiz()
{
    const cur_quiz_data = questions[cur_quiz];
    element_question.innerText = cur_quiz_data.question;
    question_label_a.innerText = cur_quiz_data.a;
    question_label_b.innerText = cur_quiz_data.b;
    question_label_c.innerText = cur_quiz_data.c;
}

function check_player_answer()
{
    player_answers.forEach((answer) => {
        if((answer as HTMLInputElement).checked)
        {
            if((answer as HTMLInputElement).id === questions[cur_quiz].correct)
            {
                cur_score++;
            }
            (answer as HTMLInputElement).checked = false;
        }
    });
}



done_button.addEventListener("click", () => 
{
    check_player_answer();
    cur_quiz++;
    if(cur_quiz < questions.length)
    {
        document.getElementById("your_score").innerHTML = `${cur_score}`
        load_quiz();
    }
    else
    {
        quiz.innerHTML = `<div>You got ${cur_score} out of ${questions.length} </div><button onclick="location.reload()">Reload</button>`;
    }
    
});