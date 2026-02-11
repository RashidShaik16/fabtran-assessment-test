// ===============================
// CONFIG
// ===============================


const QUESTIONS_PER_PAGE = 5;
const TOTAL_TIME = 15 * 60; // 20 minutes in seconds

import {data} from "./data.js"

// ===============================
// STATE
// ===============================

let currentPage = 0;
let timeLeft = TOTAL_TIME;
let userAnswers = {};

const questions = data

// ===============================
// TIMER LOGIC
// ===============================

function startTimer() {
  const timerElement = document.getElementById("timer");

  const interval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    if (timeLeft <= 0) {
      clearInterval(interval);
      submitTest();
    }

    timeLeft--;
  }, 1000);
}

// ===============================
// RENDER QUESTIONS
// ===============================

function renderQuestions() {
  const form = document.getElementById("questionForm");
  form.innerHTML = "";

  const start = currentPage * QUESTIONS_PER_PAGE;
  const end = start + QUESTIONS_PER_PAGE;

  const currentQuestions = questions.slice(start, end);

  currentQuestions.forEach((q) => {
    const questionBlock = document.createElement("div");
    questionBlock.className = "bg-white p-6 rounded shadow";

    questionBlock.innerHTML = `
      <h2 class="font-semibold mb-4">
        Q${q.id}. ${q.question}
      </h2>

      <!-- Image Area -->
      ${
        q.image != ""
          ? `<div class="mb-4 flex justify-center">
              <img src="${q.image}" 
                   class="max-h-80 border rounded p-2 bg-gray-50" />
             </div>`
          : ""
      }

      <div class="space-y-2">
        ${q.options
          .map(
            (option, index) => `
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="radio" 
                   name="question${q.id}" 
                   value="${index}" 
                   data-question="${q.id}"
                   data-option="${index}"
                   class="w-4 h-4"
                   ${userAnswers[q.id] == index ? "checked" : ""} />
            <span>${option}</span>
          </label>
        `
          )
          .join("")}
      </div>
    `;

    form.appendChild(questionBlock);
  });

  // Attach event listeners AFTER rendering
  document.querySelectorAll("input[type='radio']").forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const qId = e.target.dataset.question;
      const optionIndex = e.target.dataset.option;

      userAnswers[qId] = Number(optionIndex);
      updateProgress();
    });
  });

  updateProgress();
  updateButtons();
}


// ===============================
// NAVIGATION
// ===============================

document.getElementById("nextBtn").addEventListener("click", () => {
  if ((currentPage + 1) * QUESTIONS_PER_PAGE < questions.length) {
    currentPage++;
    renderQuestions();
    window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  } else {
    submitTest();
  }
});

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    renderQuestions();
    window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
  }
});

function updateButtons() {
  document.getElementById("prevBtn").disabled = currentPage === 0;

  const nextBtn = document.getElementById("nextBtn");
  if ((currentPage + 1) * QUESTIONS_PER_PAGE >= questions.length) {
    nextBtn.textContent = "Submit Test";
    nextBtn.classList.remove("bg-blue-600");
    nextBtn.classList.add("bg-green-600");
  } else {
    nextBtn.textContent = "Next";
    nextBtn.classList.remove("bg-green-600");
    nextBtn.classList.add("bg-blue-600");
  }
}

// ===============================
// PROGRESS BAR
// ===============================

function updateProgress() {
  const answeredCount = Object.keys(userAnswers).length;
  const percentage = (answeredCount / questions.length) * 100;

  document.getElementById("progressBar").style.width = percentage + "%";
  document.getElementById("progressText").textContent =
    `${answeredCount} / ${questions.length} Answered`;
}

// ===============================
// SUBMIT TEST
// ===============================

function submitTest() {

  // Show processing screen
  document.body.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="bg-white p-10 rounded shadow text-center max-w-md">
        
        <div class="flex justify-center mb-6">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <h2 class="text-xl font-semibold mb-2">Processing Results...</h2>
        <p class="text-gray-600">Please wait while we evaluate your answers.</p>
      </div>
    </div>
  `;

  // Delay evaluation for 3 seconds
  setTimeout(() => {

    let score = 0;

    questions.forEach((q) => {
      if (userAnswers[q.id] == q.answer) {
        score++;
      }
    });

    // Show result screen
const isPass = score >= 12;

document.body.innerHTML = `
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-10 rounded shadow text-center max-w-md w-full">

      <h2 class="text-2xl font-bold mb-4">Test Completed</h2>

      <p class="text-lg mb-2">Your Score:</p>
      <p class="text-4xl font-bold text-blue-600 mb-6">
        ${score} / ${questions.length}
      </p>

      <!-- Lights Section -->
      <div class="flex justify-center items-center gap-10 mb-6">

        <!-- Red Light -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full 
            ${!isPass 
              ? "bg-red-700 shadow-[0_0_15px_rgba(220,38,38,1),0_0_40px_rgba(220,38,38,0.9),0_0_70px_rgba(220,38,38,0.7)] scale-110"
              : "bg-red-300"}
            transition-all duration-500">
          </div>
        </div>

        <!-- Green Light -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full 
            ${isPass 
              ? "bg-green-600 shadow-[0_0_15px_rgba(34,197,94,1),0_0_40px_rgba(34,197,94,0.9),0_0_70px_rgba(34,197,94,0.7)] scale-110"
              : "bg-green-300"}
            transition-all duration-500">
          </div>
        </div>

      </div>

      <p class="text-gray-600">
        Please inform the supervisor.
      </p>

    </div>
  </div>
`;

  }, 4000);
}



document.getElementById("startTestBtn").addEventListener("click", () => {
  document.getElementById("instructionScreen").classList.add("hidden");
  document.getElementById("testContainer").classList.remove("hidden");

  renderQuestions();
  startTimer();
});