// invoice.js - Complete JavaScript for LexPilot Dashboard (Full Version)

let state = {
    clients: {
        john_smith: {
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+27 123 456 789',
            address: '123 St, Johannesburg',
            type: 'Individual',
            vatRegistered: false,
            idNumber: ''
        },
        jane_dlamini: {
            name: 'Jane Dlamini',
            email: 'jane@example.com',
            phone: '+27 987 654 321',
            address: '456 St, Cape Town',
            type: 'Individual',
            vatRegistered: true,
            vatNumber: '4123456789'
        },
        mike_jones: {
            name: 'Mike Jones',
            email: 'mike@example.com',
            phone: '+27 111 222 333',
            address: '789 St, Durban',
            type: 'Entity',
            vatRegistered: true,
            vatNumber: '4987654321'
        }
    },
    cases: {
        smith_v_raf: {
            client: 'john_smith',
            name: 'Smith v RAF',
            ref: 'MAT-2026-0001',
            type: 'Civil',
            billingType: 'Hourly',
            rate: 'R2000',
            timeUnit: 'per hour',
            attorney: 'You',
            status: 'Open'
        },
        dlamini_case: {
            client: 'jane_dlamini',
            name: 'Dlamini Case',
            ref: 'MAT-2026-0002',
            type: 'Family',
            billingType: 'Fixed',
            fixedAmount: 'R25,000',
            attorney: 'You',
            status: 'Open'
        },
        jones_v_roadcorp: {
            client: 'mike_jones',
            name: 'Jones v RoadCorp',
            ref: 'MAT-2026-0003',
            type: 'Commercial',
            billingType: 'Retainer',
            retainerAmount: 'R15,000',
            attorney: 'You',
            status: 'Open'
        }
    },
    unbilled: {
        smith_v_raf: [
            {item: 'Consultation', hours: 0.5, rate: 2000, amount: 1000, trust: true, lawyer: 'You'},
            {item: 'Draft Letter', hours: 1.0, rate: 2000, amount: 2000, trust: false, lawyer: 'You'},
            {item: 'Sheriff Service', hours: 0, rate: 0, amount: 850, trust: true, lawyer: '-'}
        ],
        dlamini_case: [],
        jones_v_roadcorp: []
    },
    trustBalances: {
        john_smith: 1200,
        jane_dlamini: 18500,
        mike_jones: 310450
    },
    invoices: {
        dlamini_case: [
            {id: 'INV001', date: '2025-12-22', amount: 5000, status: 'Overdue'}
        ]
    },
    services: [],
    disbursements: [],
    currentServiceIndex: -1,
    timers: [],
    unbilledTime: 42300,
    outstandingInvoices: 96200,
    totalTrust: 310450,
    billableHours: 150
};

function updateDashboard() {
    document.getElementById('unbilledTime').innerText = `R ${state.unbilledTime.toLocaleString()}`;
    document.getElementById('outstandingInvoices').innerText = `R ${state.outstandingInvoices.toLocaleString()}`;
    document.getElementById('trustAvailable').innerText = `R ${state.totalTrust.toLocaleString()}`;
    document.getElementById('billableHours').innerText = `${state.billableHours} / 200`;
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Conditional field toggles
function toggleVatField() {
    const vatGroup = document.getElementById('vatNumberGroup');
    vatGroup.style.display = document.getElementById('newClientVatRegistered').value === 'Yes' ? 'block' : 'none';
}

function toggleClientIdField() {
    const idGroup = document.getElementById('clientIdGroup');
    idGroup.style.display = document.getElementById('newClientType').value === 'Entity' ? 'block' : 'none';
}

function toggleBillingFields() {
    const type = document.getElementById('newCaseBillingType').value;
    document.getElementById('hourlyFields').style.display = type === 'Hourly' ? 'block' : 'none';
    document.getElementById('fixedFields').style.display = type === 'Fixed' ? 'block' : 'none';
    document.getElementById('retainerFields').style.display = type === 'Retainer' ? 'block' : 'none';
    document.getElementById('contingencyFields').style.display = type === 'Contingency' ? 'block' : 'none';
}

// Sync case dropdowns based on selected client
function updateCaseSelect(selectId, clientId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '';
    for (let caseId in state.cases) {
        if (state.cases[caseId].client === clientId) {
            const opt = document.createElement('option');
            opt.value = caseId;
            opt.text = state.cases[caseId].name;
            select.add(opt);
        }
    }
}

function updateTimeEntryCaseOptions() {
    const client = document.getElementById('timeEntryClient').value;
    updateCaseSelect('timeEntryCase', client);
}

function updateInvoiceCaseOptions() {
    const client = document.getElementById('invoiceClient').value;
    updateCaseSelect('invoiceCase', client);
}

function updateDepositCaseOptions() {
    const client = document.getElementById('depositClient').value;
    updateCaseSelect('depositCase', client);
}

// Main dashboard client change syncs cases
document.getElementById('clientSelect').onchange = function() {
    const client = this.value;
    updateCaseSelect('caseSelect', client);
    updateDashboard();
};

// Time Entry Modal
function openTimeEntryModal() {
    const client = document.getElementById('clientSelect').value;
    const caseId = document.getElementById('caseSelect').value;
    document.getElementById('timeEntryTitle').innerText = `+ TIME ENTRY – ${state.cases[caseId].name}`;
    document.getElementById('timeEntryClient').value = client;
    updateTimeEntryCaseOptions();
    document.getElementById('timeEntryCase').value = caseId;
    document.getElementById('timeEntryTrust').innerText = `R${state.trustBalances[client].toLocaleString()}`;
    loadServices();
    openModal('timeEntryModal');
}

function loadServices() {
    const container = document.getElementById('servicesContainer');
    container.innerHTML = '';
    state.services = [];
    state.timers = [];
    state.disbursements = [];

    updateSessionTotals();
}

function addServiceToDOM(service, index = state.services.length) {
    const container = document.getElementById('servicesContainer');
    const div = document.createElement('div');
    div.className = 'service-item';
    div.innerHTML = `
        <span class="service-delete" onclick="deleteService(${index})">×</span>
        <div class="form-row">
            <div><label>Service</label><input type="text" value="${service.name}" readonly></div>
            <div><label>Description</label><input type="text" value="${service.desc}" readonly></div>
            <div><label>Manual Hours</label><input type="number" step="0.1" value="${service.hours}" class="service-hours" onchange="updateServiceAmount(${index})"></div>
            <div><label>Rate</label><input type="text" value="${service.rate}" class="service-rate" onchange="updateServiceAmount(${index})"></div>
            <div><label>Amount</label><input type="text" value="${service.amount}" readonly class="service-amount"></div>
            <div><label>Use Trust?</label>
                <select class="service-trust" onchange="updateSessionTotals()">
                    <option value="Yes" ${service.trust === 'Yes' ? 'selected' : ''}>Yes</option>
                    <option value="No" ${service.trust === 'No' ? 'selected' : ''}>No</option>
                </select>
            </div>
        </div>
        <div class="timer-controls-small" style="margin-top: 0.5rem;">
            Timer: <span class="service-timer">00:00:00</span>
            <button class="btn-small btn-primary" onclick="startTimer(${index})">Start</button>
            <button class="btn-small btn-warning" onclick="pauseTimer(${index})">Pause</button>
            <button class="btn-small btn-danger" onclick="stopTimer(${index})">Stop</button>
            <button class="btn-small btn-info" onclick="resetTimer(${index})">Reset</button>
            <button class="service-edit" onclick="openServiceModal('edit', ${index})">Edit</button>
        </div>
    `;
    container.appendChild(div);
    state.services.push(service);
    state.timers.push({interval: null, seconds: service.timer || 0, status: 'Stopped'});
    updateTimerDisplay(index);
}

function deleteService(index) {
    state.services.splice(index, 1);
    state.timers.splice(index, 1);
    loadServices();
}

function updateServiceAmount(index) {
    const item = document.getElementsByClassName('service-item')[index];
    const hours = parseFloat(item.querySelector('.service-hours').value) || 0;
    const rateStr = item.querySelector('.service-rate').value.replace('R', '').trim();
    const rate = parseFloat(rateStr) || 0;
    const amount = hours * rate;
    item.querySelector('.service-amount').value = amount > 0 ? 'R' + amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : 'R0';
    state.services[index].hours = hours;
    state.services[index].amount = amount > 0 ? 'R' + amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : 'R0';
    updateSessionTotals();
}

function updateTimerDisplay(index) {
    const item = document.getElementsByClassName('service-item')[index];
    if (!item) return;
    const seconds = state.timers[index].seconds;
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    item.querySelector('.service-timer').innerText = `${hrs}:${mins}:${secs}`;
}

function startTimer(index) {
    state.timers.forEach((t, i) => { if (i !== index && t.interval) pauseTimer(i); });
    if (!state.timers[index].interval) {
        state.timers[index].interval = setInterval(() => {
            state.timers[index].seconds++;
            updateTimerDisplay(index);
            state.services[index].hours = parseFloat((state.timers[index].seconds / 3600).toFixed(2));
            updateServiceAmount(index);
        }, 1000);
        state.timers[index].status = 'Running';
    }
}

function pauseTimer(index) {
    clearInterval(state.timers[index].interval);
    state.timers[index].interval = null;
    state.timers[index].status = 'Paused';
}

function stopTimer(index) {
    clearInterval(state.timers[index].interval);
    state.timers[index].interval = null;
    state.timers[index].status = 'Stopped';
}

function resetTimer(index) {
    clearInterval(state.timers[index].interval);
    state.timers[index].seconds = 0;
    state.timers[index].status = 'Stopped';
    updateTimerDisplay(index);
    state.services[index].hours = 0;
    updateServiceAmount(index);
}

function updateSessionTotals() {
    let total = 0;
    let trustTotal = 0;
    let nonTrustTotal = 0;

    state.services.forEach((s, i) => {
        const amount = parseFloat(s.amount.replace('R', '').replace(',', '')) || 0;
        total += amount;
        const trustSelect = document.getElementsByClassName('service-trust')[i];
        const useTrust = trustSelect ? trustSelect.value === 'Yes' : s.trust === 'Yes';
        if (useTrust) trustTotal += amount;
        else nonTrustTotal += amount;
    });

    state.disbursements.forEach(d => {
        const amount = parseFloat(d.amount.replace('R', '').replace(',', '')) || 0;
        total += amount;
        if (d.trust === 'Yes') trustTotal += amount;
        else nonTrustTotal += amount;
    });

    const client = document.getElementById('timeEntryClient') ? document.getElementById('timeEntryClient').value : document.getElementById('clientSelect').value;
    const trustAvailable = state.trustBalances[client] || 0;

    document.getElementById('sessionSubtotal').innerText = `Subtotal: R${total.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    document.getElementById('trustAmount').innerHTML = `<span>Trust Amount:</span> <strong>R${trustTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>`;
    document.getElementById('nonTrustAmount').innerHTML = `<span>Non-Trust Amount:</span> <strong>R${nonTrustTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>`;
    document.getElementById('trustAvailable').innerHTML = `<span>Trust Available:</span> <strong>R${trustAvailable.toLocaleString()}</strong>`;
    document.getElementById('sessionTotalDue').innerHTML = `<span>Total Due:</span> <strong>R${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>`;
}

function openServiceModal(mode, index = -1) {
    state.currentServiceIndex = index;
    document.getElementById('serviceModalTitle').innerText = mode === 'add' ? '+ ADD SERVICE FOR THIS SESSION' : '+ EDIT SERVICE FOR THIS SESSION';
    if (mode === 'edit' && index !== -1) {
        const s = state.services[index];
        document.getElementById('serviceName').value = s.name;
        document.getElementById('billingType').value = s.type || 'Hourly';
        document.getElementById('rateAmount').value = s.rate;
        document.getElementById('serviceDescription').value = s.desc;
        document.getElementById('useTrust').value = s.trust;
        document.getElementById('estimatedHours').value = s.hours || 0;
    } else {
        document.getElementById('serviceName').value = 'Consultation';
        document.getElementById('billingType').value = 'Hourly';
        document.getElementById('rateAmount').value = 'R2000';
        document.getElementById('serviceDescription').value = 'Client consultation';
        document.getElementById('useTrust').value = 'No';
        document.getElementById('estimatedHours').value = '1.0';
    }
    openModal('serviceModal');
}

function saveService() {
    const index = state.currentServiceIndex;
    const service = {
        name: document.getElementById('serviceName').value,
        type: document.getElementById('billingType').value,
        rate: document.getElementById('rateAmount').value,
        desc: document.getElementById('serviceDescription').value,
        trust: document.getElementById('useTrust').value,
        hours: index !== -1 ? state.services[index].hours : parseFloat(document.getElementById('estimatedHours').value) || 0,
        amount: 'R0',
        timer: index !== -1 ? state.timers[index].seconds : 0,
        status: index !== -1 ? state.timers[index].status : 'Stopped'
    };
    const rate = parseFloat(service.rate.replace('R', '')) || 0;
    service.amount = 'R' + (service.hours * rate).toLocaleString(undefined, {minimumFractionDigits: 2});

    if (index === -1) {
        addServiceToDOM(service);
    } else {
        state.services[index] = service;
        loadServices();
    }
    closeModal('serviceModal');
}

function saveTimeEntry() {
    const caseId = document.getElementById('timeEntryCase').value;
    state.services.forEach((s, i) => {
        const trustSelect = document.getElementsByClassName('service-trust')[i];
        const trust = trustSelect ? trustSelect.value === 'Yes' : s.trust === 'Yes';
        state.unbilled[caseId].push({
            item: s.name,
            hours: parseFloat(s.hours),
            rate: parseFloat(s.rate.replace('R', '')),
            amount: parseFloat(s.amount.replace('R', '').replace(',', '')),
            trust: trust,
            lawyer: 'You'
        });
        state.unbilledTime += parseFloat(s.amount.replace('R', '').replace(',', ''));
    });
    state.disbursements.forEach(d => {
        state.unbilled[caseId].push({
            item: d.desc,
            hours: 0,
            rate: 0,
            amount: parseFloat(d.amount.replace('R', '').replace(',', '')),
            trust: d.trust === 'Yes',
            lawyer: '-'
        });
        state.unbilledTime += parseFloat(d.amount.replace('R', '').replace(',', ''));
    });
    updateDashboard();
    closeModal('timeEntryModal');
    alert('Time entries saved');
}

function saveAndCreateInvoice() {
    saveTimeEntry();
    const client = document.getElementById('timeEntryClient').value;
    const caseId = document.getElementById('timeEntryCase').value;
    openInvoiceModal(client, caseId);
}

// Invoice Modal
function openInvoiceModal(client, caseId, viewMode = false) {
    document.getElementById('invoiceTitle').innerText = (viewMode ? 'VIEW ' : '') + 'INVOICE – ' + state.clients[client].name + ' – ' + state.cases[caseId].name;
    document.getElementById('invoiceClient').value = client;
    document.getElementById('invoiceCase').value = caseId;
    updateInvoiceCaseOptions();
    loadUnbilledItems(caseId);
    openModal('invoiceModal');
}

function loadUnbilledItems(caseId) {
    const tbody = document.getElementById('unbilledItemsTable').querySelector('tbody');
    tbody.innerHTML = '';
    let subtotal = 0;
    (state.unbilled[caseId] || []).forEach((item, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.item}</td>
            <td>${item.hours || ''}</td>
            <td>${item.rate ? 'R' + item.rate.toLocaleString() : ''}</td>
            <td class="amount-right">R${item.amount.toLocaleString()}</td>
            <td>${item.trust ? 'Yes' : 'No'}</td>
            <td>${item.lawyer}</td>
            <td><button class="btn-small btn-danger" onclick="deleteUnbilledItem('${caseId}', ${i})">Delete</button></td>
        `;
        tbody.appendChild(tr);
        subtotal += item.amount;
    });
    updateInvoiceTotals(subtotal, state.trustBalances[state.cases[caseId].client]);
}

function deleteUnbilledItem(caseId, index) {
    const amount = state.unbilled[caseId][index].amount;
    state.unbilled[caseId].splice(index, 1);
    state.unbilledTime -= amount;
    updateDashboard();
    loadUnbilledItems(caseId);
}

function updateInvoiceTotals(subtotal, trustAvailable) {
    const vat = subtotal * 0.15;
    const totalBeforeTrust = subtotal + vat;
    const trustDeducted = Math.min(trustAvailable, totalBeforeTrust);
    const totalDue = totalBeforeTrust - trustDeducted;

    document.getElementById('invoiceSubtotal').innerHTML = `<span>Subtotal (excl. VAT):</span> <strong>R${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong>`;
    document.getElementById('invoiceVat').innerHTML = `<span>VAT @ 15%:</span> <strong>R${vat.toFixed(2)}</strong>`;
    document.getElementById('invoiceTotalBeforeTrust').innerHTML = `<span>Total Before Trust:</span> <strong>R${totalBeforeTrust.toFixed(2)}</strong>`;
    document.getElementById('invoiceTrustAvailable').innerHTML = `<span>Trust Available:</span> <strong class="trust-warning">R${trustAvailable.toLocaleString()}</strong>`;
    document.getElementById('invoiceTrustDeducted').innerHTML = `<span>Trust Deducted:</span> <strong>-R${trustDeducted.toFixed(2)}</strong>`;
    document.getElementById('invoiceTotalDue').innerHTML = `<span>Total Due:</span> <strong>R${totalDue.toFixed(2)}</strong>`;
}

function saveInvoiceDraft() {
    alert('Invoice saved as draft');
    closeModal('invoiceModal');
}

function previewInvoicePDF() {
    alert('Previewing PDF... (demo)');
}

function sendInvoice() {
    const totalDueText = document.getElementById('invoiceTotalDue').querySelector('strong').innerText;
    const totalDue = parseFloat(totalDueText.replace('R', '').replace(',', ''));
    state.outstandingInvoices += totalDue;
    updateDashboard();
    alert('Invoice sent');
    closeModal('invoiceModal');
}

// Deposit Modal
function openDepositModal(client = null, caseId = null) {
    const currentClient = client || document.getElementById('clientSelect').value;
    document.getElementById('depositClient').value = currentClient;
    updateDepositCaseOptions();
    if (caseId) document.getElementById('depositCase').value = caseId;
    openModal('depositModal');
}

function recordDeposit() {
    const client = document.getElementById('depositClient').value;
    const amountStr = document.getElementById('depositAmount').value.replace('R', '').replace(',', '').trim();
    const amount = parseFloat(amountStr) || 0;
    state.trustBalances[client] += amount;
    state.totalTrust += amount;
    updateDashboard();
    closeModal('depositModal');
    alert(`Deposit of R${amount.toLocaleString()} recorded`);
}

// Add Client & Case
function saveNewClient() {
    const name = document.getElementById('newClientName').value.trim();
    if (!name) return alert('Client name required');
    const id = name.toLowerCase().replace(/\s+/g, '_');
    state.clients[id] = {
        name,
        email: document.getElementById('newClientEmail').value || '',
        type: document.getElementById('newClientType').value,
        phone: document.getElementById('newClientPhone').value || '',
        address: document.getElementById('newClientAddress').value || '',
        vatRegistered: document.getElementById('newClientVatRegistered').value === 'Yes',
        vatNumber: document.getElementById('newClientVatNumber').value || '',
        idNumber: document.getElementById('newClientId') ? document.getElementById('newClientId').value : ''
    };

    const selects = ['clientSelect', 'timeEntryClient', 'invoiceClient', 'depositClient', 'newCaseClient'];
    selects.forEach(selId => {
        const select = document.getElementById(selId);
        if (select) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.text = name;
            select.add(opt);
        }
    });

    closeModal('addClientModal');
    alert('Client added: ' + name);
}

function saveNewCase() {
    const name = document.getElementById('newCaseName').value.trim();
    if (!name) return alert('Case name required');
    const id = name.toLowerCase().replace(/\s+/g, '_');
    state.cases[id] = {
        client: document.getElementById('newCaseClient').value,
        name,
        ref: document.getElementById('newCaseRef').value || `MAT-${new Date().getFullYear()}-${String(Object.keys(state.cases).length + 1).padStart(4, '0')}`,
        type: document.getElementById('newCaseType').value,
        billingType: document.getElementById('newCaseBillingType').value,
        attorney: document.getElementById('newCaseAttorney').value,
        status: document.getElementById('newCaseStatus').value || 'Open'
    };
    if (state.cases[id].billingType === 'Hourly') {
        state.cases[id].rate = document.getElementById('newCaseHourlyRate').value;
        state.cases[id].timeUnit = document.getElementById('newCaseTimeUnit').value;
    } else if (state.cases[id].billingType === 'Fixed') {
        state.cases[id].fixedAmount = document.getElementById('newCaseFixedAmount').value;
    } else if (state.cases[id].billingType === 'Retainer') {
        state.cases[id].retainerAmount = document.getElementById('newCaseRetainerAmount').value;
    } else if (state.cases[id].billingType === 'Contingency') {
        state.cases[id].contingencyPercent = document.getElementById('newCaseContingencyPercent').value;
    }

    const selects = ['caseSelect', 'timeEntryCase', 'invoiceCase', 'depositCase'];
    selects.forEach(selId => {
        const select = document.getElementById(selId);
        if (select) {
            const opt = document.createElement('option');
            opt.value = id;
            opt.text = name;
            select.add(opt);
        }
    });

    closeModal('addCaseModal');
    alert('Case added: ' + name);
}

// Disbursements
function openAddDisbursementModal(context = 'timeEntry') {
    openModal('addDisbursementModal');
}

function saveDisbursement() {
    const desc = document.getElementById('disbursementDesc').value;
    const amount = document.getElementById('disbursementAmount').value;
    const trust = document.getElementById('disbursementTrust').value;
    state.disbursements.push({desc, amount, trust});
    const tbody = document.getElementById('disbursementsTable').querySelector('tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${desc}</td><td>${amount}</td><td>${trust}</td><td><button class="btn-small btn-danger" onclick="deleteDisbursement(${state.disbursements.length-1})">Delete</button></td>`;
    tbody.appendChild(tr);
    updateSessionTotals();
    closeModal('addDisbursementModal');
}

function deleteDisbursement(index) {
    state.disbursements.splice(index, 1);
    const tbody = document.getElementById('disbursementsTable').querySelector('tbody');
    tbody.innerHTML = '';
    state.disbursements.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${d.desc}</td><td>${d.amount}</td><td>${d.trust}</td><td><button class="btn-small btn-danger" onclick="deleteDisbursement(${i})">Delete</button></td>`;
        tbody.appendChild(tr);
    });
    updateSessionTotals();
}

// Manual Item in Invoice
function openAddManualItemModal() {
    openModal('addManualItemModal');
}

function saveManualItem() {
    const hours = parseFloat(document.getElementById('manualItemHours').value) || 0;
    const rate = parseFloat(document.getElementById('manualItemRate').value.replace('R', '')) || 0;
    const amount = hours * rate;
    document.getElementById('manualItemAmount').value = 'R' + amount.toLocaleString(undefined, {minimumFractionDigits: 2});
    const item = {
        item: document.getElementById('manualItemName').value,
        hours,
        rate,
        amount,
        trust: document.getElementById('manualItemTrust').value === 'Yes',
        lawyer: document.getElementById('manualItemLawyer').value
    };
    const caseId = document.getElementById('invoiceCase').value;
    state.unbilled[caseId].push(item);
    loadUnbilledItems(caseId);
    closeModal('addManualItemModal');
}

// Reports
function openReportsModal() {
    const caseId = document.getElementById('caseSelect').value;
    const tbody = document.getElementById('reportsTable').querySelector('tbody');
    tbody.innerHTML = '';
    (state.invoices[caseId] || []).forEach(inv => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${inv.id}</td>
            <td>${inv.date}</td>
            <td>R${inv.amount.toLocaleString()}</td>
            <td>${inv.status}</td>
            <td><button class="btn-small btn-info" onclick="openInvoiceModal('${state.cases[caseId].client}', '${caseId}', true)">View</button></td>
        `;
        tbody.appendChild(tr);
    });
    openModal('reportsModal');
}

function openSettingsModal() {
    openModal('settingsModal');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();

    // Button bindings
    document.getElementById('openTimeEntryModal').onclick = openTimeEntryModal;
    document.getElementById('openInvoiceModalBtn').onclick = () => openInvoiceModal(document.getElementById('clientSelect').value, document.getElementById('caseSelect').value);
    document.getElementById('openDepositModalBtn').onclick = () => openDepositModal();
    document.getElementById('openAddClientModal').onclick = () => openModal('addClientModal');
    document.getElementById('openAddCaseModal').onclick = () => openModal('addCaseModal');
    document.getElementById('openReportsModal').onclick = openReportsModal;
    document.getElementById('openSettingsModal').onclick = openSettingsModal;

    // Sync case selects on client change in modals
    document.getElementById('timeEntryClient').onchange = updateTimeEntryCaseOptions;
    document.getElementById('invoiceClient').onchange = updateInvoiceCaseOptions;
    document.getElementById('depositClient').onchange = updateDepositCaseOptions;

    // Initial sync
    updateCaseSelect('caseSelect', document.getElementById('clientSelect').value);
});

// Manual item amount calculation
document.addEventListener('input', (e) => {
    if (e.target.id === 'manualItemHours' || e.target.id === 'manualItemRate') {
        const hours = parseFloat(document.getElementById('manualItemHours').value) || 0;
        const rate = parseFloat(document.getElementById('manualItemRate').value.replace('R', '')) || 0;
        document.getElementById('manualItemAmount').value = 'R' + (hours * rate).toLocaleString(undefined, {minimumFractionDigits: 2});
    }
});