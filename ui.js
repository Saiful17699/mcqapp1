/* ========================================
   UI Rendering Utilities
   ======================================== */

const UI = (() => {

  /* ----------------------------
     Escape HTML (Security)
  ----------------------------- */

  function escape(text) {

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;

  }

  /* ----------------------------
     Render MCQ Question
  ----------------------------- */

  function renderQuestion(container, question, selectedAnswer, onSelect) {

    let html = `<h3>${escape(question.question_text)}</h3>`;

    question.options.forEach((opt, index) => {

      const checked = selectedAnswer === index ? "checked" : "";

      html += `
        <label class="option">
          <input type="radio" name="mcq"
            ${checked}
            onchange="(${onSelect})(${index})">
          ${escape(opt)}
        </label>
      `;

    });

    container.innerHTML = html;

  }

  /* ----------------------------
     Render Exam Review
  ----------------------------- */

  function renderReview(container, questions, answers) {

    let html = "";

    questions.forEach((q, i) => {

      const userAns = answers[q.id];
      const correct = q.correct_answer_index;

      html += `
        <div class="card">
          <h4>Q${i + 1}: ${escape(q.question_text)}</h4>
          <p>✅ Correct: ${escape(q.options[correct])}</p>
          <p>🧑 Your Answer: ${userAns !== undefined ? escape(q.options[userAns]) : "Not Answered"}</p>

          <details>
            <summary>Explanation</summary>
            <p>${escape(q.explanation || "No explanation")}</p>
          </details>
        </div>
      `;

    });

    container.innerHTML = html;

  }

  /* ----------------------------
     Public API
  ----------------------------- */

  return {
    renderQuestion,
    renderReview
  };

})();

window.UI = UI;
