document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();
});

function switchView(view) {
  const glider = document.getElementById('sliderGlider');
  const tabDashboard = document.getElementById('tabDashboard');
  const tabRank = document.getElementById('tabRank');

  if (view === 'rank') {
    glider.classList.remove('pos-dashboard');
    glider.classList.add('pos-rank');
    tabRank.classList.add('active');
    tabDashboard.classList.remove('active');

    
  } else {
    glider.classList.remove('pos-rank');
    glider.classList.add('pos-dashboard');
    tabDashboard.classList.add('active');
    tabRank.classList.remove('active');
  }
}

function handleLogout() {
  if (confirm('Are you sure you want to log out?')) {
    
    window.location.href = 'index.html';
  }
}

function fetchDashboardData() {
  const data = {
    current_day: 17,
    total_days: 111,
    streak_days: 8,
    max_streak: 30,
    flags_count: 1,
    max_flags: 2
  };

  updateGauges(data);
}

function updateGauges(data) {
  const maxArcLength = 230;

  const dayPercentage = data.current_day / data.total_days;
  const dayOffset = maxArcLength - (maxArcLength * dayPercentage);
  document.getElementById('dayProgressArc').style.strokeDashoffset = dayOffset;
  document.getElementById('currentDay').textContent = data.current_day;
  document.getElementById('nextSubText').textContent = `Next: Day ${data.current_day + 1}`;

  const streakPercentage = Math.min(data.streak_days / data.max_streak, 1);
  const streakOffset = maxArcLength - (maxArcLength * streakPercentage);
  document.getElementById('streakArc').style.strokeDashoffset = streakOffset;
  document.getElementById('streakCount').textContent = data.streak_days;

  const flagPercentage = data.flags_count / data.max_flags;
  const flagOffset = maxArcLength - (maxArcLength * flagPercentage);
  document.getElementById('flagArc').style.strokeDashoffset = flagOffset;
  document.getElementById('flagCount').textContent = data.flags_count;
}

function goToSubmissionPage() {
  
  window.location.href = 'submit.html';
}