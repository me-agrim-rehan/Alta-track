import { logoutUser,API_BASE_URL } from "../api.js";
document.addEventListener("DOMContentLoaded", () => {
  fetchDashboardData();
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
  document
    .getElementById("submitProgressBtn")
    .addEventListener("click", goToSubmissionPage);

  document.getElementById("tabDashboard").addEventListener("click", () => {
    switchView("dashboard");
  });

  document.getElementById("tabRank").addEventListener("click", () => {
    switchView("rank");
  });
});

// =========================
// FETCH DASHBOARD DATA
// =========================

async function fetchDashboardData() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard");
    }

    updateDashboard(data);
  } catch (error) {
    

    if (error.message === "Authentication required") {
      window.location.href = "/index.html";
      return;
    }
  }
}

// =========================
// UPDATE DASHBOARD
// =========================

function updateDashboard(data) {
  const solved = data.progress.solved;
  const total = data.progress.total;

  const dashboardData = {
    current_day: solved,
    total_days: total,

    streak_days: data.challenge.streak,
    max_streak: total,

    flags_count: data.challenge.monthlyFlags,
    max_flags: 2,
  };

  updateGauges(dashboardData);

  updateProgressText(data.progress);

  updateUser(data.user);
}

// =========================
// GAUGES
// =========================

function updateGauges(data) {
  const maxArcLength = 230;

  // -------------------------
  // DAY PROGRESS
  // -------------------------

  const dayPercentage = data.current_day / data.total_days;

  const dayOffset = maxArcLength - maxArcLength * dayPercentage;

  document.getElementById("dayProgressArc").style.strokeDashoffset = dayOffset;

  document.getElementById("currentDay").textContent = data.current_day;

  document.getElementById("nextSubText").textContent =
    data.current_day < data.total_days
      ? `Next: Day ${data.current_day + 1}`
      : "Challenge completed";

  // -------------------------
  // ACTIVE STREAK
  // -------------------------

  const streakPercentage = Math.min(data.streak_days / data.max_streak, 1);

  const streakOffset = maxArcLength - maxArcLength * streakPercentage;

  document.getElementById("streakArc").style.strokeDashoffset = streakOffset;

  document.getElementById("streakCount").textContent = data.streak_days;

  document.getElementById("streakMessage").textContent =
    data.streak_days > 0 ? "Streak active" : "Start your streak";

  // -------------------------
  // FLAGS
  // -------------------------

  const flagPercentage = data.flags_count / data.max_flags;

  const flagOffset = maxArcLength - maxArcLength * flagPercentage;

  document.getElementById("flagArc").style.strokeDashoffset = flagOffset;

  document.getElementById("flagCount").textContent = data.flags_count;

  document.getElementById("flagMessage").textContent =
    data.flags_count === 0 ? "No flags" : `${data.flags_count} flag this month`;
}

// =========================
// PROGRESS TEXT
// =========================

function updateProgressText(progress) {
  document.getElementById("questionsProgress").textContent =
    `${progress.solved} / ${progress.total} Solved`;
}

// =========================
// QUESTIONS
// =========================

function renderQuestions(questions) {
  const questionsList = document.getElementById("questionsList");

  questionsList.innerHTML = "";

  questions.forEach((question) => {
    const questionCard = document.createElement("div");

    questionCard.className = `question-card ${
      question.solved ? "solved" : "unsolved"
    }`;

    questionCard.innerHTML = `

      <div class="question-number">
        ${question.id}
      </div>


      <div class="question-content">

        <h3>
          ${escapeHTML(question.problem)}
        </h3>

        <p>
          ${escapeHTML(question.description)}
        </p>

      </div>


      <div class="question-status">

        ${
          question.solved
            ? `
              <span class="status-solved">
                ✓ Solved
              </span>
            `
            : `
              <span class="status-unsolved">
                ○ Not Solved
              </span>
            `
        }

      </div>

    `;

    questionsList.appendChild(questionCard);
  });
}

// =========================
// USER
// =========================

function updateUser(user) {
  console.log("Logged in user:", user);

  // Later we can use this for:
  // - profile avatar
  // - name
  // - campus
  // - program
}

// =========================
// SECURITY
// =========================

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}

// =========================
// NAVIGATION
// =========================

function switchView(view) {
  const glider = document.getElementById("sliderGlider");

  const tabDashboard = document.getElementById("tabDashboard");

  const tabRank = document.getElementById("tabRank");

  if (view === "rank") {
    glider.classList.remove("pos-dashboard");

    glider.classList.add("pos-rank");

    tabRank.classList.add("active");

    tabDashboard.classList.remove("active");
  } else {
    glider.classList.remove("pos-rank");

    glider.classList.add("pos-dashboard");

    tabDashboard.classList.add("active");
  }
}

// =========================
// SUBMISSION
// =========================

function goToSubmissionPage() {
  window.location.href = "/submit.html";
}

async function handleLogout() {
  if (!confirm("Are you sure you want to log out?")) {
    return;
  }

  try {
    const data = await logoutUser();

    console.log("Logout response:", data);

    window.location.href = "/index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert(error.message || "Logout failed");
  }
}
