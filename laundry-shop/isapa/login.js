const form = document.getElementById('loginForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  fetch("login.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
    .then(data => {
      console.log("SERVER RESPONSE:", data);

      if (data.trim() === "success") {
        window.location.href = "./index.html"; // 👈 DITO NA ANG REDIRECT
      } 
      else if (data === "wrong_password") {
        alert("Wrong password!");
      } 
      else if (data === "not_found") {
        alert("User not found!"); 
      } 
      else {
        alert("Unexpected response: " + data);
      }
    })
    .catch(error => console.error("Error:", error));
  });