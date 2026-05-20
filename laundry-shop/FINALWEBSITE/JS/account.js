fetch("../PHP/account.php")
  .then(response => response.json())
  .then(data => {
    console.log(data);

    if (data.status === "success") {
      document.getElementById("customerName").textContent = data.fullname;
      document.getElementById("customerEmail").textContent = data.email;
      document.getElementById("customerPassword").textContent = data.password;
    } else {
      alert("Please login first.");
      window.location.href = "../HTML/login.html";
    }
  })
  .catch(error => {
    console.error(error);
    alert("Error loading account information.");
  });
  