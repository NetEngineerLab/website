(() => {
  "use strict";
  const main = document.getElementById("calculator");
  const engine = window[main.dataset.engine];
  const text = JSON.parse(document.getElementById("nel-copy").textContent);
  const validation = document.getElementById("validation");
  const statusLine = document.getElementById("statusLine");
  const defaults = new Map([...document.querySelectorAll("[data-field]")].map((el) => [el, el.value]));
  function setPath(target, key, value) {
    if (key === "blocks") { target.blocks = String(value).split(",").map((item) => item.trim()).filter(Boolean); return; }
    if (key === "powerDbm" || key === "gainDb" || key === "noiseFigureDb" || key === "spans" || key === "mss" || key === "mtbfHours" || key === "mttrHours" || key === "voltage" || key === "current" || key === "temperature" || key === "alpha" || key === "conductors" || key === "rho20" || key === "limitPercent" || key === "velocityFactor" || key === "snr" || key === "channel") { target[key] = value; return; }
    if (key.endsWith("Unit") || key === "code" || key === "kind" || key === "mode" || key === "snrUnit") { target[key] = value; return; }
    target[key] = { value: value, unit: (document.querySelector('[data-field="' + key + 'Unit"]') || {}).value };
  }
  function collect() {
    const input = {};
    for (const el of document.querySelectorAll("[data-field]")) {
      if (el.dataset.field.endsWith("Unit") && el.dataset.field !== "snrUnit") continue;
      setPath(input, el.dataset.field, el.value);
    }
    if (input.anchor) input.anchor.unit = document.getElementById("anchorUnit").value;
    if (input.spacing) input.spacing.unit = document.getElementById("spacingUnit").value;
    if (input.frequency) input.frequency.unit = document.getElementById("frequencyUnit").value;
    if (input.bandwidth && document.getElementById("bandwidthUnit")) input.bandwidth.unit = document.getElementById("bandwidthUnit").value;
    if (input.payload) input.payload.unit = document.getElementById("payloadUnit").value;
    if (input.rtt) input.rtt.unit = document.getElementById("rttUnit").value;
    if (input.loss) input.loss.unit = document.getElementById("lossUnit").value;
    if (input.link) input.link.unit = document.getElementById("linkUnit").value;
    if (input.arrival) input.arrival.unit = document.getElementById("arrivalUnit").value;
    if (input.service) input.service.unit = document.getElementById("serviceUnit").value;
    if (input.length) input.length.unit = document.getElementById("lengthUnit").value;
    if (input.area) input.area.unit = document.getElementById("areaUnit").value;
    if (input.conduit) input.conduit.unit = document.getElementById("conduitUnit").value;
    if (document.getElementById("d1")) input.groups = [{ diameter: { value: document.getElementById("d1").value, unit: document.getElementById("d1Unit").value }, count: document.getElementById("n1").value }];
    if (document.getElementById("n2") && String(document.getElementById("n2").value).trim() !== "" && Number(document.getElementById("n2").value) > 0) input.groups.push({ diameter: { value: document.getElementById("d2").value, unit: document.getElementById("d2Unit").value }, count: document.getElementById("n2").value });
    return input;
  }
  function clearOutputs() {
    for (const node of document.querySelectorAll("[data-out] .num")) node.textContent = "—";
    const body = document.getElementById("gridBody");
    if (body) body.replaceChildren();
  }
  function showInvalid(code) {
    validation.textContent = text.errors[code] || text.invalid;
    statusLine.textContent = text.invalid;
    document.getElementById("result").dataset.state = "invalid";
    clearOutputs();
  }
  function render(result) {
    if (!result || !result.ok) { showInvalid(result && result.error); return; }
    validation.textContent = "";
    statusLine.textContent = text.ready;
    document.getElementById("result").dataset.state = "valid";
    for (const [key, value] of Object.entries(result.display)) {
      const node = document.querySelector('[data-out="' + key + '"] .num');
      if (node) node.textContent = value;
    }
    const body = document.getElementById("gridBody");
    if (body) {
      body.replaceChildren();
      for (const row of result.table || []) {
        const tr = document.createElement("tr");
        for (const cell of row) { const td = document.createElement("td"); td.textContent = cell; tr.appendChild(td); }
        body.appendChild(tr);
      }
    }
  }
  function run() { render(engine.calculate(collect())); }
  document.getElementById("calculateBtn").addEventListener("click", run);
  main.addEventListener("input", run);
  document.getElementById("exampleBtn").addEventListener("click", () => {
    for (const el of document.querySelectorAll("[data-example]")) el.value = el.dataset.example;
    run();
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    for (const [el, value] of defaults) el.value = value;
    run();
  });
  document.getElementById("copyBtn").addEventListener("click", async () => {
    const localizedCopy = document.documentElement.lang === "id" || document.documentElement.lang === "pt-BR";
    const lines = [...document.querySelectorAll("[data-out]")].map((node) => {
      const key = node.id.replace(/^out-/, "");
      const label = localizedCopy ? ((document.getElementById("lbl-" + key) || {}).innerText || key) : key;
      return label + ": " + node.innerText.replace(/\s+/g, " ").trim();
    });
    const payload = lines.join("\n");
    try { await navigator.clipboard.writeText(payload); } catch (error) {
      const area = document.createElement("textarea"); area.value = payload; document.body.appendChild(area); area.select(); document.execCommand("copy"); area.remove();
    }
  });
  document.getElementById("csvBtn").addEventListener("click", () => {
    const rows = [["name", "value"], ...[...document.querySelectorAll(".metric")].map((node) => [node.querySelector(".lbl").textContent, node.querySelector(".val").innerText.replace(/\s+/g, " ").trim()])];
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = main.dataset.engine + ".csv";
    document.body.appendChild(link); link.click(); link.remove();
  });
  run();
})();
