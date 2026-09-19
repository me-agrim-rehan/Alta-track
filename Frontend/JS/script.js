import {
  loginUser,
  getDashboard,
  registerUser,
  checkEmail,
  checkPhone,
} from "../api.js";

// ======================================================
// TAB SWITCHING
// ======================================================

const signInTabBtn = document.getElementById("signInTabBtn");
const signUpTabBtn = document.getElementById("signUpTabBtn");

const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");

function switchTab(tab) {
  if (tab === "signIn") {
    signInTabBtn.classList.add("active");
    signUpTabBtn.classList.remove("active");

    signUpForm.classList.remove("active");

    setTimeout(() => {
      signUpForm.style.display = "none";

      signInForm.style.display = "flex";

      setTimeout(() => {
        signInForm.classList.add("active");
      }, 20);
    }, 150);
  } else {
    signUpTabBtn.classList.add("active");
    signInTabBtn.classList.remove("active");

    signInForm.classList.remove("active");

    setTimeout(() => {
      signInForm.style.display = "none";

      signUpForm.style.display = "flex";

      setTimeout(() => {
        signUpForm.classList.add("active");
      }, 20);
    }, 150);
  }
}

signInTabBtn.addEventListener("click", () => {
  switchTab("signIn");
});

signUpTabBtn.addEventListener("click", () => {
  switchTab("signUp");
});

// ======================================================
// LOGIN
// ======================================================

// ======================================================
// LOGIN
// ======================================================

const loginMessage = document.getElementById("loginMessage");
const signInButton = document.getElementById("signInButton");

signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  loginMessage.textContent = "";
  loginMessage.className = "";

  const email = document
    .getElementById("signin-email")
    .value.trim()
    .toLowerCase();

  const password = document.getElementById("signin-pass").value;

  try {
    signInButton.disabled = true;
    signInButton.textContent = "Signing In...";

    await loginUser({
      email,
      password,
    });

    // Login succeeded.
    // Backend has set the HTTP-only authentication cookie.

    window.location.replace("./dashboard.html");
  } catch (error) {
    console.error("Login error:", error);

    loginMessage.textContent = error.message || "Unable to sign in.";

    loginMessage.className = "error";
  } finally {
    signInButton.disabled = false;
    signInButton.textContent = "Sign In";
  }
});

// ======================================================
// REGISTRATION ELEMENTS
// ======================================================

const registerMessage = document.getElementById("registerMessage");

const registerButton = document.getElementById("registerButton");

const nameInput = document.getElementById("signup-name");

const emailInput = document.getElementById("signup-email");

const phoneInput = document.getElementById("signup-phone");

const passwordInput = document.getElementById("signup-pass");

const campusInput = document.getElementById("signup-campus");

const yearInput = document.getElementById("signup-year");

const programInput = document.getElementById("signup-program");

const emailMessage = document.getElementById("emailMessage");

const phoneMessage = document.getElementById("phoneMessage");

// ======================================================
// CHECK EMAIL WHILE TYPING
// ======================================================

let emailTimer;

emailInput.addEventListener("input", () => {
  clearTimeout(emailTimer);

  emailMessage.textContent = "";
  emailMessage.className = "";

  const email = emailInput.value.trim().toLowerCase();

  // Don't check incomplete email

  if (!email.includes("@") || !email.includes(".")) {
    return;
  }

  emailTimer = setTimeout(async () => {
    try {
      const exists = await checkEmail(email);

      if (exists) {
        emailMessage.textContent = "Email already in use.";

        emailMessage.className = "error";
      } else {
        emailMessage.textContent = "Email available.";

        emailMessage.className = "success";
      }
    } catch (error) {
      console.error(error);
    }
  }, 500);
});

// ======================================================
// CHECK PHONE WHILE TYPING
// ======================================================

let phoneTimer;

phoneInput.addEventListener("input", () => {
  clearTimeout(phoneTimer);

  // Only allow numbers

  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);

  phoneMessage.textContent = "";
  phoneMessage.className = "";

  const phone = phoneInput.value;

  // Wait until 10 digits

  if (phone.length !== 10) {
    return;
  }

  // Validate Indian mobile number

  const phoneRegex = /^[6-9][0-9]{9}$/;

  if (!phoneRegex.test(phone)) {
    phoneMessage.textContent = "Enter a valid Indian mobile number.";

    phoneMessage.className = "error";

    return;
  }

  phoneTimer = setTimeout(async () => {
    try {
      const exists = await checkPhone(phone);

      if (exists) {
        phoneMessage.textContent = "Phone number already in use.";

        phoneMessage.className = "error";
      } else {
        phoneMessage.textContent = "Phone number available.";

        phoneMessage.className = "success";
      }
    } catch (error) {
      console.error(error);
    }
  }, 500);
});

// ======================================================
// REGISTRATION
// ======================================================

signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  registerMessage.textContent = "";
  registerMessage.className = "";

  const name = nameInput.value.trim();

  const email = emailInput.value.trim().toLowerCase();

  const phone = phoneInput.value.trim();

  const password = passwordInput.value;

  const campus = campusInput.value;

  const year = yearInput.value;

  const program = programInput.value;

  // ==================================================
  // PHONE VALIDATION
  // ==================================================

  const phoneRegex = /^[6-9][0-9]{9}$/;

  if (!phoneRegex.test(phone)) {
    registerMessage.textContent =
      "Enter a valid 10-digit Indian mobile number.";

    registerMessage.className = "error";

    return;
  }

  // ==================================================
  // PASSWORD VALIDATION
  // ==================================================

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,}$/;

  if (!passwordRegex.test(password)) {
    registerMessage.textContent =
      "Password must be 8+ characters with uppercase, lowercase, number and special character.";

    registerMessage.className = "error";

    return;
  }

  try {
    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";

    // Register user

    const data = await registerUser({
      name,
      email,
      phone,
      password,
      campus,
      year,
      program,
    });

    registerMessage.textContent = data.message;

    registerMessage.className = "success";

    console.log("Registered user:", data.user);
  } catch (error) {
    console.error(error);

    registerMessage.textContent = error.message;

    registerMessage.className = "error";
  } finally {
    registerButton.disabled = false;
    registerButton.textContent = "Create Account";
  }
});

// ======================================================
// FLOATING BACKGROUND DOTS
// ======================================================

const dotsContainer = document.querySelector(".dots-container");

const dotCount = 55;

for (let i = 0; i < dotCount; i++) {
  const dot = document.createElement("div");

  dot.classList.add("floating-dot");

  const size = Math.random() * 7 + 2 + "px";

  const left = Math.random() * 100 + "vw";

  const top = Math.random() * 100 + "vh";

  const duration = Math.random() * 14 + 8 + "s";

  const delay = Math.random() * 6 + "s";

  const moveX = (Math.random() - 0.5) * 240 + "px";

  const moveY = (Math.random() - 0.5) * 240 + "px";

  dot.style.width = size;
  dot.style.height = size;
  dot.style.left = left;
  dot.style.top = top;

  dot.style.setProperty("--moveX", moveX);

  dot.style.setProperty("--moveY", moveY);

  dot.style.animationDuration = duration;

  dot.style.animationDelay = delay;

  dotsContainer.appendChild(dot);
}
