import { astronaut } from "../data/astronaut-data.js";
import { dailyExercises, weeklyPlan } from "../data/exercise-data.js";
import { nutritionTargets } from "../data/nutrition-data.js";
import { getTodayExercises } from "./storage.js";
import { getAlerts, getNutritionTotals } from "./alerts.js";

const formatNumber = value => new Intl.NumberFormat("en-US").format(Math.round(value));

export function renderDashboard(state) {
  const allReadings = [...state.readings].sort((a, b) => a.date.localeCompare(b.date));
  const wholeBodyReadings = allReadings.filter(item => item.site === "Whole body");
  const readings = wholeBodyReadings.length ? wholeBodyReadings : allReadings;
  const latest = readings[readings.length - 1];
  const first = readings[0];
  const change = first && latest ? ((Number(latest.density) - Number(first.density)) / Number(first.density)) * 100 : 0;
  const totals = getNutritionTotals(state);
  const completed = new Set(getTodayExercises(state));
  const completedThisWeek = weeklyPlan.slice(0, -1).reduce((sum, day) => sum + day.completed, 0) + completed.size;
  document.getElementById("weekly-total").textContent = `${completedThisWeek} SESSIONS`;
  const alerts = getAlerts(state);
  const densityWarning = change <= -1;

  document.getElementById("density-value").textContent = latest ? Number(latest.density).toFixed(3) : "—";
  const changeElement = document.getElementById("density-change");
  changeElement.className = `trend ${change < 0 ? (densityWarning ? "negative" : "neutral") : "positive"}`;
  changeElement.innerHTML = `${change < 0 ? '<i class="fa-solid fa-arrow-trend-down"></i>' : '<i class="fa-solid fa-arrow-trend-up"></i>'} ${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  document.getElementById("exercise-value").textContent = `${completed.size}/${dailyExercises.length}`;
  document.getElementById("exercise-progress").textContent = `${dailyExercises.length - completed.size} remaining`;
  document.getElementById("calcium-value").textContent = formatNumber(totals.calcium);
  document.getElementById("calcium-progress").textContent = `${Math.min(100, Math.round(totals.calcium / nutritionTargets.calcium * 100))}% of demo target`;
  document.getElementById("dashboard-calcium-text").textContent = `${formatNumber(totals.calcium)} / ${formatNumber(nutritionTargets.calcium)} mg`;
  document.getElementById("dashboard-vitd-text").textContent = `${totals.vitaminD.toFixed(1)} / ${nutritionTargets.vitaminD} µg`;
  document.getElementById("dashboard-calcium-bar").style.width = `${Math.min(100, totals.calcium / nutritionTargets.calcium * 100)}%`;
  document.getElementById("dashboard-vitd-bar").style.width = `${Math.min(100, totals.vitaminD / nutritionTargets.vitaminD * 100)}%`;

  const status = densityWarning || totals.calcium < nutritionTargets.calcium ? "Review" : "Stable";
  document.getElementById("health-status").textContent = status;
  const pill = document.getElementById("health-status-pill");
  pill.textContent = status === "Stable" ? "ON TRACK" : "ATTENTION";
  pill.className = `status-pill ${status === "Stable" ? "" : "status-pill-warning"}`;

  const findingItems = [];
  if (densityWarning) findingItems.push({ icon: "fa-arrow-trend-down", tone: "warning", title: "Density estimate trend", detail: `Displayed estimates changed by ${Math.abs(change).toFixed(1)}% across available records.` });
  else findingItems.push({ icon: "fa-chart-line", tone: "positive", title: "Density estimate trend", detail: "No 1% decline trigger in the available demo records." });
  if (totals.calcium < nutritionTargets.calcium) findingItems.push({ icon: "fa-bowl-food", tone: "warning", title: "Nutrition log", detail: `${formatNumber(totals.calcium)} mg calcium logged so far today.` });
  else findingItems.push({ icon: "fa-circle-check", tone: "positive", title: "Nutrition log", detail: "Calcium demo target reached in today's entries." });
  if (completed.size < dailyExercises.length) findingItems.push({ icon: "fa-dumbbell", tone: "neutral", title: "Activity plan", detail: `${dailyExercises.length - completed.size} example sessions remain unmarked.` });
  document.getElementById("analysis-findings").innerHTML = findingItems.map(item => `<div class="finding-row"><span class="finding-icon ${item.tone}"><i class="fa-solid ${item.icon}"></i></span><div><strong>${item.title}</strong><small>${item.detail}</small></div></div>`).join("");
  const analysisStatus = document.getElementById("analysis-status");
  analysisStatus.className = `analysis-status ${status === "Stable" ? "analysis-good" : "analysis-attention"}`;
  analysisStatus.innerHTML = `<span class="analysis-status-icon"><i class="fa-solid ${status === "Stable" ? "fa-check" : "fa-triangle-exclamation"}"></i></span><div><strong>${status === "Stable" ? "No demo trigger exceeded" : "Review flagged demo indicators"}</strong><small>${astronaut.name} · transparent rules · not a diagnosis</small></div>`;

  const latestAlert = alerts[0];
  const alertCard = document.getElementById("dashboard-alert");
  if (latestAlert) {
    alertCard.className = `mini-alert ${latestAlert.level}`;
    alertCard.innerHTML = `<span class="mini-alert-icon"><i class="fa-solid ${latestAlert.level === "warning" ? "fa-triangle-exclamation" : "fa-circle-info"}"></i></span><div><strong>${latestAlert.title}</strong><small>${latestAlert.message}</small></div><button class="icon-button" data-nav="alerts" aria-label="View alerts"><i class="fa-solid fa-arrow-right"></i></button>`;
  } else {
    alertCard.className = "mini-alert";
    alertCard.innerHTML = '<span class="mini-alert-icon"><i class="fa-solid fa-circle-check"></i></span><div><strong>All clear</strong><small>No new alerts right now</small></div><button class="icon-button" data-nav="alerts" aria-label="View alerts"><i class="fa-solid fa-arrow-right"></i></button>';
  }
}

export function renderMissionIdentity() {
  document.title = `BoneGuard | ${astronaut.missionId}`;
  const today = new Date();
  document.getElementById("today-label").textContent = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("exercise-date").textContent = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const clock = document.getElementById("mission-clock");
  const updateClock = () => { clock.textContent = `${new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" })} UTC`; };
  updateClock();
  window.setInterval(updateClock, 30000);
}
