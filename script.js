let vocabulary = [];
let quizQuestions = [];
let incorrectQuestions = JSON.parse(localStorage.getItem("review") || "[]");
let currentIndex = 0;
let totalAttempts = 0;
let correctAnswers = 0;

// DOM Elements
const startPage = document.getElementById("startPage");
const quizPage = document.getElementById("quizPage");
const learnPage = document.getElementById("learnPage");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedback = document.getElementById("feedback");
const totalQuestionsSpan = document.getElementById("totalQuestions");
const prevAttemptsSpan = document.getElementById("prevAttempts");
const incorrectCountSpan = document.getElementById("incorrectCount");
const currentQ = document.getElementById("currentQ");
const totalAttemptsSpan = document.getElementById("totalAttempts");
const correctAnswersSpan = document.getElementById("correctAnswers");
const accuracySpan = document.getElementById("accuracy");
const learnList = document.getElementById("learnList");

function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

function saveIncorrectAnswer(question, correct, selected) {
  incorrectQuestions.push({ question, correct, selected });
  localStorage.setItem("review", JSON.stringify(incorrectQuestions));
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomQuestions(array, n) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function shuffleOptions(options) {
  return options.sort(() => 0.5 - Math.random());
}

function showStartPage() {
  startPage.classList.remove("hidden");
  quizPage.classList.add("hidden");
  learnPage.classList.add("hidden");
  totalQuestionsSpan.textContent = vocabulary.length;
  prevAttemptsSpan.textContent = localStorage.getItem("prevAttempts") || 0;
  incorrectCountSpan.textContent = incorrectQuestions.length;
}

document.getElementById("learnBtn").onclick = () => {
  startPage.classList.add("hidden");
  learnPage.classList.remove("hidden");
  learnList.innerHTML = "";
  if (incorrectQuestions.length === 0) {
    learnList.innerHTML = "<li>No incorrect words yet!</li>";
  } else {
    incorrectQuestions.forEach(q => {
      const li = document.createElement("li");
      li.textContent = `${q.question} — Correct: ${q.correct} — Your answer: ${q.selected}`;
      learnList.appendChild(li);
    });
  }
}

document.getElementById("backBtn").onclick = showStartPage;

document.getElementById("clearReviewBtn").onclick = () => {
  localStorage.removeItem("review");
  localStorage.removeItem("prevAttempts");
  incorrectQuestions = [];
  alert("Review and stats cleared!");
  showStartPage();
}

function startQuiz() {
  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  currentIndex = 0;
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();
  quizQuestions = getRandomQuestions(vocabulary, 20);
  currentQ.textContent = 1;
  generateQuestion();
}

document.getElementById("startQuizBtn").onclick = startQuiz;

function generateQuestion() {
  feedback.textContent = "";
  const item = quizQuestions[currentIndex];

  // Available types only
  let types = [];
  if(item.Meanings) types.push("Meanings");
  if(item.Synonym) types.push("Synonym");
  if(item.Antonym) types.push("Antonym");

  if(types.length === 0){
    currentIndex++;
    if(currentIndex < quizQuestions.length){
      currentQ.textContent = currentIndex + 1;
      generateQuestion();
    } else {
      localStorage.setItem("prevAttempts", Number(localStorage.getItem("prevAttempts")||0)+totalAttempts);
      alert("Quiz Complete!");
      showStartPage();
    }
    return;
  }

  let type = getRandomItem(types);
  let correct = "";
  let question = "";
  let options = [];

  if(type==="Meanings"){
    question = `What is the meaning of "${item.Word}"?`;
    correct = item.Meanings;
    options = vocabulary.map(v=>v.Meanings).filter(Boolean);
  } else if(type==="Synonym"){
    const syns = item.Synonym.split(",").map(s=>s.trim()).filter(Boolean);
    correct = getRandomItem(syns);
    options = vocabulary.flatMap(v => v.Synonym?.split(",").map(s=>s.trim()) || []);
  } else if(type==="Antonym"){
    const ants = item.Antonym.split(",").map(a=>a.trim()).filter(Boolean);
    correct = getRandomItem(ants);
    options = vocabulary.flatMap(v => v.Antonym?.split(",").map(a=>a.trim()) || []);
  }

  options = [...new Set(options.filter(Boolean))];
  if(!options.includes(correct)) options.push(correct);
  options = shuffleOptions(options).slice(0,4);
  if(!options.includes(correct)) options[Math.floor(Math.random()*4)] = correct;

  questionText.textContent = question;
  optionsContainer.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = ()=>{
      totalAttempts++;
      if(opt === correct){
        correctAnswers++;
        feedback.textContent = "✅ Correct!";
      } else {
        feedback.textContent = `❌ Incorrect! Correct answer: ${correct}`;
        saveIncorrectAnswer(question, correct, opt);
      }
      updateDashboard();
      currentIndex++;
      if(currentIndex < quizQuestions.length){
        currentQ.textContent = currentIndex + 1;
        setTimeout(generateQuestion, 1500);
      } else {
        localStorage.setItem("prevAttempts", Number(localStorage.getItem("prevAttempts")||0)+totalAttempts);
        alert("Quiz Complete!");
        showStartPage();
      }
    }
    optionsContainer.appendChild(btn);
  });
}

// Fetch vocabulary from GitHub
fetch("https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabulary = data;
    showStartPage();
  })
  .catch(err => {
    console.error("Error loading vocabulary data:", err);
    questionText.textContent = "Failed to load vocabulary.";
  });
