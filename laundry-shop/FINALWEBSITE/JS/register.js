const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(form);

  fetch("../PHP/register.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(data => {

    data = data.trim(); // 🔥 important fix

    console.log("Server response:", data);

    if (data === "success") {
      alert("Registered successfully!");
      window.location.href = "../HTML/login.html";
    } 
    else if (data === "exists") {
      alert("Username already exists!");
    }
    else if (data === "password_mismatch") {
      alert("Password do not match!");
    }
    else {
      alert("Error: " + data);
    }

  })
  .catch(err => {
    console.error("Fetch error:", err);
    alert("Server error. Try again.");
  });
});