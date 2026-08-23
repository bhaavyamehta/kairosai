const ATTACKS = {
  portscan: {
    title: "PORT SCAN DETECTED",
    severity: "MEDIUM",
    severityClass: "medium",
    source: "192.168.1.105",
    target: "192.168.1.1 (Gateway)",
    telemetry: [
      ["Source", "192.168.1.105"],
      ["Target", "192.168.1.1"],
      ["Scanned Ports", "84 ports / 2.4s"],
      ["TCP Signal", "SYN-only"]
    ],
    explanation: "The host contacted 84 destination ports in 2.4 seconds using SYN-only connection attempts. That pattern is consistent with automated reconnaissance. The recommended next step is to verify whether the source host is authorized to perform network discovery.",
    action: "Review & isolate source host",
    confidence: "94%",
    method: "Random Forest + probing check"
  },
  spoofing: {
    title: "NETWORK SPOOFING DETECTED",
    severity: "HIGH",
    severityClass: "high",
    source: "192.168.1.77",
    target: "192.168.1.1 (Gateway)",
    telemetry: [
      ["Source", "192.168.1.77"],
      ["Target", "192.168.1.1"],
      ["Expected MAC", "AA:BB:CC:11"],
      ["Observed MAC", "DD:EE:FF:22"]
    ],
    explanation: "The gateway IP address was observed with a MAC address that conflicts with the established local mapping. This can indicate local network spoofing or another configuration problem. Verify the mapping before taking containment action.",
    action: "Verify gateway mapping",
    confidence: "98%",
    method: "IP-MAC state rule"
  }
};

const $ = id => document.getElementById(id);
let history = [];

function updateClock() {
  $("clock").textContent = new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
}
setInterval(updateClock, 1000);
updateClock();

function showDetection(a, sourceType = "simulation", rawName = "") {
  const now = new Date();
  const time = now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
  $("networkStatus").textContent = "THREAT DETECTED";
  $("networkStatus").className = "stat-value";
  $("networkStatus").style.color = "#e5484d";
  $("trafficStat").textContent = sourceType === "log" ? "LOG" : (a.title.includes("PORT") ? "1,690" : "1,420");
  $("trafficNote").textContent = sourceType === "log" ? "events ingested" : "packets / sec";
  $("threatCount").textContent = String(Number($("threatCount").textContent) + 1);
  $("modeStat").textContent = sourceType === "log" ? "LOG ANALYSIS" : "SIMULATION";

  $("alertCard").className = "alert-card " + a.severityClass;
  $("alertKicker").textContent = `${a.severity} SEVERITY`;
  $("alertTime").textContent = time;
  $("alertTitle").textContent = a.title;
  $("alertSource").textContent = `${a.source}  →  ${a.target}`;
  $("severityChip").textContent = a.severity;
  $("severityChip").style.color = a.severityClass === "critical" ? "#b52d35" : a.severityClass === "high" ? "#9a5a04" : "#216291";
  $("severityChip").style.background = a.severityClass === "critical" ? "#ffe5e6" : a.severityClass === "high" ? "#fff0d4" : "#e7f3fe";

  const telemetry = [...a.telemetry];
  telemetry.push(["Input", sourceType === "log" ? rawName || "Custom log" : "Controlled simulation"]);
  $("telemetry").innerHTML = telemetry.slice(0,4).map(([label,value]) =>
    `<div class="telemetry-item"><span>${label}</span><strong>${value}</strong></div>`).join("");

  $("xaiText").textContent = a.explanation;
  $("actionBtn").disabled = false;
  $("actionBtn").textContent = "Recommended: " + a.action;
  $("consolePath").textContent = sourceType === "log" ? `kairosai://logs/${rawName || "uploaded"}` : `kairosai://detector/${a.title.toLowerCase().replaceAll(" ","-")}`;

  history.unshift({time, attack:a.title, severity:a.severity, source:a.source, method:a.method, confidence:a.confidence, input:sourceType === "log" ? rawName : "Simulation"});
  renderHistory();
}

function simulate(key) { showDetection(ATTACKS[key], "simulation"); }

function classifyLog(text) {
  const t = text.toLowerCase();
  // Port scan heuristics
  const portSignals = [
    /nmap|port scan|scan(ed|ning)?/i.test(text),
    /ports?\s*[:=]?\s*\d{2,}/i.test(text),
    /(many|multiple|84|50|100)\s+(ports|destination ports)/i.test(text),
    /syn-only|syn only|consecutive ports/i.test(text),
  ].filter(Boolean).length;

  // Network spoofing heuristics
  const spoofSignals = [
    /arp spoof|arp poisoning|spoofing/i.test(text),
    /ip[-\s]?mac|mac[-\s]?address/i.test(text),
    /same ip.*(mac|address)|ip.*multiple mac|mapping conflict/i.test(text),
    /gateway.*mac/i.test(text),
  ].filter(Boolean).length;

  if (spoofSignals >= 2 && spoofSignals >= portSignals) {
    return {...ATTACKS.spoofing, explanation: "The uploaded log contains indicators of a conflicting or changing IP-to-MAC mapping, which is consistent with local network spoofing. Review the gateway mapping and verify the affected host.", method: "Custom log + IP-MAC rule"};
  }
  if (portSignals >= 2) {
    return {...ATTACKS.portscan, explanation: "The uploaded log contains repeated connection attempts across multiple destination ports in a short interval, which is consistent with network reconnaissance. Verify whether the source host is authorized to scan the network.", method: "Custom log + port-scan check"};
  }
  return null;
}

function analyzeLog(file, text) {
  const result = classifyLog(text);
  if (!result) {
    $("uploadStatus").textContent = "No supported threat pattern found in this sample.";
    $("uploadStatus").style.color = "#9a5a04";
    $("modeStat").textContent = "LOG REVIEW";
    $("consolePath").textContent = `kairosai://logs/${file.name}`;
    $("alertTitle").textContent = "No supported threat detected";
    $("alertSource").textContent = `Analyzed: ${file.name}`;
    $("xaiText").textContent = "The parser did not find enough evidence for the supported Port Scan or Network Spoofing patterns. This is intentionally conservative.";
    return;
  }
  $("uploadStatus").textContent = `Analyzed successfully: ${file.name}`;
  $("uploadStatus").style.color = "#0d9c79";
  showDetection(result, "log", file.name);
}

$("logFile").addEventListener("change", async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  $("fileName").textContent = file.name;
  $("uploadStatus").textContent = "Parsing log…";
  const text = await file.text();
  setTimeout(() => analyzeLog(file, text), 250);
});

function renderHistory() {
  $("historyCount").textContent = `${history.length} event${history.length === 1 ? "" : "s"}`;
  if (!history.length) {
    $("historyList").innerHTML = `<div class="empty-history">No events yet. Run a scenario or upload a log.</div>`;
    return;
  }
  $("historyList").innerHTML = history.map(h => {
    const cls = h.severity.toLowerCase();
    return `<div class="history-row">
      <strong>${h.attack}</strong>
      <span class="badge ${cls}">${h.severity}</span>
      <span class="mini-muted">${h.source}</span>
      <span class="mini-muted">${h.method} · ${h.input}</span>
      <span>${h.confidence}</span>
    </div>`;
  }).join("");
}

function resetDemo() {
  history = [];
  $("networkStatus").textContent = "NORMAL";
  $("networkStatus").className = "stat-value good";
  $("networkStatus").style.color = "";
  $("trafficStat").textContent = "1,240";
  $("trafficNote").textContent = "packets / sec";
  $("threatCount").textContent = "0";
  $("modeStat").textContent = "SIMULATION";
  $("alertCard").className = "alert-card idle";
  $("alertKicker").textContent = "SYSTEM READY";
  $("alertTime").textContent = "";
  $("alertTitle").textContent = "No active threat";
  $("alertSource").textContent = "Run a scenario or upload a network log to begin.";
  $("severityChip").textContent = "IDLE";
  $("severityChip").style.color = "";
  $("severityChip").style.background = "";
  $("telemetry").innerHTML = `
    <div class="telemetry-item"><span>Source</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Target</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Observed Signal</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Input</span><strong>—</strong></div>`;
  $("xaiText").textContent = "The explanation layer will translate structured detection evidence into plain English after a threat is classified.";
  $("actionBtn").disabled = true;
  $("actionBtn").textContent = "Recommended Action";
  $("consolePath").textContent = "kairosai://detector/idle";
  $("fileName").textContent = "No file selected";
  $("uploadStatus").textContent = "";
  $("logFile").value = "";
  renderHistory();
}

document.querySelectorAll(".attack-btn").forEach(btn => btn.addEventListener("click", () => simulate(btn.dataset.attack)));
$("resetBtn").addEventListener("click", resetDemo);
$("actionBtn").addEventListener("click", () => {
  if ($("actionBtn").disabled) return;
  alert("Prototype recommendation: review the evidence and take administrator-approved containment steps.");
});
