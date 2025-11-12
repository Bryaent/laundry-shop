document.addEventListener("DOMContentLoaded", () => {

  // ======= PAGE ELEMENTS =======
  const page1 = document.getElementById("kontainer");
  const page2 = document.getElementById("page2");
  const page3 = document.getElementById("page3");
  const page4 = document.getElementById("page4");
  const page5 = document.getElementById("page5");
  const page6 = document.getElementById("page6");
  const page7 = document.getElementById("page7");

  // ======= PAGE 1 =======
  const fullService = document.getElementById("fullService");
  const selfSelect = document.getElementById("selfSelect");
  const inclusions = document.getElementById("inclusions");
  const steps = document.getElementById("steps");
  const nextBtn = document.getElementById("nextBtn");
  const stepBtns = document.querySelectorAll(".step-btn");

  // === FULL SERVICE ===
  fullService.addEventListener("click", () => {
    fullService.classList.add("active");
    selfSelect.classList.remove("active");
    inclusions.classList.remove("hidden");
    steps.classList.add("hidden");
    nextBtn.classList.remove("hidden");
  });

  // === SELF SELECT ===
  selfSelect.addEventListener("click", () => {
    selfSelect.classList.add("active");
    fullService.classList.remove("active");
    inclusions.classList.add("hidden");
    steps.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    stepBtns.forEach(btn => btn.classList.remove("selected"));
  });

  // === TOGGLE STEP BUTTONS ===
  stepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected");
    });
  });

  // === NEXT (PAGE 1 → PAGE 2) ===
  nextBtn.addEventListener("click", () => {
    if (fullService.classList.contains("active") || selfSelect.classList.contains("active")) {
      page1.classList.add("hidden");
      page2.classList.remove("hidden");
    }
  });

  // ======= PAGE 2 =======
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

  // ======= PAGE 3 =======
  const fabSelect = document.getElementById("fabconSelect");
  const nextToDetails = document.getElementById("nextToDetails");
  const plusFab = document.getElementById("plusFab");
  const minusFab = document.getElementById("minusFab");
  const fabQtySpan = document.getElementById("fabQty");
  const backToPage2 = document.getElementById("backToPage2");
  const addBleach = document.getElementById("addBleach");
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

  // ======= PAGE 4 =======
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

  // ======= PAGE 4 → PAGE 5 (SUMMARY) =======
  finishBtn.addEventListener("click", () => {
    page4.classList.add("hidden");
    page5.classList.remove("hidden");

    const summaryTableBody = document.querySelector("#summaryTable tbody");
    const summaryTotal = document.getElementById("summaryTotal");
    summaryTableBody.innerHTML = "";
    let total = 0;

    // SERVICE
    let selectedService = fullService.classList.contains("active") ? "Full Service" : "Self Select";
    summaryTableBody.innerHTML += `
      <tr><td>1</td><td>${selectedService}</td><td>₱0</td></tr>
    `;

    // DETERGENT
    const detValue = detSelect.value;
    if (detValue && !detValue.includes("mine")) {
      let detPrice = detValue.includes("₱25") ? 25 : 20;
      let detTotal = detPrice * detQty;
      total += detTotal;
      summaryTableBody.innerHTML += `
        <tr><td>${detQty}</td><td>${detValue}</td><td>₱${detTotal}</td></tr>
      `;
    }

    // FABCON
    const fabValue = fabSelect.value;
    if (fabValue && !fabValue.includes("mine")) {
      let fabPrice = 15;
      let fabTotal = fabPrice * fabQty;
      total += fabTotal;
      summaryTableBody.innerHTML += `
        <tr><td>${fabQty}</td><td>${fabValue}</td><td>₱${fabTotal}</td></tr>
      `;
    }

    // BLEACH
    if (addBleach.checked) {
      total += 10;
      summaryTableBody.innerHTML += `
        <tr><td>1</td><td>Bleach Add-on</td><td>₱10</td></tr>
      `;
    }

    // LOAD
    const selectedLoad = document.querySelector("input[name='loadType']:checked");
    if (selectedLoad) {
      let loadName = selectedLoad.value;
      let loadPrice = loadName === "Regular Clothes" ? 100 : loadName === "Bedsheets" ? 120 : 150;
      let loadTotal = loadPrice * loadQty;
      total += loadTotal;
      summaryTableBody.innerHTML += `
        <tr><td>${loadQty}</td><td>${loadName}</td><td>₱${loadTotal}</td></tr>
      `;
    }

    summaryTotal.textContent = `₱${total}`;
  });

  // ======= PAGE 5 → PAGE 6 =======
  const toContactBtn = document.getElementById("toContactBtn");
  const backToPage4 = document.getElementById("backToPage4");
  toContactBtn.addEventListener("click", () => {
    page5.classList.add("hidden");
    page6.classList.remove("hidden");
  });
  backToPage4.addEventListener("click", () => {
    page5.classList.add("hidden");
    page4.classList.remove("hidden");
  });

  // ======= PAGE 6 → PAGE 7 (THANK YOU) =======
  const submitOrderBtn = document.getElementById("submitOrderBtn");
  const backToPage5 = document.getElementById("backToPage5");
  submitOrderBtn.addEventListener("click", () => {
    page6.classList.add("hidden");
    page7.classList.remove("hidden");

    // Generate random ticket number
    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    document.getElementById("ticketNumber").textContent = ticketNum;
    console.log(`✅ Ticket Generated: ${ticketNum}`);
  });
  backToPage5.addEventListener("click", () => {
    page6.classList.add("hidden");
    page5.classList.remove("hidden");
  });

});
// ======= PAGE 7: TRACK MY LAUNDRY BUTTON =======
const trackBtn = document.getElementById("trackBtn");

trackBtn.addEventListener("click", () => {
  // Redirect user to the tracking page
  window.location.href = "tracklaundry.html"; // ✅ ito dapat name ng tracking file mo
});
