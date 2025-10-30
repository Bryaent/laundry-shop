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
