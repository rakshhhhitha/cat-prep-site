let vocabulary = [];
let quizQuestions = [];
let currentIndex = 0;
let totalAttempts = 0;
let correctAnswers = 0;

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

function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

function getRandomItem(array) { return array[Math.floor(Math.random() * array.length)]; }
function shuffleOptions(options) { return [...new Set(options)].sort(() => 0.5 - Math.random()).slice(0,4); }
function getValidQuestions(array) { return array.filter(item => (item.Meanings && item.Meanings.trim()) || (item.Synonym && item.Synonym.trim()) || (item.Antonym && item.Antonym.trim())); }
function getRandomQuestions(array, n) { return [...array].sort(()=>0.5-Math.random()).slice(0, Math.min(n, array.length)); }

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

function generateQuestion(){
  feedback.textContent = "";
  progressBar.style.width = ((currentIndex / quizQuestions.length) * 100) + "%";

  const item = quizQuestions[currentIndex];
  const types = [];
  if(item.Meanings && item.Meanings.trim() !== "") types.push("Meanings");
  if(item.Synonym && item.Synonym.trim() !== "") types.push("Synonym");
  if(item.Antonym && item.Antonym.trim() !== "") types.push("Antonym");

  const type = getRandomItem(types);
  let correct = "", question = "", options = [];

  if(type==="Meanings"){
    question = `What is the meaning of "${item.Word}"?`;
    correct = item.Meanings.trim();
    options = vocabulary.map(v=>v.Meanings).filter(Boolean);
  } else if(type==="Synonym"){
    const syns = item.Synonym.split(",").map(s=>s.trim()).filter(Boolean);
    correct = getRandomItem(syns);
    options = vocabulary.flatMap(v=>v.Synonym?.split(",").map(s=>s.trim()) || []).filter(Boolean);
  } else if(type==="Antonym"){
    const ants = item.Antonym.split(",").map(a=>a.trim()).filter(Boolean);
    correct = getRandomItem(ants);
    options = vocabulary.flatMap(v=>v.Antonym?.split(",").map(a=>a.trim()) || []).filter(Boolean);
  }

  options = shuffleOptions([...options, correct]);

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

function nextQuestion(){
  currentIndex++;
  if(currentIndex < quizQuestions.length){
    currentQ.textContent = currentIndex + 1;
    generateQuestion();
  } else {
    showResults();
  }
}

function showResults(){
  quizPage.classList.add("hidden");
  resultPage.classList.remove("hidden");
  finalScore.textContent = correctAnswers;
  totalQuestionsResult.textContent = quizQuestions.length;
  finalAccuracy.textContent = ((correctAnswers/quizQuestions.length)*100).toFixed(2);
  progressBar.style.width = "100%";
}

document.getElementById("startQuizBtn").onclick = startQuiz;
document.getElementById("restartQuizBtn").onclick = startQuiz;

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
