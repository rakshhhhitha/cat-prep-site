let vocabulary = [];
let quizQuestions = [];
let currentIndex = 0;
let totalAttempts = 0;
let correctAnswers = 0;

// DOM Elements
const startPage = document.getElementById("startPage");
const quizPage = document.getElementById("quizPage");
const resultPage = document.getElementById("resultPage");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedback = document.getElementById("feedback");
const totalQuestionsSpan = document.getElementById("totalQuestions");
const currentQ = document.getElementById("currentQ");
const totalAttemptsSpan = document.getElementById("totalAttempts");
const correctAnswersSpan = document.getElementById("correctAnswers");
const accuracySpan = document.getElementById("accuracy");
const progressBar = document.getElementById("progressBar");
const finalScore = document.getElementById("finalScore");
const finalAccuracy = document.getElementById("finalAccuracy");
const totalQuestionsResult = document.getElementById("totalQuestionsResult");

function shuffle(array){ return array.sort(()=>0.5 - Math.random()); }

function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

function pickQuestion(pools) {
  const availableTypes = [];
  if (pools.meaningsPool.length) availableTypes.push("Meanings");
  if (pools.synonymsPool.length) availableTypes.push("Synonym");
  if (pools.antonymsPool.length) availableTypes.push("Antonym");
  if (availableTypes.length === 0) return null;

  const type = availableTypes[Math.floor(Math.random()*availableTypes.length)];
  let item, correct, question, options;

  if (type === "Meanings") {
    item = pools.meaningsPool.pop();
    correct = item.Meanings.trim();
    question = `What is the meaning of "${item.Word}"?`;
    options = pools.meaningsPool.map(v=>v.Meanings.trim()).filter(Boolean);
  } else if (type === "Synonym") {
    item = pools.synonymsPool.pop();
    const syns = item.Synonym.split(",").map(s=>s.trim()).filter(Boolean);
    correct = syns[Math.floor(Math.random()*syns.length)];
    question = `Which word is a synonym of "${item.Word}"?`;
    options = pools.synonymsPool.flatMap(v=>v.Synonym.split(",").map(s=>s.trim())).filter(Boolean);
  } else if (type === "Antonym") {
    item = pools.antonymsPool.pop();
    const ants = item.Antonym.split(",").map(a=>a.trim()).filter(Boolean);
    correct = ants[Math.floor(Math.random()*ants.length)];
    question = `Which word is an antonym of "${item.Word}"?`;
    options = pools.antonymsPool.flatMap(v=>v.Antonym.split(",").map(a=>a.trim())).filter(Boolean);
  }

  options = [...new Set(options)];
  if (!options.includes(correct)) options.push(correct);
  options = shuffle(options).slice(0,4);
  if (!options.includes(correct)) options[Math.floor(Math.random()*4)] = correct;

  return { question, options, correct };
}

function startQuiz() {
  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  resultPage.classList.add("hidden");

  currentIndex = 0;
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();

  const meaningsPool = vocabulary.filter(v=>v.Meanings && v.Meanings.trim()!=="");
  const synonymsPool = vocabulary.filter(v=>v.Synonym && v.Synonym.trim()!=="");
  const antonymsPool = vocabulary.filter(v=>v.Antonym && v.Antonym.trim()!=="");
  const pools = { meaningsPool: shuffle(meaningsPool), synonymsPool: shuffle(synonymsPool), antonymsPool: shuffle(antonymsPool) };

  quizQuestions = [];
  while(quizQuestions.length < 20) {
    const q = pickQuestion(pools);
    if(!q) break;
    quizQuestions.push(q);
  }

  currentQ.textContent = 1;
  generateQuestion();
}

function generateQuestion() {
  feedback.textContent = "";
  progressBar.style.width = ((currentIndex / quizQuestions.length) * 100) + "%";

  const q = quizQuestions[currentIndex];
  if(!q) return;

  questionText.textContent = q.question;
  optionsContainer.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      totalAttempts++;
      if(opt===q.correct){
        correctAnswers++;
        feedback.textContent = "✅ Correct!";
        btn.classList.add("correct");
      } else {
        feedback.textContent = `❌ Incorrect! Correct: ${q.correct}`;
        btn.classList.add("incorrect");
        Array.from(optionsContainer.children).forEach(b=>{
          if(b.textContent===q.correct) b.classList.add("correct");
        });
      }
      updateDashboard();
      Array.from(optionsContainer.children).forEach(b=>b.disabled=true);
      setTimeout(nextQuestion, 1200);
    };
    optionsContainer.appendChild(btn);
  });
}

function nextQuestion() {
  currentIndex++;
  if(currentIndex < quizQuestions.length){
    currentQ.textContent = currentIndex+1;
    generateQuestion();
  } else showResults();
}

function showResults() {
  quizPage.classList.add("hidden");
  resultPage.classList.remove("hidden");

  finalScore.textContent = correctAnswers;
  totalQuestionsResult.textContent = quizQuestions.length;
  finalAccuracy.textContent = ((correctAnswers/quizQuestions.length)*100).toFixed(2);
  progressBar.style.width = "100%";

  // Save attempt in localStorage
  let attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
  attempts.push({
    date: new Date().toLocaleString(),
    score: correctAnswers,
    total: quizQuestions.length,
    accuracy: ((correctAnswers/quizQuestions.length)*100).toFixed(2)
  });
  localStorage.setItem('quizAttempts', JSON.stringify(attempts));
}

// Event listeners
document.getElementById("startQuizBtn").onclick = startQuiz;
document.getElementById("restartQuizBtn").onclick = startQuiz;

// Load vocab from GitHub
fetch("https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json")
.then(res=>res.json())
.then(data=>{
  vocabulary = data;
  totalQuestionsSpan.textContent = vocabulary.length;
})
.catch(err=>{
  console.error("Failed to load vocab:", err);
  questionText.textContent = "Failed to load vocabulary.";
});
