let vocabData = {};
let quizQueue = [];
let currentQuestion = null;
let currentIndex = 0;
let correctAnswers = 0;
let totalAttempts = 0;

const startPage = document.getElementById("start-page");
const quizPage = document.getElementById("quiz-page");
const resultPage = document.getElementById("result-page");
const modeList = document.getElementById("mode-list");
const alphabetList = document.getElementById("alphabet-list");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedback = document.getElementById("feedback");
const currentQuestionNum = document.getElementById("current-question");
const totalQuestions = document.getElementById("total-questions");
const accuracyDisplay = document.getElementById("accuracy");
const resultDisplay = document.getElementById("result");

// Load vocab data
fetch("vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabData = data;
    setupModes();
  });

// Setup quiz modes
function setupModes() {
  modeList.innerHTML = "";

  const modes = [
    { id: "words", label: "Quiz on Words" },
    { id: "synonyms", label: "Quiz on Synonyms" },
    { id: "antonyms", label: "Quiz on Antonyms" }
  ];

  modes.forEach(mode => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary m-2";
    btn.textContent = mode.label;
    btn.onclick = () => selectMode(mode.id);
    modeList.appendChild(btn);
  });
}

// Select mode
function selectMode(mode) {
  alphabetList.innerHTML = "";

  if (mode === "words") {
    // Alphabet buttons
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    alphabets.forEach(letter => {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-secondary m-1";
      btn.textContent = letter;
      btn.onclick = () => startQuiz(mode, letter);
      alphabetList.appendChild(btn);
    });
  } else {
    const btn = document.createElement("button");
    btn.className = "btn btn-success m-2";
    btn.textContent = "Start Random 50";
    btn.onclick = () => startQuiz(mode);
    alphabetList.appendChild(btn);
  }
}

// Start quiz
function startQuiz(mode, letter = null) {
  quizQueue = [];
  currentIndex = 0;
  correctAnswers = 0;
  totalAttempts = 0;

  if (mode === "words") {
    quizQueue = vocabData.words[letter] || [];
  } else if (mode === "synonyms") {
    quizQueue = shuffle(vocabData.synonyms).slice(0, 50);
  } else if (mode === "antonyms") {
    quizQueue = shuffle(vocabData.antonyms).slice(0, 50);
  }

  if (quizQueue.length === 0) {
    alert("No questions found.");
    return;
  }

  startPage.classList.add("d-none");
  resultPage.classList.add("d-none");
  quizPage.classList.remove("d-none");

  totalQuestions.textContent = quizQueue.length;
  nextQuestion();
}

// Next Question
function nextQuestion() {
  if (currentIndex >= quizQueue.length) {
    showResult();
    return;
  }

  currentQuestion = quizQueue[currentIndex];
  currentIndex++;

  feedback.textContent = "";
  optionsContainer.innerHTML = "";

  let question, options, correctAnswer;

  if (currentQuestion.word) {
    question = `What is the meaning of "${currentQuestion.word}"?`;
    correctAnswer = currentQuestion.meaning;
    options = shuffle([correctAnswer, ...currentQuestion.options || []]).slice(0, 4);
  } else if (currentQuestion.synonym) {
    question = `Select the synonym of "${currentQuestion.synonym}"`;
    correctAnswer = currentQuestion.answer;
    options = shuffle([correctAnswer, ...currentQuestion.options || []]).slice(0, 4);
  } else if (currentQuestion.antonym) {
    question = `Select the antonym of "${currentQuestion.antonym}"`;
    correctAnswer = currentQuestion.answer;
    options = shuffle([correctAnswer, ...currentQuestion.options || []]).slice(0, 4);
  }

  questionText.textContent = question;
  currentQuestionNum.textContent = currentIndex;

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary m-1";
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(btn, opt, correctAnswer);
    btn.onfocus = () => btn.blur(); // prevent mobile blue highlight
    optionsContainer.appendChild(btn);
  });
}

// Handle Answer
function handleAnswer(button, selected, correctAnswer) {
  totalAttempts++;

  if (selected === correctAnswer) {
    correctAnswers++;
    button.classList.remove("btn-outline-primary");
    button.classList.add("btn-success");
    feedback.textContent = "✅ Correct!";
  } else {
    button.classList.remove("btn-outline-primary");
    button.classList.add("btn-danger");
    feedback.textContent = `❌ Incorrect! Correct: ${correctAnswer}`;
    Array.from(optionsContainer.children).forEach(b => {
      if (b.textContent === correctAnswer) {
        b.classList.remove("btn-outline-primary");
        b.classList.add("btn-success");
      }
    });
    quizQueue.push(currentQuestion); // repeat wrong
  }

  Array.from(optionsContainer.children).forEach(b => {
    b.disabled = true;
    b.blur(); // fix mobile hover issue
  });

  updateDashboard();
  setTimeout(nextQuestion, 1200);
}

// Update stats
function updateDashboard() {
  accuracyDisplay.textContent = ((correctAnswers / totalAttempts) * 100).toFixed(0) + "%";
}

// Show result
function showResult() {
  quizPage.classList.add("d-none");
  resultPage.classList.remove("d-none");
  resultDisplay.textContent = `Quiz Completed! Accuracy: ${accuracyDisplay.textContent}`;
}

// Back Home
function goHome() {
  startPage.classList.remove("d-none");
  quizPage.classList.add("d-none");
  resultPage.classList.add("d-none");
}

// Utility shuffle
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
