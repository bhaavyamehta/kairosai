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
      ["TCP Signal", "SYN-only"],
    ],
    explanation:
      "The host contacted 84 destination ports in 2.4 seconds using SYN-only connection attempts. That pattern is consistent with automated reconnaissance. The recommended next step is to verify whether the source host is authorized to perform network discovery.",
    action: "Review & isolate source host",
    confidence: "94%",
    method: "Random Forest + probing check"
  },
  synflood: {
    title: "SYN FLOOD DETECTED",
    severity: "CRITICAL",
    severityClass: "critical",
    source: "10.0.0.42",
    target: "192.168.1.20 (Web Server)",
    telemetry: [
      ["Source", "10.0.0.42"],
      ["Target", "192.168.1.20"],
      ["SYN Rate", "1,840 / sec"],
      ["Handshake State", "93% half-open"],
    ],
    explanation:
      "The observed traffic contains a sharply elevated TCP SYN rate with a high proportion of incomplete handshakes. This behavior is consistent with a SYN flood denial-of-service pattern and warrants immediate investigation of the source and service load.",
    action: "Investigate source & service load",
    confidence: "96%",
    method: "SYN-rate + TCP-state check"
  },
  arpspoof: {
    title: "ARP SPOOFING DETECTED",
    severity: "HIGH",
    severityClass: "high",
    source: "192.168.1.77",
    target: "192.168.1.1 (Gateway)",
    telemetry: [
      ["Source", "192.168.1.77"],
      ["Target", "192.168.1.1"],
      ["Expected MAC", "AA:BB:CC:11"],
      ["Observed MAC", "DD:EE:FF:22"],
    ],
    explanation:
      "The gateway IP address was observed with a MAC address that conflicts with the established local mapping. A changing IP-to-MAC association can indicate ARP spoofing or another local-network configuration issue. Verify the mapping before taking containment action.",
    action: "Verify gateway MAC mapping",
    confidence: "98%",
    method: "IP-MAC state rule"
  }
};

const $ = (id) => document.getElementById(id);
let history = [];

function updateClock() {
  $("clock").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}
setInterval(updateClock, 1000);
updateClock();

function setAlert(attackKey) {
  const a = ATTACKS[attackKey];
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  $("networkStatus").textContent = "UNDER ATTACK";
  $("networkStatus").className = "stat-value";
  $("networkStatus").style.color = "#e5484d";
  $("trafficStat").textContent = attackKey === "synflood" ? "1,840" : attackKey === "portscan" ? "1,690" : "1,420";
  $("threatCount").textContent = String(Number($("threatCount").textContent) + 1);

  const card = $("alertCard");
  card.className = "alert-card " + a.severityClass;
  $("alertKicker").textContent = `${a.severity} SEVERITY`;
  $("alertTime").textContent = time;
  $("alertTitle").textContent = a.title;
  $("alertSource").textContent = `${a.source}  →  ${a.target}`;
  $("severityChip").textContent = a.severity;
  $("severityChip").style.color = a.severityClass === "critical" ? "#b52d35" : a.severityClass === "high" ? "#9a5a04" : "#216291";
  $("severityChip").style.background = a.severityClass === "critical" ? "#ffe5e6" : a.severityClass === "high" ? "#fff0d4" : "#e7f3fe";

  $("telemetry").innerHTML = a.telemetry.map(([label, value]) =>
    `<div class="telemetry-item"><span>${label}</span><strong>${value}</strong></div>`
  ).join("");

  $("xaiText").textContent = a.explanation;
  $("actionBtn").disabled = false;
  $("actionBtn").textContent = "Recommended: " + a.action;
  $("consolePath").textContent = `kairosai://detector/${attackKey}`;

  history.unshift({
    time,
    attack: a.title,
    severity: a.severity,
    source: a.source,
    method: a.method,
    confidence: a.confidence
  });
  renderHistory();
}

function renderHistory() {
  $("historyCount").textContent = `${history.length} event${history.length === 1 ? "" : "s"}`;
  if (!history.length) {
    $("historyList").innerHTML = `<div class="empty-history">No incidents yet. Trigger a simulation above.</div>`;
    return;
  }
  $("historyList").innerHTML = history.map((h) => {
    const cls = h.severity.toLowerCase();
    return `<div class="history-row">
      <strong>${h.attack}</strong>
      <span class="badge ${cls}">${h.severity}</span>
      <span class="mini-muted">${h.source}</span>
      <span class="mini-muted">${h.method}</span>
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
  $("threatCount").textContent = "0";
  $("alertCard").className = "alert-card idle";
  $("alertKicker").textContent = "SYSTEM READY";
  $("alertTime").textContent = "";
  $("alertTitle").textContent = "No active threat";
  $("alertSource").textContent = "Run a controlled attack scenario to begin.";
  $("severityChip").textContent = "IDLE";
  $("severityChip").style.color = "";
  $("severityChip").style.background = "";
  $("telemetry").innerHTML = `
    <div class="telemetry-item"><span>Source</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Target</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Observed Rate</span><strong>—</strong></div>
    <div class="telemetry-item"><span>Signal</span><strong>—</strong></div>`;
  $("xaiText").textContent = "The explanation layer will translate structured detection evidence into plain English after a threat is classified.";
  $("actionBtn").disabled = true;
  $("actionBtn").textContent = "Recommended Action";
  $("consolePath").textContent = "kairosai://detector/idle";
  renderHistory();
}

document.querySelectorAll(".attack-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.animate(
      [{ transform: "scale(.99)" }, { transform: "scale(1)" }],
      { duration: 180, easing: "ease-out" }
    );
    setAlert(btn.dataset.attack);
  });
});

$("resetBtn").addEventListener("click", resetDemo);
$("actionBtn").addEventListener("click", () => {
  if ($("actionBtn").disabled) return;
  alert("Prototype action: review the event and take administrator-approved containment steps.");
});
