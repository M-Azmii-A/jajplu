// ╔══════════════════════════════════════════════════════╗
// ║              JAJPU – JAJANAN PULAU                   ║
// ║         script.js  |  IndexedDB + Full Logic         ║
// ╚══════════════════════════════════════════════════════╝

// =====================
// DATA MENU (seed)
// =====================
const SEED_MENU = [
  { id: 1,  name: 'Bakso Urat Spesial',  resto: 'Bakso Pak Kumis',   price: 28000, img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', cat: 'mie',     rating: 4.9 },
  { id: 2,  name: 'Mie Ayam Ceker',      resto: 'Bakso Pak Kumis',   price: 25000, img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', cat: 'mie',     rating: 4.7 },
  { id: 3,  name: 'Ayam Geprek Pedas',   resto: 'Ayam Geprek Juara', price: 22000, img: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80', cat: 'ayam',    rating: 4.8 },
  { id: 4,  name: 'Nasi Ayam Penyet',    resto: 'Ayam Geprek Juara', price: 24000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', cat: 'ayam',    rating: 4.6 },
  { id: 5,  name: 'Nasi Goreng Spesial', resto: 'Warung Bu Sari',    price: 30000, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80', cat: 'nasi',    rating: 4.7 },
  { id: 6,  name: 'Nasi Padang Komplit', resto: 'RM Minang',         price: 35000, img: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&q=80', cat: 'nasi',    rating: 4.9 },
  { id: 7,  name: 'Udang Saus Padang',   resto: 'Seafood 99',        price: 65000, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80', cat: 'seafood', rating: 4.6 },
  { id: 8,  name: 'Ikan Bakar Bumbu',    resto: 'Seafood 99',        price: 58000, img: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&q=80', cat: 'seafood', rating: 4.5 },
  { id: 9,  name: 'Es Teh Tarik',        resto: 'Kedai Teh Kita',    price: 12000, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', cat: 'minuman', rating: 4.6 },
  { id: 10, name: 'Matcha Latte',        resto: 'Kedai Teh Kita',    price: 28000, img: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80', cat: 'minuman', rating: 4.8 },
  { id: 11, name: 'Brownies Coklat',     resto: 'Sweet Corner',      price: 22000, img: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&q=80', cat: 'dessert', rating: 4.7 },
  { id: 12, name: 'Es Krim Gelato',      resto: 'Gelato Mania',      price: 35000, img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80', cat: 'dessert', rating: 4.9 },
];

// =====================
// APP STATE
// =====================
let menuData     = [];
let cart         = {};
let currentCat   = 'all';
let currentResto = null;
let currentUser  = null;
let db           = null;

// ╔══════════════════════════════════════════════════════╗
// ║                 DATABASE (IndexedDB)                 ║
// ╚══════════════════════════════════════════════════════╝

const DB_NAME    = 'JajpuDB';
const DB_VERSION = 2;

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('users')) {
        const us = d.createObjectStore('users', { keyPath: 'phone' });
        us.createIndex('role', 'role', { unique: false });
      }
      if (!d.objectStoreNames.contains('orders')) {
        const os = d.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        os.createIndex('buyerPhone', 'buyerPhone', { unique: false });
        os.createIndex('status',    'status',     { unique: false });
        os.createIndex('createdAt', 'createdAt',  { unique: false });
      }
      if (!d.objectStoreNames.contains('menu')) {
        const ms = d.createObjectStore('menu', { keyPath: 'id' });
        ms.createIndex('resto', 'resto', { unique: false });
        ms.createIndex('cat',   'cat',   { unique: false });
      }
      if (!d.objectStoreNames.contains('session')) {
        d.createObjectStore('session', { keyPath: 'key' });
      }
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror   = (e) => { console.error('DB error', e); reject(e); };
  });
}

function dbGet(store, key) {
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
function dbPut(store, value) {
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
function dbDelete(store, key) {
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(key);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}
function dbGetAll(store) {
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
function dbGetByIndex(store, indexName, value) {
  return new Promise((res, rej) => {
    const tx  = db.transaction(store, 'readonly');
    const idx = tx.objectStore(store).index(indexName);
    const req = idx.getAll(value);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}
function dbAdd(store, value) {
  return new Promise((res, rej) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).add(value);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

async function saveSession(user) {
  currentUser = user;
  await dbPut('session', { key: 'currentUser', value: JSON.stringify(user) });
}
async function clearSession() {
  currentUser = null;
  await dbDelete('session', 'currentUser');
}
async function loadSession() {
  const row = await dbGet('session', 'currentUser');
  if (row) { try { currentUser = JSON.parse(row.value); } catch { currentUser = null; } }
}

async function migrateLegacyData() {
  const oldUsers = JSON.parse(localStorage.getItem('jajpu_users') || '[]');
  for (const u of oldUsers) {
    const existing = await dbGet('users', u.phone);
    if (!existing) await dbPut('users', u);
    if (u.role === 'seller' && Array.isArray(u.menu)) {
      for (const item of u.menu) {
        const ex = await dbGet('menu', item.id);
        if (!ex) await dbPut('menu', item);
      }
    }
  }
  const oldSession = localStorage.getItem('jajpu_session');
  if (oldSession && !currentUser) {
    try {
      const u = JSON.parse(oldSession);
      if (u && u.phone) {
        const fresh = await dbGet('users', u.phone);
        if (fresh) await saveSession(fresh);
      }
    } catch {}
  }
}

// ╔══════════════════════════════════════════════════════╗
// ║                     UTILS                           ║
// ╚══════════════════════════════════════════════════════╝

function formatRupiah(n) { return 'Rp ' + n.toLocaleString('id-ID'); }

function normalizePhone(raw) {
  let d = raw.replace(/[\s\-().]/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  if (d.startsWith('+')) d = d.slice(1);
  return d;
}
function isValidPhone(p) { return /^62\d{8,13}$/.test(p); }

function validatePasswordStrength(password) {
  if (password.length < 6) return 'Password minimal 6 karakter.';
  if (!/[a-z]/.test(password)) return 'Password harus mengandung huruf kecil.';
  if (!/[A-Z]/.test(password)) return 'Password harus mengandung huruf besar.';
  if (!/[0-9]/.test(password)) return 'Password harus mengandung angka.';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password harus mengandung karakter spesial (contoh: !@#$%).';
  return null;
}
function displayPhone(p) {
  const local = (p || '').replace(/^62/, '');
  return '+62 ' + local.replace(/(\d{3,4})(\d{4})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
}
function genOrderId() {
  return 'JJP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
}

// ╔══════════════════════════════════════════════════════╗
// ║                  RENDER MENU                         ║
// ╚══════════════════════════════════════════════════════╝

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

function renderMenu(items) {
  const grid = document.getElementById('foodGrid');
  if (!items || items.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)"><div style="font-size:3rem;margin-bottom:12px">😕</div><div>Menu tidak ditemukan</div></div>`;
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="food-item">
      <div class="food-item-img">
        <img src="${item.img || DEFAULT_IMG}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'">
      </div>
      <div class="food-item-body">
        <div class="food-item-name">${item.name}</div>
        <div class="food-item-resto">${item.resto} • ⭐ ${item.rating}</div>
        <div class="food-item-footer">
          <div class="food-price">${formatRupiah(item.price)}</div>
          <button class="add-btn" onclick="addToCart(${item.id})">+</button>
        </div>
      </div>
    </div>`).join('');
}

// =====================
// FILTER
// =====================
function filterCat(cat, el) {
  currentCat = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  const q = document.getElementById('searchInput').value.toLowerCase();
  let items = cat === 'all' ? menuData : menuData.filter(m => m.cat === cat);
  if (q) items = items.filter(m => m.name.toLowerCase().includes(q) || m.resto.toLowerCase().includes(q));
  renderMenu(items);
}
function filterMenu() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let items = currentCat === 'all' ? menuData : menuData.filter(m => m.cat === currentCat);
  if (q) items = items.filter(m => m.name.toLowerCase().includes(q) || m.resto.toLowerCase().includes(q));
  renderMenu(items);
}
function filterByResto(restoName, el) {
  if (currentResto === restoName) {
    currentResto = null;
    document.querySelectorAll('.resto-card').forEach(c => c.classList.remove('active'));
    renderMenu(menuData);
    showToast('🏪 Semua restoran ditampilkan');
    return;
  }
  currentResto = restoName;
  document.querySelectorAll('.resto-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderMenu(menuData.filter(m => m.resto === restoName));
  document.getElementById('menuSection').scrollIntoView({ behavior: 'smooth' });
  showToast(`🏪 Menampilkan menu ${restoName}`);
}

// ╔══════════════════════════════════════════════════════╗
// ║                    CART                              ║
// ╚══════════════════════════════════════════════════════╝

function addToCart(id) {
  const item = menuData.find(m => m.id === id);
  if (!item) return;
  if (cart[id]) cart[id].qty++;
  else cart[id] = { ...item, qty: 1 };
  updateCartBadge();
  renderCartPanel();
  showToast(`✅ ${item.name} ditambahkan!`);
}
function updateCartBadge() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = total;
}
function renderCartPanel() {
  const items   = Object.values(cart);
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (items.length === 0) {
    itemsEl.innerHTML = `<div class="empty-cart"><div class="ec-emoji">🛒</div><div class="ec-text">Keranjangmu kosong.<br>Yuk pesan sesuatu!</div></div>`;
    footerEl.innerHTML = '';
    return;
  }
  itemsEl.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="ci-img"><img src="${item.img || DEFAULT_IMG}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'"></div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${formatRupiah(item.price * item.qty)}</div>
      </div>
      <div class="ci-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>`).join('');
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  footerEl.innerHTML = `
    <div class="cart-row total"><span>Total</span><span>${formatRupiah(subtotal)}</span></div>
    <button class="checkout-btn" onclick="checkout()">Bayar Sekarang →</button>`;
}
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartBadge();
  renderCartPanel();
}
function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  if (overlay.classList.contains('open')) {
    overlay.classList.remove('visible');
    setTimeout(() => overlay.classList.remove('open'), 300);
  } else {
    overlay.classList.add('open');
    requestAnimationFrame(() => overlay.classList.add('visible'));
  }
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('cartOverlay')) toggleCart();
}

// ╔══════════════════════════════════════════════════════╗
// ║            CHECKOUT + ALAMAT TUJUAN                  ║
// ╚══════════════════════════════════════════════════════╝

function checkout() {
  if (!currentUser) {
    toggleCart();
    openModal('login');
    showToast('⚠️ Silakan masuk dulu untuk memesan');
    return;
  }
  if (Object.keys(cart).length === 0) { showToast('⚠️ Keranjang masih kosong!'); return; }
  toggleCart();
  openCheckoutModal();
}

function openCheckoutModal() {
  const overlay = document.getElementById('checkoutOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));

  document.getElementById('checkoutName').value  = currentUser.name || '';
  document.getElementById('checkoutPhone').value = (currentUser.phone || '').replace(/^62/, '');
  document.getElementById('checkoutNote').value  = '';
  document.getElementById('checkoutError').textContent = '';

  // Setup pilihan alamat
  const hasMain = !!(currentUser.address);
  const mainText = document.getElementById('addrMainText');
  mainText.textContent = hasMain ? currentUser.address : 'Belum diatur – tambah di Edit Profil';
  // Default: alamat utama jika ada, alamat lain jika tidak
  const radios = document.querySelectorAll('input[name="addrChoice"]');
  radios[0].checked = hasMain;
  radios[1].checked = !hasMain;
  document.getElementById('checkoutAddress').style.display = hasMain ? 'none' : 'block';
  document.getElementById('checkoutAddress').value = '';

  // Reset payment ke COD
  const payRadios = document.querySelectorAll('input[name="payMethod"]');
  if (payRadios[0]) payRadios[0].checked = true;

  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('checkoutSummary').innerHTML = `
    <div class="co-summary-title">📋 Ringkasan Pesanan (${items.length} item)</div>
    <div class="co-summary-list">
      ${items.map(i => `
        <div class="co-summary-item">
          <span class="co-item-name">${i.name} <span class="co-item-qty">×${i.qty}</span></span>
          <span class="co-item-price">${formatRupiah(i.price * i.qty)}</span>
        </div>`).join('')}
    </div>`;
  document.getElementById('checkoutTotalRow').innerHTML = `
    <div class="cart-row total" style="font-size:1rem;padding-top:10px;border-top:1px solid var(--border)">
      <span>Total Pembayaran</span><span>${formatRupiah(subtotal)}</span>
    </div>`;
}

function onAddrChoice(radio) {
  const addrField = document.getElementById('checkoutAddress');
  addrField.style.display = radio.value === 'other' ? 'block' : 'none';
  if (radio.value === 'other') addrField.focus();
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkoutOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
}
function handleCheckoutOverlayClick(e) {
  if (e.target === document.getElementById('checkoutOverlay')) closeCheckoutModal();
}

async function doCheckout() {
  const recipientName  = document.getElementById('checkoutName').value.trim();
  const recipientPhone = document.getElementById('checkoutPhone').value.trim();
  const note           = document.getElementById('checkoutNote').value.trim();
  const errEl          = document.getElementById('checkoutError');
  const payMethod      = document.querySelector('input[name="payMethod"]:checked')?.value || 'cod';
  const addrChoice     = document.querySelector('input[name="addrChoice"]:checked')?.value || 'main';

  // Tentukan alamat
  let address = '';
  if (addrChoice === 'main') {
    address = currentUser.address || '';
  } else {
    address = document.getElementById('checkoutAddress').value.trim();
  }

  if (!recipientName)      { errEl.textContent = '⚠️ Nama penerima wajib diisi.'; return; }
  if (!recipientPhone)     { errEl.textContent = '⚠️ No. telepon penerima wajib diisi.'; return; }
  if (!address)            { errEl.textContent = '⚠️ Alamat tujuan wajib diisi.'; return; }
  if (address.length < 10) { errEl.textContent = '⚠️ Alamat terlalu singkat, mohon lengkapi.'; return; }

  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    orderId:        genOrderId(),
    buyerPhone:     currentUser.phone,
    buyerName:      currentUser.name,
    recipientName,
    recipientPhone: normalizePhone(recipientPhone),
    address,
    note,
    payMethod,
    items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, resto: i.resto })),
    total:     subtotal,
    status:    'Menunggu Konfirmasi',
    progress:  'Pesanan diterima',
    createdAt: new Date().toISOString(),
  };

  try {
    await dbAdd('orders', order);
    if (!currentUser.address && address) {
      currentUser.address = address;
      await dbPut('users', currentUser);
      await saveSession(currentUser);
    }
    cart = {};
    updateCartBadge();
    renderCartPanel();
    closeCheckoutModal();

    // Jika bukan COD, langsung tampilkan detail pembayaran
    if (payMethod !== 'cod') {
      const allOrders = await dbGetAll('orders');
      const savedOrder = allOrders.find(o => o.orderId === order.orderId);
      if (savedOrder) {
        setTimeout(() => showPaymentDetail(savedOrder.orderId), 400);
      }
    } else {
      showOrderSuccess(order);
    }
  } catch (err) {
    console.error(err);
    errEl.textContent = '❌ Gagal menyimpan pesanan, coba lagi.';
  }
}

function showOrderSuccess(order) {
  const old = document.getElementById('orderSuccessToast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.id = 'orderSuccessToast';
  el.className = 'order-success-toast';
  el.innerHTML = `
    <div class="ost-icon">🎉</div>
    <div class="ost-body">
      <div class="ost-title">Pesanan Berhasil!</div>
      <div class="ost-id">ID: ${order.orderId}</div>
      <div class="ost-addr">📍 ${order.address}</div>
      <div class="ost-total">${formatRupiah(order.total)}</div>
    </div>
    <button class="ost-close" onclick="this.parentElement.remove()">✕</button>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 6000);
}

// ╔══════════════════════════════════════════════════════╗
// ║                  TOAST NOTIFIKASI                    ║
// ╚══════════════════════════════════════════════════════╝

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// ╔══════════════════════════════════════════════════════╗
// ║                  AUTH SYSTEM                         ║
// ╚══════════════════════════════════════════════════════╝

function openModal(type) {
  const overlay = document.getElementById('authOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  switchModal(type);
}
function closeModal() {
  const overlay = document.getElementById('authOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
  ['loginError','registerError','sellerError'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}
function handleAuthOverlayClick(e) { if (e.target === document.getElementById('authOverlay')) closeModal(); }
function switchModal(type) {
  ['loginForm','registerForm','registerBuyerForm','registerSellerForm'].forEach(id => document.getElementById(id).style.display = 'none');
  const map = { login:'loginForm', register:'registerForm', registerBuyer:'registerBuyerForm', registerSeller:'registerSellerForm' };
  if (map[type]) document.getElementById(map[type]).style.display = 'block';
  ['loginError','registerError','sellerError'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = ''; });
}

async function doLogin() {
  const phone    = normalizePhone(document.getElementById('loginPhone').value.trim());
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  if (!phone || !password)  { errEl.textContent = 'No. telepon dan password wajib diisi.'; return; }
  if (!isValidPhone(phone)) { errEl.textContent = 'Format no. telepon tidak valid.'; return; }
  const user = await dbGet('users', phone);
  if (!user || user.password !== password) { errEl.textContent = 'No. telepon atau password salah.'; return; }
  await saveSession(user);
  updateAuthNav();
  closeModal();
  showToast(`👋 Halo, ${user.name}!`);
}

async function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const phone    = normalizePhone(document.getElementById('regPhone').value.trim());
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  if (!name || !phone || !password) { errEl.textContent = 'Semua field wajib diisi.'; return; }
  if (!isValidPhone(phone))         { errEl.textContent = 'Format no. telepon tidak valid.'; return; }
  const passErr = validatePasswordStrength(password);
  if (passErr)                      { errEl.textContent = passErr; return; }
  const existing = await dbGet('users', phone);
  if (existing) { errEl.textContent = 'No. telepon sudah terdaftar.'; return; }
  const newUser = { name, phone, password, role: 'buyer', address: '', createdAt: new Date().toISOString() };
  await dbPut('users', newUser);
  await saveSession(newUser);
  updateAuthNav();
  closeModal();
  showToast(`🎉 Akun berhasil dibuat! Halo, ${name}!`);
}

async function doRegisterSeller() {
  const name     = document.getElementById('sellerName').value.trim();
  const resto    = document.getElementById('sellerResto').value.trim();
  const cat      = document.getElementById('sellerCat').value;
  const phone    = normalizePhone(document.getElementById('sellerPhone').value.trim());
  const password = document.getElementById('sellerPassword').value;
  const errEl    = document.getElementById('sellerError');
  if (!name || !resto || !cat || !phone || !password) { errEl.textContent = 'Semua field wajib diisi.'; return; }
  if (!isValidPhone(phone)) { errEl.textContent = 'Format no. telepon tidak valid.'; return; }
  const passErr = validatePasswordStrength(password);
  if (passErr)               { errEl.textContent = passErr; return; }
  const existing = await dbGet('users', phone);
  if (existing) { errEl.textContent = 'No. telepon sudah terdaftar.'; return; }
  const newUser = { name, phone, password, role: 'seller', restoName: resto, restoCat: cat, address: '', createdAt: new Date().toISOString() };
  await dbPut('users', newUser);
  await saveSession(newUser);
  updateAuthNav();
  closeModal();
  showToast(`🏪 Restoran "${resto}" berhasil didaftarkan!`);
}

async function doLogout() {
  const name = currentUser?.name || '';
  await clearSession();
  updateAuthNav();
  showToast(`👋 Sampai jumpa, ${name}!`);
}

function updateAuthNav() {
  const navRight = document.getElementById('navRight');
  if (currentUser) {
    const sellerBtn = currentUser.role === 'seller'
      ? `<button class="btn-seller" onclick="openSellerDashboard()">🏪 Dashboard</button>` : '';
    const historyBtn = currentUser.role === 'buyer'
      ? `<button class="btn-ghost" onclick="openHistoryModal()">📋 Riwayat</button>` : '';
    navRight.innerHTML = `
      <div class="user-badge" onclick="openProfileModal()" title="Edit Profil" style="cursor:pointer">
        ${currentUser.role === 'seller' ? '🏪' : '👤'} ${currentUser.name} ✏️
      </div>
      ${sellerBtn}${historyBtn}
      <button class="btn-ghost" onclick="doLogout()">Keluar</button>
      <button class="cart-btn" onclick="toggleCart()">🛒<span class="cart-badge" id="cartBadge">0</span></button>`;
  } else {
    navRight.innerHTML = `
      <button class="btn-ghost" onclick="openModal('login')">Masuk</button>
      <button class="btn-primary" onclick="openModal('register')">Daftar</button>
      <button class="cart-btn" onclick="toggleCart()">🛒<span class="cart-badge" id="cartBadge">0</span></button>`;
  }
  updateCartBadge();
}

// ╔══════════════════════════════════════════════════════╗
// ║                 EDIT PROFIL                          ║
// ╚══════════════════════════════════════════════════════╝

function openProfileModal() {
  if (!currentUser) return;
  document.getElementById('profileOverlay').classList.add('open');
  requestAnimationFrame(() => document.getElementById('profileOverlay').classList.add('visible'));
  document.getElementById('profileSub').textContent   = displayPhone(currentUser.phone);
  document.getElementById('profileName').value        = currentUser.name || '';
  document.getElementById('profilePhone').value       = (currentUser.phone || '').replace(/^62/, '');
  document.getElementById('profileAddress').value     = currentUser.address || '';
  document.getElementById('profilePassword').value    = '';
  document.getElementById('profileError').textContent = '';
}
function closeProfileModal() {
  document.getElementById('profileOverlay').classList.remove('visible');
  setTimeout(() => document.getElementById('profileOverlay').classList.remove('open'), 280);
}
function handleProfileOverlayClick(e) { if (e.target === document.getElementById('profileOverlay')) closeProfileModal(); }

async function saveProfile() {
  const name     = document.getElementById('profileName').value.trim();
  const address  = document.getElementById('profileAddress').value.trim();
  const password = document.getElementById('profilePassword').value;
  const errEl    = document.getElementById('profileError');
  if (!name)                          { errEl.textContent = 'Nama tidak boleh kosong.'; return; }
  if (password) {
    const passErr = validatePasswordStrength(password);
    if (passErr) { errEl.textContent = passErr; return; }
  }
  currentUser.name    = name;
  currentUser.address = address;
  if (password) currentUser.password = password;
  await dbPut('users', currentUser);
  await saveSession(currentUser);
  updateAuthNav();
  closeProfileModal();
  showToast('✅ Profil berhasil diperbarui!');
}

// ╔══════════════════════════════════════════════════════╗
// ║              SELLER DASHBOARD                        ║
// ╚══════════════════════════════════════════════════════╝

async function openSellerDashboard() {
  document.getElementById('sellerOverlay').classList.add('open');
  requestAnimationFrame(() => document.getElementById('sellerOverlay').classList.add('visible'));
  const sellerMenu = await dbGetByIndex('menu', 'resto', currentUser.restoName);
  document.getElementById('sellerDashTitle').textContent = currentUser.restoName;
  document.getElementById('sellerDashSub').textContent   = `Kategori: ${currentUser.restoCat} • ${sellerMenu.length} menu`;
  // Init toggle buka/tutup
  const isOpen = currentUser.isOpen !== false; // default buka
  document.getElementById('warungToggle').checked = isOpen;
  document.getElementById('warungStatusLabel').textContent = isOpen ? '🟢 Buka' : '🔴 Tutup';
  document.getElementById('warungStatusLabel').style.color = isOpen ? 'var(--green)' : '#ff6b6b';
  switchDashTab('menu', document.querySelector('.dash-tab'));
}
function closeSellerDashboard() {
  document.getElementById('sellerOverlay').classList.remove('visible');
  setTimeout(() => document.getElementById('sellerOverlay').classList.remove('open'), 280);
}
function handleSellerOverlayClick(e) { if (e.target === document.getElementById('sellerOverlay')) closeSellerDashboard(); }
function switchDashTab(tab, el) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  ['dashMenuTab','dashAddTab','dashOrdersTab','dashStatsTab','dashLaporanTab'].forEach(id => {
    document.getElementById(id).style.display = 'none';
  });
  if (tab === 'menu')    { document.getElementById('dashMenuTab').style.display    = 'block'; renderSellerMenu(); }
  if (tab === 'add')     { document.getElementById('dashAddTab').style.display     = 'block'; resetImgUploadField(); }
  if (tab === 'orders')  { document.getElementById('dashOrdersTab').style.display  = 'block'; renderSellerOrders(); }
  if (tab === 'stats')   {
    document.getElementById('dashStatsTab').style.display   = 'block';
    statsPeriod = 'all';
    document.querySelectorAll('#dashStatsTab .period-btn').forEach((b,i) => b.classList.toggle('active', i===0));
    renderSellerStats();
  }
  if (tab === 'laporan') { document.getElementById('dashLaporanTab').style.display = 'block'; }
}

async function renderSellerMenu() {
  const list = document.getElementById('sellerMenuList');
  const menu = await dbGetByIndex('menu', 'resto', currentUser.restoName);
  if (menu.length === 0) { list.innerHTML = `<div class="seller-empty">😴 Belum ada menu. Tambahkan menu pertamamu!</div>`; return; }
  list.innerHTML = menu.map(item => `
    <div class="seller-menu-item">
      <div class="smi-img"><img src="${item.img || DEFAULT_IMG}" alt="${item.name}" onerror="this.src='${DEFAULT_IMG}'"></div>
      <div class="smi-info">
        <div class="smi-name">${item.name}</div>
        <div class="smi-price">${formatRupiah(item.price)}</div>
      </div>
      <button class="smi-del" onclick="deleteSellerMenu(${item.id})">🗑️</button>
    </div>`).join('');
}

let uploadedImgBase64 = null;
function handleImgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Ukuran foto maksimal 5MB'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImgBase64 = e.target.result;
    document.getElementById('imgPreview').src = uploadedImgBase64;
    document.getElementById('imgPreviewWrap').style.display = 'block';
    document.getElementById('imgUploadPlaceholder').style.display = 'none';
    document.getElementById('newMenuImg').value = '';
  };
  reader.readAsDataURL(file);
}
function removeUploadedImg(event) { event.stopPropagation(); resetImgUploadField(); }
function resetImgUploadField() {
  uploadedImgBase64 = null;
  const f = document.getElementById('newMenuFile'); if (f) f.value = '';
  const p = document.getElementById('imgPreview'); if (p) p.src = '';
  const pw = document.getElementById('imgPreviewWrap'); if (pw) pw.style.display = 'none';
  const ph = document.getElementById('imgUploadPlaceholder'); if (ph) ph.style.display = 'flex';
}

async function doAddMenu() {
  const name  = document.getElementById('newMenuName').value.trim();
  const url   = document.getElementById('newMenuImg').value.trim();
  const price = parseInt(document.getElementById('newMenuPrice').value);
  const errEl = document.getElementById('addMenuError');
  if (!name)              { errEl.textContent = 'Nama menu wajib diisi.'; return; }
  if (!price || price<=0) { errEl.textContent = 'Harga harus lebih dari 0.'; return; }
  const imgFinal = uploadedImgBase64 || url || DEFAULT_IMG;
  const newItem  = { id: Date.now(), name, img: imgFinal, price, cat: currentUser.restoCat, resto: currentUser.restoName, rating: 5.0 };
  await dbPut('menu', newItem);
  menuData.push(newItem);
  document.getElementById('newMenuName').value  = '';
  document.getElementById('newMenuImg').value   = '';
  document.getElementById('newMenuPrice').value = '';
  errEl.textContent = '';
  resetImgUploadField();
  const allMenu = await dbGetByIndex('menu', 'resto', currentUser.restoName);
  document.getElementById('sellerDashSub').textContent = `Kategori: ${currentUser.restoCat} • ${allMenu.length} menu`;
  renderMenu(menuData);
  showToast(`✅ "${name}" ditambahkan ke menu!`);
  switchDashTab('menu', document.querySelectorAll('.dash-tab')[0]);
}

async function deleteSellerMenu(itemId) {
  const item = menuData.find(m => m.id === itemId);
  await dbDelete('menu', itemId);
  const gi = menuData.findIndex(m => m.id === itemId);
  if (gi !== -1) menuData.splice(gi, 1);
  const allMenu = await dbGetByIndex('menu', 'resto', currentUser.restoName);
  document.getElementById('sellerDashSub').textContent = `Kategori: ${currentUser.restoCat} • ${allMenu.length} menu`;
  renderSellerMenu();
  renderMenu(menuData);
  showToast(`🗑️ "${item?.name}" dihapus dari menu`);
}

// ╔══════════════════════════════════════════════════════╗
// ║          PENJUAL: BUKA/TUTUP WARUNG                  ║
// ╚══════════════════════════════════════════════════════╝

async function toggleWarungStatus() {
  const isOpen = document.getElementById('warungToggle').checked;
  currentUser.isOpen = isOpen;
  await dbPut('users', currentUser);
  await saveSession(currentUser);
  const label = document.getElementById('warungStatusLabel');
  label.textContent = isOpen ? '🟢 Buka' : '🔴 Tutup';
  label.style.color = isOpen ? 'var(--green)' : '#ff6b6b';
  showToast(isOpen ? '🟢 Warung kamu sekarang Buka!' : '🔴 Warung kamu sekarang Tutup');
}

// ╔══════════════════════════════════════════════════════╗
// ║         PENJUAL: PESANAN MASUK & PROGRESS            ║
// ╚══════════════════════════════════════════════════════╝

const ORDER_STATUSES = ['Menunggu Konfirmasi', 'Sedang Dibuat', 'Dalam Pengantaran', 'Selesai'];
const STATUS_ICONS   = { 'Menunggu Konfirmasi':'⏳', 'Sedang Dibuat':'👨‍🍳', 'Dalam Pengantaran':'🛵', 'Selesai':'✅' };

async function renderSellerOrders() {
  const list = document.getElementById('sellerOrdersList');
  const allOrders = await dbGetAll('orders');
  const myOrders  = allOrders.filter(o => o.items && o.items.some(i => i.resto === currentUser.restoName));
  if (myOrders.length === 0) {
    list.innerHTML = `<div class="seller-empty">📦 Belum ada pesanan masuk.</div>`; return;
  }
  list.innerHTML = myOrders.map(o => {
    const nextStatus = ORDER_STATUSES[ORDER_STATUSES.indexOf(o.status) + 1];
    const nextBtn = nextStatus
      ? `<button class="status-advance-btn" onclick="advanceOrderStatus('${o.orderId}')">➡️ ${nextStatus}</button>` : '';
    const payBadge = { cod:'💵 COD', bca:'🏦 BCA', mandiri:'🏦 Mandiri', gopay:'💚 GoPay', ovo:'💜 OVO', qris:'📱 QRIS', transfer:'🏦 Transfer' }[o.payMethod] || '💵 COD';
    const proofBtn = o.paymentProof
      ? `<button class="proof-view-btn" onclick="viewPaymentProof('${o.orderId}')">🧾 Lihat Bukti Bayar</button>`
      : (o.payMethod !== 'cod' ? `<span class="proof-none-tag">⌛ Belum upload bukti</span>` : '');
    return `
      <div class="seller-order-card">
        <div class="soc-header">
          <span class="soc-id">#${o.orderId.slice(-6)}</span>
          <span class="soc-status">${STATUS_ICONS[o.status]||'⏳'} ${o.status}</span>
        </div>
        <div class="soc-buyer">👤 ${o.buyerName} &nbsp;|&nbsp; 📍 ${o.address}</div>
        <div class="soc-items">${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</div>
        <div class="soc-footer">
          <span class="soc-total">${formatRupiah(o.total)}</span>
          <span class="soc-pay">${payBadge}</span>
          ${nextBtn}
        </div>
        ${proofBtn ? `<div class="soc-proof-row">${proofBtn}</div>` : ''}
      </div>`;
  }).join('');
}

async function advanceOrderStatus(orderId) {
  const allOrders = await dbGetAll('orders');
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;
  const idx = ORDER_STATUSES.indexOf(order.status);
  if (idx < ORDER_STATUSES.length - 1) {
    order.status   = ORDER_STATUSES[idx + 1];
    order.progress = order.status;
    // dbPut memerlukan key (id) untuk update — gunakan put langsung
    await new Promise((res, rej) => {
      const tx  = db.transaction('orders', 'readwrite');
      const req = tx.objectStore('orders').put(order);
      req.onsuccess = () => res();
      req.onerror   = () => rej(req.error);
    });
    showToast(`📦 Pesanan #${orderId.slice(-6)} → ${order.status}`);
    renderSellerOrders();
  }
}

// ╔══════════════════════════════════════════════════════╗
// ║            PENJUAL: STATISTIK PENJUALAN              ║
// ╚══════════════════════════════════════════════════════╝

let statsPeriod = 'all';

function setStatsPeriod(period, el) {
  statsPeriod = period;
  document.querySelectorAll('#dashStatsTab .period-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderSellerStats();
}

async function renderSellerStats() {
  const el = document.getElementById('sellerStatsContent');
  const allOrders = await dbGetAll('orders');
  let myOrders  = allOrders.filter(o => o.items && o.items.some(i => i.resto === currentUser.restoName));
  myOrders = filterByPeriod(myOrders, statsPeriod);

  const totalOrders   = myOrders.length;
  const totalRevenue  = myOrders.filter(o => o.status === 'Selesai').reduce((s,o) => s+o.total, 0);
  const totalItems    = myOrders.reduce((s,o) => s + o.items.filter(i=>i.resto===currentUser.restoName).reduce((a,i)=>a+i.qty,0), 0);

  // Hitung per menu
  const menuCount = {};
  myOrders.forEach(o => o.items.filter(i=>i.resto===currentUser.restoName).forEach(i => {
    menuCount[i.name] = (menuCount[i.name] || 0) + i.qty;
  }));
  const topMenus = Object.entries(menuCount).sort((a,b) => b[1]-a[1]).slice(0,5);

  const periodLabels = { all:'Semua Waktu', today:'Hari Ini', week:'7 Hari Terakhir', month:'30 Hari Terakhir' };

  if (myOrders.length === 0) {
    el.innerHTML = `<div class="seller-empty">📊 Tidak ada data pesanan pada periode ${periodLabels[statsPeriod]}.</div>`;
    return;
  }

  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-num">${totalOrders}</div><div class="stat-lbl">Total Pesanan</div></div>
      <div class="stat-card"><div class="stat-num">${totalItems}</div><div class="stat-lbl">Item Terjual</div></div>
      <div class="stat-card" style="grid-column:1/-1"><div class="stat-num">${formatRupiah(totalRevenue)}</div><div class="stat-lbl">Total Pendapatan (Selesai) · ${periodLabels[statsPeriod]}</div></div>
    </div>
    <div class="stats-section-title">🏆 Menu Terlaris</div>
    ${topMenus.length === 0 ? '<div class="seller-empty">Belum ada data penjualan.</div>' :
      topMenus.map(([name, qty], i) => `
        <div class="top-menu-item">
          <span class="top-menu-rank">#${i+1}</span>
          <span class="top-menu-name">${name}</span>
          <span class="top-menu-qty">${qty} terjual</span>
        </div>`).join('')}`;
}

// ╔══════════════════════════════════════════════════════╗
// ║          PEMBELI: RIWAYAT PEMBELIAN                  ║
// ╚══════════════════════════════════════════════════════╝

async function openHistoryModal() {
  const overlay = document.getElementById('historyOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  await renderHistoryList();
}
function closeHistoryModal() {
  const overlay = document.getElementById('historyOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
}

async function renderHistoryList() {
  const list = document.getElementById('historyList');
  const allOrders = await dbGetAll('orders');
  const myOrders = allOrders
    .filter(o => o.buyerPhone === currentUser.phone)
    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (myOrders.length === 0) {
    list.innerHTML = `<div class="seller-empty">📋 Belum ada riwayat pembelian.</div>`; return;
  }

  const payLabels = {
    cod:'💵 COD', transfer:'🏦 Transfer', qris:'📱 QRIS',
    bca:'🏦 BCA', mandiri:'🏦 Mandiri', gopay:'💚 GoPay', ovo:'💜 OVO'
  };

  list.innerHTML = myOrders.map(o => {
    const isNonCod  = o.payMethod !== 'cod';
    const isPending = isNonCod && o.status === 'Menunggu Konfirmasi';
    let proofRow = '';
    if (isNonCod) {
      if (o.paymentProof) {
        proofRow = `<button class="hc-pay-btn hc-proof-sent" onclick="viewPaymentProof('${o.orderId}')">🧾 Bukti Pembayaran Terkirim</button>`;
      } else {
        proofRow = `<button class="hc-pay-btn" onclick="showPaymentDetail('${o.orderId}')">💳 ${isPending ? 'Lihat Cara Bayar & Kirim Bukti' : 'Kirim Bukti Pembayaran'}</button>`;
      }
    }
    return `
    <div class="history-card">
      <div class="hc-header">
        <span class="hc-id">#${o.orderId.slice(-6)}</span>
        <span class="hc-status">${STATUS_ICONS[o.status]||'⏳'} ${o.status}</span>
      </div>
      <div class="hc-items">${o.items.map(i=>`${i.name} ×${i.qty}`).join(' · ')}</div>
      <div class="hc-addr">📍 ${o.address}</div>
      ${o.note ? `<div class="hc-note">📝 ${o.note}</div>` : ''}
      <div class="hc-footer">
        <span>${formatRupiah(o.total)}</span>
        <span>${payLabels[o.payMethod]||'💵 COD'}</span>
        <span class="hc-date">${new Date(o.createdAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</span>
      </div>
      ${proofRow}
    </div>`;
  }).join('');
}

// ╔══════════════════════════════════════════════════════╗
// ║          PAYMENT DETAIL MODAL                        ║
// ╚══════════════════════════════════════════════════════╝

const PAYMENT_INFO = {
  bca:     { label: 'BCA', icon: '🏦', type: 'bank', noRek: '1234567890', atas: 'PT Jajpu Indonesia', kode: '014' },
  mandiri: { label: 'Mandiri', icon: '🏦', type: 'bank', noRek: '0987654321', atas: 'PT Jajpu Indonesia', kode: '008' },
  gopay:   { label: 'GoPay', icon: '💚', type: 'ewallet', noRek: '082100001234', atas: 'Jajpu Official' },
  ovo:     { label: 'OVO', icon: '💜', type: 'ewallet', noRek: '082100005678', atas: 'Jajpu Official' },
  qris:    { label: 'QRIS', icon: '📱', type: 'qris' },
};

async function showPaymentDetail(orderId) {
  const allOrders = await dbGetAll('orders');
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;

  const info = PAYMENT_INFO[order.payMethod];
  if (!info) return;

  resetProofUploadField();
  document.getElementById('proofUploadBox').parentElement.style.display = 'block';
  document.querySelector('#payDetailModal .form-btn').style.display = 'block';
  document.querySelector('#payDetailModal .form-btn').textContent = order.paymentProof ? '✅ Kirim Ulang Bukti' : '✅ Saya Sudah Bayar';

  document.getElementById('payDetailTitle').textContent = `${info.icon} Bayar via ${info.label}`;
  document.getElementById('payDetailSub').textContent   = `Order #${order.orderId.slice(-6)} · ${formatRupiah(order.total)}`;

  let html = `<div class="pay-detail-amount">Total: <span>${formatRupiah(order.total)}</span></div>`;

  if (info.type === 'bank') {
    html += `
    <div class="pay-detail-card">
      <div class="pdc-row"><span>Bank</span><strong>${info.label} (${info.kode})</strong></div>
      <div class="pdc-row"><span>No. Rekening</span>
        <strong id="copyNoRek">${info.noRek}</strong>
        <button class="copy-btn" onclick="copyText('${info.noRek}')">📋 Salin</button>
      </div>
      <div class="pdc-row"><span>Atas Nama</span><strong>${info.atas}</strong></div>
      <div class="pdc-row"><span>Jumlah Transfer</span>
        <strong id="copyAmount">${formatRupiah(order.total)}</strong>
        <button class="copy-btn" onclick="copyText('${order.total}')">📋 Salin</button>
      </div>
    </div>
    <div class="pay-detail-steps">
      <div class="pds-title">Langkah pembayaran:</div>
      <ol>
        <li>Buka aplikasi mobile banking atau ATM ${info.label}</li>
        <li>Pilih Transfer → ke Sesama ${info.label} atau Antar Bank</li>
        <li>Masukkan No. Rekening: <strong>${info.noRek}</strong></li>
        <li>Masukkan nominal tepat: <strong>${formatRupiah(order.total)}</strong></li>
        <li>Konfirmasi dan selesaikan transaksi</li>
        <li>Klik tombol "Saya Sudah Bayar" di bawah</li>
      </ol>
    </div>`;
  } else if (info.type === 'ewallet') {
    html += `
    <div class="pay-detail-card">
      <div class="pdc-row"><span>E-Wallet</span><strong>${info.label}</strong></div>
      <div class="pdc-row"><span>No. HP Tujuan</span>
        <strong>${info.noRek}</strong>
        <button class="copy-btn" onclick="copyText('${info.noRek}')">📋 Salin</button>
      </div>
      <div class="pdc-row"><span>Nama</span><strong>${info.atas}</strong></div>
      <div class="pdc-row"><span>Jumlah</span>
        <strong>${formatRupiah(order.total)}</strong>
        <button class="copy-btn" onclick="copyText('${order.total}')">📋 Salin</button>
      </div>
    </div>
    <div class="pay-detail-steps">
      <div class="pds-title">Langkah pembayaran:</div>
      <ol>
        <li>Buka aplikasi ${info.label}</li>
        <li>Pilih Transfer / Kirim Uang</li>
        <li>Masukkan nomor: <strong>${info.noRek}</strong></li>
        <li>Masukkan nominal: <strong>${formatRupiah(order.total)}</strong></li>
        <li>Konfirmasi pembayaran</li>
        <li>Klik tombol "Saya Sudah Bayar" di bawah</li>
      </ol>
    </div>`;
  } else if (info.type === 'qris') {
    // Simulasi QRIS dengan pola kotak-kotak SVG
    html += `
    <div style="text-align:center;margin:16px 0">
      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" style="border:4px solid var(--text);border-radius:8px;background:#fff">
        <rect x="10" y="10" width="60" height="60" fill="none" stroke="#000" stroke-width="4"/>
        <rect x="20" y="20" width="40" height="40" fill="#000"/>
        <rect x="110" y="10" width="60" height="60" fill="none" stroke="#000" stroke-width="4"/>
        <rect x="120" y="20" width="40" height="40" fill="#000"/>
        <rect x="10" y="110" width="60" height="60" fill="none" stroke="#000" stroke-width="4"/>
        <rect x="20" y="120" width="40" height="40" fill="#000"/>
        <rect x="80" y="10" width="10" height="10" fill="#000"/><rect x="80" y="30" width="10" height="10" fill="#000"/>
        <rect x="80" y="50" width="10" height="10" fill="#000"/><rect x="80" y="70" width="10" height="10" fill="#000"/>
        <rect x="10" y="80" width="10" height="10" fill="#000"/><rect x="30" y="80" width="10" height="10" fill="#000"/>
        <rect x="50" y="80" width="10" height="10" fill="#000"/><rect x="100" y="80" width="10" height="10" fill="#000"/>
        <rect x="120" y="80" width="10" height="10" fill="#000"/><rect x="140" y="80" width="10" height="10" fill="#000"/>
        <rect x="160" y="80" width="10" height="10" fill="#000"/><rect x="90" y="90" width="10" height="10" fill="#000"/>
        <rect x="110" y="100" width="10" height="10" fill="#000"/><rect x="130" y="100" width="10" height="10" fill="#000"/>
        <rect x="90" y="110" width="10" height="10" fill="#000"/><rect x="150" y="110" width="10" height="10" fill="#000"/>
        <rect x="110" y="120" width="10" height="10" fill="#000"/><rect x="130" y="140" width="10" height="10" fill="#000"/>
        <rect x="90" y="150" width="10" height="10" fill="#000"/><rect x="110" y="160" width="10" height="10" fill="#000"/>
        <rect x="150" y="160" width="10" height="10" fill="#000"/>
      </svg>
      <div style="font-size:.8rem;color:var(--muted);margin-top:8px">QRIS – Scan dengan aplikasi apapun</div>
      <div style="font-size:.9rem;font-weight:700;color:var(--red);margin-top:4px">${formatRupiah(order.total)}</div>
    </div>
    <div class="pay-detail-steps">
      <div class="pds-title">Langkah pembayaran:</div>
      <ol>
        <li>Buka aplikasi GoPay, OVO, Dana, LinkAja, atau m-Banking</li>
        <li>Pilih fitur Scan QR / QRIS</li>
        <li>Arahkan kamera ke kode QR di atas</li>
        <li>Periksa nominal: <strong>${formatRupiah(order.total)}</strong></li>
        <li>Konfirmasi pembayaran</li>
        <li>Klik tombol "Saya Sudah Bayar" di bawah</li>
      </ol>
    </div>`;
  }

  document.getElementById('payDetailContent').innerHTML = html;
  document.getElementById('payDetailOverlay').dataset.orderId = orderId;
  document.getElementById('payDetailOverlay').classList.add('open');
  requestAnimationFrame(() => document.getElementById('payDetailOverlay').classList.add('visible'));
}

let uploadedProofBase64 = null;

function handleProofUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('⚠️ Ukuran foto maksimal 5MB'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedProofBase64 = e.target.result;
    document.getElementById('proofPreview').src = uploadedProofBase64;
    document.getElementById('proofPreviewWrap').style.display = 'block';
    document.getElementById('proofUploadPlaceholder').style.display = 'none';
    document.getElementById('proofFileInput').value = '';
  };
  reader.readAsDataURL(file);
}

function removeProofUpload(event) {
  event.stopPropagation();
  uploadedProofBase64 = null;
  document.getElementById('proofFileInput').value = '';
  document.getElementById('proofPreview').src = '';
  document.getElementById('proofPreviewWrap').style.display = 'none';
  document.getElementById('proofUploadPlaceholder').style.display = 'flex';
}

function resetProofUploadField() {
  uploadedProofBase64 = null;
  const f = document.getElementById('proofFileInput'); if (f) f.value = '';
  const p = document.getElementById('proofPreview'); if (p) p.src = '';
  const pw = document.getElementById('proofPreviewWrap'); if (pw) pw.style.display = 'none';
  const ph = document.getElementById('proofUploadPlaceholder'); if (ph) ph.style.display = 'flex';
}

async function saveOrderUpdate(order) {
  return new Promise((res, rej) => {
    const tx  = db.transaction('orders', 'readwrite');
    const req = tx.objectStore('orders').put(order);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}

async function viewPaymentProof(orderId) {
  const allOrders = await dbGetAll('orders');
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order || !order.paymentProof) { showToast('⚠️ Belum ada bukti pembayaran.'); return; }

  document.getElementById('payDetailTitle').textContent = '🧾 Bukti Pembayaran';
  document.getElementById('payDetailSub').textContent   = `Order #${order.orderId.slice(-6)} · ${formatRupiah(order.total)}`;
  document.getElementById('payDetailContent').innerHTML = `
    <div class="proof-fullview">
      <img src="${order.paymentProof}" alt="Bukti pembayaran">
    </div>
    <div class="proof-uploaded-at">Diupload: ${new Date(order.proofUploadedAt || order.createdAt).toLocaleString('id-ID')}</div>`;
  document.getElementById('proofUploadBox').parentElement.style.display = 'none';
  document.querySelector('#payDetailModal .form-btn').style.display = 'none';

  document.getElementById('payDetailOverlay').classList.add('open');
  requestAnimationFrame(() => document.getElementById('payDetailOverlay').classList.add('visible'));
}

async function uploadProofFromHistory(orderId) {
  const allOrders = await dbGetAll('orders');
  const order = allOrders.find(o => o.orderId === orderId);
  if (!order) return;
  await showPaymentDetail(orderId);
}

function closePayDetailModal() {
  document.getElementById('payDetailOverlay').classList.remove('visible');
  setTimeout(() => {
    document.getElementById('payDetailOverlay').classList.remove('open');
    resetProofUploadField();
    document.getElementById('proofUploadBox').parentElement.style.display = 'block';
    document.querySelector('#payDetailModal .form-btn').style.display = 'block';
  }, 280);
}

async function confirmPaymentDone() {
  const orderId = document.getElementById('payDetailOverlay').dataset.orderId;
  const allOrders = await dbGetAll('orders');
  const order = allOrders.find(o => o.orderId === orderId);
  if (order && uploadedProofBase64) {
    order.paymentProof    = uploadedProofBase64;
    order.proofUploadedAt = new Date().toISOString();
    await saveOrderUpdate(order);
  }
  closePayDetailModal();
  if (uploadedProofBase64) {
    showToast('✅ Bukti pembayaran terkirim! Sedang diverifikasi oleh penjual.');
  } else {
    showToast('✅ Terima kasih! Pembayaran sedang diverifikasi oleh penjual.');
  }
  await renderHistoryList();
}

function copyText(text) {
  navigator.clipboard.writeText(String(text)).then(() => showToast('📋 Berhasil disalin!')).catch(() => showToast('⚠️ Gagal menyalin'));
}

// ╔══════════════════════════════════════════════════════╗
// ║          PAYMENT METHOD CHANGE HANDLER               ║
// ╚══════════════════════════════════════════════════════╝

function onPayMethodChange(radio) {
  const infoEl = document.getElementById('payMethodInfo');
  const payInfoMap = {
    cod:     null,
    bca:     '🏦 Transfer ke BCA no. rek. <strong>1234567890</strong> a/n PT Jajpu Indonesia. Detail lengkap muncul setelah pesan.',
    mandiri: '🏦 Transfer ke Mandiri no. rek. <strong>0987654321</strong> a/n PT Jajpu Indonesia. Detail lengkap muncul setelah pesan.',
    gopay:   '💚 Kirim ke GoPay <strong>0821-0000-1234</strong> a/n Jajpu Official. Detail lengkap muncul setelah pesan.',
    ovo:     '💜 Kirim ke OVO <strong>0821-0000-5678</strong> a/n Jajpu Official. Detail lengkap muncul setelah pesan.',
    qris:    '📱 Kode QRIS akan tampil setelah pesanan dibuat. Scan dengan aplikasi apapun.',
  };
  const msg = payInfoMap[radio.value];
  if (msg) {
    infoEl.innerHTML = `<div class="pay-info-box">ℹ️ ${msg}</div>`;
    infoEl.style.display = 'block';
  } else {
    infoEl.style.display = 'none';
  }
}

// ╔══════════════════════════════════════════════════════╗
// ║          PENJUAL: LAPORAN PENJUALAN                  ║
// ╚══════════════════════════════════════════════════════╝

let laporanPeriod = 'all';
let laporanOrders = [];

async function openLaporanModal() {
  laporanPeriod = 'all';
  document.querySelectorAll('.period-btn').forEach((b,i) => b.classList.toggle('active', i===0));
  document.getElementById('laporanSub').textContent = `Restoran: ${currentUser.restoName}`;
  document.getElementById('laporanOverlay').classList.add('open');
  requestAnimationFrame(() => document.getElementById('laporanOverlay').classList.add('visible'));
  await renderLaporan();
}
function closeLaporanModal() {
  document.getElementById('laporanOverlay').classList.remove('visible');
  setTimeout(() => document.getElementById('laporanOverlay').classList.remove('open'), 280);
}

function setLaporanPeriod(period, el) {
  laporanPeriod = period;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderLaporan();
}

function filterByPeriod(orders, period) {
  period = period || laporanPeriod;
  const now = new Date();
  if (period === 'all') return orders;
  return orders.filter(o => {
    const d = new Date(o.createdAt);
    if (period === 'today') {
      return d.toDateString() === now.toDateString();
    } else if (period === 'week') {
      return (now - d) <= 7 * 24 * 60 * 60 * 1000;
    } else if (period === 'month') {
      return (now - d) <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });
}

async function renderLaporan() {
  const el = document.getElementById('laporanContent');
  const allOrders = await dbGetAll('orders');
  const myOrders  = allOrders.filter(o => o.items && o.items.some(i => i.resto === currentUser.restoName));
  laporanOrders   = filterByPeriod(myOrders);

  if (laporanOrders.length === 0) {
    el.innerHTML = `<div class="seller-empty">📋 Tidak ada data pada periode ini.</div>`; return;
  }

  const totalPesanan  = laporanOrders.length;
  const selesai       = laporanOrders.filter(o => o.status === 'Selesai');
  const totalRevenue  = selesai.reduce((s,o) => s + o.total, 0);
  const totalItems    = laporanOrders.reduce((s,o) => s + o.items.filter(i=>i.resto===currentUser.restoName).reduce((a,i)=>a+i.qty,0), 0);

  // Per-menu count
  const menuCount = {};
  laporanOrders.forEach(o => o.items.filter(i=>i.resto===currentUser.restoName).forEach(i => {
    if (!menuCount[i.name]) menuCount[i.name] = { qty: 0, revenue: 0 };
    menuCount[i.name].qty     += i.qty;
    menuCount[i.name].revenue += i.price * i.qty;
  }));
  const topMenus = Object.entries(menuCount).sort((a,b) => b[1].qty - a[1].qty);

  // Per-payment breakdown
  const payCount = {};
  const payLabels = { cod:'COD', bca:'BCA', mandiri:'Mandiri', gopay:'GoPay', ovo:'OVO', qris:'QRIS', transfer:'Transfer' };
  laporanOrders.forEach(o => {
    const k = payLabels[o.payMethod] || 'COD';
    if (!payCount[k]) payCount[k] = { count: 0, total: 0 };
    payCount[k].count++;
    payCount[k].total += o.total;
  });

  el.innerHTML = `
    <div class="laporan-stats-grid">
      <div class="stat-card"><div class="stat-num">${totalPesanan}</div><div class="stat-lbl">Total Pesanan</div></div>
      <div class="stat-card"><div class="stat-num">${selesai.length}</div><div class="stat-lbl">Pesanan Selesai</div></div>
      <div class="stat-card"><div class="stat-num">${totalItems}</div><div class="stat-lbl">Item Terjual</div></div>
      <div class="stat-card laporan-revenue"><div class="stat-num">${formatRupiah(totalRevenue)}</div><div class="stat-lbl">Total Pendapatan</div></div>
    </div>

    <div class="laporan-section-title">🏆 Performa Menu</div>
    <div class="laporan-table-wrap">
      <table class="laporan-table">
        <thead><tr><th>#</th><th>Nama Menu</th><th>Terjual</th><th>Pendapatan</th></tr></thead>
        <tbody>
          ${topMenus.map(([name, d], i) => `
            <tr>
              <td class="lap-rank">${i+1}</td>
              <td>${name}</td>
              <td class="lap-center">${d.qty}</td>
              <td class="lap-red">${formatRupiah(d.revenue)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="laporan-section-title">💳 Metode Pembayaran</div>
    <div class="laporan-table-wrap">
      <table class="laporan-table">
        <thead><tr><th>Metode</th><th>Jumlah Transaksi</th><th>Total</th></tr></thead>
        <tbody>
          ${Object.entries(payCount).map(([k,d]) => `
            <tr>
              <td>${k}</td>
              <td class="lap-center">${d.count} transaksi</td>
              <td class="lap-red">${formatRupiah(d.total)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="laporan-section-title">📦 Daftar Transaksi</div>
    <div class="laporan-table-wrap">
      <table class="laporan-table">
        <thead><tr><th>Order ID</th><th>Pembeli</th><th>Item</th><th>Total</th><th>Bayar</th><th>Status</th><th>Tanggal</th></tr></thead>
        <tbody>
          ${laporanOrders.map(o => `
            <tr>
              <td class="lap-id">#${o.orderId.slice(-6)}</td>
              <td>${o.buyerName}</td>
              <td style="font-size:.75rem">${o.items.filter(i=>i.resto===currentUser.restoName).map(i=>`${i.name}×${i.qty}`).join(', ')}</td>
              <td class="lap-red">${formatRupiah(o.total)}</td>
              <td>${payLabels[o.payMethod]||'COD'}</td>
              <td>${o.status}</td>
              <td style="white-space:nowrap">${new Date(o.createdAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Export PDF ──────────────────────────────────────────
async function exportLaporanPDF() {
  if (!laporanOrders || laporanOrders.length === 0) { showToast('⚠️ Tidak ada data untuk diekspor.'); return; }
  showToast('📄 Membuat PDF...');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const primaryColor = [255, 59, 59];
  const darkColor    = [30, 30, 35];
  const grayColor    = [100, 100, 110];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('JAJPU – Laporan Penjualan', 14, 13);
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(`Restoran: ${currentUser.restoName}`, 14, 21);

  const periodLabels = { all:'Semua Waktu', today:'Hari Ini', week:'7 Hari Terakhir', month:'30 Hari Terakhir' };
  doc.text(`Periode: ${periodLabels[laporanPeriod]} | Dicetak: ${new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'})}`, 100, 21);

  // Summary
  const selesai      = laporanOrders.filter(o=>o.status==='Selesai');
  const totalRevenue = selesai.reduce((s,o)=>s+o.total,0);
  const totalItems   = laporanOrders.reduce((s,o)=>s+o.items.filter(i=>i.resto===currentUser.restoName).reduce((a,i)=>a+i.qty,0),0);

  doc.setTextColor(...darkColor);
  let y = 36;
  doc.setFontSize(12); doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan', 14, y); y += 7;

  const summaryData = [
    ['Total Pesanan', String(laporanOrders.length)],
    ['Pesanan Selesai', String(selesai.length)],
    ['Item Terjual', String(totalItems)],
    ['Total Pendapatan', `Rp ${totalRevenue.toLocaleString('id-ID')}`],
  ];
  doc.autoTable({
    startY: y, head: [], body: summaryData,
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle:'bold', textColor: grayColor }, 1: { textColor: primaryColor, fontStyle:'bold' } },
    margin: { left: 14, right: 14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Menu Terlaris
  const menuCount = {};
  laporanOrders.forEach(o => o.items.filter(i=>i.resto===currentUser.restoName).forEach(i => {
    if (!menuCount[i.name]) menuCount[i.name] = { qty:0, revenue:0 };
    menuCount[i.name].qty     += i.qty;
    menuCount[i.name].revenue += i.price * i.qty;
  }));
  const topMenus = Object.entries(menuCount).sort((a,b)=>b[1].qty-a[1].qty);

  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...darkColor);
  doc.text('Performa Menu', 14, y); y += 4;
  doc.autoTable({
    startY: y,
    head: [['#','Nama Menu','Terjual','Pendapatan']],
    body: topMenus.map(([name,d],i) => [i+1, name, d.qty, `Rp ${d.revenue.toLocaleString('id-ID')}`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: primaryColor },
    margin: { left:14, right:14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Metode Pembayaran
  const payCount = {};
  const payLabels = { cod:'COD', bca:'BCA', mandiri:'Mandiri', gopay:'GoPay', ovo:'OVO', qris:'QRIS', transfer:'Transfer' };
  laporanOrders.forEach(o => {
    const k = payLabels[o.payMethod] || 'COD';
    if (!payCount[k]) payCount[k] = { count:0, total:0 };
    payCount[k].count++;
    payCount[k].total += o.total;
  });

  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...darkColor);
  doc.text('Metode Pembayaran', 14, y); y += 4;
  doc.autoTable({
    startY: y,
    head: [['Metode','Jumlah Transaksi','Total']],
    body: Object.entries(payCount).map(([k,d]) => [k, `${d.count} transaksi`, `Rp ${d.total.toLocaleString('id-ID')}`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: primaryColor },
    margin: { left:14, right:14 },
  });
  y = doc.lastAutoTable.finalY + 8;

  // Daftar Transaksi (new page if needed)
  if (y > 230) { doc.addPage(); y = 15; }
  doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...darkColor);
  doc.text('Daftar Transaksi', 14, y); y += 4;
  doc.autoTable({
    startY: y,
    head: [['Order ID','Pembeli','Total','Bayar','Status','Tanggal']],
    body: laporanOrders.map(o => [
      `#${o.orderId.slice(-6)}`,
      o.buyerName,
      `Rp ${o.total.toLocaleString('id-ID')}`,
      payLabels[o.payMethod]||'COD',
      o.status,
      new Date(o.createdAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: primaryColor },
    margin: { left:14, right:14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(...grayColor);
    doc.text(`Halaman ${i} dari ${pageCount} | © ${new Date().getFullYear()} Jajpu – Jajanan Pulau`, 14, 290);
  }

  const filename = `Laporan_${currentUser.restoName.replace(/\s+/g,'_')}_${laporanPeriod}_${Date.now()}.pdf`;
  doc.save(filename);
  showToast('✅ PDF berhasil diunduh!');
}

// ── Export Excel ────────────────────────────────────────
async function exportLaporanExcel() {
  if (!laporanOrders || laporanOrders.length === 0) { showToast('⚠️ Tidak ada data untuk diekspor.'); return; }
  showToast('📊 Membuat Excel...');

  const wb = XLSX.utils.book_new();
  const payLabels = { cod:'COD', bca:'BCA', mandiri:'Mandiri', gopay:'GoPay', ovo:'OVO', qris:'QRIS', transfer:'Transfer' };

  // ── Sheet 1: Ringkasan ──
  const selesai      = laporanOrders.filter(o=>o.status==='Selesai');
  const totalRevenue = selesai.reduce((s,o)=>s+o.total,0);
  const totalItems   = laporanOrders.reduce((s,o)=>s+o.items.filter(i=>i.resto===currentUser.restoName).reduce((a,i)=>a+i.qty,0),0);
  const periodLabels = { all:'Semua Waktu', today:'Hari Ini', week:'7 Hari Terakhir', month:'30 Hari Terakhir' };

  const sheetRingkasan = [
    ['LAPORAN PENJUALAN – JAJPU'],
    [''],
    ['Restoran', currentUser.restoName],
    ['Periode', periodLabels[laporanPeriod]],
    ['Tanggal Cetak', new Date().toLocaleDateString('id-ID')],
    [''],
    ['RINGKASAN'],
    ['Total Pesanan', laporanOrders.length],
    ['Pesanan Selesai', selesai.length],
    ['Item Terjual', totalItems],
    ['Total Pendapatan (Selesai)', totalRevenue],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheetRingkasan);
  ws1['!cols'] = [{ wch: 28 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  // ── Sheet 2: Performa Menu ──
  const menuCount = {};
  laporanOrders.forEach(o => o.items.filter(i=>i.resto===currentUser.restoName).forEach(i => {
    if (!menuCount[i.name]) menuCount[i.name] = { qty:0, revenue:0 };
    menuCount[i.name].qty     += i.qty;
    menuCount[i.name].revenue += i.price * i.qty;
  }));
  const topMenus = Object.entries(menuCount).sort((a,b)=>b[1].qty-a[1].qty);

  const menuRows = [['No', 'Nama Menu', 'Total Terjual', 'Total Pendapatan (Rp)']];
  topMenus.forEach(([name, d], i) => menuRows.push([i+1, name, d.qty, d.revenue]));
  const ws2 = XLSX.utils.aoa_to_sheet(menuRows);
  ws2['!cols'] = [{ wch:5 }, { wch:28 }, { wch:16 }, { wch:22 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Performa Menu');

  // ── Sheet 3: Metode Pembayaran ──
  const payCount = {};
  laporanOrders.forEach(o => {
    const k = payLabels[o.payMethod] || 'COD';
    if (!payCount[k]) payCount[k] = { count:0, total:0 };
    payCount[k].count++;
    payCount[k].total += o.total;
  });
  const payRows = [['Metode Pembayaran', 'Jumlah Transaksi', 'Total (Rp)']];
  Object.entries(payCount).forEach(([k,d]) => payRows.push([k, d.count, d.total]));
  const ws3 = XLSX.utils.aoa_to_sheet(payRows);
  ws3['!cols'] = [{ wch:22 }, { wch:20 }, { wch:18 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Metode Pembayaran');

  // ── Sheet 4: Daftar Transaksi ──
  const txRows = [['Order ID','Pembeli','Item','Total (Rp)','Metode Bayar','Status','Tanggal']];
  laporanOrders.forEach(o => {
    const itemStr = o.items.filter(i=>i.resto===currentUser.restoName).map(i=>`${i.name} x${i.qty}`).join(', ');
    txRows.push([
      o.orderId,
      o.buyerName,
      itemStr,
      o.total,
      payLabels[o.payMethod]||'COD',
      o.status,
      new Date(o.createdAt).toLocaleDateString('id-ID'),
    ]);
  });
  const ws4 = XLSX.utils.aoa_to_sheet(txRows);
  ws4['!cols'] = [{ wch:24 }, { wch:18 }, { wch:40 }, { wch:16 }, { wch:16 }, { wch:22 }, { wch:14 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Transaksi');

  const filename = `Laporan_${currentUser.restoName.replace(/\s+/g,'_')}_${laporanPeriod}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
  showToast('✅ Excel berhasil diunduh!');
}

async function initApp() {
  try {
    await initDB();
    await migrateLegacyData();
    await loadSession();
    const dbMenu = await dbGetAll('menu');
    menuData = [...SEED_MENU];
    dbMenu.forEach(item => { if (!menuData.find(m => m.id === item.id)) menuData.push(item); });
    renderMenu(menuData);
    updateAuthNav();
  } catch (err) {
    console.error('initApp error:', err);
    menuData = [...SEED_MENU];
    renderMenu(menuData);
    updateAuthNav();
  }
}

initApp();
