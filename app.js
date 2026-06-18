// 🌟 SPA Navigation State
let currentTripMode = null; 

function navigateTo(pageId) {
    document.querySelectorAll('.app-page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// 🌟 Home & Trip Events
document.getElementById('btn-back-home').addEventListener('click', () => {
    navigateTo('page-home');
});

document.getElementById('fab-home').addEventListener('click', () => {
    currentTripMode = null; 
    navigateTo('page-scanner');
});

document.getElementById('fab-trip').addEventListener('click', () => {
    navigateTo('page-scanner');
});

document.getElementById('btn-cancel-scan').addEventListener('click', () => {
    navigateTo(currentTripMode ? 'page-trip' : 'page-home');
});

// 🌟 Avatar Bubble Selection Logic
document.querySelectorAll('#paid-by-container').forEach(container => {
    container.addEventListener('click', function(e) {
        if(e.target.classList.contains('avatar-bubble')) {
            container.querySelectorAll('.avatar-bubble').forEach(x => x.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});

document.querySelectorAll('#split-between-container').forEach(container => {
    container.addEventListener('click', function(e) {
        if(e.target.classList.contains('checkable')) {
            e.target.classList.toggle('active');
        }
    });
});

// 🌟 Existing Variables & Functions
const btnSnap = document.getElementById('btn-snap');
const cameraInput = document.getElementById('camera-input');
const resultOrb = document.getElementById('result-orb');
const perPersonAmountDisplay = document.getElementById('per-person-amount');
const btnNext = document.getElementById('btn-next'); 
const btnDone = document.getElementById('btn-done');
const manualSubtotalInput = document.getElementById('manual-subtotal');
const manualTaxInput = document.getElementById('manual-tax');
const taxLabel = document.getElementById('tax-label');

const btnSettings = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const settingsNameInput = document.getElementById('settings-name-input');
const settingsVenmoInput = document.getElementById('settings-venmo-input');
const settingsZelleInput = document.getElementById('settings-zelle-input');
const btnSettingsSave = document.getElementById('btn-settings-save');
const btnSettingsCancel = document.getElementById('btn-settings-cancel');

const customModal = document.getElementById('custom-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalCloseBtn = document.getElementById('modal-close-btn');

const assignmentModal = document.getElementById('assignment-modal');
const btnAssignmentCancel = document.getElementById('btn-assignment-cancel');
const btnAssignmentSave = document.getElementById('btn-assignment-save');
const expenseTitleInput = document.getElementById('expense-title');

const cropModal = document.getElementById('crop-modal');
const cropImage = document.getElementById('crop-image');
const btnCropCancel = document.getElementById('btn-crop-cancel');
const btnCropConfirm = document.getElementById('btn-crop-confirm');
let cropper = null; 

let scannedSubtotal = 0.00; 
let scannedTax = 0.00;       
let currentGrandTotal = 0.00; 
let currentPerPerson = 0.00;  
let lastScannedImageFile = null; 

let globalTipValue = 5;
let globalSplitValue = 1;

function autoResizeInput(input) {
    let span = document.getElementById('width-measurer');
    if (!span) { span = document.createElement('span'); span.id = 'width-measurer'; span.style.cssText = 'position:absolute; visibility:hidden; white-space:pre; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; font-size:1.1rem; font-weight:600; font-variant-numeric: tabular-nums;'; document.body.appendChild(span); }
    span.textContent = input.value || input.placeholder || "0.00";
    input.style.width = `${span.offsetWidth + 2}px`;
}

function calculateAndRender() {
    const sub = parseFloat(manualSubtotalInput.value) || 0;
    const tax = parseFloat(manualTaxInput.value) || 0;
    scannedSubtotal = sub; scannedTax = tax;

    if (sub > 0 && tax > 0) {
        const taxPercent = (tax / sub) * 100;
        taxLabel.textContent = `Tax (${taxPercent.toFixed(1)}%)`;
    } else { taxLabel.textContent = 'Tax'; }

    const tipAmount = scannedSubtotal * (globalTipValue / 100);
    currentGrandTotal = scannedSubtotal + scannedTax + tipAmount; 
    currentPerPerson = currentGrandTotal / globalSplitValue;     

    const displayStr = currentGrandTotal === 0 ? `$0.00` : `$${currentPerPerson.toFixed(2)}`;
    perPersonAmountDisplay.textContent = displayStr;
    
    const textLen = displayStr.length;
    if (textLen > 8) { perPersonAmountDisplay.style.fontSize = '2.8rem'; } 
    else if (textLen > 6) { perPersonAmountDisplay.style.fontSize = '3.5rem'; } 
    else { perPersonAmountDisplay.style.fontSize = '4.5rem'; }

    currentGrandTotal > 0 ? resultOrb.classList.remove('inactive') : resultOrb.classList.add('inactive');
}

manualSubtotalInput.addEventListener('input', function() { autoResizeInput(this); calculateAndRender(); });
manualTaxInput.addEventListener('input', function() { autoResizeInput(this); calculateAndRender(); });

function setupCircularDial(wrapperId, ringId, thumbId, displayId, min, max, step, initialValue, isPercent, onChangeCallback) {
    const wrapper = document.getElementById(wrapperId); const ring = document.getElementById(ringId); const thumb = document.getElementById(thumbId); const display = document.getElementById(displayId);
    let currentValue = initialValue; const r = 38; const cx = 50; const cy = 50; const circumference = 2 * Math.PI * r; const arcDegrees = 270; const arcLength = circumference * (arcDegrees / 360);
    ring.style.strokeDasharray = `${arcLength} ${circumference}`;

    function updateUI(val) {
        const percentage = (val - min) / (max - min); const offset = arcLength - (percentage * arcLength);
        ring.style.strokeDashoffset = offset;
        const svgAngleRad = (percentage * arcDegrees) * (Math.PI / 180);
        thumb.setAttribute('cx', cx + r * Math.cos(svgAngleRad)); thumb.setAttribute('cy', cy + r * Math.sin(svgAngleRad));
        display.textContent = val + (isPercent ? '%' : ''); onChangeCallback(val);
    }

    let isDragging = false;
    function handlePointer(e) {
        if (!isDragging && e.type !== 'pointerdown' && e.type !== 'touchstart') return;
        e.preventDefault(); 
        const rect = wrapper.getBoundingClientRect(); const centerX = rect.left + rect.width / 2; const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || (e.touches && e.touches[0].clientX); const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        if(clientX === undefined || clientY === undefined) return;
        const dx = clientX - centerX; const dy = clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI); 
        if (angle < 0) angle += 360; 
        let adjustedAngle = angle; if (angle < 135) adjustedAngle += 360;
        let percentage = (adjustedAngle - 135) / arcDegrees;
        if (percentage < 0) { if (adjustedAngle < 135) percentage = 0; }
        if (percentage > 1) { if (adjustedAngle > 135 + arcDegrees) percentage = 1; }
        percentage = Math.max(0, Math.min(1, percentage));
        let val = min + percentage * (max - min); val = Math.round(val / step) * step; val = Math.max(min, Math.min(max, val));
        if (val !== currentValue) { currentValue = val; updateUI(currentValue); }
    }

    wrapper.addEventListener('pointerdown', (e) => { isDragging = true; handlePointer(e); wrapper.setPointerCapture(e.pointerId); });
    wrapper.addEventListener('pointermove', handlePointer);
    wrapper.addEventListener('pointerup', (e) => { isDragging = false; wrapper.releasePointerCapture(e.pointerId); });
    wrapper.addEventListener('pointercancel', () => { isDragging = false; });
    wrapper.addEventListener('touchstart', (e) => { isDragging = true; handlePointer(e); }, {passive: false});
    wrapper.addEventListener('touchmove', handlePointer, {passive: false});
    wrapper.addEventListener('touchend', () => { isDragging = false; });
    updateUI(currentValue); return { setValue: (val) => { currentValue = val; updateUI(val); } };
}

const tipDialControl = setupCircularDial('tip-wrapper', 'tip-ring', 'tip-thumb', 'tip-display', 5, 30, 5, 5, true, (val) => { globalTipValue = val; calculateAndRender(); });
const splitDialControl = setupCircularDial('split-wrapper', 'split-ring', 'split-thumb', 'split-display', 1, 20, 1, 1, false, (val) => { globalSplitValue = val; calculateAndRender(); });

settingsNameInput.value = localStorage.getItem('billapp_user_name') || '';
settingsVenmoInput.value = localStorage.getItem('billapp_venmo_id') || '';
settingsZelleInput.value = localStorage.getItem('billapp_zelle_id') || '';

btnSettings.addEventListener('click', () => {
    settingsNameInput.value = localStorage.getItem('billapp_user_name') || '';
    settingsVenmoInput.value = localStorage.getItem('billapp_venmo_id') || '';
    settingsZelleInput.value = localStorage.getItem('billapp_zelle_id') || '';
    settingsModal.classList.remove('hidden');
});
btnSettingsCancel.addEventListener('click', () => settingsModal.classList.add('hidden'));

btnSettingsSave.addEventListener('click', () => {
    localStorage.setItem('billapp_user_name', settingsNameInput.value.trim());
    localStorage.setItem('billapp_venmo_id', settingsVenmoInput.value.trim());
    localStorage.setItem('billapp_zelle_id', settingsZelleInput.value.trim());
    settingsModal.classList.add('hidden');
    showNoticeModal('Profile Saved', ''); 
});

function showNoticeModal(title, text) {
    modalTitle.textContent = title;
    if (text) { modalContent.innerHTML = `<p style="color: var(--text-dim); margin-bottom: 25px; line-height: 1.5;">${text}</p>`; } 
    else { modalContent.innerHTML = `<div style="height: 25px;"></div>`; }
    customModal.classList.remove('hidden');
}
modalCloseBtn.addEventListener('click', () => customModal.classList.add('hidden'));

btnSnap.addEventListener('click', () => cameraInput.click());
btnCropCancel.addEventListener('click', () => { cropModal.classList.add('hidden'); if (cropper) cropper.destroy(); cameraInput.value = ''; });

cameraInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        cropImage.src = e.target.result; cropModal.classList.remove('hidden');
        if (cropper) cropper.destroy();
        cropper = new Cropper(cropImage, { viewMode: 1, dragMode: 'crop', autoCropArea: 0.8, restore: false, guides: true, center: true, highlight: false, cropBoxMovable: true, cropBoxResizable: true, toggleDragModeOnDblclick: false });
    };
    reader.readAsDataURL(file);
});

const originalApertureSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>`;

btnCropConfirm.addEventListener('click', async () => {
    if (!cropper) return;
    cropper.getCroppedCanvas({ maxWidth: 1024, maxHeight: 1024 }).toBlob(async (blob) => {
        cropModal.classList.add('hidden'); cropper.destroy();
        lastScannedImageFile = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        btnSnap.classList.add('scanning'); btnSnap.style.pointerEvents = 'none';

        try {
            const result = await Tesseract.recognize(blob, 'eng');
            let cleanText = result.data.text.replace(/(\d+)\s*[_\.,]\s*(\d+)/g, "$1.$2").replace(/\d+(?:\.\d+)?\s*%/g, "");
            const allAmounts = [...cleanText.matchAll(/\b\d{1,4}(?:,\d{3})*\.\d{2}\b/g)].map(m => parseFloat(m[0].replace(',', ''))).sort((a, b) => b - a);
            let finalSub = 0, finalTax = 0, finalTotal = 0;

            const splitMatch = cleanText.match(/subtotal|taxable value|net|surtax|\btax\b|vat|total amount|\btotal\b/i);
            if (splitMatch && allAmounts.length > 0) {
                const itemAmounts = [...cleanText.substring(0, splitMatch.index).matchAll(/\b\d{1,4}(?:,\d{3})*\.\d{2}\b/g)].map(m => parseFloat(m[0].replace(',', '')));
                const sumSubtotal = itemAmounts.reduce((a, b) => a + b, 0); const maxTotal = allAmounts[0]; const diffTax = maxTotal - sumSubtotal;
                if (sumSubtotal > 0 && diffTax >= 0 && diffTax < sumSubtotal * 0.3) { finalSub = sumSubtotal; finalTax = diffTax; finalTotal = maxTotal; }
            }
            if (finalSub === 0) {
                for (let i = 0; i < allAmounts.length; i++) {
                    for (let j = i + 1; j < allAmounts.length; j++) {
                        for (let k = j + 1; k < allAmounts.length; k++) {
                            let c = allAmounts[i], a = allAmounts[j], b = allAmounts[k];
                            if (Math.abs((a + b) - c) < 0.05 && b < a * 0.3) { finalTotal = c; finalSub = a; finalTax = b; break; }
                        } if (finalTotal) break;
                    } if (finalTotal) break;
                }
            }
            if (finalSub === 0) {
                const subMatch = cleanText.match(/(?:subtotal|taxable value|net)[^\n\r]{0,40}?(\d{1,4}(?:,\d{3})*\.\d{2})/i);
                const taxMatch = cleanText.match(/(?:surtax|\btax\b|vat)[^\n\r]{0,40}?(\d{1,4}(?:,\d{3})*\.\d{2})/i);
                const totalMatch = cleanText.match(/(?:total amount|\btotal\b)[^\n\r]{0,40}?(\d{1,4}(?:,\d{3})*\.\d{2})/i);
                let parsedSub = subMatch ? parseFloat(subMatch[1].replace(',', '')) : 0; let parsedTax = taxMatch ? parseFloat(taxMatch[1].replace(',', '')) : 0; let parsedTotal = totalMatch ? parseFloat(totalMatch[1].replace(',', '')) : 0;
                if (parsedSub > 0 && parsedTax > 0) { finalSub = parsedSub; finalTax = parsedTax; finalTotal = parsedSub + parsedTax; }
                else if (parsedTotal > 0 && parsedSub > 0 && parsedSub < parsedTotal) { finalTotal = parsedTotal; finalSub = parsedSub; finalTax = parsedTotal - parsedSub; }
                else if (parsedTotal > 0 && parsedTax > 0 && parsedTax < parsedTotal * 0.3) { finalTotal = parsedTotal; finalTax = parsedTax; finalSub = parsedTotal - parsedTax; }
                else if (parsedSub > 0) { finalSub = parsedSub; finalTax = parsedTax; }
                else if (parsedTotal > 0) { finalTotal = parsedTotal; finalSub = parsedTotal; finalTax = 0; }
            }

            if (finalSub > 0 || finalTotal > 0) {
                if (finalSub === 0 && finalTotal > 0) finalSub = finalTotal;
                manualSubtotalInput.value = Math.abs(parseFloat(finalSub.toFixed(2))); manualTaxInput.value = Math.abs(parseFloat(finalTax.toFixed(2)));
                autoResizeInput(manualSubtotalInput); autoResizeInput(manualTaxInput); calculateAndRender();
            } else { lastScannedImageFile = null; showNoticeModal('No Amount Found', 'Please try cropping closer to the Subtotal and Tax.'); }
        } catch (error) { showNoticeModal('Error', 'Recognition failed. Try again.'); } finally { btnSnap.innerHTML = originalApertureSVG; btnSnap.classList.remove('scanning'); btnSnap.style.pointerEvents = 'auto'; cameraInput.value = ''; }
    }, 'image/jpeg'); 
});

btnNext.addEventListener('click', async () => {
    if (currentGrandTotal === 0) { showNoticeModal('Empty Bill', ''); return; }
    
    if (currentTripMode) {
        expenseTitleInput.value = '';
        assignmentModal.classList.remove('hidden');
    } else {
        const userName = localStorage.getItem('billapp_user_name') || 'Me';
        const shareText = `🍽️ ${userName} shared a bill\n\n🔹 Subtotal: $${scannedSubtotal.toFixed(2)}\n🔹 Tax: $${scannedTax.toFixed(2)}\n🔹 Tip (${globalTipValue}%): $${(scannedSubtotal * (globalTipValue / 100)).toFixed(2)}\n💰 Total: $${currentGrandTotal.toFixed(2)}\n\n👥 Split: ${globalSplitValue} ppl\n👉 Per Person: $${currentPerPerson.toFixed(2)}`;
        if (navigator.share) {
            try { await navigator.share({ title: `${userName}'s Bill`, text: shareText }); } catch (e) {}
        } else { navigator.clipboard.writeText(shareText).then(() => { showNoticeModal('Copied', 'Details copied to clipboard.'); }); }
    }
});

btnAssignmentCancel.addEventListener('click', () => { assignmentModal.classList.add('hidden'); });

btnAssignmentSave.addEventListener('click', () => {
    const title = expenseTitleInput.value.trim() || 'Untitled Expense';
    const activePayer = document.querySelector('#paid-by-container .avatar-bubble.active');
    const payerName = activePayer ? activePayer.innerText : 'Unknown';
    const splitCount = document.querySelectorAll('#split-between-container .avatar-bubble.active').length || 1;
    
    const timeline = document.getElementById('trip-timeline');
    const newItem = document.createElement('div');
    newItem.className = 'glass-box';
    newItem.style.marginBottom = '15px';
    newItem.innerHTML = `
        <div style="display:flex; justify-content: space-between; align-items: center;">
            <div style="color: white; font-weight: 600; font-size: 1.1rem;">${title}</div>
            <div style="color: var(--accent-blue); font-size: 1.4rem; font-weight: 700;">$${currentGrandTotal.toFixed(2)}</div>
        </div>
        <div style="color: var(--text-dim); font-size: 0.85rem; margin-top: 5px;">Paid by ${payerName} • Split with ${splitCount} ppl</div>
    `;
    timeline.insertBefore(newItem, timeline.firstChild);

    assignmentModal.classList.add('hidden');
    manualSubtotalInput.value = ''; manualTaxInput.value = '';
    autoResizeInput(manualSubtotalInput); autoResizeInput(manualTaxInput); calculateAndRender();
    navigateTo('page-trip');
});

btnDone.addEventListener('click', () => { 
    manualSubtotalInput.value = ''; manualTaxInput.value = '';
    autoResizeInput(manualSubtotalInput); autoResizeInput(manualTaxInput);
    lastScannedImageFile = null; tipDialControl.setValue(5); splitDialControl.setValue(1);
    if (!currentTripMode) navigateTo('page-home');
});

autoResizeInput(manualSubtotalInput); autoResizeInput(manualTaxInput); calculateAndRender();


// ==========================================
// 🌟 SWIPE TO DELETE LOGIC (防呆機制已包裝)
// ==========================================
function setupSwipeToDelete(cardElement) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    cardElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, {passive: true});

    cardElement.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        
        if (diff > 40) { // 向左拉超過 40px 先當 Swipe，防呆機制！
            cardElement.classList.add('swiped');
        } else if (diff < -20) { // 向右推返埋
            cardElement.classList.remove('swiped');
        }
    }, {passive: true});

    cardElement.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// 點擊空白位自動收埋所有 Delete 掣
document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('.trip-item-wrapper')) {
        document.querySelectorAll('.trip-card.swiped').forEach(card => {
            card.classList.remove('swiped');
        });
    }
}, {passive: true});

// 幫現有 Hardcode 嘅 Card 加返 Event Listener
document.querySelectorAll('.trip-card').forEach(card => {
    setupSwipeToDelete(card);
    
    // 原本 Click 入去 Trip Ledger 嘅 Logic
    card.addEventListener('click', function(e) {
        if (this.classList.contains('swiped')) return; // 拉緊唔俾 Click！
        currentTripMode = 'dummy_trip';
        navigateTo('page-trip');
    });
});


// ==========================================
// 🌟 TRIP CREATION LOGIC (WITH MEMBERS & DATES)
// ==========================================

const btnAddTrip = document.getElementById('btn-add-trip');
const newTripModal = document.getElementById('new-trip-modal');
const btnNewTripCancel = document.getElementById('btn-new-trip-cancel');
const btnNewTripSave = document.getElementById('btn-new-trip-save');
const newTripNameInput = document.getElementById('new-trip-name');
const newTripStartInput = document.getElementById('new-trip-start');
const newTripEndInput = document.getElementById('new-trip-end');
const newMemberInput = document.getElementById('new-member-input');
const btnAddMember = document.getElementById('btn-add-member');
const newTripMembersList = document.getElementById('new-trip-members-list');

let currentNewTripMembers = ['Dennis']; 

function renderNewTripMembers() {
    newTripMembersList.innerHTML = '';
    currentNewTripMembers.forEach(member => {
        const bubble = document.createElement('div');
        bubble.className = 'avatar-bubble';
        bubble.style.display = 'flex';
        bubble.style.alignItems = 'center';
        bubble.innerHTML = `
            ${member} 
            <span class="remove-btn" style="color: #ff4444; margin-left: 8px; font-size: 1.2rem; cursor: pointer; line-height: 1;">×</span>
        `;
        
        bubble.querySelector('.remove-btn').addEventListener('click', () => {
            currentNewTripMembers = currentNewTripMembers.filter(m => m !== member);
            renderNewTripMembers();
        });
        
        newTripMembersList.appendChild(bubble);
    });
}

btnAddMember.addEventListener('click', () => {
    const name = newMemberInput.value.trim();
    if (name && !currentNewTripMembers.includes(name)) {
        currentNewTripMembers.push(name);
        newMemberInput.value = '';
        renderNewTripMembers();
    }
});

newMemberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnAddMember.click();
    }
});

btnAddTrip.addEventListener('click', () => {
    newTripNameInput.value = ''; 
    newMemberInput.value = '';
    currentNewTripMembers = ['Dennis']; 
    renderNewTripMembers();
    newTripModal.classList.remove('hidden');
});

btnNewTripCancel.addEventListener('click', () => {
    newTripModal.classList.add('hidden');
});

btnNewTripSave.addEventListener('click', () => {
    const tripName = newTripNameInput.value.trim();
    const startDate = newTripStartInput.value;
    const endDate = newTripEndInput.value;

    if (!tripName) {
        showNoticeModal('Error', '大佬，打個 Trip Name 先啦！');
        return;
    }
    if (currentNewTripMembers.length === 0) {
        showNoticeModal('Error', '起碼要有自己一個 Member 啦！');
        return;
    }
    
    createNewTripCard(tripName, startDate, endDate, currentNewTripMembers);
    newTripModal.classList.add('hidden');
});

function createNewTripCard(name, startDate, endDate, membersArray) {
    const tripList = document.getElementById('trip-list-container');
    
    const colors = [
        ['#1e3a8a', '#0f172a'], ['#831843', '#0f172a'], 
        ['#064e3b', '#0f172a'], ['#450a0a', '#0f172a']
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const dateDisplay = `${startObj.toLocaleString('en-US', {month: 'short'})} ${startObj.getDate() + 1} - ${endObj.toLocaleString('en-US', {month: 'short'})} ${endObj.getDate() + 1}`;

    // 建立 Wrapper 裝住 Delete 掣同埋 Card
    const wrapper = document.createElement('div');
    wrapper.className = 'trip-item-wrapper';
    
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'trip-item-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        wrapper.remove(); // 撳 Delete 就成個 Wrapper 鏟走
    });

    const newCard = document.createElement('div');
    newCard.className = 'trip-card';
    newCard.innerHTML = `
        <div class="trip-bg" style="background: linear-gradient(135deg, ${randomColor[0]}, ${randomColor[1]});"></div>
        <div class="trip-content">
            <h2>${name}</h2>
            <p>${membersArray.length} Members • ${dateDisplay}</p>
        </div>
    `;
    
    // 加返 Swipe 防呆
    setupSwipeToDelete(newCard);
    
    newCard.addEventListener('click', () => {
        if (newCard.classList.contains('swiped')) return; // 唔好拉開咗 Delete 掣都 Click 到入去
        
        currentTripMode = name; 
        document.getElementById('trip-header-title').textContent = name;
        
        document.getElementById('trip-timeline').innerHTML = `
            <div class="glass-box" style="margin-bottom: 15px; opacity: 0.5;">
                <div style="text-align: center; color: var(--text-dim); font-size: 0.9rem;">Start of trip timeline</div>
            </div>
        `;
        
        updateAssignmentModalMembers(membersArray);
        navigateTo('page-trip');
    });
    
    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(newCard);
    tripList.insertBefore(wrapper, tripList.firstChild);
}

function updateAssignmentModalMembers(membersArray) {
    const paidByContainer = document.getElementById('paid-by-container');
    const splitContainer = document.getElementById('split-between-container');
    
    paidByContainer.innerHTML = '';
    splitContainer.innerHTML = '';
    
    membersArray.forEach((member, index) => {
        const paidBubble = document.createElement('div');
        paidBubble.className = `avatar-bubble ${index === 0 ? 'active' : ''}`;
        paidBubble.textContent = member;
        paidByContainer.appendChild(paidBubble);
        
        const splitBubble = document.createElement('div');
        splitBubble.className = 'avatar-bubble checkable active';
        splitBubble.textContent = member;
        splitContainer.appendChild(splitBubble);
    });
}