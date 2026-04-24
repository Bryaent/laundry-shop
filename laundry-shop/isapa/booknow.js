// === TAB SWITCH ===
const bookTab = document.getElementById("bookTab");
const trackTab = document.getElementById("trackTab");
const bookService = document.getElementById("bookService");
const trackLaundry = document.getElementById("trackLaundry");

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

// === TRACKING FUNCTION ===
const trackBtn = document.getElementById("trackBtn");
const ticketInput = document.getElementById("ticketInput");
const trackResult = document.getElementById("trackResult");
const trackError = document.getElementById("trackError");

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
    document.getElementById("serviceDisplay").textContent = found.service || "Laundry Service";
    document.getElementById("amountDisplay").textContent = "₱" + (parseFloat(found.amount) || 0).toLocaleString();

    const statusEl = document.getElementById("statusDisplay");
    statusEl.textContent = found.status;
    statusEl.className = "status " + found.status.toLowerCase().replace(" ", "");

    trackResult.classList.remove("hidden");
  } else {
    trackResult.classList.add("hidden");
    trackError.classList.remove("hidden");
  }
});
