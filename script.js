let vocabularyData = [];
let quizQueue = [];
let currentQuestion = null;
let currentMode = null;
let totalAttempts = 0;
let correctAnswers = 0;

const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const resultDiv = document.getElementById("result");
const rangeList = document.getElementById("range-list");
const modeList = document.getElementById("mode-list");
const currentQSpan = document.getElementById("current-question");
const totalQSpan = document.getElementById("total-questions");
const accuracySpan = document.getElementById("accuracy");
const progressFill = document.getElementById("progress-fill");

function shuffle(arr) {
    for (let i = arr.length -1; i>0; i--){
        const j = Math.floor(Math.random()* (i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Load modes
function loadModeButtons() {
    ["Word", "Synonym", "Antonym"].forEach(mode=>{
        const btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.textContent = mode;
        btn.onclick = ()=> selectMode(mode);
        modeList.appendChild(btn);
    });
}

// Select mode
function selectMode(mode){
    currentMode = mode;
    rangeList.innerHTML = "";
    if(mode === "Word"){
        for(let i=65;i<=90;i++){
            const letter = String.fromCharCode(i);
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-primary";
            btn.textContent = letter;
            btn.onclick = ()=> startQuiz(letter);
            rangeList.appendChild(btn);
        }
        const randBtn = document.createElement("button");
        randBtn.className = "btn btn-primary";
        randBtn.textContent = "Random All";
        randBtn.onclick = ()=> startQuiz("RANDOM");
        rangeList.appendChild(randBtn);
    } else {
        const chunk = 100;
        for(let start=1; start<=vocabularyData.length; start+=chunk){
            const end = Math.min(start+chunk-1,vocabularyData.length);
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-primary";
            btn.textContent = `${start}-${end}`;
            btn.onclick = ()=> startQuiz(`${start}-${end}`);
            rangeList.appendChild(btn);
        }
        const randBtn = document.createElement("button");
        randBtn.className = "btn btn-primary";
        randBtn.textContent = "Random All";
        randBtn.onclick = ()=> startQuiz("RANDOM");
        rangeList.appendChild(randBtn);
    }
}

// Start quiz
function startQuiz(choice){
    quizQueue = [];
    let items = vocabularyData.filter(v=>{
        if(currentMode==="Word") return v.Meanings;
        if(currentMode==="Synonym") return v.Synonym;
        if(currentMode==="Antonym") return v.Antonym;
    });
    if(currentMode==="Word" && choice!=="RANDOM"){
        quizQueue = items.filter(i=>i.Word[0].toUpperCase()===choice.toUpperCase());
    } else if ((currentMode==="Synonym"||currentMode==="Antonym") && choice!=="RANDOM"){
        const [start,end] = choice.split("-").map(Number);
        quizQueue = items.slice(start-1,end);
    } else quizQueue = [...items];

    if(!quizQueue.length){alert("⚠️ No words available."); return;}
    quizQueue.forEach(q=>q.attempts=0);
    shuffle(quizQueue);

    startPage.classList.add("d-none");
    quizPage.classList.remove("d-none");
    resultPage.classList.add("d-none");
    totalQSpan.textContent = quizQueue.length;
    currentQSpan.textContent = 0;
    totalAttempts=0;
    correctAnswers=0;
    accuracySpan.textContent="Accuracy: 0%";
    progressFill.style.width="0%";
    nextQuestion();
}

// Next question
function nextQuestion(){
    feedback.textContent="";
    optionsContainer.innerHTML="";
    if(!quizQueue.length){
        quizPage.classList.add("d-none");
        resultPage.classList.remove("d-none");
        resultDiv.textContent = `✅ Quiz Complete! Accuracy: ${((correctAnswers/totalAttempts)*100).toFixed(2)}%`;
        return;
    }
    currentQuestion = quizQueue.shift();
    currentQSpan.textContent = parseInt(currentQSpan.textContent)+1;

    let correctAnswer="";
    if(currentMode==="Word"){
        questionText.textContent=`What is the meaning of "${currentQuestion.Word}"?`;
        correctAnswer = currentQuestion.Meanings.split(",")[0].trim();
    } else if(currentMode==="Synonym"){
        questionText.textContent=`Which word is a synonym of "${currentQuestion.Word}"?`;
        const syns = currentQuestion.Synonym.split(",").map(s=>s.trim()).filter(Boolean);
        correctAnswer = syns[Math.floor(Math.random()*syns.length)];
    } else {
        questionText.textContent=`Which word is an antonym of "${currentQuestion.Word}"?`;
        const ants = currentQuestion.Antonym.split(",").map(a=>a.trim()).filter(Boolean);
        correctAnswer = ants[Math.floor(Math.random()*ants.length)];
    }

    let options=[correctAnswer];
    let allOptions = currentMode==="Word"? vocabularyData.flatMap(v=>v.Meanings.split(",").map(m=>m.trim())):
                     currentMode==="Synonym"? vocabularyData.flatMap(v=>v.Synonym? v.Synonym.split(",").map(s=>s.trim()): []):
                     vocabularyData.flatMap(v=>v.Antonym? v.Antonym.split(",").map(a=>a.trim()): []);
    while(options.length<4 && allOptions.length>options.length){
        const rand = allOptions[Math.floor(Math.random()*allOptions.length)];
        if(!options.includes(rand)) options.push(rand);
    }
    shuffle(options);

    options.forEach(opt=>{
        const btn=document.createElement("button");
        btn.className="btn btn-outline-primary";
        btn.textContent=opt;
        btn.onclick=()=>handleAnswer(btn,opt,correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

// Handle answer
function handleAnswer(button, selected, correct){
    totalAttempts++;
    if(selected===correct){
        correctAnswers++;
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-success");
        feedback.textContent="✅ Correct!";
    } else {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-danger");
        feedback.textContent=`❌ Incorrect! Correct: ${correct}`;
        Array.from(optionsContainer.children).forEach(b=>{
            if(b.textContent===correct){
                b.classList.remove("btn-outline-primary");
                b.classList.add("btn-success");
            }
        });
        quizQueue.push(currentQuestion); // loop until correct
    }
    Array.from(optionsContainer.children).forEach(b=>b.disabled=true);
    accuracySpan.textContent=`Accuracy: ${((correctAnswers/totalAttempts)*100).toFixed(2)}%`;
    progressFill.style.width = `${(parseInt(currentQSpan.textContent)/parseInt(totalQSpan.textContent))*100}%`;
    setTimeout(nextQuestion,1200);
}

// Go home
function goHome(){
    startPage.classList.remove("d-none");
    quizPage.classList.add("d-none");
    resultPage.classList.add("d-none");
    rangeList.innerHTML="";
}

// Load data
document.addEventListener("DOMContentLoaded",()=>{
    fetch("vocab-data.json")
    .then(res=>res.json())
    .then(data=>{
        vocabularyData = data;
        loadModeButtons();
        console.log("Vocabulary loaded:", vocabularyData.length);
    })
    .catch(err=>console.error("❌ Failed to load vocab-data.json", err));
});
