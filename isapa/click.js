document.addEventListener("DOMContentLoaded", () => {

  // ======= PAGE ELEMENTS =======
  const page1 = document.getElementById("kontainer"); // Page 1: Service selection
  const page2 = document.getElementById("page2"); // Page 2: Detergent selection
  const page3 = document.getElementById("page3"); // Page 3: Fabric conditioner selection
  const page4 = document.getElementById("page4"); // Page 4: Load & extras
  const page5 = document.getElementById("page5"); // Page 5: Summary
  const page6 = document.getElementById("page6"); // Page 6: Contact details
  const page7 = document.getElementById("page7"); // Page 7: Thank you / ticket

  // ======= PAGE 1 ELEMENTS =======
  const fullService = document.getElementById("fullService"); // Full service button
  const selfSelect = document.getElementById("selfSelect"); // Self-select button
  const inclusions = document.getElementById("inclusions"); // Details for full service
  const steps = document.getElementById("steps"); // Steps for self-select
  const nextBtn = document.getElementById("nextBtn"); // Next button for page1
  const stepBtns = document.querySelectorAll(".step-btn"); // Buttons for selecting steps

  // FULL SERVICE CLICK
  fullService.addEventListener("click", () => {
    fullService.classList.add("active"); // Mark as selected
    selfSelect.classList.remove("active"); // Remove selection from self-select
    inclusions.classList.remove("hidden"); // Show inclusions info
    steps.classList.add("hidden"); // Hide step buttons
    nextBtn.classList.remove("hidden"); // Show next button
  });

  // SELF SELECT CLICK
  selfSelect.addEventListener("click", () => {
    selfSelect.classList.add("active");
    fullService.classList.remove("active");
    inclusions.classList.add("hidden"); // Hide inclusions
    steps.classList.remove("hidden"); // Show steps
    nextBtn.classList.remove("hidden");
    stepBtns.forEach(btn => btn.classList.remove("selected")); // Reset step selections
  });

  // TOGGLE STEP BUTTONS
  stepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("selected"); // Mark/unmark step selection
    });
  });

  // NEXT (PAGE 1 → PAGE 2)
  nextBtn.addEventListener("click", () => {
    if (fullService.classList.contains("active") || selfSelect.classList.contains("active")) {
      page1.classList.add("hidden"); // Hide page1
      page2.classList.remove("hidden"); // Show page2
    }
  });

  // ======= PAGE 2 ELEMENTS =======
  const detSelect = document.getElementById("detergentSelect"); // Detergent dropdown
  const nextToFabcon = document.getElementById("nextToFabcon"); // Next button
  const plusDet = document.getElementById("plusDet"); // Increase detergent qty
  const minusDet = document.getElementById("minusDet"); // Decrease detergent qty
  const detQtySpan = document.getElementById("detQty"); // Display qty
  const backToPage1 = document.getElementById("backToPage1"); // Back button
  let detQty = 1;

  // Increase / decrease qty
  plusDet.addEventListener("click", () => {
    detQty++;
    detQtySpan.textContent = detQty;
  });
  minusDet.addEventListener("click", () => {
    if (detQty > 1) detQty--;
    detQtySpan.textContent = detQty;
  });

  // Show next button if detergent selected
  detSelect.addEventListener("change", () => {
    if (detSelect.value !== "") nextToFabcon.classList.remove("hidden");
    else nextToFabcon.classList.add("hidden");
  });

  // NEXT / BACK
  nextToFabcon.addEventListener("click", () => {
    page2.classList.add("hidden");
    page3.classList.remove("hidden");
  });
  backToPage1.addEventListener("click", () => {
    page2.classList.add("hidden");
    page1.classList.remove("hidden");
  });

  // ======= PAGE 3 ELEMENTS =======
  const fabSelect = document.getElementById("fabconSelect"); // Fabric conditioner dropdown
  const nextToDetails = document.getElementById("nextToDetails"); // Next button
  const plusFab = document.getElementById("plusFab"); // Increase fab qty
  const minusFab = document.getElementById("minusFab"); // Decrease fab qty
  const fabQtySpan = document.getElementById("fabQty"); // Display qty
  const backToPage2 = document.getElementById("backToPage2"); // Back button
  const addBleach = document.getElementById("addBleach"); // Bleach checkbox
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

  // ======= PAGE 4 ELEMENTS =======
  const plusLoad = document.getElementById("plusLoad"); // Increase load qty
  const minusLoad = document.getElementById("minusLoad"); // Decrease load qty
  const loadQtySpan = document.getElementById("loadQty"); // Display qty
  const finishBtn = document.getElementById("finishBtn"); // Finish button
  const loadRadios = document.querySelectorAll("input[name='loadType']"); // Load type radios
  const backToPage3 = document.getElementById("backToPage3"); // Back button
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
      finishBtn.classList.remove("hidden"); // Show finish button kapag may selection
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
    summaryTableBody.innerHTML += `<tr><td>1</td><td>${selectedService}</td><td>₱0</td></tr>`;

    // DETERGENT
    const detValue = detSelect.value;
    if (detValue && !detValue.includes("mine")) {
      let detPrice = detValue.includes("₱25") ? 25 : 20;
      let detTotal = detPrice * detQty;
      total += detTotal;
      summaryTableBody.innerHTML += `<tr><td>${detQty}</td><td>${detValue}</td><td>₱${detTotal}</td></tr>`;
    }

    // FABCON
    const fabValue = fabSelect.value;
    if (fabValue && !fabValue.includes("mine")) {
      let fabPrice = 15;
      let fabTotal = fabPrice * fabQty;
      total += fabTotal;
      summaryTableBody.innerHTML += `<tr><td>${fabQty}</td><td>${fabValue}</td><td>₱${fabTotal}</td></tr>`;
    }

    // BLEACH
    if (addBleach.checked) {
      total += 10;
      summaryTableBody.innerHTML += `<tr><td>1</td><td>Bleach Add-on</td><td>₱10</td></tr>`;
    }

    // LOAD
    const selectedLoad = document.querySelector("input[name='loadType']:checked");
    if (selectedLoad) {
      let loadName = selectedLoad.value;
      let loadPrice = loadName === "Regular Clothes" ? 100 : loadName === "Bedsheets" ? 120 : 150;
      let loadTotal = loadPrice * loadQty;
      total += loadTotal;
      summaryTableBody.innerHTML += `<tr><td>${loadQty}</td><td>${loadName}</td><td>₱${loadTotal}</td></tr>`;
    }

    summaryTotal.textContent = `₱${total}`; // Ipakita total sa summary
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

  // READ FINAL DETAILS
  let name = document.getElementById("fullName").value;
  let contact = document.getElementById("contactNumber").value;
  let address = document.getElementById("completeAddress").value;
  let payment = document.getElementById("paymentMode").value;

  // READ SUMMARY TOTAL
  let amount = document.getElementById("summaryTotal").textContent.replace("₱", "");

  // GET EXISTING ORDERS
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  // SAVE ORDER
  orders.push({
    ticket: ticketNum,
    name: name,
    contact: contact,
    address: address,
    amount: amount,
    service: fullService.classList.contains("active") ? "Full Service" : "Self Select",
    status: "Pending"
  });

  // SAVE BACK TO LOCAL STORAGE
  localStorage.setItem("orders", JSON.stringify(orders));

  console.log("Order saved:", orders);
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
  window.location.href = "tracklaundry.html"; // ✅ pangalan ng tracking page
});
