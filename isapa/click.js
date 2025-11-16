document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     FUNCTION: SET ACTIVE STEP
  ================================= */
  function setStep(stepNumber) {
    for (let i = 1; i <= 6; i++) {
      const circle = document.getElementById(`step${i}`);
      if (circle) {
        circle.classList.toggle("active", i === stepNumber);
      }
    }
    // Update progress text
    const progressCircle = document.getElementById("progressCircle");
    if (progressCircle) progressCircle.textContent = `${stepNumber} / 6`;
  }

  /* ===============================
     PAGE ELEMENTS
  ================================= */
  const pages = {
    1: document.getElementById("kontainer"),
    2: document.getElementById("page2"),
    3: document.getElementById("page3"),
    4: document.getElementById("page4"),
    5: document.getElementById("page5"),
    6: document.getElementById("page6"),
    7: document.getElementById("page7"),
  };

  function showPage(num) {
    Object.values(pages).forEach(p => p.classList.add("hidden"));
    pages[num].classList.remove("hidden");
    if (num <= 6) setStep(num);
  }

  /* ===============================
     PAGE 1: SERVICE
  ================================= */
  const fullService = document.getElementById("fullService");
  const selfSelect = document.getElementById("selfSelect");
  const inclusions = document.getElementById("inclusions");
  const steps = document.getElementById("steps");
  const nextBtn = document.getElementById("nextBtn");
  const stepBtns = document.querySelectorAll(".step-btn");

  fullService.addEventListener("click", () => {
    fullService.classList.add("active");
    selfSelect.classList.remove("active");
    inclusions.classList.remove("hidden");
    steps.classList.add("hidden");
    nextBtn.classList.remove("hidden");
  });

  selfSelect.addEventListener("click", () => {
    selfSelect.classList.add("active");
    fullService.classList.remove("active");
    inclusions.classList.add("hidden");
    steps.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
    stepBtns.forEach(btn => btn.classList.remove("selected"));
  });

  stepBtns.forEach(btn => {
    btn.addEventListener("click", () => btn.classList.toggle("selected"));
  });

  nextBtn.addEventListener("click", () => {
    if (fullService.classList.contains("active") || selfSelect.classList.contains("active")) {
      showPage(2);
    }
  });

  /* ===============================
     PAGE 2: DETERGENT
  ================================= */
  const detSelect = document.getElementById("detergentSelect");
  const nextToFabcon = document.getElementById("nextToFabcon");
  const plusDet = document.getElementById("plusDet");
  const minusDet = document.getElementById("minusDet");
  const detQtySpan = document.getElementById("detQty");
  const backToPage1 = document.getElementById("backToPage1");
  let detQty = 1;

  plusDet.addEventListener("click", () => detQtySpan.textContent = ++detQty);
  minusDet.addEventListener("click", () => { if (detQty > 1) detQtySpan.textContent = --detQty; });
  detSelect.addEventListener("change", () => nextToFabcon.classList.toggle("hidden", detSelect.value === ""));
  nextToFabcon.addEventListener("click", () => showPage(3));
  backToPage1.addEventListener("click", () => showPage(1));

  /* ===============================
     PAGE 3: FABRIC CONDITIONER
  ================================= */
  const fabSelect = document.getElementById("fabconSelect");
  const nextToDetails = document.getElementById("nextToDetails");
  const plusFab = document.getElementById("plusFab");
  const minusFab = document.getElementById("minusFab");
  const fabQtySpan = document.getElementById("fabQty");
  const backToPage2 = document.getElementById("backToPage2");
  const addBleach = document.getElementById("addBleach");
  let fabQty = 1;

  plusFab.addEventListener("click", () => fabQtySpan.textContent = ++fabQty);
  minusFab.addEventListener("click", () => { if (fabQty > 1) fabQtySpan.textContent = --fabQty; });
  fabSelect.addEventListener("change", () => nextToDetails.classList.toggle("hidden", fabSelect.value === ""));
  nextToDetails.addEventListener("click", () => showPage(4));
  backToPage2.addEventListener("click", () => showPage(2));

  /* ===============================
     PAGE 4: LOAD DETAILS
  ================================= */
  const plusLoad = document.getElementById("plusLoad");
  const minusLoad = document.getElementById("minusLoad");
  const loadQtySpan = document.getElementById("loadQty");
  const finishBtn = document.getElementById("finishBtn");
  const loadRadios = document.querySelectorAll("input[name='loadType']");
  const backToPage3 = document.getElementById("backToPage3");
  let loadQty = 1;

  plusLoad.addEventListener("click", () => loadQtySpan.textContent = ++loadQty);
  minusLoad.addEventListener("click", () => { if (loadQty > 1) loadQtySpan.textContent = --loadQty; });
  loadRadios.forEach(radio => radio.addEventListener("change", () => finishBtn.classList.remove("hidden")));
  backToPage3.addEventListener("click", () => showPage(3));

  finishBtn.addEventListener("click", () => {
    showPage(5);

    const summaryTableBody = document.querySelector("#summaryTable tbody");
    const summaryTotal = document.getElementById("summaryTotal");
    summaryTableBody.innerHTML = "";
    let total = 0;

    // SERVICE
    const selectedService = fullService.classList.contains("active") ? "Full Service" : "Self Select";
    summaryTableBody.innerHTML += `<tr><td>1</td><td>${selectedService}</td><td>₱0</td></tr>`;

    // DETERGENT
    if (detSelect.value && !detSelect.value.includes("mine")) {
      const detPrice = detSelect.value.includes("₱25") ? 25 : 20;
      const detTotal = detPrice * detQty;
      total += detTotal;
      summaryTableBody.innerHTML += `<tr><td>${detQty}</td><td>${detSelect.value}</td><td>₱${detTotal}</td></tr>`;
    }

    // FABCON
    if (fabSelect.value && !fabSelect.value.includes("mine")) {
      const fabTotal = 15 * fabQty;
      total += fabTotal;
      summaryTableBody.innerHTML += `<tr><td>${fabQty}</td><td>${fabSelect.value}</td><td>₱${fabTotal}</td></tr>`;
    }

    // BLEACH
    if (addBleach.checked) {
      total += 10;
      summaryTableBody.innerHTML += `<tr><td>1</td><td>Bleach Add-on</td><td>₱10</td></tr>`;
    }

    // LOAD
    const selectedLoad = document.querySelector("input[name='loadType']:checked");
    if (selectedLoad) {
      const loadName = selectedLoad.value;
      const loadPrice = loadName === "Regular Clothes" ? 100 :
                        loadName === "Bedsheets" ? 120 : 150;
      const loadTotal = loadPrice * loadQty;
      total += loadTotal;
      summaryTableBody.innerHTML += `<tr><td>${loadQty}</td><td>${loadName}</td><td>₱${loadTotal}</td></tr>`;
    }

    summaryTotal.textContent = `₱${total}`;
  });

  /* ===============================
     PAGE 5
  ================================= */
  const toContactBtn = document.getElementById("toContactBtn");
  const backToPage4 = document.getElementById("backToPage4");

  toContactBtn.addEventListener("click", () => showPage(6));
  backToPage4.addEventListener("click", () => showPage(4));

  /* ===============================
     PAGE 6 → PAGE 7
  ================================= */
  const submitOrderBtn = document.getElementById("submitOrderBtn");
  const backToPage5 = document.getElementById("backToPage5");

  submitOrderBtn.addEventListener("click", () => {
    showPage(7);

    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    document.getElementById("ticketNumber").textContent = ticketNum;

    const name = document.getElementById("fullName").value;
    const contact = document.getElementById("contactNumber").value;
    const address = document.getElementById("completeAddress").value;
    const amount = document.getElementById("summaryTotal").textContent.replace("₱", "");

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push({
      ticket: ticketNum,
      name,
      contact,
      address,
      amount,
      service: fullService.classList.contains("active") ? "Full Service" : "Self Select",
      status: "Pending"
    });
    localStorage.setItem("orders", JSON.stringify(orders));
  });

  backToPage5.addEventListener("click", () => showPage(5));

  /* ===============================
     TRACK BUTTON
  ================================= */
  const trackBtn = document.getElementById("trackBtn");
  if (trackBtn) {
    trackBtn.addEventListener("click", () => window.location.href = "tracklaundry.html");
  }

  // SHOW FIRST PAGE
  showPage(1);
});
