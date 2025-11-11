function showPage(pageId) {
  // Alisin ang 'active' sa lahat ng sections
  document.querySelectorAll('.kontainer').forEach(sec => sec.classList.remove('active'));

  // Idagdag ang 'active' class sa piniling section
  document.getElementById(pageId).classList.add('active');
}
document.addEventListener("DOMContentLoaded", () => {
  const fullService = document.getElementById("fullService");
  const selfSelect = document.getElementById("selfSelect");
  const inclusions = document.getElementById("inclusions");
  const steps = document.getElementById("steps");
  const nextBtn = document.getElementById("nextBtn");
  const stepBtns = document.querySelectorAll(".step-btn");

  if (!fullService || !selfSelect || !inclusions || !steps || !nextBtn) {
    console.error("⚠️ Missing HTML elements.");
    return;
  }

  // === FULL SERVICE ===
  fullService.addEventListener("click", () => {
    fullService.classList.add("active");
    selfSelect.classList.remove("active");

    inclusions.classList.remove("hidden"); // Show inclusions
    steps.classList.add("hidden");         // Hide Wash/Dry/Fold
    nextBtn.classList.remove("hidden");    // Show Next
  });

  // === SELF SELECT ===
  selfSelect.addEventListener("click", () => {
    selfSelect.classList.add("active");
    fullService.classList.remove("active");

    inclusions.classList.add("hidden");    // Hide inclusions
    steps.classList.remove("hidden");      // Show Wash/Dry/Fold
    nextBtn.classList.remove("hidden");    // Show Next

    // Reset all buttons to unselected (white)
    stepBtns.forEach(btn => btn.classList.remove("selected"));
  });

  // === TOGGLE STEP BUTTONS ===
  stepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
    });
  });
});

// === PAGE CONNECTION FLOW ===
const page1 = document.getElementById("kontainer");
const page2 = document.getElementById("page2");
const page3 = document.getElementById("page3");
const page4 = document.getElementById("page4");

// === From PAGE 1 → PAGE 2 ===
nextBtn.addEventListener("click", () => {
  if (
    fullService.classList.contains("active") ||
    selfSelect.classList.contains("active")
  ) {
    page1.classList.add("hidden");
    page2.classList.remove("hidden");
  }
});

// === PAGE 2 ===
const detSelect = document.getElementById("detergentSelect");
const nextToFabcon = document.getElementById("nextToFabcon");
const plusDet = document.getElementById("plusDet");
const minusDet = document.getElementById("minusDet");
const detQtySpan = document.getElementById("detQty");
const backToPage1 = document.getElementById("backToPage1");
let detQty = 1;

plusDet.addEventListener("click", () => {
  detQty++;
  detQtySpan.textContent = detQty;
});
minusDet.addEventListener("click", () => {
  if (detQty > 1) detQty--;
  detQtySpan.textContent = detQty;
});
detSelect.addEventListener("change", () => {
  if (detSelect.value !== "") nextToFabcon.classList.remove("hidden");
  else nextToFabcon.classList.add("hidden");
});
nextToFabcon.addEventListener("click", () => {
  page2.classList.add("hidden");
  page3.classList.remove("hidden");
});
backToPage1.addEventListener("click", () => {
  page2.classList.add("hidden");
  page1.classList.remove("hidden");
});

// === PAGE 3 ===
const fabSelect = document.getElementById("fabconSelect");
const nextToDetails = document.getElementById("nextToDetails");
const plusFab = document.getElementById("plusFab");
const minusFab = document.getElementById("minusFab");
const fabQtySpan = document.getElementById("fabQty");
const backToPage2 = document.getElementById("backToPage2");
let fabQty = 1;

plusFab.addEventListener("click", () => {
  fabQty++;
  fabQtySpan.textContent = fabQty;
});
minusFab.addEventListener("click", () => {
  if (fabQty > 1) fabQty--;
  fabQtySpan.textContent = fabQty;
});
fabSelect.addEventListener("change", () => {
  if (fabSelect.value !== "") nextToDetails.classList.remove("hidden");
  else nextToDetails.classList.add("hidden");
});
nextToDetails.addEventListener("click", () => {
  page3.classList.add("hidden");
  page4.classList.remove("hidden");
});
backToPage2.addEventListener("click", () => {
  page3.classList.add("hidden");
  page2.classList.remove("hidden");
});

// === PAGE 4 ===
const plusLoad = document.getElementById("plusLoad");
const minusLoad = document.getElementById("minusLoad");
const loadQtySpan = document.getElementById("loadQty");
const finishBtn = document.getElementById("finishBtn");
const loadRadios = document.querySelectorAll("input[name='loadType']");
const backToPage3 = document.getElementById("backToPage3");
let loadQty = 1;

plusLoad.addEventListener("click", () => {
  loadQty++;
  loadQtySpan.textContent = loadQty;
});
minusLoad.addEventListener("click", () => {
  if (loadQty > 1) loadQty--;
  loadQtySpan.textContent = loadQty;
});

loadRadios.forEach(radio => {
  radio.addEventListener("change", () => {
    finishBtn.classList.remove("hidden");
  });
});

backToPage3.addEventListener("click", () => {
  page4.classList.add("hidden");
  page3.classList.remove("hidden");

});


