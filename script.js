// =====================
// DATA MENU
// =====================
const menuData = [
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
// STATE
// =====================
let cart = {};
let currentCat = 'all';

// =====================
// UTILS
// =====================
function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

// =====================
// RENDER MENU
// =====================
function renderMenu(items) {
  const grid = document.getElementById('foodGrid');
  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">
        <div style="font-size:3rem;margin-bottom:12px">😕</div>
        <div>Menu tidak ditemukan</div>
      </div>`;
    return;
  }
  grid.innerHTML = items.map(item => `
    <div class="food-item">
      <div class="food-item-img">
        <img src="${item.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'">
      </div>
      <div class="food-item-body">
        <div class="food-item-name">${item.name}</div>
        <div class="food-item-resto">${item.resto} • ⭐ ${item.rating}</div>
        <div class="food-item-footer">
          <div class="food-price">${formatRupiah(item.price)}</div>
          <button class="add-btn" onclick="addToCart(${item.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// =====================
// FILTER: KATEGORI
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

// =====================
// FILTER: SEARCH
// =====================
function filterMenu() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  let items = currentCat === 'all' ? menuData : menuData.filter(m => m.cat === currentCat);
  if (q) items = items.filter(m => m.name.toLowerCase().includes(q) || m.resto.toLowerCase().includes(q));
  renderMenu(items);
}

// =====================
// CART: TAMBAH ITEM
// =====================
function addToCart(id) {
  const item = menuData.find(m => m.id === id);
  if (!item) return;
  if (cart[id]) cart[id].qty++;
  else cart[id] = { ...item, qty: 1 };
  updateCartBadge();
  renderCartPanel();
  showToast(`${item.emoji} ${item.name} ditambahkan!`);
}

// =====================
// CART: UPDATE BADGE
// =====================
function updateCartBadge() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartBadge').textContent = total;
}

// =====================
// CART: RENDER PANEL
// =====================
function renderCartPanel() {
  const items = Object.values(cart);
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');

  if (items.length === 0) {
    itemsEl.innerHTML = `
      <div class="empty-cart">
        <div class="ec-emoji">🛒</div>
        <div class="ec-text">Keranjangmu kosong.<br>Yuk pesan sesuatu!</div>
      </div>`;
    footerEl.innerHTML = '';
    return;
  }

  itemsEl.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="ci-img"><img src="${item.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80'}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80'"></div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${formatRupiah(item.price * item.qty)}</div>
      </div>
      <div class="ci-qty">
        <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  footerEl.innerHTML = `
    <div class="cart-row total"><span>Total</span><span>${formatRupiah(subtotal)}</span></div>
    <button class="checkout-btn" onclick="checkout()">Bayar Sekarang →</button>
  `;
}

// =====================
// CART: UBAH JUMLAH
// =====================
function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  updateCartBadge();
  renderCartPanel();
}

// =====================
// CART: CHECKOUT → buka modal alamat
// =====================
function checkout() {
  if (!currentUser) {
    toggleCart();
    openModal('login');
    showToast('⚠️ Silakan masuk dulu untuk memesan');
    return;
  }
  openCheckoutModal();
}

// =====================
// CHECKOUT MODAL
// =====================
function openCheckoutModal() {
  const overlay = document.getElementById('checkoutOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));

  // Pre-fill dari profil
  document.getElementById('checkoutName').value    = currentUser.name || '';
  document.getElementById('checkoutPhone').value   = (currentUser.phone || '').replace(/^62/, '');
  document.getElementById('checkoutAddress').value = currentUser.address || '';
  document.getElementById('checkoutNote').value    = '';
  document.getElementById('checkoutError').textContent = '';

  // Render ringkasan
  const items    = Object.values(cart);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('checkoutSummary').innerHTML = `
    <div class="co-summary-list">
      ${items.map(i => `
        <div class="co-summary-item">
          <span class="co-item-name">${i.name} <span class="co-item-qty">×${i.qty}</span></span>
          <span class="co-item-price">${formatRupiah(i.price * i.qty)}</span>
        </div>`).join('')}
    </div>`;
  document.getElementById('checkoutTotalRow').innerHTML = `
    <div class="cart-row total"><span>Total Pembayaran</span><span>${formatRupiah(subtotal)}</span></div>`;
}

function closeCheckoutModal() {
  const overlay = document.getElementById('checkoutOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
}

function handleCheckoutOverlayClick(e) {
  if (e.target === document.getElementById('checkoutOverlay')) closeCheckoutModal();
}

function doCheckout() {
  const name    = document.getElementById('checkoutName').value.trim();
  const phone   = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const errEl   = document.getElementById('checkoutError');

  if (!name)    { errEl.textContent = 'Nama penerima wajib diisi.'; return; }
  if (!phone)   { errEl.textContent = 'No. telepon penerima wajib diisi.'; return; }
  if (!address) { errEl.textContent = 'Alamat tujuan wajib diisi.'; return; }
  if (address.length < 10) { errEl.textContent = 'Alamat terlalu singkat, mohon lengkapi.'; return; }

  // Simpan alamat ke profil jika belum ada
  if (!currentUser.address) {
    currentUser.address = address;
    const idx = users.findIndex(u => u.phone === currentUser.phone);
    if (idx !== -1) users[idx] = currentUser;
    saveUsers();
    saveSession(currentUser);
  }

  cart = {};
  updateCartBadge();
  renderCartPanel();
  closeCheckoutModal();
  showToast('🎉 Pesanan berhasil! Dikirim ke: ' + address.substring(0, 30) + '...');
}

// =====================
// EDIT PROFIL
// =====================
function openProfileModal() {
  if (!currentUser) return;
  const overlay = document.getElementById('profileOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));

  document.getElementById('profileSub').textContent    = displayPhone(currentUser.phone);
  document.getElementById('profileName').value         = currentUser.name || '';
  document.getElementById('profilePhone').value        = (currentUser.phone || '').replace(/^62/, '');
  document.getElementById('profileAddress').value      = currentUser.address || '';
  document.getElementById('profilePassword').value     = '';
  document.getElementById('profileError').textContent  = '';
}

function closeProfileModal() {
  const overlay = document.getElementById('profileOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
}

function handleProfileOverlayClick(e) {
  if (e.target === document.getElementById('profileOverlay')) closeProfileModal();
}

function saveProfile() {
  const name     = document.getElementById('profileName').value.trim();
  const address  = document.getElementById('profileAddress').value.trim();
  const password = document.getElementById('profilePassword').value;
  const errEl    = document.getElementById('profileError');

  if (!name) { errEl.textContent = 'Nama tidak boleh kosong.'; return; }
  if (password && password.length < 6) { errEl.textContent = 'Password baru minimal 6 karakter.'; return; }

  currentUser.name    = name;
  currentUser.address = address;
  if (password) currentUser.password = password;

  const idx = users.findIndex(u => u.phone === currentUser.phone);
  if (idx !== -1) users[idx] = currentUser;
  saveUsers();
  saveSession(currentUser);
  updateAuthNav();
  closeProfileModal();
  showToast('✅ Profil berhasil diperbarui!');
}

// =====================
// CART: TOGGLE PANEL
// =====================
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

// =====================
// TOAST NOTIFIKASI
// =====================
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// =====================
// AUTH: STATE
// =====================
let users = JSON.parse(localStorage.getItem('jajpu_users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('jajpu_session') || 'null');

function saveUsers() { localStorage.setItem('jajpu_users', JSON.stringify(users)); }
function saveSession(user) { currentUser = user; localStorage.setItem('jajpu_session', JSON.stringify(user)); }
function clearSession() { currentUser = null; localStorage.removeItem('jajpu_session'); }

// =====================
// AUTH: PHONE UTILS
// =====================
// Normalisasi: hapus spasi/strip, ubah awalan 0 → 62
function normalizePhone(raw) {
  let d = raw.replace(/[\s\-().]/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  if (d.startsWith('+')) d = d.slice(1);
  return d;
}
function isValidPhone(normalized) {
  return /^62\d{8,13}$/.test(normalized);
}
function displayPhone(normalized) {
  // Format: +62 812-3456-7890
  const local = normalized.replace(/^62/, '');
  return '+62 ' + local.replace(/(\d{3,4})(\d{4})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
}

// =====================
// AUTH: MODAL
// =====================
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
  ['loginError','registerError','sellerError'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
}
function handleAuthOverlayClick(e) {
  if (e.target === document.getElementById('authOverlay')) closeModal();
}
function switchModal(type) {
  const forms = ['loginForm','registerForm','registerBuyerForm','registerSellerForm'];
  forms.forEach(id => document.getElementById(id).style.display = 'none');
  const map = {
    login:          'loginForm',
    register:       'registerForm',
    registerBuyer:  'registerBuyerForm',
    registerSeller: 'registerSellerForm',
  };
  if (map[type]) document.getElementById(map[type]).style.display = 'block';
  // Clear all errors
  ['loginError','registerError','sellerError'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '';
  });
}

// =====================
// AUTH: LOGIN
// =====================
function doLogin() {
  const phone    = normalizePhone(document.getElementById('loginPhone').value.trim());
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');
  if (!phone || !password) { errEl.textContent = 'No. telepon dan password wajib diisi.'; return; }
  if (!isValidPhone(phone)) { errEl.textContent = 'Format no. telepon tidak valid.'; return; }
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) { errEl.textContent = 'No. telepon atau password salah.'; return; }
  saveSession(user);
  updateAuthNav();
  closeModal();
  showToast(`👋 Halo, ${user.name}!`);
}

// =====================
// AUTH: REGISTER PEMBELI
// =====================
function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const phone    = normalizePhone(document.getElementById('regPhone').value.trim());
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('registerError');
  if (!name || !phone || !password) { errEl.textContent = 'Semua field wajib diisi.'; return; }
  if (!isValidPhone(phone))          { errEl.textContent = 'Format no. telepon tidak valid (min. 9 digit).'; return; }
  if (password.length < 6)           { errEl.textContent = 'Password minimal 6 karakter.'; return; }
  if (users.find(u => u.phone === phone)) { errEl.textContent = 'No. telepon sudah terdaftar.'; return; }
  const newUser = { name, phone, password, role: 'buyer' };
  users.push(newUser);
  saveUsers();
  saveSession(newUser);
  updateAuthNav();
  closeModal();
  showToast(`🎉 Akun berhasil dibuat! Halo, ${name}!`);
}

// =====================
// AUTH: REGISTER PENJUAL
// =====================
function doRegisterSeller() {
  const name     = document.getElementById('sellerName').value.trim();
  const resto    = document.getElementById('sellerResto').value.trim();
  const cat      = document.getElementById('sellerCat').value;
  const phone    = normalizePhone(document.getElementById('sellerPhone').value.trim());
  const password = document.getElementById('sellerPassword').value;
  const errEl    = document.getElementById('sellerError');
  if (!name || !resto || !cat || !phone || !password) { errEl.textContent = 'Semua field wajib diisi.'; return; }
  if (!isValidPhone(phone))  { errEl.textContent = 'Format no. telepon tidak valid (min. 9 digit).'; return; }
  if (password.length < 6)   { errEl.textContent = 'Password minimal 6 karakter.'; return; }
  if (users.find(u => u.phone === phone)) { errEl.textContent = 'No. telepon sudah terdaftar.'; return; }
  const newUser = { name, phone, password, role: 'seller', restoName: resto, restoCat: cat, menu: [] };
  users.push(newUser);
  saveUsers();
  saveSession(newUser);
  updateAuthNav();
  closeModal();
  showToast(`🏪 Restoran "${resto}" berhasil didaftarkan!`);
}

// =====================
// AUTH: LOGOUT
// =====================
function doLogout() {
  const name = currentUser?.name || '';
  clearSession();
  updateAuthNav();
  showToast(`👋 Sampai jumpa, ${name}!`);
}

// =====================
// AUTH: UPDATE NAV
// =====================
function updateAuthNav() {
  const navRight = document.getElementById('navRight');
  if (currentUser) {
    const sellerBtn = currentUser.role === 'seller'
      ? `<button class="btn-seller" onclick="openSellerDashboard()">🏪 Dashboard</button>`
      : '';
    navRight.innerHTML = `
      <div class="user-badge" onclick="openProfileModal()" title="Edit Profil" style="cursor:pointer">
        ${currentUser.role === 'seller' ? '🏪' : '👤'} ${currentUser.name} ✏️
      </div>
      ${sellerBtn}
      <button class="btn-ghost" onclick="doLogout()">Keluar</button>
      <button class="cart-btn" onclick="toggleCart()">🛒<span class="cart-badge" id="cartBadge">0</span></button>
    `;
  } else {
    navRight.innerHTML = `
      <button class="btn-ghost" onclick="openModal('login')">Masuk</button>
      <button class="btn-primary" onclick="openModal('register')">Daftar</button>
      <button class="cart-btn" onclick="toggleCart()">🛒<span class="cart-badge" id="cartBadge">0</span></button>
    `;
  }
  updateCartBadge();
}

// =====================
// SELLER: DASHBOARD
// =====================
function openSellerDashboard() {
  const overlay = document.getElementById('sellerOverlay');
  overlay.classList.add('open');
  requestAnimationFrame(() => overlay.classList.add('visible'));
  document.getElementById('sellerDashTitle').textContent = currentUser.restoName;
  document.getElementById('sellerDashSub').textContent   = `Kategori: ${currentUser.restoCat} • ${currentUser.menu.length} menu`;
  switchDashTab('menu', document.querySelector('.dash-tab'));
}

function closeSellerDashboard() {
  const overlay = document.getElementById('sellerOverlay');
  overlay.classList.remove('visible');
  setTimeout(() => overlay.classList.remove('open'), 280);
}

function handleSellerOverlayClick(e) {
  if (e.target === document.getElementById('sellerOverlay')) closeSellerDashboard();
}

function switchDashTab(tab, el) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('dashMenuTab').style.display = tab === 'menu' ? 'block' : 'none';
  document.getElementById('dashAddTab').style.display  = tab === 'add'  ? 'block' : 'none';
  if (tab === 'menu') renderSellerMenu();
  if (tab === 'add' && typeof resetImgUploadField === 'function') resetImgUploadField();
}

function renderSellerMenu() {
  const list = document.getElementById('sellerMenuList');
  const menu = currentUser.menu || [];
  if (menu.length === 0) {
    list.innerHTML = `<div class="seller-empty">😴 Belum ada menu. Tambahkan menu pertamamu!</div>`;
    return;
  }
  list.innerHTML = menu.map((item, i) => `
    <div class="seller-menu-item">
      <div class="smi-img"><img src="${item.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80'}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80'"></div>
      <div class="smi-info">
        <div class="smi-name">${item.name}</div>
        <div class="smi-price">${formatRupiah(item.price)}</div>
      </div>
      <button class="smi-del" onclick="deleteSellerMenu(${i})">🗑️</button>
    </div>
  `).join('');
}

// =====================
// SELLER: UPLOAD FOTO
// =====================
let uploadedImgBase64 = null;

function handleImgUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast('⚠️ Ukuran foto maksimal 5MB');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadedImgBase64 = e.target.result;
    document.getElementById('imgPreview').src = uploadedImgBase64;
    document.getElementById('imgPreviewWrap').style.display = 'block';
    document.getElementById('imgUploadPlaceholder').style.display = 'none';
    document.getElementById('newMenuImg').value = ''; // clear URL jika pakai upload
  };
  reader.readAsDataURL(file);
}

function removeUploadedImg(event) {
  event.stopPropagation();
  uploadedImgBase64 = null;
  document.getElementById('newMenuFile').value = '';
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('imgUploadPlaceholder').style.display = 'flex';
}

function resetImgUploadField() {
  uploadedImgBase64 = null;
  document.getElementById('newMenuFile').value = '';
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('imgUploadPlaceholder').style.display = 'flex';
}

// =====================
// SELLER: TAMBAH MENU
// =====================
function doAddMenu() {
  const name  = document.getElementById('newMenuName').value.trim();
  const url   = document.getElementById('newMenuImg').value.trim();
  const price = parseInt(document.getElementById('newMenuPrice').value);
  const errEl = document.getElementById('addMenuError');

  if (!name)              { errEl.textContent = 'Nama menu wajib diisi.'; return; }
  if (!price || price<=0) { errEl.textContent = 'Harga harus lebih dari 0.'; return; }

  // Prioritas: foto upload > URL > default
  const imgFinal = uploadedImgBase64
    || url
    || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

  const newId   = Date.now();
  const newItem = { id: newId, name, img: imgFinal, price, cat: currentUser.restoCat, resto: currentUser.restoName, rating: 5.0 };

  currentUser.menu.push(newItem);
  menuData.push(newItem);

  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) users[idx] = currentUser;
  saveUsers();
  saveSession(currentUser);

  // Reset form
  document.getElementById('newMenuName').value  = '';
  document.getElementById('newMenuImg').value   = '';
  document.getElementById('newMenuPrice').value = '';
  errEl.textContent = '';
  resetImgUploadField();

  document.getElementById('sellerDashSub').textContent = `Kategori: ${currentUser.restoCat} • ${currentUser.menu.length} menu`;
  renderMenu(menuData);
  showToast(`✅ "${name}" ditambahkan ke menu!`);
  switchDashTab('menu', document.querySelectorAll('.dash-tab')[0]);
}

function deleteSellerMenu(index) {
  const item = currentUser.menu[index];
  currentUser.menu.splice(index, 1);

  // Hapus juga dari menuData global
  const gi = menuData.findIndex(m => m.id === item.id);
  if (gi !== -1) menuData.splice(gi, 1);

  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) users[idx] = currentUser;
  saveUsers();
  saveSession(currentUser);

  document.getElementById('sellerDashSub').textContent = `Kategori: ${currentUser.restoCat} • ${currentUser.menu.length} menu`;
  renderSellerMenu();
  renderMenu(menuData);
  showToast(`🗑️ "${item.name}" dihapus dari menu`);
}

// =====================
// FILTER: RESTORAN
// =====================
let currentResto = null;

function filterByResto(restoName, el) {
  // Toggle: klik ulang restoran yang sama = reset
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
  const items = menuData.filter(m => m.resto === restoName);
  renderMenu(items);
  document.getElementById('menuSection').scrollIntoView({ behavior: 'smooth' });
  showToast(`🏪 Menampilkan menu ${restoName}`);
}

// =====================
// INIT
// =====================
// Pulihkan menu dari semua penjual yang terdaftar
users.forEach(u => {
  if (u.role === 'seller' && Array.isArray(u.menu)) {
    u.menu.forEach(item => {
      if (!menuData.find(m => m.id === item.id)) menuData.push(item);
    });
  }
});

renderMenu(menuData);
updateAuthNav();
