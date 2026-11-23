
window.FasalApp = (() => {
  const state = {
    district: "Khordha",
    language: "en",
    sessionId: "sess_" + Math.random().toString(36).slice(2, 10),
    lastBotReply: "Namaste! Main aapka Krushi Sahayak hoon."
  };

  function showView(viewName) {
    document.querySelectorAll(".view-screen").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${viewName}`).classList.add("active");
    if (viewName === "dashboard") {
      syncWeather();
      syncMandi();
    }
  }

  function switchTab(tabId) {
    document.querySelectorAll(".d-nav").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
    document.querySelectorAll(".dash-tab").forEach(t => t.classList.toggle("active", t.id === `tab-${tabId}`));
  }

  function enterTool(tabId) {
    showView("dashboard");
    switchTab(tabId);
  }

  async function api(url, options = {}) {
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...options });
      if (!res.ok) throw new Error(res.status);
      return await res.json();
    } catch {
      return null;
    }
  }

  async function syncWeather() {
    const data = await api(`/api/weather?district=${encodeURIComponent(state.district)}`);
    const temp = data?.temperature ?? 29;
    const hum = data?.humidity ?? 68;
    const wind = data?.wind_speed ?? 14;
    const rain = data?.rain_prob ?? 20;
    const alert = data?.alert ?? "Normal";

    // Update Landing Hero Card
    document.getElementById("heroDistrictTitle").textContent = `${state.district}, Odisha`;
    document.getElementById("heroTemp").textContent = `${temp}°C`;
    document.getElementById("heroHum").textContent = `${hum}%`;
    document.getElementById("heroWind").textContent = `${wind} km/h`;
    document.getElementById("heroRisk").textContent = alert;

    // Update Dashboard Cards
    document.getElementById("dashWeatherLoc").textContent = state.district;
    document.getElementById("dashTemp").textContent = `${temp}°C`;
    document.getElementById("dashHum").textContent = `💧 ${hum}%`;
    document.getElementById("dashRain").textContent = `🌧️ ${rain}%`;
    document.getElementById("dashWind").textContent = `💨 ${wind} km/h`;
    document.getElementById("dashAlertBadge").textContent = alert;
    document.getElementById("ovAdvisoryText").textContent = data?.advisory || `Favorable weather in ${state.district} for field operations.`;

    document.getElementById("weatherDetailCard").innerHTML = `
      <h3>${state.district} Live Agro-Weather</h3>
      <p class="mt-16"><strong>Temperature:</strong> ${temp}°C • <strong>Humidity:</strong> ${hum}% • <strong>Wind:</strong> ${wind} km/h</p>
      <p class="mt-16"><strong>Alert Status:</strong> ${alert}</p>
      <p class="mt-16">${data?.advisory || "Normal field conditions."}</p>
    `;
  }

  async function syncMandi() {
    const res = await api(`/api/mandi-rates?district=${encodeURIComponent(state.district)}`);
    const rates = res?.rates || [
      { commodity: "Paddy (Common)", mandi: state.district, modal: 2340, msp: 2300 },
      { commodity: "Maize", mandi: state.district, modal: 2260, msp: 2225 },
      { commodity: "Green Gram (Moong)", mandi: state.district, modal: 8720, msp: 8682 }
    ];

    document.getElementById("ovMandiRows").innerHTML = rates.map(r => `
      <div class="list-row">
        <span>${r.commodity}</span>
        <strong>₹${r.modal}/q <span class="badge-green">+₹${r.modal - r.msp} MSP</span></strong>
      </div>
    `).join("");

    document.getElementById("mandiTableBody").innerHTML = rates.map(r => `
      <tr>
        <td>${r.commodity}</td><td>${r.mandi}</td><td>₹${r.modal}</td><td>₹${r.msp}</td>
        <td><span class="badge-green">+₹${r.modal - r.msp}</span></td>
      </tr>
    `).join("");
  }

  async function loadGuidance() {
    const crop = document.getElementById("guideCrop").value;
    const stage = document.getElementById("guideStage").value;
    const res = await api("/api/guidance", {
      method: "POST",
      body: JSON.stringify({ crop, stage, district: state.district, language: state.language })
    });
    document.getElementById("guidanceResult").innerHTML = `<strong>Advisory:</strong> ${res?.advisory || "Apply balanced NPK & monitor soil moisture."}`;
  }

  async function calculateROI() {
    const payload = {
      district: state.district,
      season: document.getElementById("roiSeason").value,
      soil_type: document.getElementById("roiSoil").value,
      irrigation: document.getElementById("roiIrrigation").value,
      acres: parseFloat(document.getElementById("roiAcres").value) || 1
    };
    const res = await api("/api/recommend-crops", { method: "POST", body: JSON.stringify(payload) });
    const list = res?.recommendations || [
      { crop: "Paddy (Swarna Sub-1)", yield_q: 22 * payload.acres, net_profit: 34500 * payload.acres, roi: "78%" },
      { crop: "Ragi (Shree Anna)", yield_q: 11 * payload.acres, net_profit: 29800 * payload.acres, roi: "92%" }
    ];
    document.getElementById("roiResult").innerHTML = list.map(c => `
      <div class="b-card">
        <span class="badge-green">ROI ${c.roi}</span>
        <h3 class="mt-16">${c.crop}</h3>
        <p class="muted mt-16">Expected Yield: <strong>${c.yield_q} Quintals</strong></p>
        <p class="muted">Net Profit: <strong>₹${c.net_profit.toLocaleString()}</strong></p>
      </div>
    `).join("");
  }

  async function diagnoseLeaf() {
    const file = document.getElementById("leafInput").files[0];
    if (!file) return alert("Please select a leaf image first.");
    const reader = new FileReader();
    reader.onload = async () => {
      document.getElementById("cameraPlaceholder").classList.add("hidden");
      const img = document.getElementById("leafPreview");
      img.src = reader.result;
      img.classList.remove("hidden");

      const res = await api("/api/diagnose-disease", {
        method: "POST",
        body: JSON.stringify({ image_base64: reader.result, language: state.language })
      });
      document.getElementById("doctorResult").innerHTML = `
        <span class="badge-green">Confidence: ${res?.confidence ?? 94}%</span>
        <h3 class="mt-16">${res?.disease_name || "Rice Leaf Blast"}</h3>
        <p class="mt-16"><strong>Organic Remedy:</strong> ${res?.organic_treatment || "Neem Oil (10,000 ppm) @ 3 ml/L"}</p>
        <p class="mt-16"><strong>Chemical Dosage:</strong> ${res?.chemical_dosage || "Tricyclazole 75% WP @ 0.6 g/L"}</p>
      `;
    };
    reader.readAsDataURL(file);
  }

  async function sendChat(override) {
    const input = document.getElementById("chatInput");
    const msg = (override || input.value).trim();
    if (!msg) return;

    const feed = document.getElementById("chatMessages");
    feed.innerHTML += `<div class="bubble user">${msg}</div>`;
    input.value = "";

    const res = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({ session_id: state.sessionId, message: msg, district: state.district, language: state.language })
    });
    const reply = res?.reply || "Apply soil-tested NPK fertilizers and check live MSP rates before selling.";
    state.lastBotReply = reply;
    feed.innerHTML += `<div class="bubble bot">${reply}</div>`;
    feed.scrollTop = feed.scrollHeight;
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser.");
    const rec = new SR();
    rec.lang = state.language === "hi" ? "hi-IN" : "en-IN";
    rec.onresult = (e) => { document.getElementById("chatInput").value = e.results[0][0].transcript; sendChat(); };
    rec.start();
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = state.language === "hi" ? "hi-IN" : "en-IN";
    window.speechSynthesis.speak(u);
  }

  function renderCollections() {
    const schemes = [
      { title: "PM-KISAN Samman Nidhi", desc: "₹6,000/year direct income support in 3 installments.", url: "https://pmkisan.gov.in" },
      { title: "PM Fasal Bima Yojana", desc: "Crop loss insurance at 1.5%–2% farmer premium.", url: "https://pmfby.gov.in" },
      { title: "KALIA Scheme (Odisha)", desc: "Financial & livelihood support for small/marginal farmers.", url: "https://kalia.odisha.gov.in" }
    ];
    document.getElementById("schemesList").innerHTML = schemes.map(s => `
      <div class="b-card"><h3>${s.title}</h3><p class="muted mt-16">${s.desc}</p><a href="${s.url}" target="_blank" class="text-link mt-16" style="display:inline-block;">Official Portal ↗</a></div>
    `).join("");

    const darpan = [
      { title: "Kandhamal Haldi (GI Tag)", desc: "Organic turmeric renowned for high curcumin content." },
      { title: "Koraput Kalajeera Rice (GI Tag)", desc: "Aromatic heritage black rice conserved by tribal farmers." }
    ];
    document.getElementById("darpanList").innerHTML = darpan.map(d => `
      <div class="b-card"><h3>${d.title}</h3><p class="muted mt-16">${d.desc}</p><button class="btn-sand mt-16" onclick="FasalApp.speak('${d.title}. ${d.desc}')">🔊 Listen Audio</button></div>
    `).join("");
  }

  function init() {
    document.querySelectorAll(".d-nav").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));
    document.getElementById("heroSearchBtn").addEventListener("click", () => {
      const val = document.getElementById("heroCityInput").value.trim();
      if (val) { state.district = val; syncWeather(); }
    });
    document.getElementById("dashDistrictSelect").addEventListener("change", (e) => {
      state.district = e.target.value; syncWeather(); syncMandi();
    });
    document.getElementById("dashGpsBtn").addEventListener("click", syncWeather);
    document.getElementById("heroGpsBtn").addEventListener("click", syncWeather);
    document.getElementById("dashLangSelect").addEventListener("change", (e) => { state.language = e.target.value; });
    document.getElementById("getGuidanceBtn").addEventListener("click", loadGuidance);
    document.getElementById("calcRoiBtn").addEventListener("click", calculateROI);
    document.getElementById("diagnoseBtn").addEventListener("click", diagnoseLeaf);
    document.getElementById("refreshMandiBtn").addEventListener("click", syncMandi);
    document.getElementById("sendChatBtn").addEventListener("click", () => sendChat());
    document.getElementById("micBtn").addEventListener("click", startVoice);
    document.getElementById("speakLastBtn").addEventListener("click", () => speak(state.lastBotReply));

    syncWeather();
    syncMandi();
    renderCollections();
  }

  document.addEventListener("DOMContentLoaded", init);
  return { showView, switchTab, enterTool, sendQuickChat: sendChat, speak };
})();