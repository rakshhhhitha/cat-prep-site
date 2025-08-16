let vocabulary = [];
let quizQuestions = [];
let currentQuestionIndex = 0;
let totalAttempts = 0;
let correctAnswers = 0;

// Fetch vocab data from GitHub
fetch('https://raw.githubusercontent.com/rakshhhhitha/cat-prep-site/main/vocab-data.json')
  .then(res => res.json())
  .then(data => {
    vocabulary = data.filter(v => v.Word && (v.Meanings || v.Synonym || v.Antonym));
    document.getElementById("totalQuestions").textContent = vocabulary.length;
  })
  .catch(err => {
    console.error("Failed to load vocabulary:", err);
    alert("Failed to load vocabulary data.");
  });

// DOM Elements
const startPage = document.getElementById('startPage');
const quizPage = document.getElementById('quizPage');
const resultPage = document.getElementById('resultPage');
const startBtn = document.getElementById('startQuizBtn');
const restartBtn = document.getElementById('restartQuizBtn');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const currentQ = document.getElementById('currentQ');
const progressBar = document.getElementById('progressBar');
const finalScore = document.getElementById('finalScore');
const finalAccuracy = document.getElementById('finalAccuracy');

// Start Quiz
startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', startQuiz);

function startQuiz() {
  startPage.classList.add('hidden');
  resultPage.classList.add('hidden');
  quizPage.classList.remove('hidden');

  totalAttempts = 0;
  correctAnswers = 0;
  currentQuestionIndex = 0;
  feedback.textContent = '';
  progressBar.style.width = '0%';

  // Pick 20 random non-repeating questions
  quizQuestions = [];
  let vocabCopy = [...vocabulary];
  while (quizQuestions.length < 20 && vocabCopy.length > 0) {
    let idx = Math.floor(Math.random() * vocabCopy.length);
    quizQuestions.push(vocabCopy.splice(idx, 1)[0]);
  }

  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= quizQuestions.length) {
    showResults();
    return;
  }

  const item = quizQuestions[currentQuestionIndex];
  const questionTypes = [];
  if (item.Meanings) questionTypes.push('Meaning');
  if (item.Synonym) questionTypes.push('Synonym');
  if (item.Antonym) questionTypes.push('Antonym');

  const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  let question = '';
  let correctAnswer = '';
  let options = [];

  if (type === 'Meaning') {
    question = `What is the meaning of "${item.Word}"?`;
    correctAnswer = item.Meanings;
    options = vocabulary.map(v => v.Meanings).filter(Boolean);
  } else if (type === 'Synonym') {
    question = `Which word is a synonym of "${item.Word}"?`;
    const synonyms = item.Synonym.split(',').map(s => s.trim()).filter(Boolean);
    correctAnswer = synonyms[Math.floor(Math.random() * synonyms.length)];
    options = vocabulary.flatMap(v => v.Synonym ? v.Synonym.split(',').map(s => s.trim()) : []);
  } else if (type === 'Antonym') {
    question = `Which word is an antonym of "${item.Word}"?`;
    const antonyms = item.Antonym.split(',').map(a => a.trim()).filter(Boolean);
    correctAnswer = antonyms[Math.floor(Math.random() * antonyms.length)];
    options = vocabulary.flatMap(v => v.Antonym ? v.Antonym.split(',').map(a => a.trim()) : []);
  }

  options = [...new Set(options.filter(Boolean))];
  if (!options.includes(correctAnswer)) options.push(correctAnswer);
  options = shuffleArray(options).slice(0, 4);
  if (!options.includes(correctAnswer)) options[Math.floor(Math.random() * 4)] = correctAnswer;

  questionText.textContent = question;
  currentQ.textContent = currentQuestionIndex + 1;
  optionsContainer.innerHTML = '';
  feedback.textContent = '';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, correctAnswer));
    optionsContainer.appendChild(btn);
  });

  progressBar.style.width = `${(currentQuestionIndex / quizQuestions.length) * 100}%`;
}

function handleAnswer(button, correctAnswer) {
  totalAttempts++;
  const buttons = [...optionsContainer.children];
  buttons.forEach(b => b.disabled = true);

  if (button.textContent === correctAnswer) {
    correctAnswers++;
    button.classList.add('correct');
    feedback.textContent = '✅ Correct!';
  } else {
    button.classList.add('incorrect');
    feedback.textContent = `❌ Incorrect! Correct: ${correctAnswer}`;
  }

  currentQuestionIndex++;
  setTimeout(showQuestion, 1500);
}

function showResults() {
  quizPage.classList.add('hidden');
  resultPage.classList.remove('hidden');
  finalScore.textContent = correctAnswers;
  finalAccuracy.textContent = ((correctAnswers / totalAttempts) * 100).toFixed(2);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
