
// Simple GymFlex demo app logic (frontend)
const gyms = [
  { id:'g1', name:'Titan Gym', lat:42.9839, lon:47.5047, type:'⚡', load:25, img:'images/g1.svg', floor:'images/plan1.svg' },
  { id:'g2', name:'Energy Fitness', lat:42.9872, lon:47.5040, type:'W', load:65, img:'images/g2.svg', floor:'images/plan2.svg' },
  { id:'g3', name:'Forma Club', lat:42.9800, lon:47.5065, type:'M', load:90, img:'images/g3.svg', floor:'images/plan3.svg' }
];

let map, markers = [];
let role = 'client';

function showSplashAndInit(){
  setTimeout(()=>{
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    initTheme();
    initTabs();
    initMap();
    initProfile();
    initRoleToggle();
  }, 700);
}

function initRoleToggle(){
  const btn = document.getElementById('roleToggle');
  btn.onclick = ()=>{
    role = role==='client'?'admin':'client';
    btn.textContent = 'Роль: ' + (role==='client'?'Клиент':'Админ');
    if(role==='admin'){
      document.getElementById('tabPrograms').style.display='none';
      document.getElementById('tabProfile').textContent='Админ';
    } else {
      document.getElementById('tabPrograms').style.display='inline-block';
      document.getElementById('tabProfile').textContent='Профиль';
    }
  };
}

function initTheme(){
  const tbtn = document.getElementById('themeToggle');
  const saved = localStorage.getItem('gf_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved==='dark'?'':'light');
  tbtn.textContent = saved==='dark'?'Светлая':'Тёмная';
  tbtn.onclick = ()=>{
    const cur = localStorage.getItem('gf_theme')||'dark';
    const next = cur==='dark'?'light':'dark';
    localStorage.setItem('gf_theme', next);
    document.documentElement.setAttribute('data-theme', next==='dark'?'':'light');
    tbtn.textContent = next==='dark'?'Светлая':'Тёмная';
  }
}

function initTabs(){
  const mapView = document.getElementById('mapView');
  const programsView = document.getElementById('programsView');
  const profileView = document.getElementById('profileView');
  document.getElementById('tabMap').onclick = ()=> showView('map');
  document.getElementById('tabPrograms').onclick = ()=> showView('programs');
  document.getElementById('tabProfile').onclick = ()=> showView('profile');
  function showView(v){
    document.querySelectorAll('.view').forEach(el=>el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
    if(v==='map'){ mapView.classList.remove('hidden'); document.getElementById('tabMap').classList.add('active'); }
    if(v==='programs'){ programsView.classList.remove('hidden'); document.getElementById('tabPrograms').classList.add('active'); }
    if(v==='profile'){ profileView.classList.remove('hidden'); document.getElementById('tabProfile').classList.add('active'); }
  }
}

function initMap(){
  map = L.map('map').setView([42.9839, 47.5047], 14); // Makhachkala
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  gyms.forEach(g=>{
    const color = g.load < 40 ? 'green' : (g.load < 75 ? 'orange' : 'red');
    const el = L.divIcon({className:'gym-marker', html:`<div style="background:${color};color:#000;padding:6px 8px;border-radius:6px;font-weight:700">${g.type}</div>`});
    const m = L.marker([g.lat, g.lon], {icon:el}).addTo(map);
    m.on('click', ()=> showGymModal(g));
    markers.push(m);
  });
}

function showGymModal(g){
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  content.innerHTML = `
    <h3>${g.name}</h3>
    <div>Тип: ${g.type} — Загрузка: <strong>${g.load}%</strong></div>
    <div class="card" style="margin-top:8px">
      <img src="${g.img}" class="gym-photo" alt="photo" />
      <img src="${g.floor}" class="gym-photo" alt="plan" />
    </div>
    <div style="margin-top:10px">
      <button class="btn primary" onclick="buyDemo('${g.id}')">Купить абонемент (демо)</button>
      <button class="btn" onclick="showQrMock()">Показать QR</button>
      ${role==='admin'?`<button class="btn" onclick="adminScan('${g.id}')">Сканировать QR (демо)</button>`:''}
    </div>
  `;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  document.getElementById('modalClose').onclick = closeModal;
  modal.onclick = (e)=>{ if(e.target===modal) closeModal(); }
}

function buyDemo(id){
  const profile = JSON.parse(localStorage.getItem('gf_profile')||'{}');
  if(!profile.name){ alert('Сначала заполните профиль в разделе Профиль'); return; }
  profile.pass = profile.pass || {type:'demo', remaining:5, expires: new Date(Date.now()+30*24*3600*1000).toISOString()};
  localStorage.setItem('gf_profile', JSON.stringify(profile));
  alert('Демо-абонемент активирован: 5 тренировок в течение 30 дней');
  closeModal();
}

function showQrMock(){ const profile = JSON.parse(localStorage.getItem('gf_profile')||'{}'); const modal = document.getElementById('modal'); const content = document.getElementById('modalContent'); const qr = profile.name ? ('GF-' + (profile.name.substr(0,3).toUpperCase()) + '-' + (profile.age||'00')) : 'GF-ANON-00'; content.innerHTML = `<h3>Ваш QR (демо)</h3><div style="font-size:18px;padding:8px;background:rgba(255,255,255,0.04);border-radius:8px;margin-top:8px">${qr}</div><div class="muted">Покажите этот код администратору для подтверждения входа (демо).</div>`; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); document.getElementById('modalClose').onclick = closeModal; }

function adminScan(gymId){
  const code = prompt('Вставьте код клиента (например GF-u123-00)');
  if(!code) return;
  alert('Сканировано (демо). В реальном приложении админ отправит код на сервер для валидации.');
  closeModal();
}

function initProfile(){
  const saveBtn = document.getElementById('saveProfile');
  const showQrBtn = document.getElementById('showQR');
  const msg = document.getElementById('profileMsg');
  const profile = JSON.parse(localStorage.getItem('gf_profile')||'{}');
  if(profile.name) document.getElementById('profileName').value = profile.name;
  if(profile.gender) document.getElementById('profileGender').value = profile.gender;
  if(profile.age) document.getElementById('profileAge').value = profile.age;
  if(profile.weight) document.getElementById('profileWeight').value = profile.weight;
  if(profile.height) document.getElementById('profileHeight')') document.getElementById('profileHeight').value = profile.height;
  saveBtn.onclick = ()=>{
    const p = {
      name: document.getElementById('profileName').value || '',
      gender: document.getElementById('profileGender').value || 'm',
      age: parseInt(document.getElementById('profileAge').value||0),
      weight: parseFloat(document.getElementById('profileWeight').value||0),
      height: parseFloat(document.getElementById('profileHeight').value||0)
    };
    localStorage.setItem('gf_profile', JSON.stringify(p));
    msg.textContent = 'Профиль сохранён.';
    setTimeout(()=>msg.textContent='',3000);
  };
  showQrBtn.onclick = ()=> showQrMock();
}
showSplashAndInit();
