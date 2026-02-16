/* ========================================
   Importer Module (CSV / JSON)
   ======================================== */

const Importer = (() => {

  /* ----------------------------
     Validate Question Format
  ----------------------------- */

  function validateQuestion(q) {

    if (!q.id || !q.question_text || !q.options || q.correct_answer_index === undefined) {
      return false;
    }

    if (!Array.isArray(q.options) || q.options.length < 3) {
      return false;
    }

    if (q.correct_answer_index >= q.options.length) {
      return false;
    }

    if (!q.tags) {
      q.tags = {};
    }

    return true;
  }

  /* ----------------------------
     Normalize Question Object
  ----------------------------- */

  function normalizeQuestion(q) {

    return {
      id: String(q.id),
      question_text: q.question_text,
      options: q.options,
      correct_answer_index: Number(q.correct_answer_index),
      explanation: q.explanation || "",
      images: q.images || [],
      tags: {
        subject: q.tags.subject || "",
        chapter: q.tags.chapter || "",
        topic: q.tags.topic || "",
        difficulty: q.tags.difficulty || ""
      },
      created_date: q.created_date || null,
      last_modified: q.last_modified || null
    };
  }

  /* ----------------------------
     Import JSON File
  ----------------------------- */

  async function importJSON(file) {

    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      throw "Invalid JSON format (Expected Array)";
    }

    const validQuestions = [];

    data.forEach(q => {

      if (validateQuestion(q)) {
        validQuestions.push(normalizeQuestion(q));
      }

    });

    if (validQuestions.length === 0) {
      throw "No valid questions found";
    }

    await DB.bulkInsertQuestions(validQuestions);

    return validQuestions.length;
  }

  /* ----------------------------
     CSV Parser Helper
  ----------------------------- */

  function parseCSV(csvText) {

    const lines = csvText.split("\n").filter(l => l.trim() !== "");
    const headers = lines.shift().split(",");

    const rows = [];

    lines.forEach(line => {

      const values = line.split(",");
      const obj = {};

      headers.forEach((h, i) => {
        obj[h.trim()] = values[i] ? values[i].trim() : "";
      });

      rows.push(obj);

    });

    return rows;
  }

  /* ----------------------------
     Import CSV File
  ----------------------------- */

  async function importCSV(file) {

    const text = await file.text();
    const rows = parseCSV(text);

    const questions = [];

    rows.forEach(row => {

      const options = [
        row.option1,
        row.option2,
        row.option3,
        row.option4
      ].filter(Boolean);

      const q = {
        id: row.id,
        question_text: row.question_text,
        options,
        correct_answer_index: Number(row.correct_answer_index),
        explanation: row.explanation || "",
        images: [],
        tags: {
          subject: row.subject || "",
          chapter: row.chapter || "",
          topic: row.topic || "",
          difficulty: row.difficulty || ""
        }
      };

      if (validateQuestion(q)) {
        questions.push(normalizeQuestion(q));
      }

    });

    if (!questions.length) {
      throw "No valid CSV records found";
    }

    await DB.bulkInsertQuestions(questions);

    return questions.length;
  }

  /* ----------------------------
     Public API
  ----------------------------- */

  return {
    importJSON,
    importCSV
  };

})();

window.Importer = Importer;
