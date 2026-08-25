// ---------- Relógio ----------
function tick(){
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('pt-BR');
}
tick();
setInterval(tick, 1000);

// ---------- Mapa ----------
const WORLD_BOUNDS = L.latLngBounds([-90, -180], [90, 180]);

const map = L.map('map', {
  zoomControl: true,
  minZoom: 3,
  maxBounds: WORLD_BOUNDS,
  maxBoundsViscosity: 1.0
}).setView([-23.5505, -46.6333], 8);

// URL dos estilos do mapa
const THEME_TILES = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
};

let currentTheme = localStorage.getItem('dashboard_map_theme') || 'dark';

let currentTileLayer = L.tileLayer(THEME_TILES[currentTheme], {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 19,
  minZoom: 3,
  noWrap: true,
  bounds: WORLD_BOUNDS
}).addTo(map);

// Controle do Botão de Tema no Header
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeIcon = document.getElementById('theme-icon');
const themeText = document.getElementById('theme-text');

function updateThemeButtonUI(theme) {
  if (theme === 'dark') {
    themeIcon.className = 'bi bi-moon-stars-fill';
    themeText.textContent = 'Escuro';
  } else {
    themeIcon.className = 'bi bi-sun-fill';
    themeText.textContent = 'Claro';
  }
}

updateThemeButtonUI(currentTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    currentTheme = (currentTheme === 'dark') ? 'light' : 'dark';

    map.removeLayer(currentTileLayer);
    currentTileLayer = L.tileLayer(THEME_TILES[currentTheme], {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 3,
      noWrap: true,
      bounds: WORLD_BOUNDS
    }).addTo(map);

    localStorage.setItem('dashboard_map_theme', currentTheme);
    updateThemeButtonUI(currentTheme);
  });
}

// Recálculo do tamanho do mapa
window.addEventListener('load', () => map.invalidateSize());
window.addEventListener('resize', () => map.invalidateSize());


const TYPE_CONFIG = {
  alagamento: { color: '#38bdf8', label: '💧 Alagamento' },
  erosao:     { color: '#f59e0b', label: '⚠️ Erosão' },
  talude:     { color: '#ef4444', label: '🛑 Queda de talude' }
};

function createIcon(color){
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};
      border:3px solid #0b0f19;
      box-shadow:0 0 8px ${color};
    "></div>`,
    iconSize: [18,18],
    iconAnchor: [9,9]
  });
}

const STORAGE_KEY = 'dashboard_sp_alerts';
let alerts = []; // id, tipo, local, comentario, lat, lng, time, marker
let pickedLatLng = null;

const localInput = document.getElementById('local');
const comentarioInput = document.getElementById('comentario');
const tipoSelect = document.getElementById('tipo');
const addBtn = document.getElementById('add-alert-btn');
const pickedCoordsEl = document.getElementById('picked-coords');
const alertListEl = document.getElementById('alert-list');
const emptyListEl = document.getElementById('empty-list');
let tempMarker = null;

// Clique no mapa: reverse geocoding 
map.on('click', async function(e){
  pickedLatLng = e.latlng;

  if(tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.circleMarker(pickedLatLng, {
    radius: 8,
    color: '#06b6d4',
    weight: 2,
    fillColor: '#06b6d4',
    fillOpacity: 0.4
  }).addTo(map);

  pickedCoordsEl.textContent = `Buscando endereço para ${pickedLatLng.lat.toFixed(5)}, ${pickedLatLng.lng.toFixed(5)}...`;
  addBtn.disabled = true;

  try{
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pickedLatLng.lat}&lon=${pickedLatLng.lng}&zoom=17&addressdetails=1`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
    const data = await resp.json();

    let nome = '';
    if(data && data.address){
      nome = data.address.road || data.address.pedestrian || data.address.footway
          || data.address.residential || data.address.neighbourhood
          || data.display_name || '';
    } else if (data && data.display_name){
      nome = data.display_name;
    }

    if(nome){
      localInput.value = nome;
    } else {
      localInput.value = `Local sem identificação (${pickedLatLng.lat.toFixed(5)}, ${pickedLatLng.lng.toFixed(5)})`;
    }

    pickedCoordsEl.textContent = `📍 Lat: ${pickedLatLng.lat.toFixed(5)} | Lng: ${pickedLatLng.lng.toFixed(5)}`;
  } catch(err){
    localInput.value = `Local em (${pickedLatLng.lat.toFixed(5)}, ${pickedLatLng.lng.toFixed(5)})`;
    pickedCoordsEl.textContent = `⚠️ Não foi possível buscar o nome da via automaticamente. Você pode editar manualmente.`;
  } finally {
    addBtn.disabled = false;
  }
});

// ---------- Adicionar alerta ----------
addBtn.addEventListener('click', function(){
  if(!pickedLatLng){
    alert('Clique em um ponto do mapa antes de adicionar o alerta.');
    return;
  }
  if(!localInput.value.trim()){
    alert('Informe a rodovia/rua do alerta.');
    return;
  }

  const tipo = tipoSelect.value;
  const config = TYPE_CONFIG[tipo];
  const now = new Date();
  const id = Date.now();

  const marker = L.marker(pickedLatLng, { icon: createIcon(config.color) }).addTo(map);
  marker.bindPopup(`
    <b>${config.label}</b><br>
    ${localInput.value}<br>
    ${comentarioInput.value ? comentarioInput.value + '<br>' : ''}
    <small>Registrado às ${now.toLocaleTimeString('pt-BR')}</small>
  `);

  const alertData = {
    id,
    tipo,
    local: localInput.value,
    comentario: comentarioInput.value,
    lat: pickedLatLng.lat,
    lng: pickedLatLng.lng,
    time: now.toLocaleTimeString('pt-BR'),
    marker
  };

  alerts.unshift(alertData);
  renderAlertList();
  saveAlerts();

  // reset form
  if(tempMarker){ map.removeLayer(tempMarker); tempMarker = null; }
  pickedLatLng = null;
  localInput.value = '';
  comentarioInput.value = '';
  pickedCoordsEl.textContent = '';
  addBtn.disabled = true;
});

//Renderizar lista 
function renderAlertList(){
  alertListEl.innerHTML = '';

  if(alerts.length === 0){
    alertListEl.appendChild(emptyListEl);
    return;
  }

  alerts.forEach(a => {
    const config = TYPE_CONFIG[a.tipo];
    const item = document.createElement('div');
    item.className = `alert-item ${a.tipo}`;
    item.innerHTML = `
      <div class="top-row">
        <span class="icon-type" style="color:${config.color}">${config.label}</span>
        <button class="remove-btn" title="Remover alerta">✕</button>
      </div>
      <div class="location">${a.local}</div>
      ${a.comentario ? `<div class="comment">${a.comentario}</div>` : ''}
      <div class="time">🕒 ${a.time}</div>
    `;
    item.querySelector('.remove-btn').addEventListener('click', () => removeAlert(a.id));
    alertListEl.appendChild(item);
  });
}

function removeAlert(id){
  const idx = alerts.findIndex(a => a.id === id);
  if(idx === -1) return;
  map.removeLayer(alerts[idx].marker);
  alerts.splice(idx, 1);
  renderAlertList();
  saveAlerts();
}

// Persistência (localStorage) 
function saveAlerts(){
  const data = alerts.map(a => ({
    id: a.id, tipo: a.tipo, local: a.local, comentario: a.comentario,
    lat: a.lat, lng: a.lng, time: a.time
  }));
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }catch(e){ console.error('Erro ao salvar alertas:', e); }
}

function loadAlerts(){
  let data = [];
  try{
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }catch(e){ data = []; }

  data.forEach(a => {
    const config = TYPE_CONFIG[a.tipo];
    const latlng = [a.lat, a.lng];
    const marker = L.marker(latlng, { icon: createIcon(config.color) }).addTo(map);
    marker.bindPopup(`
      <b>${config.label}</b><br>
      ${a.local}<br>
      ${a.comentario ? a.comentario + '<br>' : ''}
      <small>Registrado às ${a.time}</small>
    `);
    alerts.push({ ...a, marker });
  });
  renderAlertList();
}

loadAlerts();
