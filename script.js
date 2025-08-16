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

// Utility functions
function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }
function shuffle(array) { return array.sort(() => 0.5 - Math.random()); }

// Update dashboard
function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

// Prepare valid pools
function getValidPools() {
  return {
    meaningsPool: vocabulary.filter(v => v.Meanings && v.Meanings.trim()!==""),
    synonymsPool: vocabulary.filter(v => v.Synonym && v.Synonym.trim()!==""),
    antonymsPool: vocabulary.filter(v => v.Antonym && v.Antonym.trim()!=="")
  };
}

// Pick a valid question
function pickValidQuestion(pools){
  let types = [];
  if(pools.meaningsPool.length) types.push("Meanings");
  if(pools.synonymsPool.length) types.push("Synonym");
  if(pools.antonymsPool.length) types.push("Antonym");
  if(types.length===0) return null;

  const type = getRandomItem(types);
  let item, question, correct, options;

  if(type==="Meanings"){
    item = getRandomItem(pools.meaningsPool);
    question = `What is the meaning of "${item.Word}"?`;
    correct = item.Meanings.trim();
    options = pools.meaningsPool.map(v=>v.Meanings.trim()).filter(Boolean);
  } else if(type==="Synonym"){
    item = getRandomItem(pools.synonymsPool);
    const syns = item.Synonym.split(",").map(s=>s.trim()).filter(Boolean);
    correct = getRandomItem(syns);
    options = pools.synonymsPool.flatMap(v=>v.Synonym.split(",").map(s=>s.trim())).filter(Boolean);
  } else if(type==="Antonym"){
    item = getRandomItem(pools.antonymsPool);
    const ants = item.Antonym.split(",").map(a=>a.trim()).filter(Boolean);
    correct = getRandomItem(ants);
    options = pools.antonymsPool.flatMap(v=>v.Antonym.split(",").map(a=>a.trim())).filter(Boolean);
  }

  // Ensure unique options and include correct answer
  options = [...new Set(options)];
  if(!options.includes(correct)) options.push(correct);
  options = shuffle(options).slice(0,4);
  if(!options.includes(correct)) options[Math.floor(Math.random()*4)] = correct;

  return {question, options, correct};
}

// Start quiz
function startQuiz(){
  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  resultPage.classList.add("hidden");

  currentIndex = 0;
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();

  const pools = getValidPools();
  quizQuestions = [];
  while(quizQuestions.length<20){
    const q = pickValidQuestion(pools);
    if(q) quizQuestions.push(q);
  }
  currentQ.textContent = 1;
  generateQuestion();
}

// Generate question
function generateQuestion(){
  feedback.textContent = "";
  progressBar.style.width = ((currentIndex / quizQuestions.length) * 100) + "%";

  const q = quizQuestions[currentIndex];
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
        feedback.className = "feedback correct";
        btn.classList.add("correct");
      } else {
        feedback.textContent = `❌ Incorrect! Correct answer: ${q.correct}`;
        feedback.className = "feedback incorrect";
        btn.classList.add("incorrect");
        Array.from(optionsContainer.children).forEach(b => {
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

// Next question
function nextQuestion(){
  currentIndex++;
  if(currentIndex < quizQuestions.length){
    currentQ.textContent = currentIndex+1;
    generateQuestion();
  } else showResults();
}

// Show final results
function showResults(){
  quizPage.classList.add("hidden");
  resultPage.classList.remove("hidden");
  finalScore.textContent = correctAnswers;
  totalQuestionsResult.textContent = quizQuestions.length;
  finalAccuracy.textContent = ((correctAnswers/quizQuestions.length)*100).toFixed(2);
  progressBar.style.width = "100%";
}

// Button events
document.getElementById("startQuizBtn").onclick = startQuiz;
document.getElementById("restartQuizBtn").onclick = startQuiz;

// Load vocabulary from GitHub
fetch("https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json")
.then(res=>res.json())
.then(data=>{
  vocabulary = data;
  totalQuestionsSpan.textContent = vocabulary.length;
})
.catch(err=>{
  console.error("Error loading vocabulary data:", err);
  questionText.textContent = "Failed to load vocabulary.";
});
