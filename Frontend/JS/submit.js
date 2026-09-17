
const activeQuestionData = {
  dayNumber: 17,
  title: "Reverse Array In-Place in C",
  statement: "Write a program in C that takes an array of integers of size N and reverses the array in-place (without using a second array). Then, print the reversed array elements separated by spaces.",
  explanation: "To reverse an array in-place, use two pointer indices: one starting at index 0 (`start`) and one at `N - 1` (`end`). Swap the elements at these two indices and move `start` forward and `end` backward until `start >= end`.",
  sampleInput: "5\n10 20 30 40 50",
  sampleOutput: "50 40 30 20 10"
};


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('currentDayBadge').textContent = `Day ${activeQuestionData.dayNumber}`;
  document.getElementById('dayQuestionTitle').textContent = activeQuestionData.title;
});


function openQuestionModal() {
  document.getElementById('modalDayTag').textContent = `Day ${activeQuestionData.dayNumber}`;
  document.getElementById('modalQuestionTitle').textContent = activeQuestionData.title;
  document.getElementById('modalStatement').textContent = activeQuestionData.statement;

  const modal = document.getElementById('questionModal');
  modal.classList.remove('hidden');
}

function closeQuestionModal() {
  const modal = document.getElementById('questionModal');
  modal.classList.add('hidden');
}

function closeQuestionModalOnOverlay(event) {
  if (event.target.id === 'questionModal') {
    closeQuestionModal();
  }
}


function openHintModal() {
  document.getElementById('hintExplanation').textContent = activeQuestionData.explanation;
  document.getElementById('sampleInput').textContent = activeQuestionData.sampleInput;
  document.getElementById('sampleOutput').textContent = activeQuestionData.sampleOutput;


  closeQuestionModal();
  const hintModal = document.getElementById('hintModal');
  hintModal.classList.remove('hidden');
}

function closeHintModal() {
  const hintModal = document.getElementById('hintModal');
  hintModal.classList.add('hidden');
}

function closeHintModalOnOverlay(event) {
  if (event.target.id === 'hintModal') {
    closeHintModal();
  }
}


function handleSubmission(event) {
  event.preventDefault();

  const linkedinUrl = document.getElementById('linkedinUrl').value.trim();
  const githubUrl = document.getElementById('githubUrl').value.trim();

  if (!linkedinUrl) {
    alert('Please enter a valid LinkedIn URL.');
    return;
  }


  const submissionRecord = {
    day: activeQuestionData.dayNumber,
    linkedinUrl: linkedinUrl,
    githubUrl: githubUrl || null,
    submittedAt: new Date().toISOString()
  };

  localStorage.setItem(`submission_day_${activeQuestionData.dayNumber}`, JSON.stringify(submissionRecord));

  alert(`Progress for Day ${activeQuestionData.dayNumber} submitted successfully! Redirecting to Dashboard...`);
  window.location.href = 'dashboard.html';
}