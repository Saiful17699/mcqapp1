/* =====================================================
   IndexedDB Handler for Local MCQ Exam App
   ===================================================== */

const DB_NAME = "MCQ_EXAM_DB";
const DB_VERSION = 1;

// Object Stores
const QUESTION_STORE = "questions";
const HISTORY_STORE = "exam_history";
const META_STORE = "meta";

let dbInstance = null;

/* ================================
   Open Database
================================ */

function openDatabase() {
  return new Promise((resolve, reject) => {

    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      /* ------------------------
         Questions Store
      ------------------------ */
      if (!db.objectStoreNames.contains(QUESTION_STORE)) {

        const questionStore = db.createObjectStore(QUESTION_STORE, {
          keyPath: "id"
        });

        // Indexes for fast filtering
        questionStore.createIndex("subject", "tags.subject", { multiEntry: false });
        questionStore.createIndex("chapter", "tags.chapter", { multiEntry: false });
        questionStore.createIndex("topic", "tags.topic", { multiEntry: false });
        questionStore.createIndex("difficulty", "tags.difficulty", { multiEntry: false });
        questionStore.createIndex("created_date", "created_date");
      }

      /* ------------------------
         Exam History Store
      ------------------------ */
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {

        db.createObjectStore(HISTORY_STORE, {
          keyPath: "attempt_id",
          autoIncrement: true
        });
      }

      /* ------------------------
         Meta Store (Settings)
      ------------------------ */
      if (!db.objectStoreNames.contains(META_STORE)) {

        db.createObjectStore(META_STORE, {
          keyPath: "key"
        });
      }

      console.log("Database Initialized");
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject("Failed to open database");
    };

  });
}

/* ================================
   Utility Transaction Wrapper
================================ */

async function getStore(storeName, mode = "readonly") {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

/* ================================
   MCQ CRUD Operations
================================ */

async function addQuestion(question) {
  const store = await getStore(QUESTION_STORE, "readwrite");

  question.created_date = new Date().toISOString();
  question.last_modified = new Date().toISOString();

  return store.put(question);
}

async function updateQuestion(question) {
  const store = await getStore(QUESTION_STORE, "readwrite");

  question.last_modified = new Date().toISOString();

  return store.put(question);
}

async function deleteQuestion(id) {
  const store = await getStore(QUESTION_STORE, "readwrite");
  return store.delete(id);
}

async function getQuestion(id) {
  const store = await getStore(QUESTION_STORE);
  return store.get(id);
}

/* ================================
   Fetch All Questions
================================ */

async function getAllQuestions() {
  const store = await getStore(QUESTION_STORE);

  return new Promise(resolve => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

/* ================================
   Bulk Insert (Importer)
================================ */

async function bulkInsertQuestions(questionArray) {

  const store = await getStore(QUESTION_STORE, "readwrite");

  return new Promise((resolve, reject) => {

    questionArray.forEach(q => {
      q.created_date = new Date().toISOString();
      q.last_modified = new Date().toISOString();
      store.put(q);
    });

    store.transaction.oncomplete = () => resolve(true);
    store.transaction.onerror = () => reject(false);
  });
}

/* ================================
   Filtered Query (Exam Engine)
================================ */

async function getFilteredQuestions(filters = {}) {

  const all = await getAllQuestions();

  return all.filter(q => {

    if (filters.subject && q.tags.subject !== filters.subject) return false;
    if (filters.chapter && q.tags.chapter !== filters.chapter) return false;
    if (filters.topic && q.tags.topic !== filters.topic) return false;
    if (filters.difficulty && q.tags.difficulty !== filters.difficulty) return false;

    return true;
  });
}

/* ================================
   Exam History Functions
================================ */

async function saveExamAttempt(resultObject) {

  const store = await getStore(HISTORY_STORE, "readwrite");

  resultObject.timestamp = new Date().toISOString();

  return store.add(resultObject);
}

async function getExamHistory() {

  const store = await getStore(HISTORY_STORE);

  return new Promise(resolve => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function clearExamHistory() {

  const store = await getStore(HISTORY_STORE, "readwrite");
  return store.clear();
}

/* ================================
   Meta Settings Storage
================================ */

async function saveMeta(key, value) {

  const store = await getStore(META_STORE, "readwrite");

  return store.put({
    key,
    value
  });
}

async function getMeta(key) {

  const store = await getStore(META_STORE);

  return new Promise(resolve => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
  });
}

/* ================================
   Database Export (Backup)
================================ */

async function exportDatabase() {

  const questions = await getAllQuestions();
  const history = await getExamHistory();

  return {
    exported_at: new Date().toISOString(),
    questions,
    history
  };
}

/* ================================
   Database Import (Restore)
================================ */

async function importDatabase(data) {

  if (data.questions) {
    await bulkInsertQuestions(data.questions);
  }

  if (data.history) {
    const store = await getStore(HISTORY_STORE, "readwrite");

    data.history.forEach(h => {
      store.add(h);
    });
  }

  return true;
}

/* ================================
   Global Exposure
================================ */

window.DB = {
  openDatabase,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestion,
  getAllQuestions,
  bulkInsertQuestions,
  getFilteredQuestions,
  saveExamAttempt,
  getExamHistory,
  clearExamHistory,
  saveMeta,
  getMeta,
  exportDatabase,
  importDatabase
};
