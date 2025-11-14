const slides = document.querySelector('.slides');
const dots = document.querySelectorAll('.dots span');
let index = 0;

function showSlide(i) {
  index = i;
  slides.style.transform = `translateX(${-index * 600}px)`;
  dots.forEach(dot => dot.classList.remove('active'));
  dots[index].classList.add('active');
}

function nextSlide() {
  index = (index + 1) % dots.length;
  showSlide(index);
}

// automatic change every 3 seconds
setInterval(nextSlide, 3000);

// =====================
// FRANCHISE FORM LOGIC
// =====================

const openFormBtn = document.getElementById('openFormBtn');
const franchiseMain = document.getElementById('franchiseMain');
const franchiseForm = document.getElementById('franchiseForm');
const thankYou = document.getElementById('thankYou');
const inquiryForm = document.getElementById('inquiryForm');
const backBtn = document.getElementById('backBtn');

openFormBtn.addEventListener('click', () => {
  franchiseMain.style.display = 'none';
  franchiseForm.style.display = 'flex';
});

inquiryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  franchiseForm.style.display = 'none';
  thankYou.style.display = 'flex';
});

backBtn.addEventListener('click', () => {
  franchiseForm.style.display = 'none';
  franchiseMain.style.display = 'flex';
});
