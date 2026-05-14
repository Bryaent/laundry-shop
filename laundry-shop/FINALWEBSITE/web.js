// ================= FRANCHISE FORM SYSTEM =================

const openFormBtn = document.getElementById('openFormBtn');
const franchiseMain = document.getElementById('franchiseMain');
const franchiseForm = document.getElementById('franchiseForm');
const thankYou = document.getElementById('thankYou');
const inquiryForm = document.getElementById('inquiryForm');
const backBtn = document.getElementById('backBtn');
const returnBtn = document.getElementById('returnBtn');
const submitBtn = document.querySelector('.modern-send-btn');

// OPEN FORM
if (openFormBtn) {
  openFormBtn.addEventListener('click', () => {
    franchiseMain.style.display = 'none';
    franchiseForm.style.display = 'block';
  });
}

// BACK BUTTON
if (backBtn) {
  backBtn.addEventListener('click', () => {
    franchiseForm.style.display = 'none';
    franchiseMain.style.display = 'block';
  });
}

// SUBMIT FORM
if (inquiryForm) {
  inquiryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = inquiryForm.querySelector('[name="full_name"]').value;
    const email = inquiryForm.querySelector('[name="email"]').value;
    const contact = inquiryForm.querySelector('[name="contact"]').value;
    const message = inquiryForm.querySelector('[name="message"]').value;

    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;

    setTimeout(() => {

      let inquiries = JSON.parse(localStorage.getItem("inquiries")) || [];

      inquiries.push({
        fullName,
        email,
        contact,
        message,
        date: new Date().toLocaleString()
      });

      localStorage.setItem("inquiries", JSON.stringify(inquiries));

      inquiryForm.reset();

      franchiseForm.style.display = 'none';
      thankYou.style.display = 'flex';

      submitBtn.innerText = "SEND INQUIRY";
      submitBtn.disabled = false;

    }, 800);
  });
}

// RETURN BUTTON
if (returnBtn) {
  returnBtn.addEventListener('click', () => {
    thankYou.style.display = "none";
    franchiseMain.style.display = "block";
  });
}


// ================= NAVBAR ACTIVE SCROLL =================

const sections = document.querySelectorAll("section");
const header = document.querySelector("header");

window.addEventListener("scroll", () => {

  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  header.classList.remove(
    "home-active",
    "service-active",
    "about-active",
    "franchise-active",
    "contact-active"
  );

  if (current === "Home") header.classList.add("home-active");
  if (current === "Service") header.classList.add("service-active");
  if (current === "About") header.classList.add("about-active");
  if (current === "Franchise") header.classList.add("franchise-active");
  if (current === "Contact") header.classList.add("contact-active");

});


// ================= SMOOTH SCROLL =================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute('href'));

    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


// ================= REVEAL ANIMATION =================

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  const windowHeight = window.innerHeight;

  reveals.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const elementVisible = 150;

    if (
      elementTop < windowHeight - elementVisible ||
      window.scrollY + windowHeight >= document.body.scrollHeight - 100
    ) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll();


// ================= LOGOUT =================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    }
  });
}