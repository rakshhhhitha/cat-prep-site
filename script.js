let vocabulary = [];
let quizQuestions = [];
let currentIndex = 0;
let totalAttempts = 0;
let correctAnswers = 0;

const startPage = document.getElementById("startPage");
const quizPage = document.getElementById("quizPage");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedback = document.getElementById("feedback");
const totalQuestionsSpan = document.getElementById("totalQuestions");
const currentQ = document.getElementById("currentQ");
const totalAttemptsSpan = document.getElementById("totalAttempts");
const correctAnswersSpan = document.getElementById("correctAnswers");
const accuracySpan = document.getElementById("accuracy");

function updateDashboard() {
  totalAttemptsSpan.textContent = totalAttempts;
  correctAnswersSpan.textContent = correctAnswers;
  accuracySpan.textContent = totalAttempts ? ((correctAnswers/totalAttempts)*100).toFixed(2) + "%" : "0%";
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleOptions(options) {
  return [...new Set(options)].sort(() => 0.5 - Math.random()).slice(0,4);
}

function getValidQuestions(array) {
  return array.filter(item => 
    (item.Meanings && item.Meanings.trim()) ||
    (item.Synonym && item.Synonym.trim()) ||
    (item.Antonym && item.Antonym.trim())
  );
}

function getRandomQuestions(array, n) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function startQuiz() {
  startPage.classList.add("hidden");
  quizPage.classList.remove("hidden");
  currentIndex = 0;
  totalAttempts = 0;
  correctAnswers = 0;
  updateDashboard();

  quizQuestions = getRandomQuestions(getValidQuestions(vocabulary), 20);
  currentQ.textContent = 1;
  generateQuestion();
}

function generateQuestion() {
  feedback.textContent = "";
  const item = quizQuestions[currentIndex];

  let types = [];
  if(item.Meanings && item.Meanings.trim() !== "") types.push("Meanings");
  if(item.Synonym && item.Synonym.trim() !== "") types.push("Synonym");
  if(item.Antonym && item.Antonym.trim() !== "") types.push("Antonym");

  const type = getRandomItem(types);
  let correct = "";
  let question = "";
  let options = [];

  if(type==="Meanings"){
    question = `What is the meaning of "${item.Word}"?`;
    correct = item.Meanings.trim();
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

  options = shuffleOptions([...options, correct]);

  questionText.textContent = question;
  optionsContainer.innerHTML = "";

  options.forEach(opt=>{
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.onclick = ()=>{
      totalAttempts++;
      if(opt === correct){
        correctAnswers++;
        feedback.textContent = "✅ Correct!";
        feedback.className = "feedback correct";
      } else {
        feedback.textContent = `❌ Incorrect! Correct answer: ${correct}`;
        feedback.className = "feedback incorrect";
      }
      updateDashboard();
      nextQuestion();
    }
    optionsContainer.appendChild(btn);
  });
}

function nextQuestion(){
  currentIndex++;
  if(currentIndex < quizQuestions.length){
    currentQ.textContent = currentIndex + 1;
    setTimeout(generateQuestion, 1200);
  } else {
    alert("Quiz Complete!");
    startPage.classList.remove("hidden");
    quizPage.classList.add("hidden");
  }
}

document.getElementById("startQuizBtn").onclick = startQuiz;

// Fetch Vocabulary from GitHub
fetch("https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json")
  .then(res => res.json())
  .then(data => {
    vocabulary = data;
    totalQuestionsSpan.textContent = getValidQuestions(vocabulary).length;
  })
  .catch(err => {
    console.error("Error loading vocabulary data:", err);
    questionText.textContent = "Failed to load vocabulary.";
  });
