// ===== SLIDESHOW LOGIC =====
const slides = document.querySelector('.slides'); // Container ng lahat ng slides
const dots = document.querySelectorAll('.dots span'); // Dot indicators sa ilalim
let index = 0; // Kasalukuyang slide index

// Ipakita ang slide base sa index
function showSlide(i) {
  index = i;
  slides.style.transform = `translateX(${-index * 600}px)`; // I-slide sa tamang position
  dots.forEach(dot => dot.classList.remove('active')); // Alisin ang active sa lahat ng dots
  dots[index].classList.add('active'); // Lagyan ng active ang current dot
}

// Pumunta sa next slide
function nextSlide() {
  index = (index + 1) % dots.length; // Loop sa simula kapag huli na
  showSlide(index);
}

// Automatic na magbago bawat 3 segundo
setInterval(nextSlide, 3000);

// ===== FRANCHISE FORM LOGIC =====
const openFormBtn = document.getElementById('openFormBtn'); // Button para buksan ang form
const franchiseMain = document.getElementById('franchiseMain'); // Main franchise section
const franchiseForm = document.getElementById('franchiseForm'); // Form container
const thankYou = document.getElementById('thankYou'); // Thank you message
const inquiryForm = document.getElementById('inquiryForm'); // Actual form
const backBtn = document.getElementById('backBtn'); // Back button sa form

// Buksan ang form kapag pinindot ang openFormBtn
openFormBtn.addEventListener('click', () => {
  franchiseMain.style.display = 'none'; // Itago main section
  franchiseForm.style.display = 'flex'; // Ipakita ang form
});

// Kapag sinubmit ang form
inquiryForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Iwas default submit behavior
  franchiseForm.style.display = 'none'; // Itago form
  thankYou.style.display = 'flex'; // Ipakita thank you message
});

// Kapag pinindot ang back button
backBtn.addEventListener('click', () => {
  franchiseForm.style.display = 'none'; // Itago form
  franchiseMain.style.display = 'flex'; // Ipakita main section
});
