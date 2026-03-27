// ================= LOGIN JS =================
const form = document.getElementById('loginForm');

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Kunin input at i-trim at gawing lowercase para consistent
  const username = document.getElementById('username').value.trim().toLowerCase();
  const password = document.getElementById('password').value.trim();
  const loginType = document.getElementById('loginType').value;

  // ================= ADMIN LOGIN =================
  if (loginType === "admin") {
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("loggedInUser", username);
      window.location.href = "admin.html";
    } else {
      alert("Invalid admin credentials!");
    }
  }

  // ================= CUSTOMER LOGIN =================
  else if (loginType === "customer") {
    // Kunin user mula sa localStorage gamit lowercase username
    const storedUser = localStorage.getItem("user_" + username);

    if (!storedUser) {
      alert("User not found! Please register first.");
      return;
    }

    const userData = JSON.parse(storedUser);

    // Check password at role
    if (userData.password === password && userData.role === "customer") {
      localStorage.setItem("loggedInUser", username);
      window.location.href = "index.html"; // Redirect sa homepage ng customer
    } else if (userData.role !== "customer") {
      alert("This account is not a customer account!");
    } else {
      alert("Invalid credentials!");
    }
  }

  // ================= LOGIN TYPE NOT SELECTED =================
  else {
    alert("Please select login type!");
  }
});

// ================= CREATE ACCOUNT BUTTON =================
document.querySelector(".register-btn").addEventListener("click", function() {
  window.location.href = "register.html";
});