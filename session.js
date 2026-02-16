/* ========================================
   Session Duplicate Prevention
   ======================================== */

const Session = (() => {

  const STORAGE_KEY = "MCQ_SESSION_ATTEMPTED";

  /* ----------------------------
     Get Attempted Questions
  ----------------------------- */
  function getAttemptedQuestions() {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /* ----------------------------
     Mark Question Attempted
  ----------------------------- */
  function markAttempted(questionId) {
    const attempted = getAttemptedQuestions();

    if (!attempted.includes(questionId)) {
      attempted.push(questionId);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attempted));
    }
  }

  /* ----------------------------
     Reset Session
  ----------------------------- */
  function reset() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  /* ----------------------------
     Public API
  ----------------------------- */
  return {
    getAttemptedQuestions,
    markAttempted,
    reset
  };

})();

window.Session = Session;


