const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  console.log("Form submitted!"); // Check console

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const username = document.getElementById("username").value.trim().toLowerCase(); // ✅ lowercase
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  // Check if username already exists
  if (localStorage.getItem("user_" + username)) {
    alert("Username already exists! Please choose another.");
    return;
  }

  const user = {
    fullname,
    email,
    username,
    password,
    role: "customer" // ✅ Always customer
  };

  localStorage.setItem("user_" + username, JSON.stringify(user));

  alert("Account created successfully! 🎉");

  window.location.href = "login.html";
});