    // 1. Certified Gadget Inventory Database
const gadgets = [
  { id: 1, name: 'Apple iPhone 15 Pro Max', cat: 'smartphones', grade: 'Brand New', specs: '256GB • Natural Titanium • Factory Unlocked', price: 1680000, img: 'https://unsplash.com' },
  { id: 2, name: 'Apple iPhone 14 Pro', cat: 'smartphones', grade: 'Mint', specs: '256GB • 94% Battery Health • Deep Purple', price: 960000, img: 'https://unsplash.com' },
  { id: 3, name: 'Apple iPhone 13', cat: 'smartphones', grade: 'Good', specs: '128GB • 88% Battery Health • Midnight', price: 540000, img: 'https://unsplash.com' },
  { id: 4, name: 'Samsung Galaxy S23 Ultra', cat: 'smartphones', grade: 'Mint', specs: '256GB • 12GB RAM • S-Pen Included', price: 890000, img: 'https://unsplash.com' },
  { id: 5, name: 'Samsung Galaxy A54 5G', cat: 'smartphones', grade: 'Fair', specs: '128GB • Light Back Scratches • 100% Working', price: 310000, img: 'https://unsplash.com' },
  { id: 6, name: 'Apple MacBook Air M2', cat: 'laptops', grade: 'Mint', specs: '13.6" • 8GB RAM • 256GB SSD • 32 Cycle Count', price: 1320000, img: 'https://unsplash.com' },
  { id: 7, name: 'HP EliteBook 840 G6', cat: 'laptops', grade: 'Good', specs: 'Core i5 • 16GB RAM • 512GB SSD • Backlit Keys', price: 335000, img: 'https://unsplash.com' },
  { id: 8, name: 'Dell Latitude 7400 X360', cat: 'laptops', grade: 'Mint', specs: 'Core i7 • 16GB RAM • Touchscreen 2-in-1', price: 410000, img: 'https://unsplash.com' },
  { id: 9, name: 'Sony PlayStation 5 Slim', cat: 'consoles', grade: 'Brand New', specs: '1TB SSD • Disc Edition • DualSense Controller', price: 880000, img: 'https://unsplash.com' },
  { id: 10, name: 'Apple Watch Series 9 (45mm)', cat: 'consoles', grade: 'Mint', specs: 'GPS • Midnight Aluminum • Sport Band', price: 460000, img: 'https://unsplash.com' },
  { id: 11, name: 'Samsung Galaxy Z Fold 5', cat: 'smartphones', grade: 'Mint', specs: '512GB • 12GB RAM • Foldable AMOLED • Phantom Black', price: 1420000, img: 'https://unsplash.com' },
  { id: 12, name: 'Apple AirPods Pro (2nd Gen)', cat: 'consoles', grade: 'Brand New', specs: 'USB-C MagSafe Case • Active Noise Cancellation', price: 295000, img: 'https://unsplash.com' }

];

// Trade-In Device Values (Devices Users Can Give Up)
const tradeInDevices = [
  { name: 'Apple iPhone 14 Pro Max (256GB)', baseValue: 980000 },
  { name: 'Apple iPhone 13 Pro (128GB)', baseValue: 640000 },
  { name: 'Apple iPhone 12 (128GB)', baseValue: 370000 },
  { name: 'Apple iPhone 11 (128GB)', baseValue: 260000 },
  { name: 'Samsung Galaxy S22 Ultra (256GB)', baseValue: 560000 },
  { name: 'Samsung Galaxy A53 5G (128GB)', baseValue: 210000 },
  { name: 'Apple MacBook Air M1 (256GB)', baseValue: 720000 },
  { name: 'HP EliteBook 840 G5 (16GB)', baseValue: 215000 }
];

// 2. State & Wallet (Saved in localStorage)
let walletBalance = Number(localStorage.getItem('lh_wallet')) || 0;
let cart = JSON.parse(localStorage.getItem('lh_cart')) || [];
let latestSellQuote = { cash: 0, credit: 0, modelName: '' };

function updateWalletUI() {
  document.getElementById('walletBalance').textContent = `₦${walletBalance.toLocaleString()}`;
  const swapWalletEl = document.getElementById('swapWalletAvail');
  if (swapWalletEl) swapWalletEl.textContent = `₦${walletBalance.toLocaleString()}`;
}

// 3. Mode Tab Switcher (Buy / Sell / Swap)
const modeTabs = document.querySelectorAll('.mode-tab');
const modulePanels = document.querySelectorAll('.module-panel');

function switchMode(targetId) {
  modeTabs.forEach((t) => t.classList.toggle('active', t.dataset.target === targetId));
  modulePanels.forEach((p) => p.classList.toggle('active', p.id === targetId));
}

modeTabs.forEach((tab) => {
  tab.addEventListener('click', () => switchMode(tab.dataset.target));
});

// 4. Render & Filter Certified Buy Stock
const catalogGrid = document.getElementById('catalogGrid');
const buySearch = document.getElementById('buySearch');
const catFilter = document.getElementById('catFilter');
const gradeFilter = document.getElementById('gradeFilter');

function renderCatalog() {
  const q = buySearch.value.toLowerCase().trim();
  const cat = catFilter.value;
  const grade = gradeFilter.value;

  const filtered = gadgets.filter((g) => {
    const matchText = g.name.toLowerCase().includes(q) || g.specs.toLowerCase().includes(q);
    const matchCat = cat === 'all' || g.cat === cat;
    const matchGrade = grade === 'all' || g.grade === grade;
    return matchText && matchCat && matchGrade;
  });

  catalogGrid.innerHTML = filtered
    .map((g) => {
      const badgeClass = 'grade-' + g.grade.replace(/\s+/g, '');
      return `
        <div class="gadget-card">
          <span class="grade-tag ${badgeClass}">${g.grade}</span>
          <img src="${g.img}" alt="${g.name}" />
          <h3>${g.name}</h3>
          <p class="gadget-specs">${g.specs}</p>
          <div class="gadget-price">₦${g.price.toLocaleString()}</div>
          <div class="card-actions">
            <button class="btn-primary" onclick="addToCart(${g.id})">Buy Now</button>
            <button class="btn-outline" onclick="sendToSwap(${g.id})">Swap For This</button>
          </div>
        </div>
      `;
    })
    .join('');
}

buySearch.addEventListener('input', renderCatalog);
catFilter.addEventListener('change', renderCatalog);
gradeFilter.addEventListener('change', renderCatalog);

// 5. Shopping Cart Drawer
const cartDrawer = document.getElementById('cartDrawer');
document.getElementById('openCartBtn').addEventListener('click', () => cartDrawer.classList.add('open'));
document.getElementById('closeCartBtn').addEventListener('click', () => cartDrawer.classList.remove('open'));

function addToCart(id) {
  const item = gadgets.find((g) => g.id === id);
  if (!item) return;
  cart.push(item);
  localStorage.setItem('lh_cart', JSON.stringify(cart));
  renderCart();
  cartDrawer.classList.add('open');
}

function removeCartItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('lh_cart', JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  document.getElementById('cartCount').textContent = cart.length;
  const cartItemsEl = document.getElementById('cartItems');
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p style="color:#64748b;">Your cart is empty.</p>';
    document.getElementById('cartTotal').textContent = '₦0';
    return;
  }
  let total = 0;
  cartItemsEl.innerHTML = cart
    .map((item, idx) => {
      total += item.price;
      return `
        <div class="cart-row">
          <div><strong>${item.name}</strong><div style="font-size:0.82rem;color:#64748b;">₦${item.price.toLocaleString()}</div></div>
          <button class="btn-outline" style="padding:4px 8px;" onclick="removeCartItem(${idx})">Remove</button>
        </div>
      `;
    })
    .join('');
  document.getElementById('cartTotal').textContent = `₦${total.toLocaleString()}`;
}

function checkoutCart() {
  if (cart.length === 0) return alert('Add a certified gadget to your cart first!');
  alert('Order confirmed! Your Lighthouse ICT certified gadget is scheduled for dispatch.');
  cart = [];
  localStorage.setItem('lh_cart', JSON.stringify(cart));
  renderCart();
  cartDrawer.classList.remove('open');
}

// 6. AI Sell Evaluation Engine
function calculateSellQuote() {
  const modelSelect = document.getElementById('sellModel');
  const base = Number(modelSelect.value);
  const modelName = modelSelect.options[modelSelect.selectedIndex].text;
  const storageMult = Number(document.getElementById('sellStorage').value);
  const battery = Number(document.getElementById('sellBattery').value);
  const cosmetic = document.getElementById('sellCosmetic').value;
  const hardware = document.getElementById('sellHardware').value;
  const hasPhoto = document.getElementById('sellPhotoInput').files.length > 0;

  let grade = cosmetic;
  let mult = cosmetic === 'Mint' ? 1.0 : cosmetic === 'Good' ? 0.85 : 0.65;
  if (battery < 80) { mult -= 0.08; if (grade === 'Mint') grade = 'Good'; }
  if (hardware === 'issue') { mult -= 0.15; grade = 'Fair'; }

  const cashOffer = Math.round((base * storageMult * mult) / 1000) * 1000;
  const creditOffer = Math.round((cashOffer * 1.05) / 1000) * 1000;
  latestSellQuote = { cash: cashOffer, credit: creditOffer, modelName };

  document.getElementById('detectedGradeBadge').textContent = `AI Certified Grade: ${grade}`;
  document.getElementById('aiReasonText').textContent =
    `${hasPhoto ? 'Visual photo scan verified + ' : ''}Battery at ${battery}%, ${cosmetic.toLowerCase()} body, ${hardware === 'ok' ? 'all sensors functional' : 'sensor issue noted'}.`;
  document.getElementById('cashOfferDisplay').textContent = `₦${cashOffer.toLocaleString()}`;
  document.getElementById('creditOfferDisplay').textContent = `₦${creditOffer.toLocaleString()}`;
}

document.getElementById('runAiScanBtn').addEventListener('click', () => {
  const loader = document.getElementById('aiScanLoader');
  const result = document.getElementById('sellQuoteResult');
  loader.style.display = 'block';
  result.style.display = 'none';
  setTimeout(() => {
    calculateSellQuote();
    loader.style.display = 'none';
    result.style.display = 'block';
  }, 800);
});

function acceptSellOffer(type) {
  if (type === 'credit') {
    walletBalance += latestSellQuote.credit;
    localStorage.setItem('lh_wallet', walletBalance);
    updateWalletUI();
    alert(`₦${latestSellQuote.credit.toLocaleString()} Store Credit added to your Lighthouse Wallet!`);
  } else {
    alert(`Bank payout request of ₦${latestSellQuote.cash.toLocaleString()} for your ${latestSellQuote.modelName} has been locked! Drop off at any Lighthouse Hub.`);
  }
}
// 7. Dynamic Swap Matrix & AI Upgrade Matcher
const swapGiveSelect = document.getElementById('swapGiveSelect');
const swapGiveCondition = document.getElementById('swapGiveCondition');
const swapGetSelect = document.getElementById('swapGetSelect');
const applyWalletSwap = document.getElementById('applyWalletSwap');

function populateSwapDropdowns() {
  swapGiveSelect.innerHTML = tradeInDevices
    .map((d, idx) => `<option value="${idx}">${d.name} (Est. ₦${d.baseValue.toLocaleString()})</option>`)
    .join('');

  swapGetSelect.innerHTML = gadgets
    .map((g) => `<option value="${g.id}">${g.name} [${g.grade}] — ₦${g.price.toLocaleString()}</option>`)
    .join('');
}

function updateSwapMath() {
  const giveDevice = tradeInDevices[Number(swapGiveSelect.value)];
  const condMult = Number(swapGiveCondition.value);
  const tradeCredit = Math.round((giveDevice.baseValue * condMult) / 1000) * 1000;

  const targetGadget = gadgets.find((g) => g.id === Number(swapGetSelect.value));
  const targetPrice = targetGadget ? targetGadget.price : 0;

  const walletDeduction = applyWalletSwap.checked ? Math.min(walletBalance, Math.max(0, targetPrice - tradeCredit)) : 0;
  const netBalance = Math.max(0, targetPrice - tradeCredit - walletDeduction);

  document.getElementById('swapCreditVal').textContent = `₦${tradeCredit.toLocaleString()}`;
  document.getElementById('swapTargetVal').textContent = `₦${targetPrice.toLocaleString()}`;
  document.getElementById('swapNetBalance').textContent = `₦${netBalance.toLocaleString()}`;
}

function sendToSwap(gadgetId) {
  switchMode('swapSection');
  swapGetSelect.value = gadgetId;
  updateSwapMath();
}

swapGiveSelect.addEventListener('change', updateSwapMath);
swapGiveCondition.addEventListener('change', updateSwapMath);
swapGetSelect.addEventListener('change', updateSwapMath);
applyWalletSwap.addEventListener('change', updateSwapMath);

// AI Best Upgrade Auto-Matcher
document.getElementById('aiBestMatchBtn').addEventListener('click', () => {
  const giveDevice = tradeInDevices[Number(swapGiveSelect.value)];
  const tradeCredit = Math.round((giveDevice.baseValue * Number(swapGiveCondition.value)) / 1000) * 1000;

  const upgrades = gadgets
    .filter((g) => g.price > tradeCredit)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  const banner = document.getElementById('aiMatchBanner');
  banner.style.display = 'block';

  if (upgrades.length === 0) {
    banner.innerHTML = `<strong><i class="fa-solid fa-robot"></i> AI Match:</strong> Your ${giveDevice.name} (₦${tradeCredit.toLocaleString()} credit) covers 100% of any device in stock with ₦0 top-up!`;
    return;
  }

  banner.innerHTML = `
    <strong><i class="fa-solid fa-robot"></i> Top 3 Smart Upgrades for Your ${giveDevice.name} (₦${tradeCredit.toLocaleString()} Credit):</strong>
    <div style="margin-top:8px;display:flex;gap:10px;flex-wrap:wrap;">
      ${upgrades
        .map((u) => {
          const topUp = u.price - tradeCredit;
          return `<button class="btn-outline" style="background:#fff;" onclick="swapGetSelect.value=${u.id};updateSwapMath();">
            ${u.name} (${u.grade}) — Top up <strong>₦${topUp.toLocaleString()}</strong>
          </button>`;
        })
        .join('')}
    </div>
  `;
});

// 8. Double-Sided Escrow Locker & Stage Simulator
// 8. Double-Sided Escrow Locker & WhatsApp Deal Forwarder
const CEO_WHATSAPP = '2347065945301'; // Replace with CEO's WhatsApp number (234 + number without 0)
let escrowStage = 2;

document.getElementById('lockEscrowBtn').addEventListener('click', () => {
  const giveDevice = tradeInDevices[Number(swapGiveSelect.value)];
  const condText = swapGiveCondition.options[swapGiveCondition.selectedIndex].text;
  const targetGadget = gadgets.find((g) => g.id === Number(swapGetSelect.value));

  const creditText = document.getElementById('swapCreditVal').textContent;
  const targetPriceText = document.getElementById('swapTargetVal').textContent;
  const netText = document.getElementById('swapNetBalance').textContent;
  const escrowCode = 'ESC-' + Math.floor(100000 + Math.random() * 900000);

  if (applyWalletSwap.checked && walletBalance > 0) {
    const tradeCredit = Math.round((giveDevice.baseValue * Number(swapGiveCondition.value)) / 1000) * 1000;
    const used = Math.min(walletBalance, Math.max(0, targetGadget.price - tradeCredit));
    walletBalance -= used;
    localStorage.setItem('lh_wallet', walletBalance);
    updateWalletUI();
  }

  // Build formatted WhatsApp message with exact swap summary
  const summaryMessage =
    `Hello Lighthouse ICT CEO,%0A%0A` +
    `I would like to confirm my Gadget Swap Deal:%0A` +
    `• *Escrow ID:* ${escrowCode}%0A` +
    `• *Giving Up:* ${giveDevice.name} (${condText})%0A` +
    `• *Trade-In Credit:* ${creditText}%0A` +
    `• *Upgrading To:* ${targetGadget.name} [${targetGadget.grade}] (${targetPriceText})%0A` +
    `• *Net Top-Up Balance:* ${netText}%0A%0A` +
    `Please confirm hub drop-off / courier pickup details.`;

  document.getElementById('whatsappSwapLink').href = `https://wa.me{CEO_WHATSAPP}?text=${summaryMessage}`;

  escrowStage = 2;
  document.getElementById('escrowId').textContent = escrowCode;
  document.getElementById('escrowTracker').style.display = 'block';
  resetEscrowSteps();
  alert(`Swap locked in Double-Sided Escrow (${escrowCode})! Click "Send Swap Summary to CEO" below to forward your deal on WhatsApp.`);
});

// 9. Lighthouse AI Upgrade Advisor (Floating Chat Bot)
const aiChatWindow = document.getElementById('aiChatWindow');
const aiMessages = document.getElementById('aiMessages');

document.getElementById('toggleAiChat').addEventListener('click', () => aiChatWindow.classList.toggle('open'));
document.getElementById('closeAiChat').addEventListener('click', () => aiChatWindow.classList.remove('open'));

function appendChatMsg(text, sender) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.innerHTML = text;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

document.getElementById('aiChatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('aiPromptInput');
  const query = input.value.trim();
  if (!query) return;

  appendChatMsg(query, 'user');
  input.value = '';

  const q = query.toLowerCase();
  let reply = '';

  if (q.includes('escrow') || q.includes('safe')) {
    reply = '<strong>Double-Sided Escrow:</strong> Your top-up payment is locked safely by Lighthouse ICT and is only released after our technicians complete a 40-point physical QA check on both devices.';
  } else if (q.includes('swap') || q.includes('iphone') || q.includes('samsung')) {
    const matchedTrade = tradeInDevices.find((d) => q.includes(d.name.toLowerCase().split(' ').slice(1, 3).join(' ')));
    if (matchedTrade) {
      const sampleTarget = gadgets[1];
      const diff = Math.max(0, sampleTarget.price - matchedTrade.baseValue);
      reply = `Your <strong>${matchedTrade.name}</strong> has an estimated trade-in value of <strong>₦${matchedTrade.baseValue.toLocaleString()}</strong>. For example, swapping to our certified <strong>${sampleTarget.name}</strong> costs just <strong>₦${diff.toLocaleString()}</strong> top-up!`;
    } else {
      reply = 'Switch to the <strong>Swap Matrix</strong> tab above, select your current phone, and click <strong>"AI Recommend Best Upgrades"</strong> to see exact top-up amounts!';
    }
  } else if (q.includes('laptop') || q.includes('500k') || q.includes('budget')) {
    const affordable = gadgets.filter((g) => g.price <= 550000);
    reply = `Here are certified gadgets under ₦550,000 in stock:<br>• ` +
      affordable.map((a) => `${a.name} (${a.grade}) — <strong>₦${a.price.toLocaleString()}</strong>`).join('<br>• ');
  } else if (q.includes('sell') || q.includes('wallet')) {
    reply = 'Use the <strong>Sell Device</strong> tab to run an AI Valuation Scan. Choosing <strong>Lighthouse Wallet Store Credit</strong> gives you an instant <strong>+5% bonus</strong> on your payout!';
  } else {
    reply = 'I can help calculate <strong>Swap top-ups</strong>, recommend <strong>certified phones/laptops</strong> by budget, or explain <strong>Double-Sided Escrow</strong>. Try asking: <em>"Swap iPhone 12"</em> or <em>"Laptops under 500k"</em>!';
  }

  setTimeout(() => appendChatMsg(reply, 'bot'), 400);
});

// Initialize Everything on Page Load
populateSwapDropdowns();
updateSwapMath();
calculateSellQuote();
updateWalletUI();
renderCatalog();
renderCart();


// 10. Customer Login / Create Account Gate
const authGate = document.getElementById('authGate');
const gateLoginTab = document.getElementById('gateLoginTab');
const gateSignupTab = document.getElementById('gateSignupTab');
const gateNameGroup = document.getElementById('gateNameGroup');
const gateSubmitBtn = document.getElementById('gateSubmitBtn');
const gateAuthForm = document.getElementById('gateAuthForm');
let isCreatingAccount = false;

function checkMemberAccess() {
  const member = JSON.parse(localStorage.getItem('lh_member'));
  if (member) {
    authGate.classList.add('hidden');
  } else {
    authGate.classList.remove('hidden');
  }
}

gateLoginTab.addEventListener('click', () => {
  isCreatingAccount = false;
  gateLoginTab.className = 'btn-primary';
  gateSignupTab.className = 'btn-outline';
  gateNameGroup.style.display = 'none';
  gateSubmitBtn.textContent = 'Sign In & Access Store →';
});

gateSignupTab.addEventListener('click', () => {
  isCreatingAccount = true;
  gateSignupTab.className = 'btn-primary';
  gateLoginTab.className = 'btn-outline';
  gateNameGroup.style.display = 'block';
  gateSubmitBtn.textContent = 'Create Account & Enter →';
});

gateAuthForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('gateEmail').value.trim();
  const name = document.getElementById('gateName').value.trim() || email.split('@');
  localStorage.setItem('lh_member', JSON.stringify({ name, email }));
  checkMemberAccess();
});

function logoutLighthouse() {
  localStorage.removeItem('lh_member');
  checkMemberAccess();
}

checkMemberAccess();

// 11. Interactive Floating WhatsApp Welcome Widget
const STORE_WHATSAPP_NUMBER = '2347065945301'; 
const waPopup = document.getElementById('waPopup');
const waFloatBtn = document.getElementById('waFloatBtn');
const closeWaPopup = document.getElementById('closeWaPopup');
const waChatForm = document.getElementById('waChatForm');

waFloatBtn.addEventListener('click', () => waPopup.classList.toggle('open'));
closeWaPopup.addEventListener('click', () => waPopup.classList.remove('open'));
setTimeout(() => {
  if (localStorage.getItem('lh_member')) {
    waPopup.classList.add('open');
  }
}, 2500);

waChatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('waMsgInput').value.trim();
  if (!text) return;
  const member = JSON.parse(localStorage.getItem('lh_member'));
  const senderTag = member ? ` (Customer: ${member.name})` : '';
  const url = `https://wa.me{STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(text + senderTag)}`;
  window.open(url, '_blank');
  document.getElementById('waMsgInput').value = '';
});
