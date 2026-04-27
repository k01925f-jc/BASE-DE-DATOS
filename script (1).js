// ══════════════════════════════════════════════
//  Base de Datos II - UPLA
//  Supabase Storage: bucket "materiales"
// ══════════════════════════════════════════════

const SUPABASE_URL  = "https://buqrpqtwzujqgwyzmqri.supabase.co";
const SUPABASE_KEY  = "sb_publishable_JmrFVaGF6-fDZBMstEwjFw_T9-s6hUY";

// Inicializar cliente Supabase correctamente
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const unitInfo = {
  1: { title: 'Introducción y Fundamentos',  desc: 'Conceptos básicos, historia y tipos de bases de datos.' },
  2: { title: 'Modelado de Datos',           desc: 'Diagramas entidad-relación, normalización y esquemas.' },
  3: { title: 'SQL y Consultas',             desc: 'Lenguaje SQL, DDL, DML, subconsultas y joins.' },
  4: { title: 'Administración y Seguridad',  desc: 'Gestión de usuarios, índices, respaldo y rendimiento.' },
};

let currentUnit = 1;

// ── Cargar y guardar en localStorage ──
function loadFiles() {
  const saved = localStorage.getItem('bd2_files_v2');
  return saved ? JSON.parse(saved) : {
    1: { 1: [], 2: [], 3: [], 4: [] },
    2: { 1: [], 2: [], 3: [], 4: [] },
    3: { 1: [], 2: [], 3: [], 4: [] },
    4: { 1: [], 2: [], 3: [], 4: [] },
  };
}

function saveFiles(files) {
  localStorage.setItem('bd2_files_v2', JSON.stringify(files));
}

// ── Navegación ──
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
}

function goToUnit(num) {
  currentUnit = num;
  document.getElementById('unit-num').textContent  = num;
  document.getElementById('unit-desc').textContent = unitInfo[num].desc;
  renderWeeks(num);
  goTo('unit');
}

function scrollToSection(id) {
  goTo('home');
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// ── Modal Login ──
function showLoginModal() {
  document.getElementById('login-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('modal-user').focus(), 100);
}

function hideLoginModal() {
  document.getElementById('login-modal').style.display = 'none';
  document.getElementById('modal-user').value        = '';
  document.getElementById('modal-pass').value        = '';
  document.getElementById('modal-err').style.display = 'none';
}

function doLoginModal() {
  const u = document.getElementById('modal-user').value.trim();
  const p = document.getElementById('modal-pass').value.trim();
  if (u === 'admin' && p === 'admin') {
    hideLoginModal();
    selectAdminUnit(1, document.querySelector('.admin-unit-tab'));
    goTo('admin');
  } else {
    document.getElementById('modal-err').style.display = 'block';
    document.getElementById('modal-pass').value = '';
  }
}

// Enter key en login
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.getElementById('login-modal').style.display === 'flex') {
    doLoginModal();
  }
});

function doLogout() { goTo('home'); }

// ── Vista pública ──
function renderWeeks(unit) {
  const files = loadFiles();
  const c = document.getElementById('weeks-container');
  c.innerHTML = '';

  for (let w = 1; w <= 4; w++) {
    const fs = files[unit][w] || [];

    let fileHTML = fs.length
      ? fs.map(f => `
          <a href="${f.url}" target="_blank" rel="noopener" class="file-item downloadable">
            <span class="file-icon">${getFileIcon(f.name)}</span>
            <span class="file-name">${f.name}</span>
            <span class="download-icon">↗</span>
          </a>`).join('')
      : `<div class="empty-state">
           <div class="empty-icon">📂</div>
           <p class="empty-text">Sin archivos aún</p>
           <p class="empty-subtext">El docente subirá el material pronto</p>
         </div>`;

    c.innerHTML += `
      <div class="week-card">
        <div class="week-num">0${w}</div>
        <h3>Semana ${w}</h3>
        <p>${unitInfo[unit].title}</p>
        <div class="week-files">${fileHTML}</div>
      </div>`;
  }
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  const icons = { pdf: '📕', doc: '📝', docx: '📝', ppt: '📊', pptx: '📊', xls: '📗', xlsx: '📗', zip: '🗜️', rar: '🗜️', mp4: '🎬', mp3: '🎵', jpg: '🖼️', png: '🖼️' };
  return icons[ext] || '📄';
}

// ── Admin: seleccionar unidad ──
function selectAdminUnit(num, btn) {
  currentUnit = num;
  document.querySelectorAll('.admin-unit-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderAdminWeeks(num);
}

// ── Admin: renderizar semanas ──
function renderAdminWeeks(unit) {
  const c = document.getElementById('admin-weeks-container');
  c.innerHTML = '';

  for (let w = 1; w <= 4; w++) {
    c.innerHTML += `
      <div class="admin-week-card">
        <h4>Semana ${w} <span>U${unit}</span></h4>

        <div class="tab-switcher">
          <button class="tab-btn active" onclick="switchTab(this, 'upload', ${unit}, ${w})">⬆ Subir Archivo</button>
          <button class="tab-btn" onclick="switchTab(this, 'link', ${unit}, ${w})">🔗 Link Drive</button>
        </div>

        <!-- Panel subida directa -->
        <div class="tab-panel" id="panel-upload-${unit}-${w}">
          <div class="upload-zone" id="zone-${unit}-${w}" 
               ondragover="handleDragOver(event)" 
               ondragleave="handleDragLeave(event)"
               ondrop="handleDrop(event, ${unit}, ${w})"
               onclick="document.getElementById('file-${unit}-${w}').click()">
            <div class="upload-icon">☁</div>
            <p class="upload-hint">Arrastra un archivo o <strong>haz clic</strong></p>
            <p class="upload-sub">PDF, Word, PowerPoint, Excel, etc.</p>
          </div>
          <input type="file" id="file-${unit}-${w}" style="display:none" 
                 onchange="handleFileSelect(this, ${unit}, ${w})" 
                 accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.jpg,.png" />
          <div class="upload-progress" id="progress-${unit}-${w}" style="display:none">
            <div class="progress-bar"><div class="progress-fill" id="fill-${unit}-${w}"></div></div>
            <span class="progress-text" id="ptext-${unit}-${w}">Subiendo...</span>
          </div>
        </div>

        <!-- Panel link Drive -->
        <div class="tab-panel hidden" id="panel-link-${unit}-${w}">
          <div class="link-form">
            <input type="text" id="name-${unit}-${w}" placeholder="Nombre (ej: Clase 1 - Introducción)" class="link-input" />
            <input type="url"  id="url-${unit}-${w}"  placeholder="Link de Google Drive o cualquier URL" class="link-input" />
            <button class="btn-add-link" onclick="addLink(${unit}, ${w})">+ Agregar link</button>
          </div>
        </div>

        <div class="uploaded-list" id="list-${unit}-${w}"></div>
      </div>`;
  }

  for (let w = 1; w <= 4; w++) refreshList(unit, w);
}

// ── Tabs upload / link ──
function switchTab(btn, type, unit, week) {
  const card = btn.closest('.admin-week-card');
  card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  card.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`panel-${type}-${unit}-${week}`).classList.remove('hidden');
}

// ── Drag & Drop ──
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function handleDrop(e, unit, week) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file, unit, week);
}
function handleFileSelect(input, unit, week) {
  const file = input.files[0];
  if (file) uploadFile(file, unit, week);
}

// ── Subir archivo a Supabase Storage ──
async function uploadFile(file, unit, week) {
  const MAX_MB = 50;
  if (file.size > MAX_MB * 1024 * 1024) {
    showToast(`❌ El archivo supera los ${MAX_MB} MB permitidos`, 'error');
    return;
  }

  const progressEl = document.getElementById(`progress-${unit}-${week}`);
  const fillEl     = document.getElementById(`fill-${unit}-${week}`);
  const ptextEl    = document.getElementById(`ptext-${unit}-${week}`);
  const zone       = document.getElementById(`zone-${unit}-${week}`);

  progressEl.style.display = 'block';
  zone.style.pointerEvents = 'none';
  zone.style.opacity = '0.5';

  // Nombre único para evitar colisiones
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `u${unit}_s${week}_${Date.now()}_${safeName}`;

  // Simular progreso mientras sube
  let fakeProgress = 0;
  const fakeInterval = setInterval(() => {
    fakeProgress = Math.min(fakeProgress + Math.random() * 15, 85);
    fillEl.style.width = fakeProgress + '%';
    ptextEl.textContent = `Subiendo... ${Math.round(fakeProgress)}%`;
  }, 200);

  try {
    const { data, error } = await sb.storage
      .from('materiales')
      .upload(fileName, file, { upsert: false });

    clearInterval(fakeInterval);

    if (error) {
      console.error('Supabase upload error:', error);
      showToast('❌ Error al subir: ' + error.message, 'error');
      progressEl.style.display = 'none';
      zone.style.pointerEvents = 'auto';
      zone.style.opacity = '1';
      return;
    }

    fillEl.style.width = '100%';
    ptextEl.textContent = '✓ ¡Subido!';

    // Obtener URL pública
    const { data: publicData } = sb.storage
      .from('materiales')
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    // Guardar en localStorage
    const files = loadFiles();
    if (!files[unit][week]) files[unit][week] = [];
    files[unit][week].push({ name: file.name, url: publicUrl, type: 'file' });
    saveFiles(files);

    showToast(`✅ "${file.name}" subido correctamente`, 'success');
    refreshList(unit, week);

    // Reset
    setTimeout(() => {
      progressEl.style.display = 'none';
      fillEl.style.width = '0%';
      zone.style.pointerEvents = 'auto';
      zone.style.opacity = '1';
      document.getElementById(`file-${unit}-${week}`).value = '';
    }, 1500);

  } catch (err) {
    clearInterval(fakeInterval);
    console.error('Error inesperado:', err);
    showToast('❌ Error inesperado al subir el archivo', 'error');
    progressEl.style.display = 'none';
    zone.style.pointerEvents = 'auto';
    zone.style.opacity = '1';
  }
}

// ── Agregar link manual ──
function addLink(unit, week) {
  const nameEl = document.getElementById(`name-${unit}-${week}`);
  const urlEl  = document.getElementById(`url-${unit}-${week}`);
  const name   = nameEl.value.trim();
  let   url    = urlEl.value.trim();

  if (!name || !url) {
    showToast('⚠️ Completa el nombre y el link', 'warning');
    return;
  }

  url = convertDriveLink(url);

  const files = loadFiles();
  if (!files[unit][week]) files[unit][week] = [];
  files[unit][week].push({ name, url, type: 'link' });
  saveFiles(files);

  nameEl.value = '';
  urlEl.value  = '';
  refreshList(unit, week);
  showToast(`✅ Link "${name}" agregado`, 'success');
}

function convertDriveLink(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/view`;
  return url;
}

// ── Refrescar lista admin ──
function refreshList(unit, week) {
  const el = document.getElementById(`list-${unit}-${week}`);
  if (!el) return;
  const files = loadFiles();
  const fs = files[unit][week] || [];
  el.innerHTML = fs.length
    ? fs.map((f, i) => `
        <div class="uploaded-item">
          <span>${getFileIcon(f.name)}</span>
          <a href="${f.url}" target="_blank" class="fname" title="${f.name}">${f.name}</a>
          <button class="del-btn" onclick="deleteFile(${unit},${week},${i})" title="Eliminar">✕</button>
        </div>`).join('')
    : '<p class="empty-list">Sin archivos en esta semana</p>';
}

// ── Eliminar ──
function deleteFile(unit, week, idx) {
  if (!confirm('¿Eliminar este archivo de la lista?')) return;
  const files = loadFiles();
  files[unit][week].splice(idx, 1);
  saveFiles(files);
  refreshList(unit, week);
  showToast('🗑️ Archivo eliminado', 'info');
}

// ── Toast notifications ──
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

// ── Contacto ──
function sendContact() {
  const name = document.querySelector('.contact-form input[type="text"]').value.trim();
  if (!name) { showToast('⚠️ Completa tu nombre', 'warning'); return; }
  showToast('✅ ¡Mensaje enviado! Te contactaremos pronto.', 'success');
  document.querySelectorAll('.contact-form input, .contact-form textarea').forEach(el => el.value = '');
}

// ── Init ──
window.onload = () => {
  selectAdminUnit(1, document.querySelector('.admin-unit-tab'));
};
