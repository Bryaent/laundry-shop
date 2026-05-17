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

  const userData = {
    fullname: data.fullname || data.username,
    username: data.username,
    email: data.email,
    contact: data.contact || "",
    address: data.address || "",
    profilePicture: ""
  };

  localStorage.setItem("loggedInUser", JSON.stringify(userData));

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
// ===============================
// GOOGLE LOGIN (SIMULATED)
// ===============================
document.getElementById("googleLoginBtn").addEventListener("click", function () {
  const googleUser = {
    fullname: "Google User",
    username: "google_user",
    email: "googleuser@gmail.com",
    contact: "",
    address: "",
    profilePicture: ""
  };

  // Save user data
  localStorage.setItem("loggedInUser", JSON.stringify(googleUser));

  // Redirect to website
  window.location.href = "../HTML/index.html";
});


// ===============================
// FACEBOOK LOGIN (SIMULATED)
// ===============================
document.getElementById("facebookLoginBtn").addEventListener("click", function () {
  const facebookUser = {
    fullname: "Facebook User",
    username: "facebook_user",
    email: "facebookuser@facebook.com",
    contact: "",
    address: "",
    profilePicture: ""
  };

  // Save user data
  localStorage.setItem("loggedInUser", JSON.stringify(facebookUser));

  // Redirect to website
  window.location.href = "../HTML/index.html";
});