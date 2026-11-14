import { nutritionTargets } from "../data/nutrition-data.js";
import { dailyExercises } from "../data/exercise-data.js";
import { getTodayExercises, getTodayKey, markAlertRead, markAllAlertsRead, saveState } from "./storage.js";

function totalNutrition(state) {
  const entries = state.foodLogs[getTodayKey()] || [];
  return entries.reduce((sum, item) => ({
    calcium: sum.calcium + Number(item.calcium || 0),
    vitaminD: sum.vitaminD + Number(item.vitaminD || 0)
  }), { calcium: 0, vitaminD: 0 });
}

export function getAlerts(state) {
  const alerts = [];
  const nutrition = totalNutrition(state);
  if (nutrition.calcium < nutritionTargets.calcium) {
    alerts.push({
      id: "calcium-below-demo-target",
      level: "warning",
      title: "Calcium intake below demo target",
      message: `Today's logged intake is ${Math.round(nutrition.calcium)} mg against a configurable demo target of ${nutritionTargets.calcium.toLocaleString()} mg.`,
      source: "Nutrition tracker",
      timestamp: "Today"
    });
  }
  if (nutrition.vitaminD < nutritionTargets.vitaminD) {
    alerts.push({
      id: "vitamin-d-below-demo-target",
      level: "info",
      title: "Vitamin D intake below demo target",
      message: `Today's logged intake is ${nutrition.vitaminD.toFixed(1)} µg against a configurable demo target of ${nutritionTargets.vitaminD} µg.`,
      source: "Nutrition tracker",
      timestamp: "Today"
    });
  }
  const completed = new Set(getTodayExercises(state));
  const missed = dailyExercises.filter(item => !completed.has(item.id));
  if (missed.length) {
    alerts.push({
      id: "exercise-sessions-pending",
      level: "info",
      title: "Exercise sessions still pending",
      message: `${missed.length} of ${dailyExercises.length} example sessions have not been marked complete today.`,
      source: "Exercise tracker",
      timestamp: "Today"
    });
  }
  const allReadings = [...state.readings].sort((a, b) => a.date.localeCompare(b.date));
  const bodyReadings = allReadings.filter(item => item.site === "Whole body");
  const readings = bodyReadings.length ? bodyReadings : allReadings;
  if (readings.length > 1) {
    const first = Number(readings[0].density);
    const last = Number(readings[readings.length - 1].density);
    const decline = first > 0 ? ((first - last) / first) * 100 : 0;
    if (decline >= 1) {
      alerts.push({
        id: "density-trend-review",
        level: "warning",
        title: "Review estimated density trend",
        message: `Displayed estimates have changed by ${decline.toFixed(1)}% across the available record range. This configurable demo trigger is not a medical threshold.`,
        source: "Bone monitoring",
        timestamp: readings[readings.length - 1].date
      });
    }
  }
  const latest = state.readings.reduce((a, b) => a.date > b.date ? a : b, state.readings[0]);
  const daysSinceReading = latest ? (Date.now() - new Date(`${latest.date}T00:00:00`).getTime()) / 86400000 : Infinity;
  if (!latest || daysSinceReading > 14) {
    alerts.push({
      id: "reading-overdue",
      level: "warning",
      title: "Monitoring record may be out of date",
      message: latest ? `The latest simulated reading is dated ${latest.date}.` : "No monitoring records have been added.",
      source: "Bone monitoring",
      timestamp: "Needs review"
    });
  }
  return alerts;
}

export function getNutritionTotals(state) {
  return totalNutrition(state);
}

export function renderAlerts(state, onUpdate) {
  const alerts = getAlerts(state);
  const unreadCount = alerts.filter(alert => !state.readAlertIds.includes(alert.id)).length;
  document.getElementById("nav-alert-count").textContent = unreadCount;
  document.getElementById("header-alert-dot").hidden = unreadCount === 0;
  const summary = document.getElementById("alert-summary");
  const counts = {
    critical: alerts.filter(alert => alert.level === "critical").length,
    warning: alerts.filter(alert => alert.level === "warning").length,
    info: alerts.filter(alert => alert.level === "info").length
  };
  summary.innerHTML = [
    { key: "critical", title: "Critical", icon: "fa-circle-exclamation", tone: "critical" },
    { key: "warning", title: "Warnings", icon: "fa-triangle-exclamation", tone: "warning" },
    { key: "info", title: "Information", icon: "fa-circle-info", tone: "info" }
  ].map(item => `<article class="alert-summary-card"><span class="alert-summary-icon ${item.tone}"><i class="fa-solid ${item.icon}"></i></span><div><strong>${counts[item.key]}</strong><small>${item.title}</small></div></article>`).join("");
  const filter = document.getElementById("alert-filter").value;
  const filtered = alerts.filter(alert => filter === "all" || (filter === "read") === state.readAlertIds.includes(alert.id));
  document.getElementById("alert-description").textContent = `${alerts.length} active demo condition${alerts.length === 1 ? "" : "s"} · ${unreadCount} unread`;
  const list = document.getElementById("alert-list");
  list.innerHTML = filtered.length ? filtered.map(alert => {
    const isRead = state.readAlertIds.includes(alert.id);
    const icon = alert.level === "warning" ? "fa-triangle-exclamation" : alert.level === "critical" ? "fa-circle-exclamation" : "fa-circle-info";
    return `<article class="alert-item ${alert.level} ${isRead ? "is-read" : ""}"><span class="alert-item-icon"><i class="fa-solid ${icon}"></i></span><div class="alert-item-content"><div class="alert-item-title"><strong>${alert.title}</strong><span class="alert-level">${alert.level}</span>${isRead ? '<span class="read-label">READ</span>' : '<span class="unread-dot"></span>'}</div><p>${alert.message}</p><small>${alert.source} <span>·</span> ${alert.timestamp}</small></div><button class="button button-outline alert-read-button" type="button" data-alert-id="${alert.id}" ${isRead ? "disabled" : ""}>${isRead ? "Read" : "Mark read"}</button></article>`;
  }).join("") : '<div class="empty-state"><i class="fa-regular fa-circle-check"></i><strong>No alerts in this filter</strong><span>Check back when the simulated data updates.</span></div>';
  list.onclick = event => {
    const button = event.target.closest("[data-alert-id]");
    if (!button) return;
    if (markAlertRead(state, button.dataset.alertId)) onUpdate("Alert marked as read");
  };
  document.getElementById("mark-all-read").disabled = unreadCount === 0;
  document.getElementById("mark-all-read").onclick = () => {
    if (markAllAlertsRead(state, alerts.map(alert => alert.id))) onUpdate("All alerts marked as read");
  };
  document.getElementById("alert-filter").onchange = () => renderAlerts(state, onUpdate);
}
