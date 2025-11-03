 
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