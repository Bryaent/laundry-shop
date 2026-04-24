const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const formData = new FormData(form);

  fetch("register.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(data => {

    console.log(data); // 👈 para makita mo error

    if (data === "success") {
      alert("Registered successfully!");
      window.location.href = "login.html";
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

  });
});