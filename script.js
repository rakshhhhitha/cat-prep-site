let vocabData = [];
let quizMode = "";
let quizQueue = [];
let currentQuestion = null;
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
const totalQuestionsNum = document.getElementById("total-questions");
const accuracyText = document.getElementById("accuracy");
const resultText = document.getElementById("result");

// Load vocab data
fetch("vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabData = data;
    renderModes();
  });

// Render quiz mode options
function renderModes() {
  modeList.innerHTML = "";
  const modes = ["Words", "Synonyms", "Antonyms"];
  modes.forEach(mode => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary m-2";
    btn.textContent = mode;
    btn.onclick = () => selectMode(mode);
    modeList.appendChild(btn);
  });
}

// Select mode
function selectMode(mode) {
  quizMode = mode;
  alphabetList.innerHTML = "";

  if (mode === "Words") {
    // Show alphabet buttons
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i);
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-secondary m-1";
      btn.textContent = letter;
      btn.onclick = () => startQuiz(letter);
      alphabetList.appendChild(btn);
    }
  } else {
    // Random 50 for Synonyms/Antonyms
    const btn = document.createElement("button");
    btn.className = "btn btn-success";
    btn.textContent = `Start ${mode} Quiz (50 Qs)`;
    btn.onclick = () => startQuiz();
    alphabetList.appendChild(btn);
  }
}

// Start quiz
function startQuiz(letter = null) {
  correctAnswers = 0;
  totalAttempts = 0;
  feedback.textContent = "";

  if (quizMode === "Words") {
    quizQueue = vocabData.filter(item =>
      item.Word[0].toUpperCase() === letter
    );
  } else if (quizMode === "Synonyms") {
    quizQueue = shuffleArray(vocabData).slice(0, 50);
  } else if (quizMode === "Antonyms") {
    quizQueue = shuffleArray(vocabData).slice(0, 50);
  }

  if (quizQueue.length === 0) {
    alert("No questions available!");
    return;
  }

  startPage.classList.add("d-none");
  quizPage.classList.remove("d-none");
  resultPage.classList.add("d-none");

  totalQuestionsNum.textContent = quizQueue.length;
  nextQuestion();
}

// Show next question
function nextQuestion() {
  if (quizQueue.length === 0) {
    showResult();
    return;
  }

  currentQuestion = quizQueue.shift();
  currentQuestionNum.textContent = totalAttempts + 1;
  feedback.textContent = "";

  let question = "";
  let correctAnswer = "";
  let options = [];

  if (quizMode === "Words") {
    question = `What is the meaning of "${currentQuestion.Word}"?`;
    correctAnswer = currentQuestion.Meanings.split(",")[0].trim();
    options = generateOptions(
      correctAnswer,
      vocabData.map(item => item.Meanings.split(",")[0].trim())
    );
  } else if (quizMode === "Synonyms") {
    question = `Pick the synonym of "${currentQuestion.Word}"`;
    correctAnswer = currentQuestion.Synonym.split(",")[0].trim();
    options = generateOptions(
      correctAnswer,
      vocabData.flatMap(item => item.Synonym.split(",").map(s => s.trim()))
    );
  } else {
    question = `Pick the antonym of "${currentQuestion.Word}"`;
    correctAnswer = currentQuestion.Antonym.split(",")[0].trim();
    options = generateOptions(
      correctAnswer,
      vocabData.flatMap(item => item.Antonym.split(",").map(a => a.trim()))
    );
  }

  questionText.textContent = question;
  renderOptions(options, correctAnswer);
}

// Render options
function renderOptions(options, correctAnswer) {
  optionsContainer.innerHTML = "";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary";
    btn.textContent = opt;
    btn.onclick = () => handleAnswer(btn, opt, correctAnswer);
    optionsContainer.appendChild(btn);
  });
}

// Handle answer
function handleAnswer(button, selected, correctAnswer) {
  totalAttempts++;

  // 🚀 Remove sticky highlight immediately (mobile fix)
  button.blur();
  document.activeElement.blur();

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

    // Repeat wrong question later
    quizQueue.push(currentQuestion);
  }

  Array.from(optionsContainer.children).forEach(b => (b.disabled = true));
  updateDashboard();

  setTimeout(nextQuestion, 1200);
}

// Update dashboard
function updateDashboard() {
  accuracyText.textContent =
    totalAttempts > 0
      ? ((correctAnswers / totalAttempts) * 100).toFixed(1) + "%"
      : "0%";
  currentQuestionNum.textContent = totalAttempts;
  totalQuestionsNum.textContent = quizQueue.length + totalAttempts;
}

// Show results
function showResult() {
  quizPage.classList.add("d-none");
  resultPage.classList.remove("d-none");
  resultText.textContent = `Your Accuracy: ${accuracyText.textContent}`;
}

// Shuffle helper
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Go back home
function goHome() {
  startPage.classList.remove("d-none");
  quizPage.classList.add("d-none");
  resultPage.classList.add("d-none");
}
