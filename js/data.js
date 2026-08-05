/* 数据加载（带缓存） */
const DATA_CACHE = {};
async function loadData(name) {
  if (DATA_CACHE[name]) return DATA_CACHE[name];
  const res = await fetch(`data/${name}.json`);
  const json = await res.json();
  if (name === "relics" && Array.isArray(json.relics)) {
    json.relics.forEach(r => { if (!r.img) r.img = `assets/img/relics/${r.id}.jpg`; });
  }
  DATA_CACHE[name] = json;
  return json;
}
function qs(id) { return document.getElementById(id); }
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
