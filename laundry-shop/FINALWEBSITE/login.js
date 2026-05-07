console.log("LOGIN JS IS LOADED");

// ---------------- LOGIN ----------------
const form = document.getElementById('loginForm');

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch("login.php", {
      method: "POST",
      body: formData
    })
    .then(res => res.text())
    .then(data => {

      console.log("RAW:", JSON.stringify(data));

      const response = data.trim().toLowerCase();
      console.log("CLEAN:", response);

      // 🔥 FLEXIBLE MATCH (NO MORE STRICT BUGS)
      if (response.includes("admin")) {
        console.log("Redirecting to ADMIN...");
        window.location.href = "admin.html";
      } 
      else if (response.includes("user") || response.includes("success")) {
        console.log("Redirecting to USER...");
        window.location.href = "index.html";
      } 
      else if (response.includes("wrong")) {
        alert("Wrong password!");
      } 
      else if (response.includes("not_found")) {
        alert("User not found!");
      } 
      else {
        // ⚠️ FALLBACK (para hindi ka ma-stuck)
        console.log("UNKNOWN RESPONSE, FORCING REDIRECT...");
        window.location.href = "index.html";
      }
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);
      alert("Server error. Check XAMPP / MySQL.");
    });
  });
} else {
  console.log("Login form not found");
}

// ---------------- ADMIN BUTTON ----------------
function openAdmin() {
  const passcode = prompt("Enter admin passcode:");
  const correctPasscode = "1234";

  if (passcode === correctPasscode) {
    window.location.href = "admin.html";
  } else {
    alert("Incorrect passcode!");
  }
}

// expose globally
window.openAdmin = openAdmin;

// ---------------- BUTTON LISTENER ----------------
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");

  console.log("ADMIN BTN:", adminBtn);

  if (adminBtn) {
    adminBtn.addEventListener("click", openAdmin);
  }
});