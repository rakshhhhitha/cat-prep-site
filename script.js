let vocabularyData = [];
let quizQueue = [];
let currentQuestion = null;
let currentMode = "";
let correctAnswers = 0;
let totalAttempts = 0;

// DOM elements
const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");

const modeList = document.getElementById("mode-list");
const alphabetList = document.getElementById("alphabet-list");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const currentQSpan = document.getElementById("current-question");
const totalQSpan = document.getElementById("total-questions");
const accuracySpan = document.getElementById("accuracy");
const resultDiv = document.getElementById("result");

// Load dataset
fetch("vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabularyData = data;
    showModes();
  });

// Show modes
function showModes() {
  startPage.classList.remove("d-none");
  quizPage.classList.add("d-none");
  resultPage.classList.add("d-none");

  modeList.innerHTML = `
    <button class="btn btn-primary m-1" onclick="chooseMode('Word')">Words Quiz</button>
    <button class="btn btn-success m-1" onclick="chooseMode('Synonym')">Synonyms Quiz</button>
    <button class="btn btn-danger m-1" onclick="chooseMode('Antonym')">Antonyms Quiz</button>
  `;
}

// Choose mode
function chooseMode(mode) {
  currentMode = mode;
  alphabetList.innerHTML = "";

  if (mode === "Word") {
    // Show alphabets for word quiz
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabets.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-secondary m-1";
      btn.textContent = letter;
      btn.onclick = () => startQuiz(letter);
      alphabetList.appendChild(btn);
    });
  } else {
    // For Synonym & Antonym → random 50
    startQuiz();
  }
}

// Start quiz
function startQuiz(letter = null) {
  correctAnswers = 0;
  totalAttempts = 0;
  currentQSpan.textContent = 0;

  if (currentMode === "Word") {
    quizQueue = vocabularyData.filter(v => v.Word.startsWith(letter));
  } else if (currentMode === "Synonym") {
    quizQueue = vocabularyData.filter(v => v.Synonym && v.Synonym.trim() !== "");
    shuffle(quizQueue);
    quizQueue = quizQueue.slice(0, 50);
  } else if (currentMode === "Antonym") {
    quizQueue = vocabularyData.filter(v => v.Antonym && v.Antonym.trim() !== "");
    shuffle(quizQueue);
    quizQueue = quizQueue.slice(0, 50);
  }

  totalQSpan.textContent = quizQueue.length;
  accuracySpan.textContent = "0%";

  startPage.classList.add("d-none");
  quizPage.classList.remove("d-none");
  resultPage.classList.add("d-none");

  nextQuestion();
}

// Next Question
function nextQuestion() {
  feedback.textContent = "";

  if (quizQueue.length === 0) {
    quizPage.classList.add("d-none");
    resultPage.classList.remove("d-none");
    resultDiv.textContent = `✅ Quiz Complete! Accuracy: ${((correctAnswers/totalAttempts)*100).toFixed(2)}%`;
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

  // Generate options
  let options = [correctAnswer];
  let allOptions = [];
  if (currentMode === "Word") {
    allOptions = vocabularyData.flatMap(v => v.Meanings.split(",").map(m => m.trim()));
  } else if (currentMode === "Synonym") {
    allOptions = vocabularyData.flatMap(v => v.Synonym ? v.Synonym.split(",").map(s => s.trim()) : []);
  } else if (currentMode === "Antonym") {
    allOptions = vocabularyData.flatMap(v => v.Antonym ? v.Antonym.split(",").map(a => a.trim()) : []);
  }

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

  // 🚀 Prevent stuck blue highlight on mobile
  document.activeElement.blur();
}

// Handle Answer
function handleAnswer(button, selected, correctAnswer) {
  totalAttempts++;
  button.blur(); // 🚀 Prevent focus highlight issue on mobile

  if (selected === correctAnswer) {
    correctAnswers++;
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

    // 🚀 Add wrong question back for revision
    quizQueue.push(currentQuestion);
  }

  // Disable all options after answering
  Array.from(optionsContainer.children).forEach(b => b.disabled = true);

  updateDashboard();

  // Move to next question after short delay
  setTimeout(nextQuestion, 1200);
}

// Update Scoreboard
function updateDashboard() {
  const acc = totalAttempts === 0 ? 0 : (correctAnswers / totalAttempts) * 100;
  accuracySpan.textContent = `${acc.toFixed(2)}%`;
}

// Shuffle utility
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Go Home
function goHome() {
  showModes();
}
