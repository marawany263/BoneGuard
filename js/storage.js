import { initialReadings } from "../data/astronaut-data.js";
import { initialFoodLog } from "../data/nutrition-data.js";
import { dailyExercises } from "../data/exercise-data.js";

const STORAGE_KEY = "boneguard-demo-state-v1";

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function createInitialState() {
  return {
    readings: initialReadings,
    foodLogs: { [todayKey()]: initialFoodLog },
    completedExercises: {},
    readAlertIds: []
  };
}

function normalizeState(value) {
  const initial = createInitialState();
  if (!value || typeof value !== "object") return initial;
  return {
    ...initial,
    ...value,
    readings: Array.isArray(value.readings) ? value.readings : initial.readings,
    foodLogs: value.foodLogs && typeof value.foodLogs === "object" ? value.foodLogs : initial.foodLogs,
    completedExercises: value.completedExercises && typeof value.completedExercises === "object" ? value.completedExercises : {},
    readAlertIds: Array.isArray(value.readAlertIds) ? value.readAlertIds : []
  };
}

export function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeState(JSON.parse(stored)) : createInitialState();
  } catch (error) {
    console.error("BoneGuard could not load saved demo data.", error);
    return createInitialState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("BoneGuard could not save demo data.", error);
    return false;
  }
}

export function getTodayKey() {
  return todayKey();
}

export function getTodayExercises(state) {
  return state.completedExercises[todayKey()] || [];
}

export function setExerciseComplete(state, exerciseId, complete) {
  const key = todayKey();
  const current = new Set(state.completedExercises[key] || []);
  if (complete) current.add(exerciseId);
  else current.delete(exerciseId);
  state.completedExercises[key] = [...current];
  return saveState(state);
}

export function addFood(state, food) {
  const key = todayKey();
  if (!Array.isArray(state.foodLogs[key])) state.foodLogs[key] = [];
  state.foodLogs[key].push(food);
  return saveState(state);
}

export function removeFood(state, foodId) {
  const key = todayKey();
  state.foodLogs[key] = (state.foodLogs[key] || []).filter(item => item.id !== foodId);
  return saveState(state);
}

export function addReading(state, reading) {
  state.readings.push(reading);
  state.readings.sort((a, b) => a.date.localeCompare(b.date));
  return saveState(state);
}

export function markAlertRead(state, alertId) {
  if (!state.readAlertIds.includes(alertId)) state.readAlertIds.push(alertId);
  return saveState(state);
}

export function markAllAlertsRead(state, ids) {
  state.readAlertIds = [...new Set([...state.readAlertIds, ...ids])];
  return saveState(state);
}
