import { nutritionTargets, sampleFoods } from "../data/nutrition-data.js";
import { addFood, getTodayKey, removeFood } from "./storage.js";
import { getNutritionTotals } from "./alerts.js";

export function renderNutrition(state, onUpdate) {
  const entries = state.foodLogs[getTodayKey()] || [];
  const totals = getNutritionTotals(state);
  const calciumPercent = totals.calcium / nutritionTargets.calcium * 100;
  const vitaminPercent = totals.vitaminD / nutritionTargets.vitaminD * 100;
  document.getElementById("nutrition-calcium-total").textContent = Math.round(totals.calcium).toLocaleString("en-US");
  document.getElementById("nutrition-vitd-total").textContent = totals.vitaminD.toFixed(1);
  document.getElementById("nutrition-calcium-bar").style.width = `${Math.min(100, calciumPercent)}%`;
  document.getElementById("nutrition-vitd-bar").style.width = `${Math.min(100, vitaminPercent)}%`;
  document.getElementById("nutrition-calcium-caption").textContent = calciumPercent >= 100 ? "Demo target reached; target is not a medical limit." : `${Math.max(0, Math.round(nutritionTargets.calcium - totals.calcium))} mg to demo target; this is not a medical recommendation.`;
  document.getElementById("food-count").textContent = `${entries.length} ITEM${entries.length === 1 ? "" : "S"}`;
  document.getElementById("food-log-total").textContent = `${Math.round(totals.calcium)} mg Ca · ${totals.vitaminD.toFixed(1)} µg vitamin D`;
  const foodList = document.getElementById("food-log-list");
  foodList.innerHTML = entries.length ? entries.map(item => `
    <div class="food-log-item"><span class="food-log-icon"><i class="fa-solid fa-utensils"></i></span><div class="food-log-copy"><strong>${escapeHtml(item.name)}</strong><small>${Math.round(Number(item.calcium))} mg calcium <span>·</span> ${Number(item.vitaminD).toFixed(1)} µg vitamin D</small></div><button type="button" class="icon-button remove-food" data-remove-food="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}"><i class="fa-solid fa-xmark"></i></button></div>`).join("") : '<div class="empty-state"><i class="fa-solid fa-bowl-food"></i><strong>No food logged today</strong><span>Add an item to start tracking.</span></div>';
  document.getElementById("food-reference").innerHTML = sampleFoods.map(food => `
    <div class="reference-food"><span class="reference-icon"><i class="fa-solid ${food.icon}"></i></span><div><strong>${food.name}</strong><small>${food.serving} · ${food.calcium} mg calcium · ${food.vitaminD} µg vitamin D</small></div><button class="button button-outline add-sample-food" type="button" data-food-id="${food.id}"><i class="fa-solid fa-plus"></i> Add</button></div>`).join("");

  foodList.onclick = event => {
    const button = event.target.closest("[data-remove-food]");
    if (!button) return;
    if (removeFood(state, button.dataset.removeFood)) onUpdate("Food item removed");
  };
  document.getElementById("food-reference").onclick = event => {
    const button = event.target.closest("[data-food-id]");
    if (!button) return;
    const food = sampleFoods.find(item => item.id === button.dataset.foodId);
    if (!food) return;
    if (addFood(state, { id: `food-${Date.now()}`, name: food.name, calcium: food.calcium, vitaminD: food.vitaminD })) onUpdate(`${food.name} added`);
  };
}

export function bindFoodForm(form, state, onUpdate) {
  form.addEventListener("submit", event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const calcium = Number(data.get("calcium"));
    const vitaminD = Number(data.get("vitaminD"));
    const feedback = document.getElementById("food-feedback");
    if (!name || !Number.isFinite(calcium) || calcium < 0 || calcium > 3000 || !Number.isFinite(vitaminD) || vitaminD < 0 || vitaminD > 200) {
      feedback.textContent = "Enter a name and valid nutrient values.";
      feedback.className = "form-feedback error";
      return;
    }
    if (!addFood(state, { id: `food-${Date.now()}`, name, calcium, vitaminD })) {
      feedback.textContent = "Could not save this item. Check browser storage settings.";
      feedback.className = "form-feedback error";
      return;
    }
    form.reset();
    feedback.textContent = "Food item added.";
    feedback.className = "form-feedback success";
    onUpdate("Food item added to today's log");
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
