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

  document.getElementById('checkoutName').value    = currentUser.name || '';
  document.getElementById('checkoutPhone').value   = (currentUser.phone || '').replace(/^62/, '');
  document.getElementById('checkoutAddress').value = currentUser.address || '';
  document.getElementById('checkoutNote').value    = '';
  document.getElementById('checkoutError').textContent = '';

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
  const address        = document.getElementById('checkoutAddress').value.trim();
  const note           = document.getElementById('checkoutNote').value.trim();
  const errEl          = document.getElementById('checkoutError');

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
    items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, resto: i.resto })),
    total:     subtotal,
    status:    'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await dbAdd('orders', order);

    if (!currentUser.address) {
      currentUser.address = address;
      await dbPut('users', currentUser);
      await saveSession(currentUser);
    }

    cart = {};
    updateCartBadge();
    renderCartPanel();
    closeCheckoutModal();
    showOrderSuccess(order);
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
  if (password.length < 6)          { errEl.textContent = 'Password minimal 6 karakter.'; return; }
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
  if (password.length < 6) { errEl.textContent = 'Password minimal 6 karakter.'; return; }
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
    const sellerBtn = currentUser.role === 'seller' ? `<button class="btn-seller" onclick="openSellerDashboard()">🏪 Dashboard</button>` : '';
    navRight.innerHTML = `
      <div class="user-badge" onclick="openProfileModal()" title="Edit Profil" style="cursor:pointer">
        ${currentUser.role === 'seller' ? '🏪' : '👤'} ${currentUser.name} ✏️
      </div>
      ${sellerBtn}
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
  if (password && password.length < 6) { errEl.textContent = 'Password baru minimal 6 karakter.'; return; }
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
  document.getElementById('dashMenuTab').style.display = tab === 'menu' ? 'block' : 'none';
  document.getElementById('dashAddTab').style.display  = tab === 'add'  ? 'block' : 'none';
  if (tab === 'menu') renderSellerMenu();
  if (tab === 'add')  resetImgUploadField();
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
// ║                  INISIALISASI APP                    ║
// ╚══════════════════════════════════════════════════════╝

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
