import { addReading, getTodayKey } from "./storage.js";

export function renderMonitoring(state) {
  const records = [...state.readings].sort((a, b) => b.date.localeCompare(a.date));
  ["Hip", "Leg", "Whole body"].forEach(site => {
    const record = records.find(item => item.site === site);
    const key = site === "Whole body" ? "whole" : site.toLowerCase();
    document.getElementById(`${key}-density`).textContent = record ? Number(record.density).toFixed(3) : "—";
    document.getElementById(`${key}-date`).textContent = record ? new Date(`${record.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "no record";
  });
  document.getElementById("record-count").textContent = `${records.length} RECORD${records.length === 1 ? "" : "S"}`;
  document.getElementById("records-body").innerHTML = records.map(record => `
    <tr>
      <td>${new Date(`${record.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
      <td>${escapeHtml(record.site || "Whole body")}</td>
      <td><strong>${Number(record.density).toFixed(3)}</strong> <span class="unit-text">g/cm² · estimated</span></td>
      <td>${Number(record.calcium).toFixed(1)} <span class="unit-text">mg/dL · simulated lab</span></td>
      <td>${Number(record.vitaminD).toFixed(1)} <span class="unit-text">ng/mL · simulated lab</span></td>
      <td><span class="source-tag">${escapeHtml(record.source || "Simulated entry")}</span></td>
    </tr>`).join("");
}

export function bindReadingForm(form, state, onUpdate) {
  const dateInput = form.elements.date;
  dateInput.max = getTodayKey();
  dateInput.value = dateInput.max;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const date = String(data.get("date"));
    const density = Number(data.get("density"));
    const calcium = Number(data.get("calcium"));
    const vitaminD = Number(data.get("vitaminD"));
    const feedback = document.getElementById("reading-feedback");
    if (!date || date > dateInput.max || !Number.isFinite(density) || !Number.isFinite(calcium) || !Number.isFinite(vitaminD)) {
      feedback.textContent = "Enter a valid date and numeric readings.";
      feedback.className = "form-feedback error";
      return;
    }
    const reading = {
      id: `reading-${Date.now()}`,
      date,
      site: String(data.get("site")),
      density,
      calcium,
      vitaminD,
      source: "User-entered simulation"
    };
    if (!addReading(state, reading)) {
      feedback.textContent = "Could not save this reading. Check browser storage settings.";
      feedback.className = "form-feedback error";
      return;
    }
    feedback.textContent = "Simulated reading saved.";
    feedback.className = "form-feedback success";
    form.reset();
    dateInput.value = dateInput.max;
    onUpdate("Monitoring reading saved");
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
