const ordersTable = document.querySelector("#ordersBody");
const completedOrdersTable = document.querySelector("#completedOrdersBody");

let orders = [];

// LOAD ORDERS
function loadOrders(){

    fetch("http://localhost:3000/laundry-shop/FINALWEBSITE/orders")
        .then(res => res.json())
        .then(data => {

            orders = data;

            renderOrders();
            renderRevenueChart();

        })
        .catch(err => {

            console.log("Fallback localStorage");

            orders =
                JSON.parse(localStorage.getItem("orders")) || [];

            renderOrders();
            renderRevenueChart();

        });

}

loadOrders();

// RENDER ORDERS
function renderOrders(){

    if(!ordersTable || !completedOrdersTable) return;

    ordersTable.innerHTML = "";
    completedOrdersTable.innerHTML = "";

    const totalOrders = orders.length;

    const completedOrders =
        orders.filter(o => o.status === "Completed").length;

    const pendingOrders =
        totalOrders - completedOrders;

    const totalRevenue =
        orders
        .filter(o => o.status === "Completed")
        .reduce((sum,o) =>
            sum + Number(o.amount || 0),0);

    document.getElementById("card-total-orders").innerText =
        totalOrders;

    document.getElementById("card-completed").innerText =
        completedOrders;

    document.getElementById("card-pending").innerText =
        pendingOrders;

    document.getElementById("card-total-revenue").innerText =
        `₱${totalRevenue.toLocaleString()}`;

    // NO ORDERS
    if(orders.length === 0){

        ordersTable.innerHTML = `
            <tr>
                <td colspan="9"
                style="text-align:center;padding:30px;">
                    No live orders
                </td>
            </tr>
        `;

        completedOrdersTable.innerHTML = `
            <tr>
                <td colspan="7"
                style="text-align:center;padding:30px;">
                    No completed orders
                </td>
            </tr>
        `;

        return;
    }

    // RENDER EACH
    orders.forEach((o,i)=>{

        const tr =
            document.createElement("tr");

        const pickupDisplay =
            o.pickupType ||
            o.delivery ||
            "Store Pickup";

        // COMPLETED
        if(o.status === "Completed"){

            tr.innerHTML = `
                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>

                <td>
                    ₱${Number(o.amount || 0).toLocaleString()}
                </td>

                <td>
                    <span class="status completed">
                        Completed
                    </span>
                </td>

                <td>${pickupDisplay}</td>
            `;

            completedOrdersTable.appendChild(tr);

        }

        // ACTIVE
        else{

            const statusClass =
                (o.status || "Pending")
                .toLowerCase()
                .replace(/\s+/g,"");

            tr.innerHTML = `

                <td>
                    <input
                    type="checkbox"
                    class="select-checkbox order-checkbox"
                    data-index="${i}">
                </td>

                <td>${o.ticket || ""}</td>
                <td>${o.name || ""}</td>
                <td>${o.contact || "N/A"}</td>
                <td>${o.service || ""}</td>

                <td>
                    ₱${Number(o.amount || 0).toLocaleString()}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${o.status || "Pending"}
                    </span>
                </td>

                <td>${pickupDisplay}</td>

                <td>

                    <button
                    class="action-btn received-btn"
                    onclick="updateStatus(${i}, 'Received')">
                        Received
                    </button>

                    <button
                    class="action-btn ready-btn"
                    onclick="updateStatus(${i}, 'Ready')">
                        Ready
                    </button>

                    <button
                    class="action-btn progress-btn"
                    onclick="updateStatus(${i}, 'In Progress')">
                        In Progress
                    </button>

                    <button
                    class="action-btn complete-btn"
                    onclick="updateStatus(${i}, 'Completed')">
                        Complete
                    </button>

                    <button
                    class="action-btn delete-btn"
                    onclick="deleteOrder(${i})">
                        Delete
                    </button>

                </td>
            `;

            ordersTable.appendChild(tr);

        }

    });

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    setupSelectAll();

}

// UPDATE STATUS
function updateStatus(i,status){

    const order = orders[i];

    if(!order) return;

    order.status = status;

    renderOrders();
    renderRevenueChart();

}

// DELETE ONE
function deleteOrder(i){

    orders.splice(i,1);

    renderOrders();
    renderRevenueChart();

}

// SELECT ALL
function setupSelectAll(){

    const selectAll =
        document.getElementById("selectAll");

    if(!selectAll) return;

    selectAll.checked = false;

    selectAll.addEventListener("change",()=>{

        const checkboxes =
            document.querySelectorAll(".order-checkbox");

        checkboxes.forEach(box=>{

            box.checked = selectAll.checked;

        });

    });

}

// DELETE SELECTED
function deleteSelectedOrders(){

    const checkedBoxes =
        document.querySelectorAll(
            ".order-checkbox:checked"
        );

    if(checkedBoxes.length === 0){

        alert("Please select orders first.");
        return;

    }

    if(!confirm("Delete selected orders?")) return;

    const indexes = [];

    checkedBoxes.forEach(box=>{

        indexes.push(
            Number(box.dataset.index)
        );

    });

    indexes.sort((a,b)=>b-a);

    indexes.forEach(i=>{

        orders.splice(i,1);

    });

    renderOrders();
    renderRevenueChart();

}

// TAB SWITCHING
const menuButtons =
    document.querySelectorAll(".menu-btn");

const tabs =
    document.querySelectorAll(".tab-content");

function switchTab(tabId){

    menuButtons.forEach(btn=>{

        btn.classList.remove("active");

    });

    tabs.forEach(tab=>{

        tab.classList.remove("active-tab");

    });

    const activeButton =
        document.querySelector(
            `[data-tab="${tabId}"]`
        );

    const activeTab =
        document.getElementById(tabId);

    if(activeButton)
        activeButton.classList.add("active");

    if(activeTab)
        activeTab.classList.add("active-tab");

}

menuButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const tab =
            button.getAttribute("data-tab");

        switchTab(tab);

    });

});

// CLICKABLE CARDS
const clickableCards =
    document.querySelectorAll(".clickable-card");

clickableCards.forEach(card=>{

    card.addEventListener("click",()=>{

        const target =
            card.getAttribute("data-tab-target");

        switchTab(target);

    });

});

// REVENUE CHART
function renderRevenueChart(){

    const ctx =
        document.getElementById("revenueChart");

    if(!ctx || typeof Chart === "undefined")
        return;

    const completed =
        orders.filter(
            o => o.status === "Completed"
        );

    const monthlyRevenue =
        new Array(12).fill(0);

    completed.forEach(order=>{

        const month =
            order.month !== undefined
                ? order.month
                : new Date().getMonth();

        monthlyRevenue[month] +=
            Number(order.amount || 0);

    });

    if(window.revenueChartInstance){

        window.revenueChartInstance.destroy();

    }

    window.revenueChartInstance =
        new Chart(ctx,{

            type:"line",

            data:{

                labels:[
                    "Jan","Feb","Mar","Apr",
                    "May","Jun","Jul","Aug",
                    "Sep","Oct","Nov","Dec"
                ],

                datasets:[{

                    label:"Monthly Revenue",

                    data:monthlyRevenue,

                    tension:0.4,

                    fill:true,

                    borderWidth:4

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false

            }

        });

}

// SEARCH
const searchInput =
    document.getElementById("searchInput");

if(searchInput){

    searchInput.addEventListener("keyup",()=>{

        const value =
            searchInput.value.toLowerCase();

        const rows =
            document.querySelectorAll(
                "#ordersBody tr"
            );

        rows.forEach(row=>{

            const text =
                row.innerText.toLowerCase();

            row.style.display =
                text.includes(value)
                ? ""
                : "none";

        });

    });

}

// INQUIRIES
const inquiriesBody =
    document.querySelector("#inquiriesBody");

let inquiries =
    JSON.parse(
        localStorage.getItem("inquiries")
    ) || [];

function renderInquiries(){

    if(!inquiriesBody) return;

    inquiriesBody.innerHTML = "";

    if(inquiries.length === 0){

        inquiriesBody.innerHTML = `
            <tr>
                <td colspan="6"
                style="text-align:center;padding:30px;">
                    No franchise inquiries
                </td>
            </tr>
        `;

        return;

    }

    inquiries.forEach((inq,i)=>{

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>${inq.fullName || ""}</td>
            <td>${inq.email || ""}</td>
            <td>${inq.contact || ""}</td>
            <td>${inq.message || ""}</td>
            <td>${inq.date || ""}</td>

            <td>

                <button
                class="action-btn delete-btn"
                onclick="deleteInquiry(${i})">

                    Delete

                </button>

            </td>
        `;

        inquiriesBody.appendChild(tr);

    });

}

renderInquiries();

function deleteInquiry(i){

    inquiries.splice(i,1);

    localStorage.setItem(
        "inquiries",
        JSON.stringify(inquiries)
    );

    renderInquiries();

}
// ===== PRICING SETTINGS SYSTEM =====
let pricingData = {};

// Load pricing on settings tab
function loadPricing() {
    try {
        pricingData = JSON.parse(localStorage.getItem('laundryPricing')) || {};
        
        // Load all pricing inputs
        loadPriceInput('soap-ariel', 'Ariel', 1, 'soap');
        loadPriceInput('soap-tide', 'Tide', 1, 'soap');
        loadPriceInput('soap-breeze', 'Breeze', 1, 'soap');
        loadPriceInput('soap-surf', 'Surf', 1, 'soap');
        loadPriceInput('soap-pride', 'Pride', 1, 'soap');
        loadPriceInput('soap-wings', 'Wings', 1, 'soap');
        
        loadPriceInput('fabcon-downy', 'Downy', 2, 'fabcon');
        loadPriceInput('fabcon-del', 'Del', 2, 'fabcon');
        loadPriceInput('fabcon-champion', 'Champion', 2, 'fabcon');
        loadPriceInput('fabcon-surf', 'Surf Fabcon', 2, 'fabcon');
        loadPriceInput('fabcon-lala', 'Lala Fabcon', 2, 'fabcon');
        loadPriceInput('fabcon-personal', 'Personal Choice', 2, 'fabcon');
        
        loadPriceInput('wash-quick', 'Quick Wash', 3, 'wash');
        loadPriceInput('wash-deep', 'Deep Clean', 3, 'wash');
        loadPriceInput('wash-premium', 'Premium Wash', 3, 'wash');
        loadPriceInput('wash-eco', 'Eco Wash', 3, 'wash');
        loadPriceInput('wash-cold', 'Cold Wash', 3, 'wash');
        loadPriceInput('wash-hot', 'Hot Wash', 3, 'wash');
        
        // Fees
        document.getElementById('delivery-fee').value = pricingData.deliveryFee || 40;
        document.getElementById('express-fee').value = pricingData.expressFee || 50;
        document.getElementById('kg-extra-fee').value = pricingData.kgExtraFee || 5;
        document.getElementById('gcash-fee').value = pricingData.gcashFee || 5;
    
    } catch (e) {
        console.log('Loading default pricing');
        resetPricing();
    }
}

function loadPriceInput(inputId, itemName, stepNum, category) {
    const input = document.getElementById(inputId);
    if (input) {
        const savedPrice = pricingData[`${category}_${itemName.toLowerCase().replace(/\s+/g, '-')}`];
        input.value = savedPrice || getDefaultPrice(stepNum, itemName);
    }
}

function getDefaultPrice(step, itemName) {
    const defaults = {
        1: { Ariel: 20, Tide: 25, Breeze: 18, Surf: 15, Pride: 17, Wings: 16 },
        2: { Downy: 30, Del: 20, Champion: 22, 'Surf Fabcon': 18, 'Lala Fabcon': 15, 'Personal Choice': 10 },
        3: { 'Quick Wash': 50, 'Deep Clean': 80, 'Premium Wash': 120, 'Eco Wash': 60, 'Cold Wash': 40, 'Hot Wash': 70 }
    };
    return defaults[step]?.[itemName] || 0;
}

function savePricing() {
    const statusEl = document.getElementById('pricingStatus');
    
    // ===== COLLECT ALL PRICES =====
    const allPricing = {
        // Step 1: Soaps
        step1: stepContents[1].items.map(item => ({name: item.name, price: parseFloat(document.getElementById(`soap-${item.name.toLowerCase().replace(/\s+/g, '-')}`)?.value) || item.price})),
        
        // Step 2: Fabcon
        step2: stepContents[2].items.map(item => ({name: item.name, price: parseFloat(document.getElementById(`fabcon-${item.name.toLowerCase().replace(/\s+/g, '-')}`)?.value) || item.price})),
        
        // Step 3: Wash
        step3: stepContents[3].items.map(item => ({name: item.name, price: parseFloat(document.getElementById(`wash-${item.name.toLowerCase().replace(/\s+/g, '-')}`)?.value) || item.price})),
        
        // Fees
        deliveryFee: parseFloat(document.getElementById('delivery-fee').value) || 40,
        expressFee: parseFloat(document.getElementById('express-fee').value) || 50,
        kgExtraFee: parseFloat(document.getElementById('kg-extra-fee').value) || 5,
        gcashFee: parseFloat(document.getElementById('gcash-fee').value) || 5,
        
    };
    
    // ===== SAVE TO LOCALSTORAGE =====
    localStorage.setItem('laundryPricing', JSON.stringify(allPricing));
    
    // ===== TRIGGER UPDATE EVENT =====
    window.dispatchEvent(new CustomEvent('pricingUpdated'));
    
    // ===== SUCCESS MESSAGE =====
    statusEl.textContent = '✅ All pricing saved! BookNow prices updated instantly.';
    statusEl.className = 'pricing-status status-success';
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 4000);
    
    console.log('💾 Pricing saved:', allPricing);
}
    
    // Save to localStorage
    localStorage.setItem('laundryPricing', JSON.stringify(pricingData));
    
    // Success feedback
    statusEl.textContent = '✅ All pricing saved successfully! Changes are now live on the booking system.';
    statusEl.className = 'pricing-status status-success';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 5000);
    
    // Trigger re-render for any open booknow pages
    window.dispatchEvent(new CustomEvent('pricingUpdated'));


function resetPricing() {
    if (!confirm('Reset all pricing to factory defaults? This cannot be undone.')) return;
    
    // Reset stepContents to original prices
    Object.assign(stepContents[1].items[0], {price: 20}); // Ariel
    Object.assign(stepContents[1].items[1], {price: 25}); // Tide
    // ... repeat for all items (or use the original structure)
    
    // Reset inputs to defaults
    document.querySelectorAll('.price-item input, .fee-item input').forEach(input => {
        const itemName = input.previousElementSibling.textContent;
        const step = input.id.includes('soap') ? 1 : input.id.includes('fabcon') ? 2 : 3;
        input.value = getDefaultPrice(step, itemName);
    });
    
    savePricing();
}

// Load pricing when settings tab is active
document.addEventListener('DOMContentLoaded', () => {
    const settingsTab = document.getElementById('settings');
    const observer = new MutationObserver(() => {
        if (settingsTab.classList.contains('active-tab')) {
            loadPricing();
            observer.disconnect();
        }
    });
    observer.observe(settingsTab, { attributes: true, attributeFilter: ['class'] });
});

// Export stepContents for pricing system (make available globally)
window.stepContents = stepContents;

// ===== PRICING SYSTEM - PERFECT SYNC =====
function savePricing() {
    const statusEl = document.getElementById('pricingStatus');
    
    // HARDCODED EXACT MATCH - NO stepContents DEPENDENCY
    const pricingData = {
        // STEP 1 SOAPS [index 0-5]
        step1: [
            parseFloat(document.getElementById('soap-ariel')?.value) || 20,
            parseFloat(document.getElementById('soap-tide')?.value) || 25,
            parseFloat(document.getElementById('soap-breeze')?.value) || 18,
            parseFloat(document.getElementById('soap-surf')?.value) || 15,
            parseFloat(document.getElementById('soap-pride')?.value) || 17,
            parseFloat(document.getElementById('soap-wings')?.value) || 16
        ],
        // STEP 2 FABCON [index 0-5] 
        step2: [
            parseFloat(document.getElementById('fabcon-downy')?.value) || 30,
            parseFloat(document.getElementById('fabcon-del')?.value) || 20,
            parseFloat(document.getElementById('fabcon-champion')?.value) || 22,
            parseFloat(document.getElementById('fabcon-surf-fabcon')?.value) || 18,
            parseFloat(document.getElementById('fabcon-lala-fabcon')?.value) || 15,
            parseFloat(document.getElementById('fabcon-personal-choice')?.value) || 10
        ],
        // STEP 3 WASH [index 0-5]
        step3: [
            parseFloat(document.getElementById('wash-quick-wash')?.value) || 50,
            parseFloat(document.getElementById('wash-deep-clean')?.value) || 80,
            parseFloat(document.getElementById('wash-premium-wash')?.value) || 120,
            parseFloat(document.getElementById('wash-eco-wash')?.value) || 60,
            parseFloat(document.getElementById('wash-cold-wash')?.value) || 40,
            parseFloat(document.getElementById('wash-hot-wash')?.value) || 70
        ],
        // FEES
        deliveryFee: parseFloat(document.getElementById('delivery-fee')?.value) || 40,
        kgExtraFee: parseFloat(document.getElementById('kg-extra-fee')?.value) || 5
    };
    
    // SAVE & TRIGGER
    localStorage.setItem('laundryPricing', JSON.stringify(pricingData));
    window.dispatchEvent(new CustomEvent('pricingUpdated'));
    
    // SUCCESS
    statusEl.innerHTML = '✅ <strong>SAVED! BookNow updated instantly.</strong>';
    statusEl.className = 'pricing-status status-success';
    statusEl.style.display = 'block';
    setTimeout(() => statusEl.style.display = 'none', 3000);
    
    console.log('💾 SAVED PRICES:', pricingData);
}

function loadSavedPricing() {
    try {
        const saved = JSON.parse(localStorage.getItem('laundryPricing'));
        if (!saved) return;
        
        // LOAD STEP 1
        const s1 = saved.step1 || [];
        document.getElementById('soap-ariel').value = s1[0] || 20;
        document.getElementById('soap-tide').value = s1[1] || 25;
        document.getElementById('soap-breeze').value = s1[2] || 18;
        document.getElementById('soap-surf').value = s1[3] || 15;
        document.getElementById('soap-pride').value = s1[4] || 17;
        document.getElementById('soap-wings').value = s1[5] || 16;
        
        // LOAD STEP 2  
        const s2 = saved.step2 || [];
        document.getElementById('fabcon-downy').value = s2[0] || 30;
        document.getElementById('fabcon-del').value = s2[1] || 20;
        document.getElementById('fabcon-champion').value = s2[2] || 22;
        document.getElementById('fabcon-surf-fabcon').value = s2[3] || 18;
        document.getElementById('fabcon-lala-fabcon').value = s2[4] || 15;
        document.getElementById('fabcon-personal-choice').value = s2[5] || 10;
        
        // LOAD STEP 3
        const s3 = saved.step3 || [];
        document.getElementById('wash-quick-wash').value = s3[0] || 50;
        document.getElementById('wash-deep-clean').value = s3[1] || 80;
        document.getElementById('wash-premium-wash').value = s3[2] || 120;
        document.getElementById('wash-eco-wash').value = s3[3] || 60;
        document.getElementById('wash-cold-wash').value = s3[4] || 40;
        document.getElementById('wash-hot-wash').value = s3[5] || 70;
        
        // FEES
        document.getElementById('delivery-fee').value = saved.deliveryFee || 40;
        document.getElementById('kg-extra-fee').value = saved.kgExtraFee || 5;
        
        console.log('✅ Pricing LOADED from admin');
    } catch(e) {
        console.log('No saved pricing');
    }
}

function resetPricing() {
    if(!confirm('Reset ALL to defaults?')) return;
    
    // Reset inputs to factory defaults
    document.getElementById('soap-ariel').value = 20;
    document.getElementById('soap-tide').value = 25;
    document.getElementById('soap-breeze').value = 18;
    // ... ALL OTHER INPUTS ...
    
    savePricing();
}

// AUTO LOAD WHEN SETTINGS OPENS
document.addEventListener('click', (e) => {
    if(e.target.matches('[data-tab="settings"]')) {
        setTimeout(loadSavedPricing, 200);
    }
});