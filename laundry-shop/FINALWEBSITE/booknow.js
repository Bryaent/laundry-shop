// ===== FIXED PRICING SYNC (PUT AT VERY TOP) =====
function loadPricingFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem('laundryPricing'));
        if (!saved) return console.log('No admin pricing found');
        
        // UPDATE STEP 1 SOAPS
        if(saved.step1) {
            stepContents[1].items[0].price = saved.step1[0]; // Ariel
            stepContents[1].items[1].price = saved.step1[1]; // Tide  
            stepContents[1].items[2].price = saved.step1[2]; // Breeze
            stepContents[1].items[3].price = saved.step1[3]; // Surf
            stepContents[1].items[4].price = saved.step1[4]; // Pride
            stepContents[1].items[5].price = saved.step1[5]; // Wings
        }
        
        // UPDATE STEP 2 FABCON
        if(saved.step2) {
            stepContents[2].items[0].price = saved.step2[0]; // Downy
            stepContents[2].items[1].price = saved.step2[1]; // Del
            stepContents[2].items[2].price = saved.step2[2]; // Champion
            stepContents[2].items[3].price = saved.step2[3]; // Surf Fabcon
            stepContents[2].items[4].price = saved.step2[4]; // Lala Fabcon
            stepContents[2].items[5].price = saved.step2[5]; // Personal Choice
        }
        
        // UPDATE STEP 3 WASH
        if(saved.step3) {
            stepContents[3].items[0].price = saved.step3[0]; // Quick Wash
            stepContents[3].items[1].price = saved.step3[1]; // Deep Clean
            stepContents[3].items[2].price = saved.step3[2]; // Premium Wash
            stepContents[3].items[3].price = saved.step3[3]; // Eco Wash
            stepContents[3].items[4].price = saved.step3[4]; // Cold Wash
            stepContents[3].items[5].price = saved.step3[5]; // Hot Wash
        }
        
        deliveryFee = saved.deliveryFee || 40;
        
        console.log('✅ PRICES UPDATED:', {
            Ariel: stepContents[1].items[0].price,
            Downy: stepContents[2].items[0].price,
            'Quick Wash': stepContents[3].items[0].price
        });
        
        // REFRESH UI
        if(isConfirmed) renderConfirmation();
        else updateStepUI();
        
    } catch(e) {
        console.log('Pricing load failed:', e);
    }
}



// ===== KIOSK STEP SYSTEM =====
let stepBoxes = document.querySelectorAll(".step-box");
const productsPanel = document.querySelector(".products-panel");
let currentStep = 1;
let isConfirmed = false; // ✅ Lock system

// ===== USER SELECTIONS =====
const selections = {
  1: [], // soaps (multiple)
  2: [], // fabcon (multiple)
  3: null,
  4: null,
  5: null
};

// ===== EXTRA ORDER DATA =====
let orderQuantity = 1;
let kg = 1;
let deliveryFee = 0;

// ===== STEP CONTENTS WITH PRICES =====
const stepContents = {
  1: {
    title: "Select Your Laundry Soap",
    text: "Choose your preferred detergent product.",
    items: [
      { name: "Ariel", img: "img/Ariel.jpg", price: 20 },
      { name: "Tide", img: "img/tide.jpg", price: 25 },
      { name: "Breeze", img: "img/breeze.jpg", price: 18 },
      { name: "Surf", img: "img/surf.jpg", price: 15 },
      { name: "Pride", img: "img/pride.jpg", price: 17 },
      { name: "Wings", img: "img/wings.jpg", price: 16 }
    ]
  },

  2: {
    title: "Select Fabric Conditioner",
    text: "Choose your preferred fabric conditioner.",
    items: [
      { name: "Downy", img: "img/downy.jpg", price: 30 },
      { name: "Del", img: "img/del.jpg", price: 20 },
      { name: "Champion", img: "img/champ.jpg", price: 22 },
      { name: "Surf Fabcon", img: "img/serf.jpg", price: 18 },
      { name: "Lala Fabcon", img: "img/lala.jpg", price: 15 },
      { name: "Personal Choice", img: "img/placeholder.jpg", price: 10 }
    ]
  },

  3: {
    title: "Select Wash Type",
    text: "Choose your wash preference.",
    items: [
      { name: "Quick Wash", img: "img/quick.jpg", price: 50 },
      { name: "Deep Clean", img: "img/deep.jpg", price: 80 },
      { name: "Premium Wash", img: "img/premium.jpg", price: 120 },
      { name: "Eco Wash", img: "img/eco.jpg", price: 60 },
      { name: "Cold Wash", img: "img/cold.jpg", price: 40 },
      { name: "Hot Wash", img: "img/hot.jpg", price: 70 }
    ]
  },

  4: {
    title: "Pickup Details",
    text: "Choose your pickup schedule.",
    items: [
      { name: "Morning", img: "img/morning.jpg", price: 0 },
      { name: "Afternoon", img: "img/afternoon.jpg", price: 0 },
      { name: "Evening", img: "img/evening.jpg", price: 0 },
      { name: "Express Pickup", img: "img/express.jpg", price: 50 },
      { name: "Store Pickup", img: "img/A1.jpg", price: 0 },
      { name: "Home Delivery", img: "img/home.png", price: 40 }
    ]
  },

  5: {
  title: "Select Payment",
  text: "Choose your payment method.",
  items: [
    { name: "Cash", img: "img/cash.jpg", price: 0 },
    { name: "GCash", img: "img/gcash.jpg", price: 5 }
  ]
}
};

// ===== TOTAL =====
function getSubtotal() {
  let total = 0;

  // STEP 1 SOAPS
  selections[1].forEach(item => {
    total += item.price * item.qty;
  });

  // STEP 2 FABCON
  selections[2].forEach(item => {
    total += item.price * item.qty;
  });

  // OTHER STEPS
  for (let i = 3; i <= 5; i++) {
    if (selections[i]) {
      total += selections[i].price;
    }
  }

  return total;
}

function getTotal() {
  let base = getSubtotal() * orderQuantity;
  let kgCharge = kg > 8 ? 5 : 0;
  return base + kgCharge + deliveryFee;
}

// ===== STEP CHECKS =====
function updateStepChecks() {
  stepBoxes.forEach((step, index) => {
    const span = step.querySelector("span");
    const stepNum = index + 1;

    if (
  (stepNum === 1 || stepNum === 2)
    ? selections[stepNum].length > 0
    : selections[stepNum]
) {
      span.textContent = "✔";
      span.style.background = "#28a745";
    } else if (stepNum === 6 && isConfirmed) {
      span.textContent = "✔";
      span.style.background = "#28a745";
    } else {
      span.textContent = stepNum;
      span.style.background = "#0094ff";
    }
  });
}

// ✅ LOCK STEPS FUNCTION
function lockPreviousSteps() {
  stepBoxes.forEach((step, index) => {
    const stepNum = index + 1;
    
    if (stepNum < 6 && isConfirmed) {
      step.style.pointerEvents = "none";
      step.style.opacity = "0.6";
      step.style.cursor = "not-allowed";
    } else if (stepNum === 6 && isConfirmed) {
      step.style.pointerEvents = "none";
      step.style.opacity = "1";
      step.style.cursor = "default";
    }
  });
}

// ===== STEP CLICK (LOCKED) =====
function activateStepClicks() {
  stepBoxes = document.querySelectorAll(".step-box");

  stepBoxes.forEach((step, index) => {
    step.onclick = () => {
      const stepNum = index + 1;
      
      if (isConfirmed || stepNum >= currentStep) {
        return; // Locked!
      }
      
      currentStep = stepNum;
      updateStepUI();
    };
  });
}

// ===== EXTRA CONTROLS =====
function updateKg(val) {
  kg = val < 1 ? 1 : parseInt(val);
  if (isConfirmed) renderConfirmation();
  else updateConfirmationLive();
}

function togglePickup(type) {
  deliveryFee = type === "delivery" ? 40 : 0;
  if (isConfirmed) renderConfirmation();
  else updateConfirmationLive();
}

// ✅ FULL DROPDOWN CUSTOMIZATION IN CONFIRMATION
function renderConfirmation() {
  isConfirmed = true;
  lockPreviousSteps();
  updateStepChecks();

  let html = `
  <div class="confirm-layout">

    <!-- LEFT FORM -->
    <div class="confirm-form">

      <h2>Customize Your Order</h2>
      <p style="color:#28a745; font-weight:600;">Steps locked! Customize quantities & details below:</p>

      <input id="custName" placeholder="Full Name *" required>
      <input id="custAddress" placeholder="Address *" required>

      <label>Pickup Type</label>
      <select id="pickupType" onchange="togglePickup(this.value)">
        <option value="store" ${deliveryFee === 0 ? 'selected' : ''}>Store Pickup (Free)</option>
        <option value="delivery" ${deliveryFee === 40 ? 'selected' : ''}>Home Delivery (+₱40)</option>
      </select>

      <label>Pickup Time</label>
      <select id="pickupTime">
        <option>8:00 AM</option>
        <option>10:00 AM</option>
        <option>12:00 PM</option>
        <option>2:00 PM</option>
        <option>4:00 PM</option>
        <option>6:00 PM</option>
      </select>

      <label>Kilograms</label>
      <div class="qty-control" style="margin-bottom:12px;">
        <button onclick="updateKg(${kg-1})" ${kg <= 1 ? 'disabled' : ''}>-</button>
        <input type="number" id="kgInput" value="${kg}" min="1" style="width:80px;" onchange="updateKg(this.value)">
        <button onclick="updateKg(${kg+1})">+</button>
      </div>
      ${kg > 8 ? `<p style="color:red; font-size:14px;">+₱5 extra charge (above 8kg)</p>` : ""}

      <label>Order Quantity</label>
      <div class="qty-control">
        <button onclick="changeQty(-1)">-</button>
        <input type="text" value="${orderQuantity}" id="qtyDisplay" readonly>
        <button onclick="changeQty(1)">+</button>
      </div>

    </div>

    <!-- RIGHT SUMMARY - FULL DROPDOWNS ✅ -->
    <div class="confirmation-box">

      <h2>Final Selections</h2>
      <p style="color:#666; font-size:14px;">Click dropdowns to customize your choices:</p>

  `;

  // ✅ FULL DROPDOWN FOR ALL 5 STEPS
  // ✅ CONFIRMATION DISPLAY
 // ✅ CONFIRMATION DISPLAY
for (let i = 1; i <= 5; i++) {

  const data = stepContents[i];

  html += `
    <div style="
      margin-bottom:15px;
      padding:12px;
      background:#f8f9ff;
      border-radius:10px;
    ">
      <div style="
        font-weight:700;
        color:#0094ff;
        margin-bottom:8px;
        font-size:16px;
      ">
        ${data.title}
      </div>
  `;

  // ===== STEP 1 & 2 MULTIPLE ITEMS
  if (i === 1 || i === 2) {

    if (selections[i].length === 0) {

      html += `
        <p>No selections yet.</p>
      `;

    } else {

      html += selections[i].map(item => `
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          background:white;
          padding:10px;
          border-radius:8px;
          margin-bottom:8px;
        ">
          <div>
            <strong>${item.name}</strong><br>
            Qty: ${item.qty}
          </div>

          <div style="
            font-weight:700;
            color:#0094ff;
          ">
            ₱${item.price * item.qty}
          </div>
        </div>
      `).join("");
    }

  } else {

    // ===== NORMAL DROPDOWN
    html += `
      <select
        onchange="updateSelection(${i}, this.value)"
        style="
          width:100%;
          padding:12px;
          border:2px solid #0094ff;
          border-radius:10px;
          font-size:15px;
          font-weight:600;
        "
      >
        ${data.items.map(item => `
          <option
            value="${item.name}"
            ${selections[i]?.name === item.name ? "selected" : ""}
          >
            ${item.name} - ₱${item.price}
          </option>
        `).join("")}
      </select>
    `;
  }

  // CLOSE EACH BOX
  html += `</div>`;
}

// ===== FINAL SUMMARY
html += `
  <hr style="margin: 25px 0;">

  <div style="
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:15px;
    background:#e3f2fd;
    border-radius:12px;
    margin-bottom:20px;
  ">
    <strong style="font-size:22px;">GRAND TOTAL:</strong>

    <span id="totalLive" style="
      font-size:28px;
      font-weight:700;
      color:#0094ff;
    ">
      ₱${getTotal().toLocaleString()}
    </span>
  </div>

  <button
    class="select-product-btn confirm-btn"
    onclick="confirmFinalOrder()"
    style="margin-bottom:15px;"
  >
    CONFIRM FINAL ORDER
  </button>

  <div style="
    padding:15px;
    background:#fff3cd;
    border:1px solid #ffeaa7;
    border-radius:10px;
    font-size:14px;
    color:#856404;
  ">
    <strong>Info:</strong>
    All selections above are now <strong>FINAL</strong> after confirmation!
  </div>

</div>
</div>
`;

// ===== RENDER
productsPanel.innerHTML = html;

// ===== UPDATE TOTAL
updateConfirmationLive();

}

// ===== LIVE UPDATE =====
function updateConfirmationLive() {
  const el = document.getElementById("totalLive");
  if (el) el.textContent = "₱" + getTotal().toLocaleString();
}

// ✅ DROPDOWN SELECTION - WORKS IN CONFIRMATION
function updateSelection(step, value) {
  const item = stepContents[step].items.find(i => i.name === value);
  selections[step] = item;

  updateStepChecks();
  
  // Re-render to show updated selections + total

    updateConfirmationLive();
  }


// ===== QTY =====
function changeQty(val) {
  orderQuantity += val;

  if (orderQuantity < 1) {
    orderQuantity = 1;
  }

  // I-update lang ang quantity display
  const qtyDisplay = document.getElementById("qtyDisplay");
  if (qtyDisplay) {
    qtyDisplay.value = orderQuantity;
  }

  // I-update lang ang total
  updateConfirmationLive();
}

// ===== MAIN UI =====
function updateStepUI() {
  stepBoxes.forEach(s => s.classList.remove("active-step"));
  if (stepBoxes[currentStep - 1]) {
    stepBoxes[currentStep - 1].classList.add("active-step");
  }

  updateStepChecks();

  if (currentStep === 6) {
    renderConfirmation();
    return;
  }

  const data = stepContents[currentStep];

// ===== MULTIPLE SELECT FOR STEP 1 & 2 =====
if (currentStep === 1 || currentStep === 2) {

  productsPanel.innerHTML = `
    <h2>${data.title}</h2>
    <p class="select-text">${data.text}</p>

    <div class="products-grid">
      ${data.items.map((item, index) => `
        <div class="product-card">

          <img src="${item.img}">
          <h3>${item.name}</h3>

          <p>₱${item.price}</p>

          <div class="qty-control" style="
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px;
  margin:15px 0;
">

  <button onclick="
  handleQtyChange(${currentStep}, ${index}, -1)
">-</button>

  <input
  type="number"
  min="1"
  value="1"
  readonly
    id="qty-${currentStep}-${index}"
    style="
      width:60px;
      text-align:center;
      font-weight:700;
    "
  >

  
  <button onclick="
  handleQtyChange(${currentStep}, ${index}, 1)
">+</button>

</div>

 <button
  id="addBtn-${currentStep}-${index}"
  onclick="addMultiItem(${currentStep}, ${index})"
  style="
    background:${
      (selections[currentStep] || []).find(i => i.name === item.name)
        ? '#28a745'
        : '#0094ff'
    };
    color:white;
    border:none;
    padding:10px 18px;
    border-radius:10px;
    cursor:pointer;
    font-weight:700;
    transition:0.3s;
  "
  ${
    (selections[currentStep] || []).find(i => i.name === item.name)
      ? 'disabled'
      : ''
  }
>
  ${
    (selections[currentStep] || []).find(i => i.name === item.name)
      ? '✔ Added'
      : 'Add'
  }
</button>

        </div>
      `).join("")}
    </div>

    <div id="selectedItems" style="
      margin-top:30px;
      text-align:left;
    ">
      <p>No items selected yet.</p>
    </div>

    <button
  onclick="confirmMultiStep(${currentStep})"
  style="
    margin-top:15px;
    background:#28a745;
    color:white;
    border:none;
    padding:10px 18px;
    border-radius:10px;
    font-size:14px;
    font-weight:700;
    cursor:pointer;
    display:block;
    margin-left:auto;
    margin-right:auto;
  "
>
      Confirm Selection
    </button>
  `;

  renderMultiSummary(currentStep);
return;
}

// ===== NORMAL SINGLE SELECT STEPS =====
productsPanel.innerHTML = `
  <h2>${data.title}</h2>
  <p class="select-text">${data.text}</p>

  <div class="products-grid">
    ${data.items.map((item, index) => `
      <div class="product-card">
        <img src="${item.img}">
        <h3>${item.name}</h3>
        <p>₱${item.price}</p>

        <button onclick="selectItem(${currentStep}, ${index})">
          Select
        </button>
      </div>
    `).join("")}
  </div>

  <div style="
    margin-top:20px;
    font-weight:700;
    color:#0094ff;
  ">
    Total: ₱${getTotal().toLocaleString()}
  </div>
`;
}

// ===== SELECT ITEM =====
function selectItem(step, index) {

  selections[step] =
    stepContents[step].items[index];

  currentStep++;

  updateStepUI();
}

// ===== FINAL ORDER CONFIRMATION =====
function confirmFinalOrder() {

  const name = document.getElementById("custName")?.value;
  const address = document.getElementById("custAddress")?.value;

  if (!name || !address) {
    alert("Please fill in your name and address!");
    return;
  }

  // ===== GENERATE TICKET =====
  const ticketNumber =
  Math.floor(100 + Math.random() * 900).toString();

  // ===== ORDER OBJECT =====
  const newOrder = {
    ticket: ticketNumber,
    name: name,
    contact: "N/A",
    address: address,

    service: selections[3]
      ? selections[3].name
      : "Laundry Service",

    soap: selections[1]
  .map(i => `${i.name} x${i.qty}`)
  .join(", "),

    fabcon: selections[2]
  .map(i => `${i.name} x${i.qty}`)
  .join(", "),

    pickup: selections[4]
      ? selections[4].name
      : "",

    payment: selections[5]
      ? selections[5].name
      : "",

    kg: kg,
    quantity: orderQuantity,

    amount: getTotal(),

    status: "Pending",

    pickupType:
      deliveryFee === 40
        ? "Home Delivery"
        : "Store Pickup",

    pickupTime:
      document.getElementById("pickupTime")
        ? document.getElementById("pickupTime").value
        : ""
  };

  // ===== SAVE TO LOCAL STORAGE =====
  // ===== SAVE TO LOCAL STORAGE =====
let orders = JSON.parse(localStorage.getItem("orders")) || [];
orders.push(newOrder);
localStorage.setItem("orders", JSON.stringify(orders));

// ===== SAVE TO DATABASE (PHP MYSQL) =====
fetch("http://localhost/HTML1/PHP/laundry-shop/FINALWEBSITE/orders.php", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(newOrder)
})
.then(res => res.json())
.then(data => {
  console.log("Saved to DB:", data);
})
.catch(err => {
  console.log("DB Error:", err);
});

  // ===== SUCCESS =====
  alert(
    "ORDER CONFIRMED!\n\n" +
    "Ticket Number: " + ticketNumber +
    "\n\nCustomer: " + name +
    "\nTotal: ₱" + getTotal() +
    "\n\nYou can now track your laundry."
  );

  // ===== REDIRECT =====
  window.location.href =
    "tracklaundry.html?ticket=" + ticketNumber;
}

// ===== INITIALIZE =====
updateStepUI();
activateStepClicks();

// ===== ADD MULTIPLE ITEMS =====
function addMultiItem(step, index) {

  const item = stepContents[step].items[index];
 const qtyInput = document.getElementById(`qty-${step}-${index}`);
if (!qtyInput) return;

  let qty = parseInt(qtyInput.value);

  if (isNaN(qty) || qty < 1) {
    qty = 1;
  }

  const existing = selections[step].find(i => i.name === item.name);

  if (existing) {
    alert("Already added. Remove first before changing quantity.");
    return;
  }

  selections[step].push({
    ...item,
    qty: qty
  });

  qtyInput.value = 1;

  renderMultiSummary(step);
  updateStepChecks(); // optional UI update lang
}
function bindQtyLiveUpdate(step, index) {

  const input = document.getElementById(`qty-${step}-${index}`);
  const item = stepContents[step].items[index];

  if (!input) return;

  input.oninput = () => {

    let qty = parseInt(input.value);
    if (!qty || qty < 1) qty = 1;

    const existing = selections[step].find(i => i.name === item.name);

    if (existing) {
      existing.qty = qty;
      renderMultiSummary(step);
    }
  };
}

// ===== REMOVE ITEM =====
// ===== REMOVE ITEM =====
function removeMultiItem(step, name) {

  // remove specific item only
  selections[step] =
    selections[step].filter(i => i.name !== name);

  // hanapin original index
  const index =
    stepContents[step].items.findIndex(
      item => item.name === name
    );

  // reset ONLY that qty input
  const qtyInput =
    document.getElementById(`qty-${step}-${index}`);

  if (qtyInput) {
    qtyInput.value = 1;
  }

  // reset ONLY that button
  const btn =
    document.getElementById(`addBtn-${step}-${index}`);

  if (btn) {
    btn.style.background = "#0094ff";
    btn.style.color = "white";
    btn.innerHTML = "Add";
    btn.disabled = false;
  }

  // refresh summary
  renderMultiSummary(step);
}

// ===== CONFIRM STEP =====
function confirmMultiStep(step) {

  if (selections[step].length === 0) {
    alert("Please select at least one item.");
    return;
  }

  currentStep++;
  updateStepUI();
}

function renderMultiSummary(step) {

  const box = document.getElementById("selectedItems");

  if (!box) return;

  if (selections[step].length === 0) {
    box.innerHTML = `
      <p>No items selected yet.</p>
    `;
    return;
  }

  box.innerHTML = selections[step].map(item => `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      background:#f5f7fb;
      padding:10px;
      border-radius:10px;
      margin-bottom:10px;
    ">
      <div>
        <strong>${item.name}</strong><br>
        Qty: ${item.qty}<br>
        ₱${item.price * item.qty}
      </div>

      <button onclick="
        removeMultiItem(${step}, '${item.name}')
      " style="
        background:red;
        color:white;
        border:none;
        padding:8px 12px;
        border-radius:8px;
        cursor:pointer;
      ">
        Remove
      </button>
    </div>
  `).join("");

  box.innerHTML += `
    <div style="
      margin-top:15px;
      font-weight:700;
      color:#0094ff;
      font-size:18px;
    ">
      Current Total:
      ₱${getTotal().toLocaleString()}
    </div>
  `;
}

// ===== HANDLE QTY CHANGE =====
function handleQtyChange(step, index, change) {

  const item = stepContents[step].items[index];

  const existing = selections[step].find(
    i => i.name === item.name
  );

  if (existing) {
    alert(
      "Remove the item first before editing quantity."
    );
    return;
  }

  const input =
    document.getElementById(`qty-${step}-${index}`);

  let current = parseInt(input.value);

  if (isNaN(current) || current < 1) {
    current = 1;
  }

  current += change;

  if (current < 1) current = 1;

  input.value = current;
}
// INIT PRICING
loadPricingFromStorage();
window.addEventListener('pricingUpdated', loadPricingFromStorage);
