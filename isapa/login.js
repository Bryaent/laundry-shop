// ===== LOGIN FORM LOGIC =====

// Kunin ang form at "Create Account" button
const form = document.getElementById('loginForm');
const createBtn = document.querySelector('.btn-secondary');

// Kapag sinubmit ang login form
form.addEventListener('submit', function(event) {
  event.preventDefault(); // Iwas reload ng page

  // Kunin ang mga input values
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const loginType = document.getElementById('loginType').value;

  // Suriin ang login type at credentials
  if (loginType === "admin") {
    // Para sa admin login
    if (username === "admin" && password === "admin123") {
      window.open("admin.html", "_self"); // Redirect sa admin page
    } else {
      alert("Invalid admin credentials!"); // Mali ang admin login
    }
  } 
  else if (loginType === "customer") {
    // Para sa customer login
    if (username === "customer" && password === "customer1234") {
      window.open("index.html", "_self"); // Redirect sa customer home page
    } else {
      alert("Invalid customer credentials!"); // Mali ang customer login
    }
  } 
  else {
    alert("Please select login type!"); // Walang napiling login type
  }
});

// Kapag pinindot ang "Create Account" button
createBtn.addEventListener('click', function() {
  window.open("register.html", "_self"); // Redirect sa registration page
});
