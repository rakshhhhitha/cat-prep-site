<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vocabulary Quiz</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <!-- Start Page -->
    <div id="startPage" class="quiz-container text-center">
      <h1 class="mb-3">Vocabulary Quiz</h1>
      <p>Total Words Available: <span id="totalQuestions">0</span></p>
      <button class="btn btn-primary mt-3" id="startQuizBtn">Start Quiz</button>
    </div>

    <!-- Quiz Page -->
    <div id="quizPage" class="quiz-container hidden">
      <div class="quiz-header">
        <h2>Interactive Quiz</h2>
        <div class="progress">
          <div id="progressBar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuemin="0"
            aria-valuemax="100"></div>
        </div>
      </div>

      <h4 class="mb-3">Question <span id="currentQ">1</span> / 20</h4>
      <p class="question" id="questionText"></p>
      <div class="options" id="optionsContainer"></div>

      <div class="feedback mt-3 fw-bold" id="feedback"></div>

      <div class="quiz-footer mt-4">
        <div>
          <p>Total Attempts: <span id="totalAttempts">0</span></p>
          <p>Correct Answers: <span id="correctAnswers">0</span></p>
          <p>Accuracy: <span id="accuracy">0%</span></p>
        </div>
      </div>
    </div>

    <!-- Results Page -->
    <div id="resultPage" class="quiz-container hidden text-center">
      <div class="result-icon">
        <i id="resultIcon" class="fas fa-trophy text-success"></i>
      </div>
      <h2>Quiz Completed!</h2>
      <p>Your Score: <span id="finalScore"></span> / <span id="totalQuestionsResult"></span></p>
      <p>Accuracy: <span id="finalAccuracy"></span>%</p>
      <button class="btn btn-primary mt-3" id="restartQuizBtn">Restart Quiz</button>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
