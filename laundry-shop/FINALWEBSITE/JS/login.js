const form = document.getElementById('loginForm');

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  fetch("../PHP/login.php", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {

    console.log(data);

    if (data.status === "success") {

      if (data.role === "admin") {
        window.location.href = "../HTML/admin.html";
      } else {
        window.location.href = "../HTML/index.html";
      }

    } 
    else if (data.status === "wrong_password") {
      alert("Wrong password!");
    } 
    else {
      alert("User not found!");
    }

  })
  .catch(err => {
    console.error(err);
    alert("Server error");
  });
});