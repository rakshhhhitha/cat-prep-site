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

// Dashboard update
function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

// Utility functions
function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }
function shuffle(array) { return array.sort(() => 0.5 - Math.random()); }
function getValidQuestions(array) {
  return array.filter(item => 
    (item.Meanings && item.Meanings.trim() !== "") || 
    (item.Synonym && item.Synonym.trim() !== "") || 
    (item.Antonym && item.Antonym.trim() !== "")
  );
}
function getRandomQuestions(array, n) { return shuffle([...array]).slice(0, Math.min(n, array.length)); }

// Start Quiz
function startQuiz(){
  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  resultPage.classList.add("hidden");

  currentIndex = 0;
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();

  quizQuestions = getRandomQuestions(getValidQuestions(vocabulary), 20);
  currentQ.textContent = 1;
  generateQuestion();
}

// Generate a single question
function generateQuestion(){
  feedback.textContent = "";
  progressBar.style.width = ((currentIndex / quizQuestions.length) * 100) + "%";

  const item = quizQuestions[currentIndex];

  // Determine valid question types for this word
  const types = [];
  if(item.Meanings && item.Meanings.trim() !== "") types.push("Meanings");
  if(item.Synonym && item.Synonym.trim() !== "") types.push("Synonym");
  if(item.Antonym && item.Antonym.trim() !== "") types.push("Antonym");

  if(types.length === 0){
    console.warn("Skipping invalid word:", item);
    nextQuestion(); 
    return;
  }

  const type = getRandomItem(types);
  let correct = "", question = "", options = [];

  if(type==="Meanings"){
    question = `What is the meaning of "${item.Word}"?`;
    correct = item.Meanings.trim();
    options = vocabulary.map(v=>v.Meanings).filter(s => s && s.trim() !== "");
  } else if(type==="Synonym"){
    const syns = item.Synonym.split(",").map(s=>s.trim()).filter(s => s !== "");
    correct = getRandomItem(syns);
    options = vocabulary.flatMap(v=>v.Synonym?.split(",").map(s=>s.trim()) || []).filter(s=>s!=="");
  } else if(type==="Antonym"){
    const ants = item.Antonym.split(",").map(a=>a.trim()).filter(a => a !== "");
    correct = getRandomItem(ants);
    options = vocabulary.flatMap(v=>v.Antonym?.split(",").map(a=>a.trim()) || []).filter(a=>a!=="");
  }

  // Ensure options are unique and include the correct answer
  options = [...new Set(options)];
  if(!options.includes(correct)) options.push(correct);
  options = shuffle(options).slice(0,4);
  if(!options.includes(correct)) options[Math.floor(Math.random()*4)] = correct;

  // Render question
  questionText.textContent = question;
  optionsContainer.innerHTML = "";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = () => {
      totalAttempts++;
      if(opt === correct){
        correctAnswers++;
        feedback.textContent = "✅ Correct!";
        feedback.className = "feedback correct";
        btn.classList.add("correct");
      } else {
        feedback.textContent = `❌ Incorrect! Correct answer: ${correct}`;
        feedback.className = "feedback incorrect";
        btn.classList.add("incorrect");
        // Highlight correct answer
        Array.from(optionsContainer.children).forEach(b => {
          if(b.textContent === correct) b.classList.add("correct");
        });
      }
      updateDashboard();
      Array.from(optionsContainer.children).forEach(b=>b.disabled=true);
      setTimeout(nextQuestion, 1200);
    };
    optionsContainer.appendChild(btn);
  });
}

// Move to next question
function nextQuestion(){
  currentIndex++;
  if(currentIndex < quizQuestions.length){
    currentQ.textContent = currentIndex + 1;
    generateQuestion();
  } else {
    showResults();
  }
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

// Fetch vocab from GitHub
fetch("https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json")
.then(res=>res.json())
.then(data=>{
  vocabulary = data;
  totalQuestionsSpan.textContent = getValidQuestions(vocabulary).length;
})
.catch(err=>{
  console.error("Error loading vocabulary data:", err);
  questionText.textContent = "Failed to load vocabulary.";
});
