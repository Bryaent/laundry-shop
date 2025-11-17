/* click.js
   Clean, organized, plug-and-play script for the laundry multi-step flow,
   summary edit, confirm, receipt fill, and PDF download.
   Author: ChatGPT (tailored for your HTML)
*/

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------------
     Helper: safe query
  ------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* -------------------------
     Page elements map
  ------------------------- */
  const pages = {
    1: $("#kontainer"),
    2: $("#page2"),
    3: $("#page3"),
    4: $("#page4"),
    5: $("#page5"),
    6: $("#page6"),
    7: $("#page7"),
  };

  // buttons / controls
  const fullService = $("#fullService");
  const selfSelect = $("#selfSelect");
  const inclusions = $("#inclusions");
  const stepsBox = $("#steps");
  const nextBtn = $("#nextBtn");

  const detSelect = $("#detergentSelect");
  const plusDet = $("#plusDet");
  const minusDet = $("#minusDet");
  const detQtySpan = $("#detQty");
  const nextToFabcon = $("#nextToFabcon");
  const backToPage1 = $("#backToPage1");

  const fabSelect = $("#fabconSelect");
  const plusFab = $("#plusFab");
  const minusFab = $("#minusFab");
  const fabQtySpan = $("#fabQty");
  const addBleach = $("#addBleach");
  const nextToDetails = $("#nextToDetails");
  const backToPage2 = $("#backToPage2");

  const plusLoad = $("#plusLoad");
  const minusLoad = $("#minusLoad");
  const loadQtySpan = $("#loadQty");
  const loadRadios = $$("input[name='loadType']");
  const finishBtn = $("#finishBtn");
  const backToPage3 = $("#backToPage3");

  const summaryTableBody = $("#summaryTable tbody");
  const summaryTotal = $("#summaryTotal");
  const editSummaryBtn = $("#editSummaryBtn"); // Confirm (Review)
  const toContactBtn = $("#toContactBtn");
  const backToPage4 = $("#backToPage4");

  const submitOrderBtn = $("#submitOrderBtn");
  const backToPage5 = $("#backToPage5");

  const ticketNumberEl = $("#ticketNumber");

  // Receipt elements
  const r_ticket = $("#r_ticket");
  const r_name = $("#r_name");
  const r_contact = $("#r_contact");
  const r_address = $("#r_address");
  const r_payment = $("#r_payment");
  const r_amount = $("#r_amount");
  const r_date = $("#r_date");
  const downloadReceiptBtn = $("#downloadReceipt");
  const receiptBox = $("#receiptBox");

  const trackBtn = $("#trackBtn");

  /* -------------------------
     Local state
  ------------------------- */
  let detQty = 1, fabQty = 1, loadQty = 1;
  // track whether confirmed
  let isConfirmed = false;

  /* -------------------------
     Utility functions
  ------------------------- */

  function showPage(n) {
  // Hide all pages
  Object.values(pages).forEach(p => p && p.classList.add("hidden"));

  // Show target page
  if (pages[n]) pages[n].classList.remove("hidden");

  // === UPDATE PROGRESS CIRCLE ===
  const progressCircle = document.getElementById("progressCircle");

  // If page is 1 to 6 → show progress
  if (n >= 1 && n <= 6) {
    progressCircle.textContent = `${n} / 6`;
    progressCircle.classList.remove("hidden");
  }

  // If page 7 (ticket) → hide progress
  if (n === 7) {
    progressCircle.classList.add("hidden");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}


  function getOptionTextWithPrice(selectEl) {
    if (!selectEl) return "";
    const opt = selectEl.selectedOptions && selectEl.selectedOptions[0];
    return opt ? opt.textContent.trim() : "";
  }

  function extractPriceFromText(text) {
    // Look for "₱" followed by digits; return number or 0
    if (!text) return 0;
    const m = text.match(/₱\s*([\d,]+)/);
    if (!m) return 0;
    return parseFloat(m[1].replace(/,/g, ""));
  }

  function calculateTotal() {
    let total = 0;

    // detergent
    const detText = getOptionTextWithPrice(detSelect);
    const detIsMine = /I have mine/i.test(detText);
    if (!detIsMine && detText) {
      const detPrice = extractPriceFromText(detText) || 0;
      total += detPrice * detQty;
    }

    // fabcon
    const fabText = getOptionTextWithPrice(fabSelect);
    const fabIsMine = /I have mine/i.test(fabText);
    if (!fabIsMine && fabText) {
      const fabPrice = extractPriceFromText(fabText) || 0;
      total += fabPrice * fabQty;
    }

    // bleach
    if (addBleach && addBleach.checked) total += 10;

    // load
    const selLoad = document.querySelector("input[name='loadType']:checked");
    if (selLoad) {
      const loadName = selLoad.value;
      let price = loadName === "Regular Clothes" ? 100
                : loadName === "Bedsheets" ? 120 : 150;
      total += price * loadQty;
    }

    return total;
  }

  /* -------------------------
     Render summary table (with Edit buttons)
  ------------------------- */
  function renderSummary() {
    if (!summaryTableBody) return;
    summaryTableBody.innerHTML = "";
    let total = 0;

    // Service row
    const serviceText = (fullService && fullService.classList.contains("active")) ? "Full Service" : "Self Select";
    const trService = document.createElement("tr");
    trService.innerHTML = `
      <td>1</td>
      <td>${serviceText}</td>
      <td>₱0</td>
      <td><button class="summary-edit-btn" data-page="1" data-service="${fullService.classList.contains("active")}">Edit</button></td>
    `;
    summaryTableBody.appendChild(trService);

    // Detergent
    const detText = getOptionTextWithPrice(detSelect);
    const detPrice = extractPriceFromText(detText);
    const detIsMine = /I have mine/i.test(detText);
    const detTotal = detIsMine ? 0 : (detPrice * detQty || 0);
    if (detText) {
      const trDet = document.createElement("tr");
      trDet.innerHTML = `
        <td>${detQty}</td>
        <td>${detText}</td>
        <td>₱${detTotal}</td>
        <td><button class="summary-edit-btn" data-page="2" data-det="${detText}" data-qty="${detQty}">Edit</button></td>
      `;
      summaryTableBody.appendChild(trDet);
      total += detTotal;
    }

    // Fabcon
    const fabText = getOptionTextWithPrice(fabSelect);
    const fabPrice = extractPriceFromText(fabText);
    const fabIsMine = /I have mine/i.test(fabText);
    const fabTotal = fabIsMine ? 0 : (fabPrice * fabQty || 0);
    if (fabText) {
      const trFab = document.createElement("tr");
      trFab.innerHTML = `
        <td>${fabQty}</td>
        <td>${fabText}${addBleach && addBleach.checked ? " + Bleach" : ""}</td>
        <td>₱${fabTotal}</td>
        <td><button class="summary-edit-btn" data-page="3" data-fab="${fabText}" data-qty="${fabQty}" data-bleach="${addBleach && addBleach.checked}">Edit</button></td>
      `;
      summaryTableBody.appendChild(trFab);
      total += fabTotal;
    }

    // Load
    const selLoad = document.querySelector("input[name='loadType']:checked");
    if (selLoad) {
      const loadName = selLoad.value;
      const loadPrice = loadName === "Regular Clothes" ? 100 : loadName === "Bedsheets" ? 120 : 150;
      const loadTotal = loadPrice * loadQty;
      const trLoad = document.createElement("tr");
      trLoad.innerHTML = `
        <td>${loadQty}</td>
        <td>${loadName}</td>
        <td>₱${loadTotal}</td>
        <td><button class="summary-edit-btn" data-page="4" data-load="${loadName}" data-qty="${loadQty}">Edit</button></td>
      `;
      summaryTableBody.appendChild(trLoad);
      total += loadTotal;
    }

    summaryTotal.textContent = `₱${total}`;
    // rebind edit buttons
    bindSummaryEditButtons();
    // update confirm button state
    updateConfirmUI();
  }

  function bindSummaryEditButtons() {
    const editBtns = $$(".summary-edit-btn");
    editBtns.forEach(btn => {
      btn.classList.remove("locked");
      btn.onclick = (e) => {
        // If locked, ignore
        if (btn.classList.contains("locked")) return;
        const p = parseInt(btn.dataset.page, 10);
        if (p === 1) {
          prefillService(btn.dataset.service === "true");
          showPage(1);
        } else if (p === 2) {
          prefillDetergent(btn.dataset.det, parseInt(btn.dataset.qty, 10) || 1);
          showPage(2);
        } else if (p === 3) {
          prefillFab(btn.dataset.fab, parseInt(btn.dataset.qty, 10) || 1, btn.dataset.bleach === "true");
          showPage(3);
        } else if (p === 4) {
          prefillLoad(btn.dataset.load, parseInt(btn.dataset.qty, 10) || 1);
          showPage(4);
        }
      };
    });
  }

  /* -------------------------
     Prefill helpers (used by Edit)
  ------------------------- */
  function prefillDetergent(detText, qty) {
    if (!detSelect) return;
    // find option index by matching text
    const opts = Array.from(detSelect.options);
    const idx = opts.findIndex(o => o.textContent.trim() === detText);
    if (idx >= 0) detSelect.selectedIndex = idx;
    detQty = qty || 1;
    detQtySpan.textContent = detQty;
    nextToFabcon.classList.remove("hidden");
  }

  function prefillFab(fabText, qty, bleach) {
    if (!fabSelect) return;
    const opts = Array.from(fabSelect.options);
    const idx = opts.findIndex(o => o.textContent.trim() === fabText);
    if (idx >= 0) fabSelect.selectedIndex = idx;
    fabQty = qty || 1;
    fabQtySpan.textContent = fabQty;
    addBleach.checked = !!bleach;
    nextToDetails.classList.remove("hidden");
  }

  function prefillLoad(type, qty) {
    loadRadios.forEach(r => r.checked = (r.value === type));
    loadQty = qty || 1;
    loadQtySpan.textContent = loadQty;
    finishBtn.classList.remove("hidden");
  }

  function prefillService(isFull) {
    if (isFull) {
      fullService.classList.add("active");
      selfSelect.classList.remove("active");
      inclusions.classList.remove("hidden");
      stepsBox.classList.add("hidden");
    } else {
      selfSelect.classList.add("active");
      fullService.classList.remove("active");
      inclusions.classList.add("hidden");
      stepsBox.classList.remove("hidden");
    }
    nextBtn.classList.remove("hidden");
  }

  /* -------------------------
     Update Confirm UI (locking & color)
  ------------------------- */
  function updateConfirmUI() {
    if (!editSummaryBtn) return;
    if (isConfirmed) {
      editSummaryBtn.textContent = "✔ Confirmed";
      editSummaryBtn.disabled = true;
      editSummaryBtn.style.background = "#27ae60"; // green
      // lock all edit buttons visually
      $$(".summary-edit-btn").forEach(b => {
        b.classList.add("locked");
        b.disabled = true;
        b.style.opacity = "0.6";
        b.style.pointerEvents = "none";
      });
    } else {
      editSummaryBtn.textContent = "Confirm (Review)";
      editSummaryBtn.disabled = false;
      editSummaryBtn.style.background = ""; // reset
      $$(".summary-edit-btn").forEach(b => {
        b.classList.remove("locked");
        b.disabled = false;
        b.style.opacity = "";
        b.style.pointerEvents = "";
      });
    }
  }

  /* -------------------------
     Event wiring: page1
  ------------------------- */
  if (fullService) {
    fullService.addEventListener("click", () => {
      fullService.classList.add("active");
      selfSelect.classList.remove("active");
      inclusions && inclusions.classList.remove("hidden");
      stepsBox && stepsBox.classList.add("hidden");
      nextBtn && nextBtn.classList.remove("hidden");
    });
  }
  if (selfSelect) {
    selfSelect.addEventListener("click", () => {
      selfSelect.classList.add("active");
      fullService.classList.remove("active");
      inclusions && inclusions.classList.add("hidden");
      stepsBox && stepsBox.classList.remove("hidden");
      nextBtn && nextBtn.classList.remove("hidden");
      $$(".step-btn").forEach(btn => btn.classList.remove("selected"));
    });
  }
  $$(".step-btn").forEach(btn => btn.addEventListener("click", () => btn.classList.toggle("selected")));
  nextBtn && nextBtn.addEventListener("click", () => {
    if ((fullService && fullService.classList.contains("active")) || (selfSelect && selfSelect.classList.contains("active"))) {
      showPage(2);
    }
  });

  /* -------------------------
     Event wiring: page2
  ------------------------- */
  if (plusDet) plusDet.addEventListener("click", () => { detQty++; detQtySpan.textContent = detQty; });
  if (minusDet) minusDet.addEventListener("click", () => { if (detQty > 1) detQty--; detQtySpan.textContent = detQty; });
  if (detSelect) detSelect.addEventListener("change", () => { if (detSelect.value !== "") nextToFabcon.classList.remove("hidden"); else nextToFabcon.classList.add("hidden"); });
  if (nextToFabcon) nextToFabcon.addEventListener("click", () => showPage(3));
  if (backToPage1) backToPage1.addEventListener("click", () => showPage(1));

  /* -------------------------
     Event wiring: page3
  ------------------------- */
  if (plusFab) plusFab.addEventListener("click", () => { fabQty++; fabQtySpan.textContent = fabQty; });
  if (minusFab) minusFab.addEventListener("click", () => { if (fabQty > 1) fabQty--; fabQtySpan.textContent = fabQty; });
  if (fabSelect) fabSelect.addEventListener("change", () => { if (fabSelect.value !== "") nextToDetails.classList.remove("hidden"); else nextToDetails.classList.add("hidden"); });
  if (nextToDetails) nextToDetails.addEventListener("click", () => showPage(4));
  if (backToPage2) backToPage2.addEventListener("click", () => showPage(2));

  /* -------------------------
     Event wiring: page4
  ------------------------- */
  if (plusLoad) plusLoad.addEventListener("click", () => { loadQty++; loadQtySpan.textContent = loadQty; });
  if (minusLoad) minusLoad.addEventListener("click", () => { if (loadQty > 1) loadQty--; loadQtySpan.textContent = loadQty; });
  if (loadRadios && loadRadios.length) {
    loadRadios.forEach(r => r.addEventListener("change", () => finishBtn && finishBtn.classList.remove("hidden")));
  }
  if (backToPage3) backToPage3.addEventListener("click", () => showPage(3));

  /* When pressing Finish -> render summary (page 5) */
  if (finishBtn) finishBtn.addEventListener("click", () => {
    renderSummary();
    isConfirmed = false; // reset confirm on new summary
    updateConfirmUI();
    showPage(5);
  });

  /* -------------------------
     Page5: confirm / edit / next
  ------------------------- */
  if (editSummaryBtn) {
    editSummaryBtn.addEventListener("click", () => {
      // clicking Confirm makes the button green and locks edits
      isConfirmed = true;
      updateConfirmUI();
    });
  }

  if (toContactBtn) {
    toContactBtn.addEventListener("click", () => {
      // NEXT to contact page (page6) — we DO NOT require confirmation to proceed
      showPage(6);
    });
  }
  if (backToPage4) backToPage4.addEventListener("click", () => showPage(4));

  /* -------------------------
     Page6: submit order -> page7 (ticket + receipt fill)
  ------------------------- */
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener("click", () => {
      // gather info
      const name = $("#fullName") ? $("#fullName").value.trim() : "";
      const contact = $("#contactNumber") ? $("#contactNumber").value.trim() : "";
      const address = $("#completeAddress") ? $("#completeAddress").value.trim() : "";
      const payment = $("#paymentMode") ? $("#paymentMode").selectedOptions[0].textContent.trim() : "";

      // calculated amount is string with "₱", remove it
      const amountText = summaryTotal ? summaryTotal.textContent.replace("₱", "").trim() : "0";
      const amount = parseFloat(amountText.replace(/,/g, "")) || 0;

      // generate ticket
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      if (ticketNumberEl) ticketNumberEl.textContent = ticketNum;

      // save to localStorage orders
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      orders.push({
        ticket: String(ticketNum),
        name,
        contact,
        address,
        amount,
        service: (fullService && fullService.classList.contains("active")) ? "Full Service" : "Self Select",
        status: "Pending"
      });
      localStorage.setItem("orders", JSON.stringify(orders));

      // Fill receipt fields (if present)
      if (r_ticket) r_ticket.textContent = ticketNum;
      if (r_name) r_name.textContent = name || "—";
      if (r_contact) r_contact.textContent = contact || "—";
      if (r_address) r_address.textContent = address || "—";
      if (r_payment) r_payment.textContent = payment || "—";
      if (r_amount) r_amount.textContent = amount;
      if (r_date) r_date.textContent = (new Date()).toLocaleString();

      // reset confirmation flag? keep as is (user already confirmed or not)
      // show ticket page
      showPage(7);
    });
  }

  if (backToPage5) backToPage5.addEventListener("click", () => showPage(5));

  /* -------------------------
     Track button
  ------------------------- */
  if (trackBtn) {
    trackBtn.addEventListener("click", () => {
      window.location.href = "tracklaundry.html";
    });
  }

  /* -------------------------
     Download receipt (html2canvas + jspdf)
     Hide the download button before capture so it's not included.
  ------------------------- */
  if (downloadReceiptBtn && receiptBox) {
    downloadReceiptBtn.addEventListener("click", async () => {
      // hide button (so it's not in image)
      const prevDisplay = downloadReceiptBtn.style.display || "";
      downloadReceiptBtn.style.display = "none";

      // small delay to allow reflow
      await new Promise(res => setTimeout(res, 150));

      // capture
      try {
        const canvas = await html2canvas(receiptBox, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        // jspdf: use mm or px. We'll create small receipt sized pdf
        const pdf = new jspdf.jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [380, 600]
        });

        pdf.addImage(imgData, "PNG", 10, 10, 360, 560);
        pdf.save(`Laundry-Receipt-${r_ticket ? r_ticket.textContent : Date.now()}.pdf`);
      } catch (err) {
        console.error("Receipt download failed:", err);
        alert("Error generating receipt. Check console for details.");
      } finally {
        // restore button
        downloadReceiptBtn.style.display = prevDisplay;
      }
    });
  }

  /* -------------------------
     Initial view
  ------------------------- */
  showPage(1);

  /* -------------------------
     Accessibility: keep summary updated when user changes selections
  ------------------------- */
  if (detSelect) detSelect.addEventListener("change", () => { /* nothing needed, summary updated on Finish */ });
  if (fabSelect) fabSelect.addEventListener("change", () => { /* nothing */ });
  if (addBleach) addBleach.addEventListener("change", () => { /* nothing */ });

  // optional: update total in real-time (if you want)
  // const watchInputs = [detSelect, fabSelect, addBleach, ...loadRadios];
  // watchInputs.forEach(el => el && el.addEventListener('change', () => {/*update UI*/}));

}); // DOMContentLoaded end
