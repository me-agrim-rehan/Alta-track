import { API_BASE_URL } from "../api.js";

let activeQuestionData = null;

document.addEventListener("DOMContentLoaded", async () => {
  document
    .getElementById("submissionForm")
    .addEventListener("submit", handleSubmission);

  await loadNextQuestion();
});

async function loadNextQuestion() {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions/next`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
      window.location.replace("./index.html");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      console.log("Submission error response:", data);

      alert(data.message || "Submission failed.");

      return;
    }

    if (data.status === "completed") {
      showPageMessage("You have completed all 111 questions! 🎉");

      disableSubmission();
      return;
    }

    if (data.status === "wait") {
      showPageMessage(data.message);
      disableSubmission();

      if (data.question) {
        activeQuestionData = data.question;

        document.getElementById("currentDayBadge").textContent =
          `Day ${data.question.id}`;

        document.getElementById("dayQuestionTitle").textContent =
          `Question ${data.question.id}`;

        document.querySelector(".day-summary").textContent =
          data.question.problem;

        document.getElementById("modalDayTag").textContent =
          `Day ${data.question.id}`;

        document.getElementById("modalQuestionTitle").textContent =
          data.question.problem;

        document.getElementById("modalStatement").textContent =
          data.question.description || "";
      }

      return;
    }

    if (data.status === "reset_required") {
      activeQuestionData = data.question;

      // Show Question 1 on the side card
      document.getElementById("currentDayBadge").textContent = "Day 1";

      document.getElementById("dayQuestionTitle").textContent =
        `Question ${data.question.id}`;

      document.querySelector(".day-summary").textContent =
        "Your challenge has restarted. You must begin again from Question 1.";

      // Question modal information
      document.getElementById("modalDayTag").textContent = "Day 1";

      document.getElementById("modalQuestionTitle").textContent = "Question 1";

      document.getElementById("modalStatement").textContent =
        "Your challenge has restarted. Question 1 is now available.";

      // IMPORTANT:
      // User must be allowed to submit Question 1
      enableSubmission();

      // Show reset popup
      showResetPopup();

      return;
    }


    if (!data.question) {
      throw new Error("No question was returned by the server.");
    }

    activeQuestionData = data.question;

    document.getElementById("currentDayBadge").textContent =
      `Day ${data.question.id}`;

    document.getElementById("dayQuestionTitle").textContent =
      data.question.problem;

    document.querySelector(".day-summary").textContent = data.question.problem;

    document.getElementById("modalDayTag").textContent =
      `Day ${data.question.id}`;

    document.getElementById("modalQuestionTitle").textContent =
      data.question.problem;

    document.getElementById("modalStatement").textContent =
      data.question.description || "";

    if (data.status === "grace_period") {
      showPageMessage(
        "You are submitting during your grace period. This submission will add 1 flag.",
      );
    }
  } catch (error) {
    console.error("Load submission question error:", error);

    showPageMessage(error.message || "Unable to load today's question.");

    disableSubmission();
  }
}

async function handleSubmission(event) {
  event.preventDefault();

  const form = document.getElementById("submissionForm");

  const submitButton = form.querySelector(".form-submit-btn");

  const linkedinUrl = document.getElementById("linkedinUrl").value.trim();

  const githubUrl = document.getElementById("githubUrl").value.trim();

  if (!linkedinUrl) {
    alert("Please enter your LinkedIn post URL.");
    return;
  }

  try {
    submitButton.disabled = true;

    const buttonText = submitButton.querySelector("span");

    if (buttonText) {
      buttonText.textContent = "Submitting...";
    }

    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        linkedinUrl,
        githubUrl: githubUrl || null,
      }),
    });

    if (response.status === 401) {
      window.location.replace("./index.html");
      return;
    }

    const data = await response.json();
    console.log("SUBMISSION RESPONSE:", data);
    if (!response.ok) {
      alert(data.message || "Submission failed.");

      return;
    }

    if (data.flagAdded) {
      alert(
        "Submission accepted. You used a grace day, so 1 flag has been added.",
      );
    } else {
      alert("Submission accepted successfully!");
    }

    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("Submission error:", error);

    alert("Unable to submit your solution. Please try again.");
  } finally {
    submitButton.disabled = false;

    const buttonText = submitButton.querySelector("span");

    if (buttonText) {
      buttonText.textContent = "Submit Solution";
    }
  }
}

function openQuestionModal() {
  if (!activeQuestionData) {
    return;
  }
  document.getElementById("modalDayTag").textContent =
    `Day ${activeQuestionData.id}`;

  document.getElementById("modalQuestionTitle").textContent =
    activeQuestionData.problem;

  document.getElementById("modalStatement").textContent =
    activeQuestionData.description || "";

  document.getElementById("questionModal").classList.remove("hidden");
}
window.openQuestionModal = openQuestionModal;

function closeQuestionModal() {
  document.getElementById("questionModal").classList.add("hidden");
}
window.closeQuestionModal = closeQuestionModal;
function closeQuestionModalOnOverlay(event) {
  if (event.target.id === "questionModal") {
    closeQuestionModal();
  }
}
window.closeQuestionModalOnOverlay = closeQuestionModalOnOverlay;

function openHintModal() {
  if (!activeQuestionData) {
    return;
  }

  document.getElementById("hintExplanation").textContent =
    "Hint information is not available for this question yet.";

  document.getElementById("sampleInput").textContent = "Not available";

  document.getElementById("sampleOutput").textContent = "Not available";

  closeQuestionModal();

  document.getElementById("hintModal").classList.remove("hidden");
}

function closeHintModal() {
  document.getElementById("hintModal").classList.add("hidden");
}

function closeHintModalOnOverlay(event) {
  if (event.target.id === "hintModal") {
    closeHintModal();
  }
}

function disableSubmission() {
  const form = document.getElementById("submissionForm");

  const button = form.querySelector(".form-submit-btn");

  if (button) {
    button.disabled = true;
  }

  document.getElementById("linkedinUrl").disabled = true;

  document.getElementById("githubUrl").disabled = true;
}
function enableSubmission() {
  const form = document.getElementById("submissionForm");

  const button = form.querySelector(".form-submit-btn");

  if (button) {
    button.disabled = false;
  }

  document.getElementById("linkedinUrl").disabled = false;

  document.getElementById("githubUrl").disabled = false;
}

function showPageMessage(message) {
  let messageElement = document.getElementById("submissionStatus");

  if (!messageElement) {
    messageElement = document.createElement("div");

    messageElement.id = "submissionStatus";

    messageElement.style.marginBottom = "20px";

    messageElement.style.padding = "12px 16px";

    messageElement.style.borderRadius = "8px";

    messageElement.style.background = "#f3f4f6";

    messageElement.style.color = "#111827";

    const formCard = document.querySelector(".form-card");

    if (formCard) {
      formCard.prepend(messageElement);
    }
  }

  messageElement.textContent = message;
}


function showResetPopup() {
  document.getElementById("resetModal").classList.remove("hidden");
}

function closeResetModal() {
  document.getElementById("resetModal").classList.add("hidden");
}

function closeResetModalOnOverlay(event) {
  if (event.target.id === "resetModal") {
    closeResetModal();
  }
}