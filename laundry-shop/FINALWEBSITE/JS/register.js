const form = document.getElementById("registerForm");

form.addEventListener("submit", function(e) {

  e.preventDefault();

  const formData = new FormData(form);

  fetch("http://localhost/HTML1/PHP/laundry-shop/FINALWEBSITE/PHP/register.php", {
    method: "POST",
    body: formData
  })

  .then(res => res.json())

  .then(data => {

    console.log(data);

    if (data.status === "success") {

  window.location.href = "../HTML/login.html";

}
    else if (data.status === "exists") {

      alert("Username already exists!");

    }
    else if (data.status === "password_mismatch") {

      alert("Passwords do not match!");

    }
    else {

      alert("Error: " + data.message);

    }

  })

  .catch(err => {

    console.error(err);
    alert("Server error");

  });

});



