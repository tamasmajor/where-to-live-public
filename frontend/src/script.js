document.addEventListener('DOMContentLoaded', async function() {
  const map = await createMap();
  createAnalysisElements();
})

async function createMap() {
  const holder = document.querySelector('#map-holder');
  while (holder.firstChild) { holder.removeChild(holder.firstChild); }
  const el = document.createElement('div');
  el.id = "map";
  holder.appendChild(el);

  map = L.map('map').setView([47.49787936554485, 19.054830634907844], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        'Tiles style by <a href="https://www.hotosm.org/updates/2013-09-29_a_new_window_on_openstreetmap_data">Humanitarian OpenStreetMap Team</a> ' +
        'hosted by <a href="https://openstreetmap.fr/">OpenStreetMap France</a>',
  }).addTo(map);
  return map;
}

async function createAnalysisElements() {
  const response = await fetch('http://127.0.0.1:3000/analyses');
  const analyses = await response.json();
  const holder = document.querySelector('#analyses');
  for (const id in analyses) {
    const current = analyses[id];
    const notYetEvaluated = current.grid.filter(e => e.duration == undefined);
    const el = document.createElement('div');
    el.innerHTML = `
      <div>${current.id}</div>
      <div>Status: ${current.status}</div>
      <div>Target: ${current.target.name}</div>
      <div>Origin: ${current.origin.name}</div>
      <div>Num of points: ${current.grid.length}</div>
      <div>Not yet evaluated: ${notYetEvaluated.length}</div>
      <button onclick="showAnalysis('${current.id}')">show</button>
      <button onclick="analyse('${current.id}')">analyse</button>
    `;
    holder.appendChild(el);  
  }
}

async function showAnalysis(id) {
  const map = await createMap();
  const response = await fetch(`http://127.0.0.1:3000/analyses/${id}`);
  const analysis = await response.json();

  analysis.grid.forEach(block => block.fillColor = evaluateColor(block.duration));
  analysis.grid.forEach(p => {
    L.rectangle(p.bounds, { stroke: true, color: "#000000", opacity: 0.05, weight: 1, fillColor: p.fillColor, fillOpacity: 0.25}).addTo(map);
  })
  L.circle([analysis.target.lat, analysis.target.lon], { radius: 50, color: "#0000FF" }).addTo(map);
  L.circle([analysis.origin.lat, analysis.origin.lon], { radius: 50, color: "#FF0000" }).addTo(map);
}

async function analyse(id) {
  const response = await fetch(`http://127.0.0.1:3000/analyses/${id}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
}

function evaluateColor(duration) {
  let color = "#FF0000";
  if (duration == undefined || duration <= 0) {
    color = '#000000'
  } else if (duration < 30 * 60) {
    color = '#00FF00'
  } else if (duration < 45 * 60) {
    color = '#FFFF00'
  } else if (duration < 60 * 60) {
    color = '#FFA500'
  }
  return color;
}