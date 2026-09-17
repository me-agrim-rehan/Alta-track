
const defaultUserData = {
  name: "Alta Student",
  campus: "Alta School of Technology",
  phone: "+91 9876543210",
  email: "student@alta.edu"
};

let currentUserData = {};
let isEditMode = false;


document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  
  
  document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('profileDropdown');
    const avatarBtn = document.getElementById('avatarMenuBtn');
    if (!dropdown.contains(event.target) && !avatarBtn.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  });
});


function loadUserData() {
  const savedData = localStorage.getItem('alta_user_profile');
  if (savedData) {
    currentUserData = JSON.parse(savedData);
  } else {
    currentUserData = { ...defaultUserData };
    localStorage.setItem('alta_user_profile', JSON.stringify(currentUserData));
  }

  populateUI();
}


function populateUI() {
  
  document.getElementById('dispName').textContent = currentUserData.name;
  document.getElementById('dispCampus').textContent = currentUserData.campus;

  
  document.getElementById('inputName').value = currentUserData.name;
  document.getElementById('inputCampus').value = currentUserData.campus;
  document.getElementById('inputPhone').value = currentUserData.phone;
  document.getElementById('inputEmail').value = currentUserData.email;

  
  document.getElementById('dropdownName').textContent = currentUserData.name;
  document.getElementById('dropdownCampus').textContent = currentUserData.campus;
  document.getElementById('dropdownPhone').textContent = currentUserData.phone;
  document.getElementById('dropdownEmail').textContent = currentUserData.email;
}


function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  dropdown.classList.toggle('hidden');
}


function enableEditModeFromDropdown() {
  document.getElementById('profileDropdown').classList.add('hidden');
  if (!isEditMode) {
    toggleEditMode();
  }
}

function toggleEditMode() {
  isEditMode = true;
  const inputs = document.querySelectorAll('.field-input');
  
  inputs.forEach(input => {
    input.removeAttribute('disabled');
    input.classList.add('editable');
  });

  document.getElementById('editToggleBtn').classList.add('hidden');
  document.getElementById('saveCancelGroup').classList.remove('hidden');
}

function cancelEditMode() {
  isEditMode = false;
  const inputs = document.querySelectorAll('.field-input');
  
  inputs.forEach(input => {
    input.setAttribute('disabled', 'true');
    input.classList.remove('editable');
  });

  document.getElementById('saveCancelGroup').classList.add('hidden');
  document.getElementById('editToggleBtn').classList.remove('hidden');

  populateUI();
}

function saveProfileChanges(event) {
  event.preventDefault();

  const updatedName = document.getElementById('inputName').value.trim();
  const updatedCampus = document.getElementById('inputCampus').value.trim();
  const updatedPhone = document.getElementById('inputPhone').value.trim();
  const updatedEmail = document.getElementById('inputEmail').value.trim();

  if (!updatedName || !updatedCampus || !updatedPhone || !updatedEmail) {
    alert('Please complete all required profile fields.');
    return;
  }

  currentUserData = {
    name: updatedName,
    campus: updatedCampus,
    phone: updatedPhone,
    email: updatedEmail
  };

  localStorage.setItem('alta_user_profile', JSON.stringify(currentUserData));

  cancelEditMode();
  alert('Profile updated successfully!');
}