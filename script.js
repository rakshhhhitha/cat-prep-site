let vocabularyData = [];
let quizQueue = [];
let currentQuestion = null;
let currentMode = null;
const maxAttemptsPerWord = 2;

// DOM Elements
const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const resultDiv = document.getElementById("result");
const alphabetList = document.getElementById("alphabet-list");
const modeList = document.getElementById("mode-list");
const currentQSpan = document.getElementById("current-question");
const totalQSpan = document.getElementById("total-questions");

// Utility: shuffle array
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Load Mode Buttons
function loadModeButtons() {
    modeList.innerHTML = "";
    ["Word", "Synonym", "Antonym"].forEach(mode => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary m-1";
        btn.textContent = mode;
        btn.onclick = () => selectMode(mode);
        modeList.appendChild(btn);
    });
}

// Select Mode
function selectMode(mode) {
    currentMode = mode;
    alphabetList.innerHTML = "";

    if (mode === "Word") {
        for (let i = 65; i <= 90; i++) {
            const letter = String.fromCharCode(i);
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-secondary m-1";
            btn.textContent = letter;
            btn.onclick = () => startQuiz(letter);
            alphabetList.appendChild(btn);
        }
        const randBtn = document.createElement("button");
        randBtn.className = "btn btn-primary m-1";
        randBtn.textContent = "Random All";
        randBtn.onclick = () => startQuiz("RANDOM");
        alphabetList.appendChild(randBtn);
    } else {
        // Synonym/Antonym numeric ranges
        const total = vocabularyData.length;
        for (let start = 1; start <= total; start += 100) {
            const end = Math.min(start + 99, total);
            const btn = document.createElement("button");
            btn.className = "btn btn-outline-secondary m-1";
            btn.textContent = `${start}-${end}`;
            btn.onclick = () => startQuiz(`${start}-${end}`);
            alphabetList.appendChild(btn);
        }
        const randBtn = document.createElement("button");
        randBtn.className = "btn btn-primary m-1";
        randBtn.textContent = "Random All";
        randBtn.onclick = () => startQuiz("RANDOM");
        alphabetList.appendChild(randBtn);
    }
}

// Start Quiz
function startQuiz(choice) {
    if (!vocabularyData.length) {
        alert("⚠️ Vocabulary data not loaded yet.");
        return;
    }

    quizQueue = [];
    let items = [];

    if (currentMode === "Word") items = vocabularyData.filter(v => v.Meanings);
    else if (currentMode === "Synonym") items = vocabularyData.filter(v => v.Synonym);
    else if (currentMode === "Antonym") items = vocabularyData.filter(v => v.Antonym);

    if (!items.length) {
        alert("⚠️ No data available for this mode.");
        return;
    }

    // Filter by choice
    if (currentMode === "Word" && choice !== "RANDOM") {
        quizQueue = items.filter(item => item.Word[0].toUpperCase() === choice.toUpperCase());
    } else if ((currentMode === "Synonym" || currentMode === "Antonym") && choice !== "RANDOM") {
        const [start, end] = choice.split("-").map(Number);
        quizQueue = items.slice(start - 1, end);
    } else {
        quizQueue = [...items];
    }

    if (!quizQueue.length) {
        alert("⚠️ No words available for this selection.");
        return;
    }

    // Reset attempts
    quizQueue.forEach(q => q.attempts = 0);

    shuffle(quizQueue);
    startPage.classList.add("d-none");
    quizPage.classList.remove("d-none");
    resultPage.classList.add("d-none");
    totalQSpan.textContent = quizQueue.length;
    currentQSpan.textContent = 0;
    nextQuestion();
}

// Next Question
function nextQuestion() {
    feedback.textContent = "";
    optionsContainer.innerHTML = "";

    if (!quizQueue.length) {
        quizPage.classList.add("d-none");
        resultPage.classList.remove("d-none");
        resultDiv.textContent = "✅ Quiz Complete!";
        return;
    }

    currentQuestion = quizQueue.shift();
    currentQSpan.textContent = parseInt(currentQSpan.textContent) + 1;

    let correctAnswer = "";
    if (currentMode === "Word") {
        questionText.textContent = `What is the meaning of "${currentQuestion.Word}"?`;
        correctAnswer = currentQuestion.Meanings.split(",")[0].trim();
    } else if (currentMode === "Synonym") {
        questionText.textContent = `Which word is a synonym of "${currentQuestion.Word}"?`;
        const syns = currentQuestion.Synonym.split(",").map(s => s.trim()).filter(Boolean);
        correctAnswer = syns[Math.floor(Math.random() * syns.length)];
    } else if (currentMode === "Antonym") {
        questionText.textContent = `Which word is an antonym of "${currentQuestion.Word}"?`;
        const ants = currentQuestion.Antonym.split(",").map(a => a.trim()).filter(Boolean);
        correctAnswer = ants[Math.floor(Math.random() * ants.length)];
    }

    let options = [correctAnswer];
    let allOptions = currentMode === "Word"
        ? vocabularyData.flatMap(v => v.Meanings.split(",").map(m => m.trim()))
        : currentMode === "Synonym"
            ? vocabularyData.flatMap(v => v.Synonym ? v.Synonym.split(",").map(s => s.trim()) : [])
            : vocabularyData.flatMap(v => v.Antonym ? v.Antonym.split(",").map(a => a.trim()) : []);

    while (options.length < 4 && allOptions.length > options.length) {
        const rand = allOptions[Math.floor(Math.random() * allOptions.length)];
        if (!options.includes(rand)) options.push(rand);
    }

    shuffle(options);

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary m-1";
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(btn, opt, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

// Handle Answer
function handleAnswer(button, selected, correctAnswer) {
    if (selected === correctAnswer) {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-success");
        feedback.textContent = "✅ Correct!";
    } else {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-danger");
        feedback.textContent = `❌ Incorrect! Correct: ${correctAnswer}`;
        // Highlight correct answer
        Array.from(optionsContainer.children).forEach(b => {
            if (b.textContent === correctAnswer) {
                b.classList.remove("btn-outline-primary");
                b.classList.add("btn-success");
            }
        });
        // Always push back to end
        currentQuestion.attempts = (currentQuestion.attempts || 0) + 1;
        quizQueue.push(currentQuestion);
    }

    Array.from(optionsContainer.children).forEach(b => b.disabled = true);
    setTimeout(nextQuestion, 1200);
}

// Go Home
function goHome() {
    startPage.classList.remove("d-none");
    quizPage.classList.add("d-none");
    resultPage.classList.add("d-none");
    alphabetList.innerHTML = "";
}

// Load Dataset
document.addEventListener("DOMContentLoaded", () => {
    fetch("vocab-data.json")
        .then(res => res.json())
        .then(data => {
            vocabularyData = data;
            loadModeButtons();
            console.log("Vocabulary loaded:", vocabularyData.length);
        })
        .catch(err => console.error("❌ Failed to load vocab-data.json", err));
});
