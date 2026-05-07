// === TAB SWITCH ===
const bookTab = document.getElementById("bookTab");
const trackTab = document.getElementById("trackTab");
const bookService = document.getElementById("bookService");
const trackLaundry = document.getElementById("trackLaundry");

if (bookTab && trackTab && bookService && trackLaundry) {

  bookTab.addEventListener("click", () => {

    bookTab.classList.add("active");
    trackTab.classList.remove("active");

    bookService.classList.add("active");
    trackLaundry.classList.remove("active");

  });

  trackTab.addEventListener("click", () => {

    trackTab.classList.add("active");
    bookTab.classList.remove("active");

    trackLaundry.classList.add("active");
    bookService.classList.remove("active");

  });

}

// === TRACKING FUNCTION ===
const trackBtn = document.getElementById("trackBtn");
const ticketInput = document.getElementById("ticketInput");
const trackResult = document.getElementById("trackResult");
const trackError = document.getElementById("trackError");

if (trackBtn) {

  trackBtn.addEventListener("click", () => {

    const ticket = ticketInput.value.trim();

    if (!ticket) {

      alert("Please enter your ticket number.");
      return;

    }

    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const history = JSON.parse(localStorage.getItem("orderHistory")) || [];

    const allOrders = [...orders, ...history];

    const found = allOrders.find(o => String(o.ticket) === ticket);

    if (found) {

      trackError.classList.add("hidden");

      document.getElementById("ticketDisplay").textContent = found.ticket;

      document.getElementById("nameDisplay").textContent = found.name;

      document.getElementById("contactDisplay").textContent = found.contact;

      document.getElementById("serviceDisplay").textContent =
        found.service || "Laundry Service";

      document.getElementById("amountDisplay").textContent =
        "₱" + (parseFloat(found.amount) || 0).toLocaleString();

      const statusEl = document.getElementById("statusDisplay");

      statusEl.textContent = found.status;

      statusEl.className =
        "status " + found.status.toLowerCase().replace(" ", "");

      trackResult.classList.remove("hidden");

    } else {

      trackResult.classList.add("hidden");

      trackError.classList.remove("hidden");

    }

  });

}

// ===== KIOSK STEP SYSTEM =====

let stepBoxes = document.querySelectorAll(".step-box");

const productsPanel = document.querySelector(".products-panel");

let currentStep = 1;

// STEP CONTENTS
const stepContents = {

  1: {
    title: "Select Your Laundry Soap",
    text: "Choose your preferred detergent product.",

    items: [
      "Ariel",
      "Tide",
      "Breeze",
      "Surf",
      "Pride",
      "Wings"
    ]
  },

  2: {
    title: "Select Fabric Conditioner",
    text: "Choose your preferred fabric conditioner.",

    items: [
      "Downy",
      "Del",
      "Champion",
      "Surf Fabcon",
      "Breeze Fabcon",
      "Personal Choice"
    ]
  },

  3: {
    title: "Select Wash Type",
    text: "Choose your wash preference.",

    items: [
      "Quick Wash",
      "Deep Clean",
      "Premium Wash",
      "Eco Wash",
      "Cold Wash",
      "Hot Wash"
    ]
  },

  4: {
    title: "Pickup Details",
    text: "Choose your pickup schedule.",

    items: [
      "Morning",
      "Afternoon",
      "Evening",
      "Express Pickup",
      "Store Pickup",
      "Home Delivery"
    ]
  },

  5: {
    title: "Select Payment",
    text: "Choose your payment method.",

    items: [
      "Cash",
      "GCash",
      "Maya",
      "Credit Card",
      "Debit Card",
      "Online Banking"
    ]
  },

  6: {
    title: "Order Confirmation",
    text: "Review and confirm your laundry order.",

    items: [
      "Soap Selected",
      "Fabcon Selected",
      "Wash Selected",
      "Pickup Selected",
      "Payment Selected",
      "Confirm Order"
    ]
  }

};

// ===== STEP CLICK FUNCTION =====

function activateStepClicks() {

  stepBoxes = document.querySelectorAll(".step-box");

  stepBoxes.forEach((step, index) => {

    step.style.cursor = "pointer";

    step.onclick = () => {

      currentStep = index + 1;

      updateStepUI();

    };

  });

}

// ===== UPDATE UI =====

function updateStepUI() {

  // ACTIVE STEP
  stepBoxes.forEach(step => {

    step.classList.remove("active-step");

  });

  if (stepBoxes[currentStep - 1]) {

    stepBoxes[currentStep - 1].classList.add("active-step");

  }

  // LOAD CONTENT
  const data = stepContents[currentStep];

  productsPanel.innerHTML = `

    <h2>${data.title}</h2>

    <p class="select-text">
      ${data.text}
    </p>

    <div class="products-grid">

      ${data.items.map(item => `

        <div class="product-card">

          <div>

            <img src="img/product-placeholder.png" alt="${item}">

            <h3>${item}</h3>

          </div>

          <button class="select-product-btn">
            Select
          </button>

        </div>

      `).join("")}

    </div>

  `;

  // BUTTON EVENTS
  const selectButtons =
    document.querySelectorAll(".select-product-btn");

  selectButtons.forEach(button => {

    button.addEventListener("click", () => {

      if (currentStep < 6) {

        currentStep++;

        updateStepUI();

      } else {

        alert("Laundry Service Confirmed!");

      }

    });

  });

  // RE-ACTIVATE STEP CLICKS
  activateStepClicks();

}

// ===== INITIAL LOAD =====

if (productsPanel) {

  updateStepUI();

  activateStepClicks();

}