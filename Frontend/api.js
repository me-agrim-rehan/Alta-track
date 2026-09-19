export const API_BASE_URL = "http://localhost:5000";

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
}

// Check email
export async function checkEmail(email) {
  const response = await fetch(
    `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not check email");
  }

  return data.exists;
}

// Check phone
export async function checkPhone(phone) {
  const response = await fetch(
    `${API_BASE_URL}/auth/check-phone?phone=${encodeURIComponent(phone)}`,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not check phone");
  }

  return data.exists;
}

export async function getDashboard() {
  const response = await fetch(`${API_BASE_URL}/dashboard`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Could not load dashboard");
  }

  return data;
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
}