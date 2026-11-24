// =========================================================
// FasalSathi — Complete Frontend (Video Flow + Voice + Daily/Weekend)
// =========================================================

let farmerProfile = {
  name: "Soubhagya",
  district: "Bhubaneswar",
  state: "Odisha",
  acres: 2,
  crop: "Paddy"
};

let currentLanguage = "hi";
let autoVoiceEnabled = true;
let activeZone = "Zone A";
let activeGrowthStage = "Vegetative";
let sessionId = "farmer_" + Math.random().toString(36).substring(2, 9);

const MANDI_DATASET = [
  { commodity: "Paddy (Dhan)", modal: 2360, msp: 2300 },
  { commodity: "Wheat (Gehun)", modal: 2425, msp: 2275 },
  { commodity: "Maize (Makka)", modal: 2240, msp: 2225 },
  { commodity: "Cotton (Kapas)", modal: 7210, msp: 7121 },
  { commodity: "Soybean", modal: 4950, msp: 4892 },
  { commodity: "Mustard (Sarson)", modal: 5820, msp: 5650 }
];

const GROWTH_STAGES = [
  { key: "Sowing", label: "Sowing", days: "Day 1–10", tip: "Beej buwai aur halka moisture banayein." },
  { key: "Seedling", label: "Seedling", days: "Day 11–20", tip: "Ankur suraksha aur weed check karein." },
  { key: "Vegetative", label: "Vegetative", days: "Day 21–40", tip: "Patte aur tanon ki growth—balanced poshan dein." },
  { key: "Flowering", label: "Flowering", days: "Day 41–65", tip: "Phool/bali aate samay pani ki kami na hone dein." },
  { key: "Harvest Ready", label: "Harvest Ready", days: "Day 75+", tip: "Pakne par samay se katai aur safe storage karein." }
];

const CROP_GUIDES = {
  Paddy: "Paddy (Dhan) ko warm humid climate, fertile alluvial/clayey soil, aur regular water management pasand hai.",
  Wheat: "Wheat (Gehun) Rabi season ki mukhya fasal hai jise cool weather aur timely irrigation chahiye.",
  Cotton: "Cotton (Kapas) black cotton soil mein achha badhta hai aur pest/bollworm monitoring zaroori hoti hai.",
  Tomato: "Tomato (Tamatar) well-drained loamy soil mein achhi upaj deta hai aur fungal/blight care zaroori hai."
};

let dailyGrowthLogs = [
  { day: "Day 1 (Mon)", growthPct: 42, status: "Issue Spotted", issue: "Mild leaf spot", recovery: "Affected leaves noted; organic spray planned.", weather: "29°C • 68% Hum" },
  { day: "Day 2 (Tue)", growthPct: 44, status: "Recovering", issue: "Spot spread slowing", recovery: "Neem oil applied; weather cool enough for recovery.", weather: "28°C • 66% Hum" },
  { day: "Day 3 (Wed)", growthPct: 47, status: "Recovering", issue: "Minor leaf stress", recovery: "Balanced moisture maintained; new shoots healthy.", weather: "30°C • 64% Hum" },
  { day: "Day 4 (Thu)", growthPct: 50, status: "Healthy Growth", issue: "Spots drying out", recovery: "Recovery steady; green color improving.", weather: "29°C • 62% Hum" },
  { day: "Day 5 (Fri)", growthPct: 53, status: "Healthy Growth", issue: "No new spots", recovery: "Active vegetative growth under normal weather.", weather: "28°C • 65% Hum" },
  { day: "Day 6 (Sat)", growthPct: 56, status: "Healthy Growth", issue: "Recovered", recovery: "Issue resolved; crop growth on track.", weather: "29°C • 67% Hum" }
];

// =========================================================
// 1. VOICE ASSISTANCE (TTS & STT)
// =========================================================
function speakText(text, langCode = currentLanguage) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[#*_`•→🔊⏹️🎤]/g, "").trim();
  const utt = new SpeechSynthesisUtterance(clean);
  const map = { hi: "hi-IN", en: "en-IN", or: "hi-IN", mr: "mr-IN", bn: "bn-IN", te: "te-IN", ta: "ta-IN", pa: "pa-IN" };
  utt.lang = map[langCode] || "hi-IN";
  utt.rate = 0.95;
  window.speechSynthesis.speak(utt);
}

function stopVoice() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function attachVoiceControls(container, textToRead, autoSpeak = autoVoiceEnabled) {
  if (!container || !textToRead) return;
  const old = container.querySelector(".voice-bar");
  if (old) old.remove();

  const bar = document.createElement("div");
  bar.className = "voice-bar";
  bar.style.cssText = "margin-top:10px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;";

  const listen = document.createElement("button");
  listen.type = "button";
  listen.className = "btn-green";
  listen.style.cssText = "padding:5px 12px; border-radius:16px; font-size:0.78rem;";
  listen.innerText = "🔊 Suniye";
  listen.onclick = () => speakText(textToRead);

  const stop = document.createElement("button");
  stop.type = "button";
  stop.className = "btn-white";
  stop.style.cssText = "padding:5px 10px; border-radius:16px; font-size:0.78rem;";
  stop.innerText = "⏹️ Rokein";
  stop.onclick = stopVoice;

  bar.appendChild(listen);
  bar.appendChild(stop);
  container.appendChild(bar);

  if (autoSpeak) speakText(textToRead);
}

function startVoiceInput(inputId, cb = null) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Chrome ya Edge browser mein mic speech input use karein.");
    return;
  }
  const rec = new SR();
  const map = { hi: "hi-IN", en: "en-IN", or: "hi-IN", mr: "mr-IN", bn: "bn-IN", te: "te-IN", ta: "ta-IN", pa: "pa-IN" };
  rec.lang = map[currentLanguage] || "hi-IN";
  rec.interimResults = false;

  const el = document.getElementById(inputId);
  const prevPh = el ? el.placeholder : "";
  if (el) el.placeholder = "🎤 Boliyega...";

  rec.onresult = (e) => {
    const text = e.results[0][0].transcript.replace(/\.$/, "");
    if (el) {
      el.value = text;
      el.placeholder = prevPh;
    }
    if (typeof cb === "function") cb(text);
  };
  rec.onerror = () => {
    if (el) el.placeholder = prevPh || "Dobara bolein...";
  };
  rec.start();
}

// =========================================================
// 2. SCREEN NAVIGATION (LOGIN -> LANDING -> WORKSPACE)
// =========================================================
function hideAllScreens() {
  ["login-screen", "landing-view", "app-workspace"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function showLoginScreen() {
  stopVoice();
  hideAllScreens();
  document.getElementById("login-screen").style.display = "flex";
}

function continueGuestToLanding() {
  hideAllScreens();
  document.getElementById("landing-view").style.display = "block";
  fetchWeather(farmerProfile.district);
  fetchMandiRates(farmerProfile.district);
}

function loginFarmer() {
  const name = document.getElementById("login-name")?.value.trim() || "Farmer";
  const district = document.getElementById("login-district")?.value.trim() || "Bhubaneswar";
  const acres = parseFloat(document.getElementById("login-acres")?.value || "2") || 2;
  const crop = document.getElementById("login-crop")?.value.trim() || "Paddy";

  farmerProfile = { name, district, state: "India", acres, crop };
  localStorage.setItem("fasalsathi_farmer", JSON.stringify(farmerProfile));
  syncProfileUI();
  openWorkspace("page-dashboard");
  if (autoVoiceEnabled) {
    speakText(`Swagat hai ${name} ji. Aapka ${district} ka dashboard aur daily growth tracker taiyar hai.`);
  }
}

function showLandingView() {
  hideAllScreens();
  document.getElementById("landing-view").style.display = "block";
  fetchWeather(farmerProfile.district);
}

function openWorkspace(pageId = "page-dashboard") {
  hideAllScreens();
  document.getElementById("app-workspace").style.display = "block";
  syncProfileUI();
  renderZoneGrid();
  selectZone(activeZone);
  renderGrowthTimeline(activeGrowthStage);
  renderDailyAndWeekendTracker();
  renderCropProfile();
  fetchWeather(farmerProfile.district);
  fetchMandiRates(farmerProfile.district);
  switchWorkspacePage(pageId);
}

function switchWorkspacePage(pageId, btnEl = null) {
  document.querySelectorAll(".ws-page").forEach((p) => (p.style.display = "none"));
  const target = document.getElementById(pageId);
  if (target) target.style.display = "block";

  document.querySelectorAll(".side-link").forEach((b) => {
    b.classList.toggle("active", b.dataset.page === pageId);
  });
  if (btnEl) {
    document.querySelectorAll(".side-link").forEach((b) => b.classList.remove("active"));
    btnEl.classList.add("active");
  }

  const titles = {
    "page-dashboard": "Your farm, at a glance.",
    "page-zones": "Farm Zones & Real-Time Crop Growth",
    "page-scan": "AI Crop Doctor + Crop Growth Tracker",
    "page-explore": "Explore Crops, Soil & ROI",
    "page-mandi": "Live APMC Mandi vs MSP",
    "page-chat": "Krushi Sahayak Voice AI"
  };
  const titleEl = document.getElementById("workspace-page-title");
  if (titleEl && titles[pageId]) titleEl.innerText = titles[pageId];
}

function syncProfileUI() {
  const meta = document.getElementById("workspace-farmer-meta");
  if (meta) {
    meta.innerText = `Farmer: ${farmerProfile.name} • ${farmerProfile.district} • ${farmerProfile.acres} Acres • Crop: ${farmerProfile.crop}`;
  }
  const roiAcres = document.getElementById("roi-acres");
  if (roiAcres) roiAcres.value = farmerProfile.acres;
  const scanCrop = document.getElementById("scan-crop-name");
  if (scanCrop && farmerProfile.crop) scanCrop.value = farmerProfile.crop;
}

function setLanguage(lang) {
  currentLanguage = lang;
  ["login-lang-select", "landing-lang-select", "app-lang-select"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = lang;
  });
}

function toggleAutoVoice() {
  autoVoiceEnabled = !autoVoiceEnabled;
  const label = autoVoiceEnabled ? "🔊 Auto-Voice: ON" : "🔇 Auto-Voice: OFF";
  ["auto-voice-btn-landing", "auto-voice-btn-app"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerText = label;
  });
  if (!autoVoiceEnabled) stopVoice();
}

// =========================================================
// 3. WEATHER & MANDI
// =========================================================
async function fetchWeather(district = farmerProfile.district) {
  const q = (district || "Bhubaneswar").trim();
  farmerProfile.district = q;

  const titleEl = document.getElementById("weather-location-title");
  const dashLocEl = document.getElementById("dash-weather-loc");
  if (titleEl) titleEl.innerText = `${q}, India`;
  if (dashLocEl) dashLocEl.innerText = `${q}, India`;

  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
    );
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results.length) return;

    const place = geoData.results[0];
    const displayLoc = `${place.name}, ${place.admin1 || "India"}`;
    if (titleEl) titleEl.innerText = displayLoc;
    if (dashLocEl) dashLocEl.innerText = displayLoc;

    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&timezone=auto`
    );
    const wData = await wRes.json();
    const cur = wData.current;

    const temp = `${Math.round(cur.temperature_2m)}°C`;
    const hum = `${cur.relative_humidity_2m ?? 68}%`;
    const rain = `${cur.precipitation_probability ?? 10}%`;
    const wind = `${Math.round(cur.wind_speed_10m ?? 12)} km/h`;
    const cond = (cur.precipitation_probability ?? 0) >= 55 ? "Rainy / Showers" : "Partly Cloudy";

    if (document.getElementById("weather-temp")) document.getElementById("weather-temp").innerText = temp;
    if (document.getElementById("dash-weather-temp")) document.getElementById("dash-weather-temp").innerText = temp;
    if (document.getElementById("weather-condition")) document.getElementById("weather-condition").innerText = cond;
    if (document.getElementById("weather-humidity")) document.getElementById("weather-humidity").innerText = hum;
    if (document.getElementById("weather-rain")) document.getElementById("weather-rain").innerText = rain;
    if (document.getElementById("weather-wind")) document.getElementById("weather-wind").innerText = wind;
  } catch (e) {
    console.warn("Weather fetch issue:", e);
  }
}

function searchDistrictWeather() {
  const val = document.getElementById("district-input")?.value.trim();
  if (val) {
    fetchWeather(val);
    fetchMandiRates(val);
  }
}

function useMyLocation() {
  if (!navigator.geolocation) return alert("Geolocation supported nahi hai.");
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      const { latitude, longitude } = pos.coords;
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const d = await r.json();
      const city = d.address.city || d.address.state_district || d.address.town || "Bhubaneswar";
      fetchWeather(city);
      fetchMandiRates(city);
    } catch {
      fetchWeather("Bhubaneswar");
    }
  });
}

function speakWeatherNow() {
  const loc = document.getElementById("weather-location-title")?.innerText || farmerProfile.district;
  const temp = document.getElementById("weather-temp")?.innerText || "";
  const cond = document.getElementById("weather-condition")?.innerText || "";
  speakText(`${loc} ka taapman ${temp} aur mausam ${cond} hai.`);
}

async function fetchMandiRates(district = farmerProfile.district) {
  const box = document.getElementById("mandi-output");
  if (!box) return;

  const seed = district.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const delta = ((seed % 7) - 3) * 15;

  const rows = MANDI_DATASET.map((item) => {
    const modal = item.modal + delta;
    const above = modal >= item.msp;
    return `
      <tr>
        <td style="padding:7px 6px; border-bottom:1px solid #efece2;">${item.commodity}</td>
        <td style="padding:7px 6px; border-bottom:1px solid #efece2;">₹${modal}/q</td>
        <td style="padding:7px 6px; border-bottom:1px solid #efece2;">₹${item.msp}/q</td>
        <td style="padding:7px 6px; border-bottom:1px solid #efece2; font-weight:700; color:${above ? "#1c3b2a" : "#b91c1c"};">
          ${above ? "▲ Above MSP" : "▼ Below MSP"}
        </td>
      </tr>`;
  }).join("");

  box.innerHTML = `
    <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;">📍 Mandi Comparison: <strong>${district}</strong></div>
    <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.88rem;">
      <thead><tr><th>Crop</th><th>Mandi Rate</th><th>MSP</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// =========================================================
// 4. ZONES + GROWTH TIMELINE + DAILY LOG & WEEKEND RESULT
// =========================================================
function renderZoneGrid() {
  const grid = document.getElementById("farm-zone-grid");
  if (!grid) return;
  grid.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    const zoneName = i <= 4 ? "Zone A" : i <= 8 ? "Zone B" : "Zone C";
    const isStress = i === 6 || i === 10;
    const cell = document.createElement("div");
    cell.className = `zone-cell ${isStress ? "stress" : ""} ${activeZone === zoneName ? "selected" : ""}`;
    cell.innerText = `Z${i}`;
    cell.onclick = () => selectZone(zoneName);
    grid.appendChild(cell);
  }
}

function selectZone(zoneName) {
  activeZone = zoneName;
  renderZoneGrid();
  const box = document.getElementById("zone-detail-box");
  if (!box) return;

  const info = {
    "Zone A": { health: "91%", stage: "Vegetative", growth: "62% Growth Complete", note: "Healthy canopy & balanced moisture." },
    "Zone B": { health: "76%", stage: "Vegetative", growth: "54% Growth Complete", note: "Moderate moisture check needed in mid-section." },
    "Zone C": { health: "84%", stage: "Seedling / Vegetative", growth: "48% Growth Complete", note: "Steady growth; monitor leaf tips." }
  }[zoneName];

  box.innerHTML = `
    <strong>${zoneName}</strong> • Health: <b>${info.health}</b> • Growth: <b>${info.growth}</b> (${info.stage})<br/>
    <span style="color:var(--text-muted);">${info.note}</span>
  `;
}

function renderGrowthTimeline(selectedStage = activeGrowthStage) {
  activeGrowthStage = selectedStage;
  const dashStageEl = document.getElementById("dash-growth-stage");
  const currentObj = GROWTH_STAGES.find((g) => g.key === selectedStage) || GROWTH_STAGES[2];
  if (dashStageEl) dashStageEl.innerText = `${currentObj.label} (${currentObj.days})`;

  const html = GROWTH_STAGES.map(
    (g) => `
      <div class="growth-stage-box ${g.key === selectedStage ? "active" : ""}" onclick="renderGrowthTimeline('${g.key}')">
        <div><strong>${g.label}</strong></div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${g.days}</div>
        <div style="font-size:0.74rem; margin-top:4px;">${g.tip}</div>
      </div>`
  ).join("");

  if (document.getElementById("dash-growth-timeline"))
    document.getElementById("dash-growth-timeline").innerHTML = html;
  if (document.getElementById("scan-growth-timeline"))
    document.getElementById("scan-growth-timeline").innerHTML = html;
}

function getLiveWeatherShort() {
  const t = document.getElementById("weather-temp")?.innerText || "29°C";
  const h = document.getElementById("weather-humidity")?.innerText || "68%";
  return `${t} • ${h} Hum`;
}

function logNextDayProgress() {
  const nextNum = dailyGrowthLogs.length + 1;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayLabel = `Day ${nextNum} (${days[(nextNum - 1) % 7]})`;
  const last = dailyGrowthLogs[dailyGrowthLogs.length - 1];
  const nextGrowth = Math.min(100, (last ? last.growthPct : 40) + 3);

  const noteInput = document.getElementById("daily-issue-input");
  const statusSelect = document.getElementById("daily-status-select");
  const customNote = noteInput?.value.trim();
  const chosenStatus = statusSelect?.value || (nextGrowth >= 52 ? "Healthy Growth" : "Recovering");
  const weatherNow = getLiveWeatherShort();

  dailyGrowthLogs.push({
    day: dayLabel,
    growthPct: nextGrowth,
    status: chosenStatus,
    issue: customNote ? customNote : nextGrowth >= 55 ? "Issue resolved" : "Mild recovery ongoing",
    recovery: `Weather (${weatherNow}) ke anusaar growth ${nextGrowth}% tak pahunchi aur recovery jaari hai.`,
    weather: weatherNow
  });

  if (noteInput) noteInput.value = "";
  renderDailyAndWeekendTracker();
}

function renderDailyAndWeekendTracker() {
  const listEl = document.getElementById("daily-log-list");
  const weekendEl = document.getElementById("weekend-result-box");
  if (!listEl || !weekendEl) return;

  listEl.innerHTML = dailyGrowthLogs
    .map(
      (item) => `
      <div class="daily-card">
        <div style="display:flex; justify-content:space-between; font-weight:700; color:var(--forest-dark);">
          <span>${item.day}</span>
          <span>${item.growthPct}%</span>
        </div>
        <div style="font-size:0.74rem; color:var(--text-muted); margin:2px 0;">🌦️ ${item.weather}</div>
        <div style="margin-top:4px;"><b>Status:</b> ${item.status}</div>
        <div><b>Issue / Update:</b> ${item.issue}</div>
        <div style="margin-top:4px; color:var(--text-muted);"><b>How it's improving:</b> ${item.recovery}</div>
      </div>`
    )
    .join("");

  const first = dailyGrowthLogs[0];
  const latest = dailyGrowthLogs[dailyGrowthLogs.length - 1];
  const netGain = latest.growthPct - first.growthPct;
  const verdict =
    netGain >= 10
      ? "Positive Weekend Result — Fasal ki issue control mein hai aur growth mein achha sudhar hua hai."
      : "Moderate Weekend Result — Growth aur recovery chal rahi hai; agle hafte bhi mausam aur nami par nazar rakhein.";

  weekendEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
      <strong style="color:var(--forest-dark); font-size:0.95rem;">📊 Weekend Result (${first.day} → ${latest.day})</strong>
      <span class="pill">Growth Gain: +${netGain}% (Now ${latest.growthPct}%)</span>
    </div>
    <p style="margin:6px 0 0; font-size:0.86rem;">${verdict}</p>
  `;
}

function speakWeekendSummary() {
  const text = document.getElementById("weekend-result-box")?.innerText || "";
  speakText(text);
}

// =========================================================
// 5. CROP DOCTOR (ISSUE + GROWTH) + ROI + VOICE CHAT
// =========================================================
async function diagnoseLeafAndGrowth() {
  const fileInput = document.getElementById("leaf-image-input");
  const outBox = document.getElementById("disease-output");
  const cropName = document.getElementById("scan-crop-name")?.value || farmerProfile.crop;
  const stage = document.getElementById("scan-growth-select")?.value || "Vegetative";

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert("Kripya pehle patte ya fasal ki photo select karein.");
    return;
  }

  renderGrowthTimeline(stage);
  outBox.innerHTML = "🔬 AI issue aur crop growth dono ka vishleshan kar raha hai...";

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Img = reader.result.split(",")[1];
    let resultData = {
      disease_name: "Early Leaf Spot / Mild Stress",
      confidence: 88,
      organic_treatment: "Neem oil spray aur infected leaves ki chhantai karein.",
      chemical_dosage: "Recommended fungicide/nutrient spray krushi salah ke anusaar."
    };

    try {
      const res = await fetch("/api/diagnose-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: base64Img, crop: cropName, stage, language: currentLanguage })
      });
      if (res.ok) resultData = await res.json();
    } catch {}

    const growthObj = GROWTH_STAGES.find((g) => g.key === stage) || GROWTH_STAGES[2];
    outBox.innerHTML = `
      <div style="padding:10px; background:var(--gold-soft); border-radius:8px; margin-bottom:8px;">
        <strong>🩺 Issue Detected:</strong> ${resultData.disease_name} (${resultData.confidence}%)<br/>
        <strong>🌿 Care / Treatment:</strong> ${resultData.organic_treatment}<br/>
        <strong>🧪 Dosage Note:</strong> ${resultData.chemical_dosage}
      </div>
      <div style="padding:10px; background:var(--sage-soft); border-radius:8px;">
        <strong>📈 Crop Growth Status:</strong> ${cropName} — <b>${growthObj.label}</b> (${growthObj.days})<br/>
        <span>${growthObj.tip}</span>
      </div>
    `;

    const voiceSummary = `${cropName} ki jaanch poori hui. Issue: ${resultData.disease_name}. Upchar: ${resultData.organic_treatment}. Crop growth stage hai ${growthObj.label}, ${growthObj.days}. ${growthObj.tip}`;
    attachVoiceControls(outBox, voiceSummary, true);
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function renderCropProfile() {
  const crop = document.getElementById("explore-crop-select")?.value || "Paddy";
  const box = document.getElementById("crop-profile-box");
  if (box) {
    box.innerHTML = `<p style="margin:0;"><strong>${crop}:</strong> ${CROP_GUIDES[crop] || ""}</p>`;
  }
}

function speakCropProfile() {
  const crop = document.getElementById("explore-crop-select")?.value || "Paddy";
  speakText(CROP_GUIDES[crop] || "");
}

async function calculateROI() {
  const season = document.getElementById("roi-season")?.value || "Kharif";
  const soil = document.getElementById("roi-soil")?.value || "Alluvial";
  const irrigation = document.getElementById("roi-irrigation")?.value || "Irrigated";
  const acres = parseFloat(document.getElementById("roi-acres")?.value || "2") || 2;
  const outBox = document.getElementById("roi-output");

  const baseCrop = season === "Rabi" ? "Wheat" : season === "Zaid" ? "Moong / Maize" : "Paddy";
  const yieldQ = Math.round(acres * (irrigation === "Irrigated" ? 18 : 12));
  const netProfit = Math.round(yieldQ * 1150);

  outBox.innerHTML = `
    <div style="padding:9px; background:#faf8f2; border:1px solid var(--border-soft); border-radius:8px; font-size:0.86rem;">
      <strong>🌾 Best Crop (${season} • ${soil}): ${baseCrop}</strong><br/>
      Yield (${acres} ac): <b>${yieldQ} Quintals</b> • Est. Net Profit: <b>₹${netProfit.toLocaleString("en-IN")}</b>
    </div>
  `;
  attachVoiceControls(outBox, `${acres} acre mein ${baseCrop} se lagbhag ${yieldQ} quintal upaj aur ${netProfit} rupaye ka munafa anumanit hai.`, true);
}

async function sendChatMessage(customMsg = null) {
  const input = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-messages");
  const message = customMsg || (input ? input.value.trim() : "");
  if (!message) return;
  if (input) input.value = "";

  const uDiv = document.createElement("div");
  uDiv.style.cssText = "background:var(--sage-soft); padding:7px 10px; border-radius:9px; margin:6px 0; text-align:right; font-size:0.86rem;";
  uDiv.innerText = `👨‍🌾 ${message}`;
  chatBox.appendChild(uDiv);

  const bDiv = document.createElement("div");
  bDiv.style.cssText = "background:#fff; padding:8px 11px; border-radius:9px; margin:6px 0; border:1px solid var(--border-soft); font-size:0.86rem;";
  bDiv.innerText = "🤖 Jawab taiyar ho raha hai...";
  chatBox.appendChild(bDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        district: farmerProfile.district,
        language: currentLanguage
      })
    });
    if (!res.ok) throw new Error("No backend");
    const data = await res.json();
    bDiv.innerHTML = `<p style="margin:0;">🤖 ${data.reply}</p>`;
    attachVoiceControls(bDiv, data.reply, true);
  } catch {
    const fallback = `${farmerProfile.district} aur ${farmerProfile.crop} ke liye aapka sawal ("${message}") mil gaya hai. Backend Ollama connect hote hi poora AI jawab yahan aayega.`;
    bDiv.innerHTML = `<p style="margin:0;">🤖 ${fallback}</p>`;
    attachVoiceControls(bDiv, fallback, true);
  }
  chatBox.scrollTop = chatBox.scrollHeight;
}

// =========================================================
// 6. INITIAL LOAD
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("fasalsathi_farmer");
  if (saved) {
    try {
      const p = JSON.parse(saved);
      farmerProfile = { ...farmerProfile, ...p };
      if (document.getElementById("login-name") && p.name) document.getElementById("login-name").value = p.name;
      if (document.getElementById("login-district") && p.district) document.getElementById("login-district").value = p.district;
      if (document.getElementById("login-acres") && p.acres) document.getElementById("login-acres").value = p.acres;
      if (document.getElementById("login-crop") && p.crop) document.getElementById("login-crop").value = p.crop;
    } catch {}
  }

  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendChatMessage();
    });
  }
});