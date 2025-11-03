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
console.log("✅ finishBtn found:", finishBtn);
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

// ===== SUMMARY & ORDER FLOW LOGIC =====
// Ensure elements exist
const page5 = document.getElementById("page5");
const page6 = document.getElementById("page6");
const page7 = document.getElementById("page7");

const backToPage4Btn = document.getElementById("backToPage4");
const toContactBtn = document.getElementById("toContactBtn");
const backToPage5Btn = document.getElementById("backToPage5");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const trackBtn = document.getElementById("trackBtn");

const summaryTableBody = document.querySelector("#summaryTable tbody");
const summaryTotalEl = document.getElementById("summaryTotal");

const ticketNumberEl = document.getElementById("ticketNumber");
const ticketNoteEl = document.getElementById("ticketNote");

// Price list (₱)
const PRICES = {
  // steps (if selected individually)
  Wash: 60,
  Dry: 65,
  Fold: 30,
  // detergents by option label (simplified)
  "Surf Rose Fresh 64mL": 20,
  "Surf Cherry Blossom 64mL": 20,
  "Ariel Twin Sunrise Fresh 64g": 25,
  "Ariel Twin Downy 64g": 25,
  "I have mine (liquid only)": 0,
  // fabric conditioner
  "Surf Luxe Perfume 40mL": 15,
  "Surf Blossom Fresh 40mL": 15,
  "Del Shower Fresh 33mL": 15,
  "Del Lavender Breeze 33mL": 15,
  "I have mine": 0,
  // add bleach
  Bleach: 25,
  // load types (optional fee adjustments - here 0)
  "Regular Clothes": 0,
  Bedsheets: 0,
  Comforter: 0
};

// helper: format currency
function toPHP(n) {
  return "₱" + Number(n).toLocaleString();
}

// Build order items from current selections
function buildOrderItems() {
  const items = [];

  // service type and steps
  const fullActive = document.getElementById("fullService").classList.contains("active");
  const selfActive = document.getElementById("selfSelect").classList.contains("active");

  if (fullActive) {
    // full service - assume it includes Wash/Dry/Fold at fixed price
    // For clarity, add separate lines for Wash,Dry,Fold
    items.push({ qty: 1, name: "Wash", price: PRICES.Wash });
    items.push({ qty: 1, name: "Dry", price: PRICES.Dry });
    items.push({ qty: 1, name: "Fold", price: PRICES.Fold });
  } else if (selfActive) {
    // gather selected step buttons
    document.querySelectorAll(".step-btn.selected").forEach(btn => {
      const name = btn.textContent.trim();
      const p = PRICES[name] || 0;
      items.push({ qty: 1, name, price: p });
    });
  }

  // detergent
  const detSelectEl = document.getElementById("detergentSelect");
  const detVal = detSelectEl ? detSelectEl.value : "";
  const detQty = Number(document.getElementById("detQty").textContent) || 1;
  if (detVal) {
    const per = PRICES[detVal] ?? 0;
    if (per > 0) items.push({ qty: detQty, name: detVal, price: per * detQty });
  }

  // fabric conditioner
  const fabVal = document.getElementById("fabconSelect") ? document.getElementById("fabconSelect").value : "";
  const fabQty = Number(document.getElementById("fabQty").textContent) || 1;
  if (fabVal) {
    const per = PRICES[fabVal] ?? 0;
    if (per > 0) items.push({ qty: fabQty, name: fabVal, price: per * fabQty });
  }

  // bleach
  const addBleach = document.getElementById("addBleach");
  if (addBleach && addBleach.checked) {
    items.push({ qty: 1, name: "Add Bleach", price: PRICES.Bleach });
  }

  // loads (we'll not charge per load in this example, but show the count)
  const loadQty = Number(document.getElementById("loadQty").textContent) || 1;
  const loadTypeSelected = document.querySelector("input[name='loadType']:checked");
  if (loadTypeSelected) {
    const label = loadTypeSelected.value;
    // include a descriptive row (price 0 here)
    items.push({ qty: loadQty, name: `${label} (loads)`, price: 0 });
  }

  return items;
}

function renderSummary() {
  const items = buildOrderItems();
  summaryTableBody.innerHTML = "";
  let total = 0;

  items.forEach(it => {
    const tr = document.createElement("tr");
    const tdQty = document.createElement("td");
    tdQty.textContent = it.qty;
    const tdName = document.createElement("td");
    tdName.textContent = it.name;
    const tdPrice = document.createElement("td");
    tdPrice.textContent = toPHP(it.price);
    tr.appendChild(tdQty);
    tr.appendChild(tdName);
    tr.appendChild(tdPrice);
    summaryTableBody.appendChild(tr);
    total += Number(it.price) || 0;
  });

  summaryTotalEl.textContent = toPHP(total);
  return { items, total };
}

// navigation: page4 -> page5
const finishBtnEl = document.getElementById("finishBtn");
if (finishBtnEl) {
  finishBtnEl.addEventListener("click", () => {
    // require load type selected
    if (!document.querySelector("input[name='loadType']:checked")) {
      alert("Please choose a Type of Load before proceeding.");
      return;
    }
    // render and navigate
    renderSummary();
    document.getElementById("page4").classList.add("hidden");
    page5.classList.remove("hidden");
  });
}

// back nav
if (backToPage4Btn) backToPage4Btn.addEventListener("click", () => {
  page5.classList.add("hidden");
  document.getElementById("page4").classList.remove("hidden");
});

// page5 -> contact
if (toContactBtn) {
  toContactBtn.addEventListener("click", () => {
    const result = renderSummary();
    if (result.total <= 0) {
      if (!confirm("Your order total is ₱0. Proceed anyway?")) return;
    }
    page5.classList.add("hidden");
    page6.classList.remove("hidden");
  });
}

// back from contact to summary
if (backToPage5Btn) backToPage5Btn.addEventListener("click", () => {
  page6.classList.add("hidden");
  page5.classList.remove("hidden");
});

// submit contact & show confirmation
if (submitOrderBtn) {
  submitOrderBtn.addEventListener("click", () => {
    // basic validation
    const fullName = document.getElementById("fullName").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const completeAddress = document.getElementById("completeAddress").value.trim();
    const paymentMode = document.getElementById("paymentMode").value;

    if (!fullName || !contactNumber || !email || !completeAddress) {
      alert("Please fill in all contact and address fields.");
      return;
    }

    // prepare order payload (for possible backend)
    const order = {
      customer: { fullName, contactNumber, email, completeAddress, paymentMode },
      summary: renderSummary()
    };

    // Generate ticket number (4 digit)
    const ticket = String(Math.floor(1000 + Math.random() * 9000));
    localStorage.setItem("lastOrder", JSON.stringify({ order, ticket, timestamp: Date.now() }));

    // Show ticket page
    ticketNumberEl.textContent = ticket;
    ticketNoteEl.textContent = `Ticket number is ${ticket}. We've saved your order locally.`;
    page6.classList.add("hidden");
    page7.classList.remove("hidden");

    // TODO: send `order` to your backend API to email the customer and persist the order.
    // Example: fetch('/api/orders', { method:'POST', body:JSON.stringify(order) })
  });
}

// track button (simple behavior: open a tiny modal or alert)
if (trackBtn) {
  trackBtn.addEventListener("click", () => {
    const stored = JSON.parse(localStorage.getItem("lastOrder") || "null");
    if (stored && stored.ticket) {
      alert(`Order ${stored.ticket}\nStatus: Received\nName: ${stored.order.customer.fullName}`);
    } else {
      alert("No recent order found. Please save or create an order first.");
    }
  });
}
