// ================= FIXED FRANCHISE FORM SYSTEM =================

const openFormBtn = document.getElementById('openFormBtn');
const franchiseMain = document.getElementById('franchiseMain');
const franchiseForm = document.getElementById('franchiseForm');
const thankYou = document.getElementById('thankYou');
const inquiryForm = document.getElementById('inquiryForm');
const backBtn = document.getElementById('backBtn');
const submitBtn = document.querySelector('.modern-send-btn');

// OPEN FORM
openFormBtn.addEventListener('click', () => {
  franchiseMain.style.display = 'none';
  franchiseForm.style.display = 'block'; // 🔥 FIXED (NO FLEX)
});

// BACK BUTTON
backBtn.addEventListener('click', () => {
  franchiseForm.style.display = 'none';
  franchiseMain.style.display = 'block';
});

// SUBMIT
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

// RETURN
document.getElementById("returnBtn").addEventListener("click", () => {
  thankYou.style.display = "none";
  franchiseMain.style.display = "block";
});