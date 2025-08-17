let vocabularyData = [];
let quizQueue = [];
let quizQueueStart = [];
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
const wordsCorrectSpan = document.getElementById("words-correct");
const totalQuestionsWordsSpan = document.getElementById("total-questions-words");

// Shuffle utility
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Load Mode Buttons
function loadModeButtons() {
    const modes = ["Word", "Synonym", "Antonym"];
    modeList.innerHTML = "";
    modes.forEach(mode => {
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
        startQuiz("RANDOM");
    }
}

// Start Quiz
function startQuiz(choice) {
    quizQueue = [];
    let items = [];

    if (currentMode === "Word") items = vocabularyData.filter(v => v.Meanings);
    else if (currentMode === "Synonym") items = vocabularyData.filter(v => v.Synonym);
    else if (currentMode === "Antonym") items = vocabularyData.filter(v => v.Antonym);

    if (currentMode === "Word" && choice !== "RANDOM") {
        quizQueue = items.filter(item => item.Word[0].toUpperCase() === choice.toUpperCase());
    } else {
        quizQueue = [...items];
    }

    if (quizQueue.length === 0) {
        alert("⚠️ No words available for this selection.");
        return;
    }

    quizQueueStart = quizQueue.map(q => ({ ...q, attempts: 0, correct: false }));
    quizQueue = [...quizQueueStart];

    shuffle(quizQueue);
    startPage.classList.add("d-none");
    quizPage.classList.remove("d-none");
    resultPage.classList.add("d-none");

    totalQuestionsWordsSpan.textContent = quizQueueStart.length;
    updateDashboard();
    nextQuestion();
}

// Next Question
function nextQuestion() {
    feedback.textContent = "";
    optionsContainer.innerHTML = "";

    if (quizQueue.length === 0) {
        quizPage.classList.add("d-none");
        resultPage.classList.remove("d-none");
        resultDiv.textContent = `✅ Quiz Complete! Words Correct: ${wordsCorrectSpan.textContent} / ${quizQueueStart.length}`;
        return;
    }

    currentQuestion = quizQueue.shift();
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

    // Generate options
    let options = [correctAnswer];
    let allOptions = [];
    if (currentMode === "Word") allOptions = vocabularyData.flatMap(v => v.Meanings.split(",").map(m => m.trim()));
    else if (currentMode === "Synonym") allOptions = vocabularyData.flatMap(v => v.Synonym ? v.Synonym.split(",").map(s => s.trim()) : []);
    else if (currentMode === "Antonym") allOptions = vocabularyData.flatMap(v => v.Antonym ? v.Antonym.split(",").map(a => a.trim()) : []);

    while (options.length < 4 && allOptions.length > options.length) {
        const rand = allOptions[Math.floor(Math.random() * allOptions.length)];
        if (!options.includes(rand)) options.push(rand);
    }

    shuffle(options);

    options.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-outline-primary m-1";
        btn.textContent = opt;
        btn.disabled = false;
        btn.onclick = () => handleAnswer(btn, opt, correctAnswer);
        optionsContainer.appendChild(btn);
    });
}

// Handle Answer
function handleAnswer(button, selected, correctAnswer) {
    if (selected === correctAnswer && !currentQuestion.correct) {
        currentQuestion.correct = true;
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-success");
        feedback.textContent = "✅ Correct!";
    } else if (selected === correctAnswer) {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-success");
        feedback.textContent = "✅ Correct!";
    } else {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-danger");
        feedback.textContent = `❌ Incorrect! Correct: ${correctAnswer}`;

        currentQuestion.attempts++;
        if (currentQuestion.attempts < maxAttemptsPerWord) {
            quizQueue.push(currentQuestion);
        }

        Array.from(optionsContainer.children).forEach(b => {
            if (b.textContent === correctAnswer) {
                b.classList.remove("btn-outline-primary");
                b.classList.add("btn-success");
            }
        });
    }

    Array.from(optionsContainer.children).forEach(b => b.disabled = true);
    updateDashboard();
    setTimeout(nextQuestion, 1200);
}

// Update Dashboard
function updateDashboard() {
    wordsCorrectSpan.textContent = quizQueueStart.filter(q => q.correct).length;
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
        })
        .catch(err => console.error("❌ Failed to load vocab-data.json", err));
});
