// kunin ang form element
const form = document.getElementById('loginForm');

form.addEventListener('submit', function(event) {
  event.preventDefault(); // para hindi mag-refresh ang page

  // kunin ang input values
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // example login check (pwede mong palitan kung gusto mo)
  if (username === "admin" && password === "1234") {
    // kapag tama ang username at password, pupunta sa ibang HTML file
    window.open("index.html", "_self");
  } else {
    alert("Invalid username or password!");
  }
});
