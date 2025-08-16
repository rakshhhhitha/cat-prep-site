let vocabulary = [];
let totalAttempts = 0;
let correctAnswers = 0;
let currentQuestionIndex = 0;
let selectedQuestions = [];

// Fetch vocabulary from GitHub
fetch('https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json')
  .then(res => res.json())
  .then(data => {
    vocabulary = data.filter(v => v.Meanings || v.Synonym || v.Antonym);
    document.getElementById("totalQuestions").textContent = vocabulary.length;
  }).catch(err => {
    console.error(err);
    alert("Failed to load vocabulary data.");
  });

// Utility
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandomQuestions(count) {
  const valid = vocabulary.filter(v => v.Meanings || v.Synonym || v.Antonym);
  return shuffleArray(valid).slice(0, count);
}

// UI helpers
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

function updateDashboard() {
  const progressPercent = ((currentQuestionIndex)/selectedQuestions.length)*100;
  document.getElementById("progressBar").style.width = progressPercent + "%";
  document.getElementById("currentQ").textContent = currentQuestionIndex + 1;
}

// Start quiz
function startQuiz() {
  totalAttempts = 0;
  correctAnswers = 0;
  currentQuestionIndex = 0;
  selectedQuestions = getRandomQuestions(20);
  showPage("quizPage");
  generateQuiz();
}

// Generate question
function generateQuiz() {
  if (currentQuestionIndex >= selectedQuestions.length) return showResult();

  document.getElementById("feedback").textContent = "";
  const item = selectedQuestions[currentQuestionIndex];

  // Decide question type
  const types = [];
  if (item.Meanings) types.push("Meaning");
  if (item.Synonym) types.push("Synonym");
  if (item.Antonym) types.push("Antonym");
  const qType = getRandomItem(types);

  let questionText = "", correctAnswer = "", options = [];

  if (qType === "Meaning") {
    questionText = `What is the meaning of "${item.Word}"?`;
    correctAnswer = item.Meanings;
    options = vocabulary.map(v => v.Meanings).filter(Boolean);
  } else if (qType === "Synonym") {
    questionText = `Which word is a synonym of "${item.Word}"?`;
    const syns = item.Synonym.split(",").map(s => s.trim()).filter(Boolean);
    correctAnswer = getRandomItem(syns);
    options = vocabulary.flatMap(v => (v.Synonym?.split(",").map(s => s.trim()) || []));
  } else if (qType === "Antonym") {
    questionText = `Which word is an antonym of "${item.Word}"?`;
    const ants = item.Antonym.split(",").map(a => a.trim()).filter(Boolean);
    correctAnswer = getRandomItem(ants);
    options = vocabulary.flatMap(v => (v.Antonym?.split(",").map(a => a.trim()) || []));
  }

  options = [...new Set(options.filter(Boolean))];
  if (!options.includes(correctAnswer)) options.push(correctAnswer);
  options = shuffleArray(options).slice(0, 4);
  if (!options.includes(correctAnswer)) options[Math.floor(Math.random()*4)] = correctAnswer;

  document.getElementById("questionText").textContent = questionText;
  const container = document.getElementById("optionsContainer");
  container.innerHTML = "";

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("btn-option");
    btn.onclick = () => {
      totalAttempts++;
      if (option === correctAnswer) {
        correctAnswers++;
        btn.classList.add("correct");
        document.getElementById("feedback").textContent = "✅ Correct!";
      } else {
        btn.classList.add("incorrect");
        document.getElementById("feedback").textContent = `❌ Incorrect! Correct: ${correctAnswer}`;
      }
      updateDashboard();
      currentQuestionIndex++;
      setTimeout(generateQuiz, 1000);
    };
    container.appendChild(btn);
  });

  updateDashboard();
}

function showResult() {
  showPage("resultPage");
  document.getElementById("finalScore").textContent = correctAnswers;
  document.getElementById("totalQuestionsResult").textContent = selectedQuestions.length;
  const accuracy = ((correctAnswers/selectedQuestions.length)*100).toFixed(2);
  document.getElementById("finalAccuracy").textContent = accuracy;

  // Save attempt to localStorage
  const attempts = JSON.parse(localStorage.getItem("quizAttempts") || "[]");
  attempts.push({ score: correctAnswers, total: selectedQuestions.length, accuracy });
  localStorage.setItem("quizAttempts", JSON.stringify(attempts));
}

// Event Listeners
document.getElementById("startQuizBtn").addEventListener("click", startQuiz);
document.getElementById("restartQuizBtn").addEventListener("click", () => showPage("startPage"));
document.getElementById("viewReportBtn").addEventListener("click", () => window.location.href="report.html");
document.getElementById("viewReportFromResult").addEventListener("click", () => window.location.href="report.html");
