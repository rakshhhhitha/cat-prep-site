let vocabularyData = [];
let quizQueue = [];
let currentQuestion = null;
let currentMode = null; // "Word" | "Synonym" | "Antonym"
let totalAttempts = 0;
let correctAnswers = 0;

// DOM Elements
const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const resultDiv = document.getElementById("result");
const alphabetList = document.getElementById("alphabet-list");
const modeList = document.getElementById("mode-list");

// Dashboard container (add this to index.html inside quiz-page)
const dashboardHTML = `
<div class="mt-3">
  <p>Total Attempts: <span id="total-attempts">0</span></p>
  <p>Correct Answers: <span id="correct-answers">0</span></p>
  <p>Accuracy: <span id="accuracy">0%</span></p>
</div>`;
quizPage.insertAdjacentHTML("beforeend", dashboardHTML);
const totalAttemptsSpan = document.getElementById("total-attempts");
const correctAnswersSpan = document.getElementById("correct-answers");
const accuracySpan = document.getElementById("accuracy");

// =================
// Shuffle Utility
// =================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// =================
// Load Mode Buttons
// =================
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

// =================
// Select Mode
// =================
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

// =================
// Start Quiz
// =================
function startQuiz(choice) {
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();

  quizQueue = [];
  let items = [];
  if (currentMode === "Word") items = vocabularyData.filter(v => v.Meanings);
  else if (currentMode === "Synonym") items = vocabularyData.filter(v => v.Synonym);
  else if (currentMode === "Antonym") items = vocabularyData.filter(v => v.Antonym);

  if (currentMode === "Word" && choice !== "RANDOM") {
    quizQueue = items.filter(item => item.Word[0].toUpperCase() === choice);
  } else {
    quizQueue = [...items];
  }

  if (quizQueue.length === 0) {
    alert("⚠️ No words available for this selection.");
    return;
  }

  shuffle(quizQueue);
  if (currentMode !== "Word" && quizQueue.length > 50) quizQueue = quizQueue.slice(0, 50);

  startPage.classList.add("d-none");
  quizPage.classList.remove("d-none");
  resultPage.classList.add("d-none");

  nextQuestion();
}

// =================
// Next Question
// =================
function nextQuestion() {
  if (quizQueue.length === 0) {
    quizPage.classList.add("d-none");
    resultPage.classList.remove("d-none");
    resultDiv.textContent = `✅ Quiz Complete! Accuracy: ${((correctAnswers/totalAttempts)*100).toFixed(2)}%`;
    return;
  }

  currentQuestion = quizQueue.shift();

  let correctAnswer = "";
  if (currentMode === "Word") {
    questionText.textContent = `What is the meaning of "${currentQuestion.Word}"?`;
    correctAnswer = currentQuestion.Meanings;
  } else if (currentMode === "Synonym") {
    questionText.textContent = `Which word is a synonym of "${currentQuestion.Word}"?`;
    const syns = currentQuestion.Synonym.split(",").map(s => s.trim());
    correctAnswer = syns[Math.floor(Math.random() * syns.length)];
  } else if (currentMode === "Antonym") {
    questionText.textContent = `Which word is an antonym of "${currentQuestion.Word}"?`;
    const ants = currentQuestion.Antonym.split(",").map(a => a.trim());
    correctAnswer = ants[Math.floor(Math.random() * ants.length)];
  }

  // Options
  let options = [correctAnswer];
  let allOptions = [];
  if (currentMode === "Word") allOptions = vocabularyData.map(v => v.Meanings);
  else if (currentMode === "Synonym") allOptions = vocabularyData.flatMap(v => v.Synonym ? v.Synonym.split(",").map(s => s.trim()) : []);
  else if (currentMode === "Antonym") allOptions = vocabularyData.flatMap(v => v.Antonym ? v.Antonym.split(",").map(a => a.trim()) : []);

  while (options.length < 4 && allOptions.length > options.length) {
    const rand = allOptions[Math.floor(Math.random() * allOptions.length)];
    if (!options.includes(rand)) options.push(rand);
  }

  shuffle(options);

  optionsContainer.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1";
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(btn, opt, correctAnswer);
    optionsContainer.appendChild(btn);
  });
}

// =================
// Handle Answer
// =================
function handleAnswer(button, selected, correctAnswer) {
  totalAttempts++;
  if (selected === correctAnswer) {
    correctAnswers++;
    button.classList.add("correct");
  } else {
    button.classList.add("incorrect");
    quizQueue.push(currentQuestion); // retry later
    // highlight correct answer
    Array.from(optionsContainer.children).forEach(b => {
      if (b.textContent === correctAnswer) b.classList.add("correct");
    });
  }
  updateDashboard();
  // disable all buttons
  Array.from(optionsContainer.children).forEach(b => b.disabled = true);

  // next question after 1s
  setTimeout(nextQuestion, 1000);
}

// =================
// Update Dashboard
// =================
function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

// =================
// Go Home
// =================
function goHome() {
  startPage.classList.remove("d-none");
  quizPage.classList.add("d-none");
  resultPage.classList.add("d-none");
}

// =================
// Load Dataset
// =================
fetch("vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabularyData = data;
    loadModeButtons();
  })
  .catch(err => console.error("❌ Failed to load vocab-data.json", err));
