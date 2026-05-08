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


// ===== STEP CONTENTS (UPDATED WITH IMAGES) =====

const stepContents = {

  1: {
    title: "Select Your Laundry Soap",
    text: "Choose your preferred detergent product.",

    items: [
      { name: "Ariel", img: "img/Ariel.jpg" },
      { name: "Tide", img: "img/tide.jpg" },
      { name: "Breeze", img: "img/breeze.jpg" },
      { name: "Surf", img: "img/surf.jpg" },
      { name: "Pride", img: "img/pride.jpg" },
      { name: "Wings", img: "img/wings.jpg" }
    ]
  },

  2: {
    title: "Select Fabric Conditioner",
    text: "Choose your preferred fabric conditioner.",

    items: [
      { name: "Downy", img: "img/downy.jpg" },
      { name: "Del", img: "img/del.jpg" },
      { name: "Champion", img: "img/champ.jpg" },
      { name: "Surf Fabcon", img: "img/serf.jpg" },
      { name: "Lala Fabcon", img: "img/lala.jpg" },
      { name: "Personal Choice", img: "img/placeholder.jpg" }
    ]
  },

  3: {
    title: "Select Wash Type",
    text: "Choose your wash preference.",

    items: [
      { name: "Quick Wash", img: "img/quick.jpg" },
      { name: "Deep Clean", img: "img/deep.jpg" },
      { name: "Premium Wash", img: "img/premium.jpg" },
      { name: "Eco Wash", img: "img/eco.jpg" },
      { name: "Cold Wash", img: "img/cold.jpg" },
      { name: "Hot Wash", img: "img/hot.jpg" }
    ]
  },

  4: {
    title: "Pickup Details",
    text: "Choose your pickup schedule.",

    items: [
      { name: "Morning", img: "img/morning.jpg" },
      { name: "Afternoon", img: "img/afternoon.jpg" },
      { name: "Evening", img: "img/evening.jpg" },
      { name: "Express Pickup", img: "img/express.jpg" },
      { name: "Store Pickup", img: "img/A1.jpg" },
      { name: "Home Delivery", img: "img/home.png" }
    ]
  },

  5: {
    title: "Select Payment",
    text: "Choose your payment method.",

    items: [
      { name: "Cash", img: "img/cash.jpg" },
      { name: "GCash", img: "img/gcash.jpg" },
      { name: "Maya", img: "img/maya.jpg" },
      { name: "Credit Card", img: "img/card.jpg" },
      { name: "Debit Card", img: "img/debit.jpg" },
      { name: "Online Banking", img: "img/online.jpg" }
    ]
  },

  6: {
    title: "Order Confirmation",
    text: "Review and confirm your laundry order.",

    items: [
      { name: "Soap Selected", img: "img/check.png" },
      { name: "Fabcon Selected", img: "img/check.png" },
      { name: "Wash Selected", img: "img/check.png" },
      { name: "Pickup Selected", img: "img/check.png" },
      { name: "Payment Selected", img: "img/check.png" },
      { name: "Confirm Order", img: "img/confirm.png" }
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
  stepBoxes.forEach(step => step.classList.remove("active-step"));

  if (stepBoxes[currentStep - 1]) {
    stepBoxes[currentStep - 1].classList.add("active-step");
  }

  const data = stepContents[currentStep];

  productsPanel.innerHTML = `
    <h2>${data.title}</h2>
    <p class="select-text">${data.text}</p>

    <div class="products-grid">

      ${data.items.map(item => `
        <div class="product-card">
          <div>
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
          </div>

          <button class="select-product-btn">
            Select
          </button>
        </div>
      `).join("")}

    </div>
  `;

  // BUTTON EVENTS
  const selectButtons = document.querySelectorAll(".select-product-btn");

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

  activateStepClicks();
}


// ===== INITIAL LOAD =====

if (productsPanel) {
  updateStepUI();
  activateStepClicks();
}