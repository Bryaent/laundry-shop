// =====================================================
// ADMIN PRICING SYNC — load first before anything else
// =====================================================
function loadPricingFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('laundryPricing'));
    if (!saved) return console.log('No admin pricing found');

    if (Array.isArray(saved.step1)) {
      stepContents[1].items.forEach((item, i) => {
        if (item.name === 'Personal Choice') return;
        if (saved.step1[i] !== undefined) stepContents[1].items[i].price = saved.step1[i];
      });
    }

    if (Array.isArray(saved.step2)) {
      stepContents[2].items.forEach((item, i) => {
        if (saved.step2[i] !== undefined) stepContents[2].items[i].price = saved.step2[i];
      });
    }

    if (Array.isArray(saved.step3)) {
      stepContents[3].items.forEach((item, i) => {
        if (saved.step3[i] !== undefined) stepContents[3].items[i].price = saved.step3[i];
      });
    }

    if (saved.deliveryFee !== undefined) deliveryFee = saved.deliveryFee;

    console.log('✅ PRICES UPDATED:', {
      Ariel: stepContents[1].items[0].price,
      Downy: stepContents[2].items[0].price,
      'Quick Wash': stepContents[3].items[0].price
    });

    if (isConfirmed) renderConfirmation();
    else updateStepUI();

  } catch (e) {
    console.log('Pricing load failed:', e);
  }
}

// =====================================================
// STATE
// =====================================================
let isConfirmed   = false;
let orderQuantity = 1;
let kg            = 1;
let deliveryFee   = 0;

const carouselPage = { 1: 0, 2: 0, 3: 0 };

// =====================================================
// USER SELECTIONS
// =====================================================
const selections = {
  1: [],   // soaps (multiple)
  2: [],   // fabcon (multiple)
  3: null  // wash type (single)
};

// =====================================================
// STEP CONTENTS
// =====================================================
const stepContents = {
  1: {
    title: "Select Your Laundry Soap",
    text: "Choose your preferred detergent. You may select multiple.",
    multi: true,
    items: [
      { name: "Ariel",  img: "../img/Ariel.jpg",  price: 20, desc: "Powerful stain removal trusted by families." },
      { name: "Tide",   img: "../img/tide.jpg",   price: 25, desc: "Superior clean even in cold water." },
      { name: "Breeze", img: "../img/breeze.jpg", price: 18, desc: "Gentle on fabrics, tough on stains." },
      { name: "Surf",   img: "../img/surf.jpg",   price: 15, desc: "Affordable cleaning with a fresh scent." },
      { name: "Pride",  img: "../img/pride.jpg",  price: 17, desc: "Everyday clean at a great value." },
      { name: "Wings",  img: "../img/wings.jpg",  price: 16, desc: "Trusted Filipino detergent for daily use." }
    ]
  },

  2: {
    title: "Select Fabric Conditioner",
    text: "Choose your preferred fabric conditioner. You may select multiple.",
    multi: true,
    items: [
      { name: "Downy",           img: "../img/downy.jpg",    price: 30, desc: "Softens with a lasting fresh fragrance." },
      { name: "Del",             img: "../img/del.jpg",      price: 20, desc: "Gentle conditioner for smooth, soft fabrics." },
      { name: "Champion",        img: "../img/champ.jpg",    price: 22, desc: "Long-lasting scent all day long." },
      { name: "Surf Fabcon",     img: "../img/serf.jpg",     price: 18, desc: "Fresh scent with softening care." },
      { name: "Lala Fabcon",     img: "../img/lala.jpg",     price: 15, desc: "Mild and budget-friendly conditioner." },
      { name: "Personal Choice", img: "../img/personal.jpg", price: 0,  desc: "Bring your own fabric conditioner." }
    ]
  },

  3: {
    title: "Select Wash Type",
    text: "Choose your wash preference.",
    multi: false,
    items: [
      { name: "Quick Wash",   img: "../img/quick.jpg",   price: 50,  desc: "Fast 30-min cycle for lightly soiled clothes." },
      { name: "Deep Clean",   img: "../img/deep.jpg",    price: 80,  desc: "Thorough wash for heavily soiled garments." },
      { name: "Premium Wash", img: "../img/premium.jpg", price: 120, desc: "Top-tier care with premium fabric-safe detergents." },
      { name: "Eco Wash",     img: "../img/eco.jpg",     price: 60,  desc: "Energy-efficient, kind to the planet." },
      { name: "Cold Wash",    img: "../img/cold.jpg",    price: 40,  desc: "Gentle cold cycle, ideal for colored fabrics." },
      { name: "Hot Wash",     img: "../img/hot.jpg",     price: 70,  desc: "High-temp wash that eliminates bacteria." }
    ]
  }
};

const paymentItems = [
  { name: "Cash",  note: "Pay upon pickup or delivery", icon: "&#8369;", price: 0 },
  { name: "GCash", note: "+&#8369;5 processing fee",    icon: "G",       price: 5 }
];

let selectedPayment = "Cash";

// =====================================================
// SIDEBAR — 4 steps
// =====================================================
const sidebarMeta = [
  { label: "Laundry Soap",       hint: "Step 1" },
  { label: "Fabric Conditioner", hint: "Step 2" },
  { label: "Wash Type",          hint: "Step 3" },
  { label: "Confirm Order",      hint: "Step 4" }
];

function isStepDone(n) {
  if (n === 1) return selections[1].length > 0;
  if (n === 2) return selections[2].length > 0;
  if (n === 3) return !!selections[3];
  if (n === 4) return selections[1].length > 0 && selections[2].length > 0 && !!selections[3];
  return false;
}

function renderSidebar(activeStep) {
  const sidebar = document.getElementById('stepsSidebar');
  if (!sidebar) return;

  let html = '<div class="sidebar-label">Your Progress</div>';

  sidebarMeta.forEach((s, i) => {
    const n    = i + 1;
    const done = isStepDone(n);
    const circleClass = done ? 'done' : (n === activeStep ? 'active' : '');
    const isLast = n === sidebarMeta.length;

    html += `
      <div class="step-item">
        <div class="step-connector">
          <div class="step-circle ${circleClass}">${done ? '&#10003;' : n}</div>
          ${!isLast ? `<div class="step-line${done ? ' done' : ''}"></div>` : ''}
        </div>
        <button class="step-btn${n === activeStep ? ' active' : ''}" onclick="sidebarClick(${n})">
          <span class="step-name">${s.label}</span>
          <span class="step-hint">${s.hint}</span>
        </button>
      </div>`;
  });

  sidebar.innerHTML = html;
}

function sidebarClick(n) {
  const id = n <= 3 ? `section-step-${n}` : 'section-proceed';
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================================================
// TOTALS
// =====================================================
function getSubtotal() {
  let t = 0;
  selections[1].forEach(i => t += i.price * i.qty);
  selections[2].forEach(i => t += i.price * i.qty);
  if (selections[3]) t += selections[3].price;
  const pay = paymentItems.find(p => p.name === selectedPayment);
  if (pay) t += pay.price;
  return t;
}

function getTotal() {
  return getSubtotal() * orderQuantity + (kg > 8 ? 5 : 0) + deliveryFee;
}

function updateTotalLive() {
  const el = document.getElementById('totalLive');
  if (el) el.innerHTML = '&#8369;' + getTotal().toLocaleString();
}

// =====================================================
// CAROUSEL
// =====================================================
function applyCarousel(step) {
  const track   = document.getElementById(`track-${step}`);
  const winEl   = document.getElementById(`win-${step}`);
  const prevBtn = document.getElementById(`prev-${step}`);
  const nextBtn = document.getElementById(`next-${step}`);
  const dotsEl  = document.getElementById(`dots-${step}`);
  if (!track || !winEl) return;

  const total = stepContents[step].items.length;
  const pages = Math.ceil(total / 3);
  const page  = carouselPage[step];

  const winW  = winEl.offsetWidth;
  const cardW = (winW - 28) / 3;
  const shift = page * ((cardW + 14) * 3);

  track.style.transform = `translateX(-${shift}px)`;

  if (prevBtn) prevBtn.disabled = page === 0;
  if (nextBtn) nextBtn.disabled = page >= pages - 1;

  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let d = 0; d < pages; d++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (d === page ? ' active' : '');
      dot.onclick = () => { carouselPage[step] = d; applyCarousel(step); };
      dotsEl.appendChild(dot);
    }
  }
}

function slidePrev(step) {
  if (carouselPage[step] > 0) { carouselPage[step]--; applyCarousel(step); }
}

function slideNext(step) {
  const pages = Math.ceil(stepContents[step].items.length / 3);
  if (carouselPage[step] < pages - 1) { carouselPage[step]++; applyCarousel(step); }
}

function initCarousels() {
  requestAnimationFrame(() => {
    [1, 2, 3].forEach(s => applyCarousel(s));
  });
}

// =====================================================
// CARD BUILDERS
// =====================================================
function buildMultiCard(step, item, index) {
  const isAdded = !!selections[step].find(i => i.name === item.name);
  return `
    <div class="product-card${isAdded ? ' is-added' : ''}" id="card-${step}-${index}">
      <div class="card-img-area">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='../img/placeholder.jpg'">
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-qty-row">
          <button onclick="handleQty(${step},${index},-1)">&#8722;</button>
          <input type="number" id="qty-${step}-${index}" value="1" min="1" readonly>
          <button onclick="handleQty(${step},${index},1)">&#43;</button>
        </div>
        <div class="card-footer">
          <div class="card-price">${item.price > 0 ? '&#8369;' + item.price : 'Free'}</div>
          <button id="addBtn-${step}-${index}"
            class="card-add-btn${isAdded ? ' added' : ''}"
            onclick="addItem(${step},${index})"
            ${isAdded ? 'disabled' : ''}>
            ${isAdded ? 'Added &#10003;' : 'Add'}
          </button>
        </div>
      </div>
    </div>`;
}

function buildSingleCard(step, item, index) {
  const isSel = selections[step]?.name === item.name;
  return `
    <div class="product-card${isSel ? ' is-selected' : ''}" id="card-${step}-${index}">
      <div class="card-img-area">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='../img/placeholder.jpg'">
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-footer">
          <div class="card-price">${item.price > 0 ? '&#8369;' + item.price : 'Free'}</div>
          <button id="selBtn-${step}-${index}"
            class="card-add-btn${isSel ? ' selected-single' : ''}"
            onclick="selectItem(${step},${index})">
            ${isSel ? 'Selected &#10003;' : 'Select'}
          </button>
        </div>
      </div>
    </div>`;
}

// =====================================================
// MULTI-ITEM ACTIONS
// =====================================================
function handleQty(step, index, delta) {
  if (selections[step].find(i => i.name === stepContents[step].items[index].name)) {
    alert('Remove the item first before editing quantity.');
    return;
  }
  const inp = document.getElementById(`qty-${step}-${index}`);
  inp.value = Math.max(1, parseInt(inp.value) + delta);
}

function addItem(step, index) {
  const item = stepContents[step].items[index];
  const inp  = document.getElementById(`qty-${step}-${index}`);
  const qty  = Math.max(1, parseInt(inp.value) || 1);
  if (selections[step].find(i => i.name === item.name)) return;
  selections[step].push({ ...item, qty });

  const btn  = document.getElementById(`addBtn-${step}-${index}`);
  const card = document.getElementById(`card-${step}-${index}`);
  if (btn)  { btn.classList.add('added'); btn.innerHTML = 'Added &#10003;'; btn.disabled = true; }
  if (card) card.classList.add('is-added');
  refreshSummary(step);
  renderSidebar(getCurrentStep());
}

function removeItem(step, name) {
  const index = stepContents[step].items.findIndex(i => i.name === name);
  selections[step] = selections[step].filter(i => i.name !== name);
  const btn  = document.getElementById(`addBtn-${step}-${index}`);
  const inp  = document.getElementById(`qty-${step}-${index}`);
  const card = document.getElementById(`card-${step}-${index}`);
  if (btn)  { btn.classList.remove('added'); btn.innerHTML = 'Add'; btn.disabled = false; }
  if (inp)  inp.value = 1;
  if (card) card.classList.remove('is-added');
  refreshSummary(step);
  renderSidebar(getCurrentStep());
}

function refreshSummary(step) {
  const box = document.getElementById(`summary-${step}`);
  if (!box) return;
  if (selections[step].length === 0) {
    box.innerHTML = '<p style="font-size:12px;color:#64748b;">No items selected yet.</p>';
    return;
  }
  box.innerHTML = `
    <h4>Selected Items</h4>
    ${selections[step].map(item => `
      <div class="summary-item-row">
        <div class="si-left">
          <strong>${item.name}</strong>
          <span>Qty: ${item.qty}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="si-price">&#8369;${item.price * item.qty}</div>
          <button class="remove-btn" onclick="removeItem(${step},'${item.name}')">Remove</button>
        </div>
      </div>`).join('')}
    <div class="running-total-row">Running total: &#8369;${getTotal().toLocaleString()}</div>`;
}

// =====================================================
// SINGLE SELECT
// =====================================================
function selectItem(step, index) {
  selections[step] = stepContents[step].items[index];
  stepContents[step].items.forEach((_, i) => {
    const btn  = document.getElementById(`selBtn-${step}-${i}`);
    const card = document.getElementById(`card-${step}-${i}`);
    const isSel = i === index;
    if (btn)  { btn.classList.toggle('selected-single', isSel); btn.innerHTML = isSel ? 'Selected &#10003;' : 'Select'; }
    if (card) card.classList.toggle('is-selected', isSel);
  });
  renderSidebar(getCurrentStep());
}

// =====================================================
// PERSONAL CHOICE
// =====================================================
function usePersonalChoice(step) {
  if (!selections[step].find(i => i.name === 'Personal Choice')) {
    selections[step].push({ name: 'Personal Choice', img: '', price: 0, desc: '', qty: 1 });
  }
  refreshSummary(step);
  renderSidebar(getCurrentStep());
  const next = document.getElementById(`section-step-${step + 1}`);
  if (next) next.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =====================================================
// SCROLL SYNC
// =====================================================
let _observer = null;

function getCurrentStep() {
  for (let s = 1; s <= 3; s++) {
    const el = document.getElementById(`section-step-${s}`);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.6 && r.bottom > 0) return s;
  }
  return 1;
}

function initScrollSync() {
  if (_observer) _observer.disconnect();

  _observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const step = parseInt(e.target.dataset.step);
        renderSidebar(step);
      }
    });
  }, { threshold: 0.25 });

  for (let s = 1; s <= 3; s++) {
    const el = document.getElementById(`section-step-${s}`);
    if (el) _observer.observe(el);
  }

  const proceed = document.getElementById('section-proceed');
  if (proceed) {
    const o2 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) renderSidebar(4);
    }, { threshold: 0.3 });
    o2.observe(proceed);
  }
}

// =====================================================
// RENDER ALL STEPS
// =====================================================
function renderAllSteps() {
  const content = document.getElementById('bookContent');
  let html = '';

  for (let s = 1; s <= 3; s++) {
    const data    = stepContents[s];
    const isMulti = data.multi;
    const cards   = data.items.map((item, i) =>
      isMulti ? buildMultiCard(s, item, i) : buildSingleCard(s, item, i)
    ).join('');

    html += `
      <div class="step-section" id="section-step-${s}" data-step="${s}">
        <div class="section-head">
          <div class="section-num" id="badge-${s}">${s}</div>
          <div>
            <div class="section-title">${data.title}</div>
            <div class="section-sub">${data.text}</div>
          </div>
        </div>

        <div class="carousel-shell">
          <button class="carousel-nav-btn" id="prev-${s}" onclick="slidePrev(${s})">&#8249;</button>
          <div class="carousel-window" id="win-${s}">
            <div class="carousel-track" id="track-${s}">
              ${cards}
            </div>
          </div>
          <button class="carousel-nav-btn" id="next-${s}" onclick="slideNext(${s})">&#8250;</button>
        </div>

        <div class="carousel-dots" id="dots-${s}"></div>

        ${isMulti ? `
          <div class="multi-summary" id="summary-${s}">
            <p style="font-size:12px;color:#64748b;">No items selected yet.</p>
          </div>
          ${s === 1 || s === 2 ? `
            <button class="btn-personal-choice" onclick="usePersonalChoice(${s})">
              &#129514; Use Personal Choice &mdash; Bring Your Own
            </button>` : ''}
        ` : ''}
      </div>`;
  }

  html += `
    <div class="proceed-btn-wrap" id="section-proceed">
      <p style="font-size:13px;color:#64748b;margin-bottom:14px;">Review your selections above, then proceed to confirmation.</p>
      <button class="proceed-to-confirm" onclick="goToConfirmation()">Proceed to Confirmation &rarr;</button>
    </div>`;

  content.innerHTML = html;
  renderSidebar(1);
  initCarousels();
  initScrollSync();

  window.addEventListener('resize', () => {
    [1, 2, 3].forEach(s => applyCarousel(s));
  });
}

// =====================================================
// VALIDATION
// =====================================================
function goToConfirmation() {
  if (selections[1].length === 0) { alert('Please select at least one Laundry Soap (or use Personal Choice).'); return; }
  if (selections[2].length === 0) { alert('Please select at least one Fabric Conditioner (or use Personal Choice).'); return; }
  if (!selections[3])             { alert('Please select a Wash Type.'); return; }
  if (_observer) _observer.disconnect();
  isConfirmed = true;
  renderSidebar(4);
  renderConfirmation();
}

// =====================================================
// CONFIRMATION
// =====================================================
function renderConfirmation() {
  const content = document.getElementById('bookContent');

  const soapRows = selections[1].map(item => `
    <div class="confirm-item-row">
      <div><strong>${item.name}</strong></div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button class="conf-qty-btn" onclick="confirmChangeQty(1,'${item.name}',-1)">&#8722;</button>
        <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center;">${item.qty}</span>
        <button class="conf-qty-btn" onclick="confirmChangeQty(1,'${item.name}',1)">&#43;</button>
        <div class="confirm-item-price">&#8369;${item.price * item.qty}</div>
        <button class="remove-btn" onclick="confirmRemoveItem(1,'${item.name}')">Remove</button>
      </div>
    </div>`).join('');

  const fabconRows = selections[2].map(item => `
    <div class="confirm-item-row">
      <div><strong>${item.name}</strong></div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
        <button class="conf-qty-btn" onclick="confirmChangeQty(2,'${item.name}',-1)">&#8722;</button>
        <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center;">${item.qty}</span>
        <button class="conf-qty-btn" onclick="confirmChangeQty(2,'${item.name}',1)">&#43;</button>
        <div class="confirm-item-price">&#8369;${item.price * item.qty}</div>
        <button class="remove-btn" onclick="confirmRemoveItem(2,'${item.name}')">Remove</button>
      </div>
    </div>`).join('');

  const washOpts = stepContents[3].items.map(i =>
    `<option value="${i.name}" ${selections[3]?.name === i.name ? 'selected' : ''}>${i.name} &mdash; &#8369;${i.price}</option>`
  ).join('');

  const payOpts = paymentItems.map(p => `
    <div class="payment-option${selectedPayment === p.name ? ' selected' : ''}" onclick="selectPayment('${p.name}')">
      <div class="payment-icon">${p.icon}</div>
      <div>
        <div class="payment-name">${p.name}</div>
        <div class="payment-note">${p.note}</div>
      </div>
    </div>`).join('');

  content.innerHTML = `
    <button class="btn-back" onclick="goBack()">&#8592; Back to Edit</button>
    <div class="confirm-layout">

      <div class="confirm-form">
        <h2>Order Details</h2>

        <label>Full Name</label>
        <input id="custName" placeholder="Enter your full name">

        <label>Address</label>
        <input id="custAddress" placeholder="Enter your complete address">

        <label>Delivery Method</label>
        <select id="pickupType" onchange="toggleDelivery(this.value)">
          <option value="store"    ${deliveryFee === 0  ? 'selected' : ''}>Store Pickup &mdash; Free</option>
          <option value="delivery" ${deliveryFee === 40 ? 'selected' : ''}>Home Delivery &mdash; +&#8369;40</option>
        </select>

        <label>Pickup Schedule</label>
        <select id="pickupSchedule">
          <option value="Morning">Morning (7 AM &ndash; 12 PM)</option>
          <option value="Afternoon">Afternoon (12 PM &ndash; 5 PM)</option>
          <option value="Evening">Evening (5 PM &ndash; 9 PM)</option>
          <option value="Express">Express &mdash; within 2 hrs (+&#8369;50)</option>
        </select>

        <label>Load Weight (kg)</label>
        <div class="qty-control">
          <button onclick="updateKg(${kg - 1})" ${kg <= 1 ? 'disabled' : ''}>&#8722;</button>
          <input type="number" id="kgInput" value="${kg}" min="1" onchange="updateKg(this.value)">
          <button onclick="updateKg(${kg + 1})">&#43;</button>
        </div>
        ${kg > 8 ? '<p style="color:red;font-size:13px;margin-top:-5px;">&#9888; +&#8369;5 charge above 8 kg.</p>' : ''}

        <label>Number of Orders</label>
        <div class="qty-control">
          <button onclick="changeQty(-1)" ${orderQuantity <= 1 ? 'disabled' : ''}>&#8722;</button>
          <input type="text" id="qtyDisplay" value="${orderQuantity}" readonly>
          <button onclick="changeQty(1)" ${orderQuantity >= 4 ? 'disabled' : ''}>&#43;</button>
        </div>

        <div style="background:#fff9e6;border:1.5px solid #f5d87a;border-radius:9px;padding:12px 14px;font-size:12px;color:#7a5c00;margin-top:16px;line-height:1.6;">
          All selections can still be changed below. Once you press <strong>Confirm Final Order</strong>, your booking will be submitted.
        </div>
      </div>

      <div class="confirmation-box">
        <h2>Order Summary</h2>
        <p style="font-size:12px;color:#64748b;margin-bottom:16px;">Review and edit your selections below.</p>

        <div class="confirm-section">
          <div class="confirm-section-title">Laundry Soap</div>
          ${soapRows || '<p style="font-size:12px;color:#64748b;">None selected.</p>'}
        </div>

        <div class="confirm-section">
          <div class="confirm-section-title">Fabric Conditioner</div>
          ${fabconRows || '<p style="font-size:12px;color:#64748b;">None selected.</p>'}
        </div>

        <div class="confirm-section">
          <div class="confirm-section-title">Wash Type</div>
          <select class="confirm-select" onchange="updateSingleSelection(3,this.value)">${washOpts}</select>
        </div>

        <div class="confirm-section">
          <div class="confirm-section-title">Payment Method</div>
          <div class="payment-options">${payOpts}</div>
        </div>

        <div class="confirm-total-bar">
          <strong>GRAND TOTAL</strong>
          <span id="totalLive">&#8369;${getTotal().toLocaleString()}</span>
        </div>

        <button class="confirm-btn" onclick="confirmFinalOrder()">&#10004; CONFIRM FINAL ORDER</button>
      </div>
    </div>`;
}

// =====================================================
// BACK
// =====================================================
function goBack() {
  isConfirmed = false;
  renderAllSteps();
  setTimeout(() => {
    [1, 2].forEach(s => {
      selections[s].forEach(item => {
        const idx = stepContents[s].items.findIndex(i => i.name === item.name);
        if (idx === -1) return;
        const btn  = document.getElementById(`addBtn-${s}-${idx}`);
        const card = document.getElementById(`card-${s}-${idx}`);
        if (btn)  { btn.classList.add('added'); btn.innerHTML = 'Added &#10003;'; btn.disabled = true; }
        if (card) card.classList.add('is-added');
      });
      refreshSummary(s);
    });
    if (selections[3]) {
      const idx = stepContents[3].items.findIndex(i => i.name === selections[3].name);
      if (idx !== -1) {
        const btn  = document.getElementById(`selBtn-3-${idx}`);
        const card = document.getElementById(`card-3-${idx}`);
        if (btn)  { btn.classList.add('selected-single'); btn.innerHTML = 'Selected &#10003;'; }
        if (card) card.classList.add('is-selected');
      }
    }
  }, 60);
}

// =====================================================
// CONFIRMATION HELPERS
// =====================================================
function toggleDelivery(val)      { deliveryFee = val === 'delivery' ? 40 : 0; updateTotalLive(); }
function updateKg(val)            { kg = Math.max(1, parseInt(val) || 1); renderConfirmation(); }
function changeQty(delta)         { orderQuantity = Math.min(4, Math.max(1, orderQuantity + delta)); const d = document.getElementById('qtyDisplay'); if (d) d.value = orderQuantity; updateTotalLive(); }
function selectPayment(name)      { selectedPayment = name; document.querySelectorAll('.payment-option').forEach(el => el.classList.toggle('selected', el.getAttribute('onclick')?.includes(`'${name}'`))); updateTotalLive(); }
function updateSingleSelection(step, value) { const item = stepContents[step].items.find(i => i.name === value); if (item) selections[step] = item; updateTotalLive(); }
function confirmRemoveItem(step, name)      { selections[step] = selections[step].filter(i => i.name !== name); renderConfirmation(); }
function confirmChangeQty(step, name, delta){ const item = selections[step].find(i => i.name === name); if (item) item.qty = Math.max(1, item.qty + delta); renderConfirmation(); }

function updateStepUI() {
  // Refresh visible prices after pricing update without full re-render
  if (!isConfirmed) renderAllSteps();
}

// =====================================================
// FINAL ORDER
// =====================================================
function confirmFinalOrder() {
  const name     = document.getElementById('custName')?.value?.trim();
  const address  = document.getElementById('custAddress')?.value?.trim();
  const schedule = document.getElementById('pickupSchedule')?.value || 'Morning';

  if (!name || !address)          { alert('Please enter your full name and address.'); return; }
  if (selections[1].length === 0) { alert('Laundry soap is empty. Please go back.'); return; }
  if (selections[2].length === 0) { alert('Fabric conditioner is empty. Please go back.'); return; }
  if (!selections[3])             { alert('No wash type selected. Please go back.'); return; }

  // If GCash, open modal first; Cash goes directly to finalize
  if (selectedPayment === 'GCash') {
    openGcashModal();
  } else {
    finalizeOrder();
  }
}

// =====================================================
// FIX: finalizeOrder — handles BOTH Cash and GCash
// Cash: saves immediately with payment:'Cash'
// GCash: called from submitGcashPayment() after modal
// =====================================================
function finalizeOrder() {
  const name          = document.getElementById('custName')?.value?.trim();
  const address       = document.getElementById('custAddress')?.value?.trim();
  const schedule      = document.getElementById('pickupSchedule')?.value || 'Morning';
  const expressCharge = schedule === 'Express' ? 50 : 0;
  const ticketNumber  = Math.floor(100 + Math.random() * 900).toString();

  const newOrder = {
    ticket:     ticketNumber,
    name,
    address,
    service:    selections[3]?.name || 'Laundry Service',
    soap:       selections[1].map(i => `${i.name} x${i.qty}`).join(', '),
    fabcon:     selections[2].map(i => `${i.name} x${i.qty}`).join(', '),
    pickup:     schedule,
    // ── FIX: always store proper case "Cash" or "GCash" ──
    payment:    selectedPayment,
    kg,
    quantity:   orderQuantity,
    amount:     getTotal() + expressCharge,
    status:     'Pending',
    pickupType: deliveryFee === 40 ? 'Home Delivery' : 'Store Pickup',
    date:       new Date().toISOString()
  };

  // ── FIX: Attach GCash details if payment is GCash ──
  if (selectedPayment === 'GCash' && window._gcashPaymentDetails) {
    newOrder.gcash = window._gcashPaymentDetails;
    window._gcashPaymentDetails = null;
  }

  // Deduct stocks
  deductStocksFromOrder(newOrder);

  // Save to localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(newOrder);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Try to save to backend
  fetch('http://localhost/HTML1/PHP/laundry-shop/FINALWEBSITE/PHP/orders.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(newOrder)
  })
    .then(r => r.json())
    .then(d => console.log('Saved to DB:', d))
    .catch(e => console.log('DB Error (order still saved locally):', e));

  alert(
    `ORDER CONFIRMED!\n\nTicket: #${ticketNumber}\nCustomer: ${name}\nTotal: ₱${newOrder.amount.toLocaleString()}\n\nYou can now track your laundry.`
  );
  window.location.href = `../HTML/tracklaundry.html?ticket=${ticketNumber}`;
}

// =====================================================
// STOCK DEDUCTION
// =====================================================
function deductStocksFromOrder(order) {
  try {
    const stocks = JSON.parse(localStorage.getItem('laundryStocks') || '{}');

    const soapKeys = [
      { name: 'Ariel',  key: 'stock-soap-ariel'  },
      { name: 'Tide',   key: 'stock-soap-tide'   },
      { name: 'Breeze', key: 'stock-soap-breeze' },
      { name: 'Surf',   key: 'stock-soap-surf'   },
      { name: 'Pride',  key: 'stock-soap-pride'  },
      { name: 'Wings',  key: 'stock-soap-wings'  },
    ];

    const fabconKeys = [
      { name: 'Downy',         key: 'stock-fabcon-downy'           },
      { name: 'Del',           key: 'stock-fabcon-del'             },
      { name: 'Champion',      key: 'stock-fabcon-champion'        },
      { name: 'Surf Fabcon',   key: 'stock-fabcon-surf-fabcon'     },
      { name: 'Lala Fabcon',   key: 'stock-fabcon-lala-fabcon'     },
      { name: 'Del Gentle',    key: 'stock-fabcon-personal-choice' },
    ];

    selections[1].forEach(selectedItem => {
      if (selectedItem.name === 'Personal Choice') return;
      const mapping = soapKeys.find(m => m.name === selectedItem.name);
      if (!mapping) return;
      const current = parseInt(stocks[mapping.key] || 0);
      stocks[mapping.key] = Math.max(0, current - (selectedItem.qty || 1));
    });

    selections[2].forEach(selectedItem => {
      if (selectedItem.name === 'Personal Choice') return;
      const mapping = fabconKeys.find(m => m.name === selectedItem.name);
      if (!mapping) return;
      const current = parseInt(stocks[mapping.key] || 0);
      stocks[mapping.key] = Math.max(0, current - (selectedItem.qty || 1));
    });

    localStorage.setItem('laundryStocks', JSON.stringify(stocks));
    window.dispatchEvent(new CustomEvent('stocksUpdated', { detail: stocks }));
    console.log('✅ Stocks deducted:', stocks);
  } catch (e) {
    console.error('Stock deduction error:', e);
  }
}

// =====================================================
// STEP BOX CLICKS
// =====================================================
function activateStepClicks() {
  const stepBoxes = document.querySelectorAll('.step-box');
  stepBoxes.forEach((step, index) => {
    step.onclick = () => {
      if (isConfirmed) return;
      const s = index + 1;
      const el = document.getElementById(`section-step-${s}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });
}

// =====================================================
// INIT
// =====================================================
loadPricingFromStorage();
window.addEventListener('pricingUpdated', loadPricingFromStorage);
renderAllSteps();
activateStepClicks();

document.getElementById('logoutBtn')?.addEventListener('click', function (e) {
  e.preventDefault();
  if (confirm('Are you sure you want to log out?')) {
    localStorage.removeItem('loggedInUser');
    window.location.href = '../HTML/login.html';
  }
});