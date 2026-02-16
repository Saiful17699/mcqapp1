/* ========================================
   Exam Engine Core
   ======================================== */

const ExamEngine = (() => {

  let questionsPool = [];
  let examQuestions = [];
  let currentIndex = 0;
  let userAnswers = {};
  let examStartTime = null;

  /* ----------------------------
     Load Exam Questions
  ----------------------------- */

  async function loadQuestions(settings) {

    const filters = {
      subject: settings.subject || null,
      chapter: settings.chapter || null,
      topic: settings.topic || null,
      difficulty: settings.difficulty || null
    };

    let allQuestions = await DB.getFilteredQuestions(filters);

    if (!allQuestions.length) {
      throw "No questions found with selected filters";
    }

    // Duplicate Prevention Layer (Session)
    const attemptedIds = Session.getAttemptedQuestions();

    const unused = allQuestions.filter(q =>
      !attemptedIds.includes(q.id)
    );

    if (unused.length === 0) {
      Session.reset();
      return loadQuestions(settings);
    }

    questionsPool = shuffle(unused);

    examQuestions = questionsPool.slice(0, settings.totalQuestions);

    examQuestions.forEach(q => Session.markAttempted(q.id));

    currentIndex = 0;
    userAnswers = {};
    examStartTime = Date.now();

    return examQuestions.length;
  }

  /* ----------------------------
     Shuffle Algorithm
  ----------------------------- */

  function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  /* ----------------------------
     Navigation
  ----------------------------- */

  function getCurrentQuestion() {
    return examQuestions[currentIndex];
  }

  function nextQuestion() {
    if (currentIndex < examQuestions.length - 1) {
      currentIndex++;
    }
    return getCurrentQuestion();
  }

  function prevQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
    }
    return getCurrentQuestion();
  }

  function goTo(index) {
    if (index >= 0 && index < examQuestions.length) {
      currentIndex = index;
    }
    return getCurrentQuestion();
  }

  /* ----------------------------
     Answer Handling
  ----------------------------- */

  function saveAnswer(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;
  }

  function getUserAnswer(questionId) {
    return userAnswers[questionId];
  }

  /* ----------------------------
     Submit Exam
  ----------------------------- */

  async function submitExam() {

    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - examStartTime) / 1000);

    let correct = 0;
    let wrong = 0;

    examQuestions.forEach(q => {

      const userAns = userAnswers[q.id];

      if (userAns === q.correct_answer_index) {
        correct++;
      } else {
        wrong++;
      }

    });

    const result = {
      total_questions: examQuestions.length,
      correct,
      wrong,
      percentage: ((correct / examQuestions.length) * 100).toFixed(2),
      time_taken_seconds: timeTaken,
      answers: userAnswers,
      questions_snapshot: examQuestions
    };

    await DB.saveExamAttempt(result);

    return result;
  }

  /* ----------------------------
     Review Helpers
  ----------------------------- */

  function getExamQuestions() {
    return examQuestions;
  }

  function getProgress() {
    return {
      current: currentIndex + 1,
      total: examQuestions.length
    };
  }

  /* ----------------------------
     Public API
  ----------------------------- */

  return {
    loadQuestions,
    getCurrentQuestion,
    nextQuestion,
    prevQuestion,
    goTo,
    saveAnswer,
    getUserAnswer,
    submitExam,
    getExamQuestions,
    getProgress
  };

})();

window.ExamEngine = ExamEngine;
