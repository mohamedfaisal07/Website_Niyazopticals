// Init Supabase (graceful no-op if keys not set)
let supabaseClient = null;
try {
  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch(e) { console.log('Supabase not configured yet'); }

// ===== PRODUCTS DATA =====
const products = [
  {
    id: 1,
    name: 'Full Frame Offer',
    desc: 'Blue Cut Lens (100% filtered) + Premium Full Frame',
    mrp: 4000,
    price: 2200,
    emoji: '👓',
    features: ['Blue Cut 100%', 'Full Frame', 'Anti-glare', 'UV Protection'],
    bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
    waMsg: 'Hi, I want to order the Full Frame Offer (₹2200). Blue Cut Lens + Full Frame. I will send my prescription.'
  },
  {
    id: 2,
    name: 'Half Frame Offer',
    desc: 'Blue Cut Lens (100% filtered) + Premium Half Frame',
    mrp: 4300,
    price: 2400,
    emoji: '🕶️',
    features: ['Blue Cut 100%', 'Half Frame', 'Anti-glare', 'UV Protection'],
    bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
    waMsg: 'Hi, I want to order the Half Frame Offer (₹2400). Blue Cut Lens + Half Frame. I will send my prescription.'
  },
  {
    id: 3,
    name: 'Frameless Offer',
    desc: 'Blue Cut Lens (100% filtered) + Rimless Frameless',
    mrp: 6500,
    price: 2900,
    emoji: '✨',
    features: ['Blue Cut 100%', 'Frameless', 'Anti-glare', 'UV Protection'],
    bg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    waMsg: 'Hi, I want to order the Frameless Offer (₹2900). Blue Cut Lens + Frameless. I will send my prescription.'
  }
];

function getDiscount(mrp, price) {
  return Math.round((1 - price/mrp)*100);
}

function renderProductCard(p, mode='home') {
  const disc = getDiscount(p.mrp, p.price);
  return `
    <div class="${mode==='shop'?'shop-product-card':'product-card'}">
      <div class="product-img-wrap" style="background:${p.bg}">
        <div class="product-emoji">${p.emoji}</div>
        <span class="stock-badge">Limited Stock</span>
        <span class="discount-badge">Save ${disc}%</span>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price-wrap">
          <span class="price-offer">₹${p.price.toLocaleString()}</span>
          <span class="price-mrp">₹${p.mrp.toLocaleString()}</span>
        </div>
        <div class="product-features">
          ${p.features.map(f=>`<span class="feature-tag">${f}</span>`).join('')}
        </div>
        <button class="btn-buy" onclick="openBuyModal(${p.id})">🛒 Buy Now</button>
      </div>
    </div>
  `;
}

// Render products
document.getElementById('home-products-grid').innerHTML = products.map(p=>renderProductCard(p,'home')).join('');
document.getElementById('shop-products-grid').innerHTML = products.map(p=>renderProductCard(p,'shop')).join('');

// ===== NAVIGATION =====
let currentPage = 'home';
function navigate(page) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  currentPage = page;
  window.scrollTo({top:0,behavior:'smooth'});
  // Update active nav link
  const links = document.querySelectorAll('.nav-link');
  const map = {home:0,shop:1,contact:2};
  if(links[map[page]]) links[map[page]].classList.add('active');
}

// ===== MOBILE NAV =====
function toggleMenu() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ===== SCROLL =====
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>40);
  // fade-in observer
});

// ===== FADE IN =====
const obs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:.15});
document.querySelectorAll('.fade-in').forEach(el=>obs.observe(el));

// ===== MODAL =====
let selectedProduct = null;
function openBuyModal(productId) {
  selectedProduct = products.find(p=>p.id===productId);
  document.getElementById('modal-product-name').textContent = selectedProduct.name;
  document.getElementById('modal-product-price').textContent = '₹'+selectedProduct.price.toLocaleString();
  document.getElementById('modal-wa-btn').onclick = ()=>{
    window.open('https://wa.me/919443617786?text='+encodeURIComponent(selectedProduct.waMsg),'_blank');
  };
  document.getElementById('modalOverlay').classList.add('open');
}
function closeModal(e) {
  if(e.target===document.getElementById('modalOverlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modalOverlay').classList.remove('open');
}

// ===== PAYMENT =====
async function initiatePayment() {
  const name = document.getElementById('order-name').value.trim();
  const phone = document.getElementById('order-phone').value.trim();
  const address = document.getElementById('order-address').value.trim();
  if(!name || !phone || !address) { showToast('Please fill all fields'); return; }
  if(!selectedProduct) return;

  // Save lead to Supabase
  if(supabaseClient) {
    try {
      await supabaseClient.from('orders').insert([{
        product_name: selectedProduct.name,
        amount: selectedProduct.price,
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        status: 'pending_payment',
        created_at: new Date().toISOString()
      }]);
    } catch(e) { console.log('Supabase insert error',e); }
  }

  // Razorpay checkout
  if(RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
    showToast('⚠️ Razorpay not configured yet. Redirecting to WhatsApp...');
    setTimeout(()=>{
      window.open('https://wa.me/919443617786?text='+encodeURIComponent(selectedProduct.waMsg),'_blank');
    },1500);
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: selectedProduct.price * 100, // paise
    currency: 'INR',
    name: 'Niyaz Opticals',
    description: selectedProduct.name,
    image: '', // Add your logo URL
    prefill: { name, contact: phone },
    theme: { color: '#0d9488' },
    handler: async function(response) {
      showToast('✅ Payment Successful! We\'ll contact you soon.');
      // Update order status
      if(supabaseClient) {
        try {
          await supabaseClient.from('orders').update({
            status:'paid',
            razorpay_payment_id: response.razorpay_payment_id
          }).eq('customer_phone',phone).eq('product_name',selectedProduct.name);
        } catch(e){}
      }
      closeModalDirect();
      // Prompt WhatsApp prescription
      setTimeout(()=>{
        window.open('https://wa.me/919443617786?text=Hi+I+just+paid+for+'+encodeURIComponent(selectedProduct.name)+'+.+Here+is+my+prescription:','_blank');
      },2000);
    }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

// ===== CONTACT FORM =====
async function submitContactForm(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('submitBtnText');
  btnText.textContent = 'Submitting...';
  btn.disabled = true;

  const data = {
    name: document.getElementById('cf-name').value,
    phone: document.getElementById('cf-phone').value,
    interest: document.getElementById('cf-interest').value,
    message: document.getElementById('cf-message').value,
    created_at: new Date().toISOString()
  };

  if(supabaseClient) {
    try {
      await supabaseClient.from('contacts').insert([data]);
    } catch(e) { console.log('Supabase contact error',e); }
  }

  document.getElementById('formSuccess').style.display = 'block';
  document.getElementById('contactForm').style.display = 'none';
  showToast('✅ Submitted! We\'ll call you soon.');
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}

// ===== INIT FADE =====
window.addEventListener('load',()=>{
  setTimeout(()=>{
    document.querySelectorAll('.fade-in').forEach(el=>{
      const rect=el.getBoundingClientRect();
      if(rect.top<window.innerHeight) el.classList.add('visible');
    });
  },100);
});