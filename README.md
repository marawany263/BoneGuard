# BoneGuard

BoneGuard is a responsive, front-end prototype for exploring astronaut bone-health monitoring during a fictional long-duration mission. It uses HTML, CSS, vanilla JavaScript modules, Chart.js, Font Awesome, and browser LocalStorage.

## Run locally

1. Open this folder in VS Code.
2. Install or enable the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

The app loads Chart.js, Font Awesome, and web fonts from CDNs, so those visual assets need an internet connection. LocalStorage keeps demo readings, food entries, exercise completion, and read-alert status in the browser.

## What is included

- Mission overview, charts, nutrition progress, and a transparent rule-based health summary.
- Monitoring charts and a validated form for simulated density estimates and lab-style values.
- Exercise checklist and weekly progress chart.
- Food reference, custom nutrition logging, totals, and progress indicators.
- Dynamic demo alerts with read/unread controls.
- An educational artificial-gravity model with no spacecraft control functions.

## Data and safety notes

All astronaut details and readings are fictional. Bone density is an illustrative estimate; a smartwatch or wearable is not shown as directly measuring bone density. Laboratory-style values are also simulated. Health summaries and alerts use plain configurable demo rules, not a medically validated AI model. Nutrition targets are not official NASA medical limits and are not supplement or treatment instructions. Exercise suggestions are educational examples; real astronaut training must be approved by qualified specialists. Artificial gravity is a research concept, not an established daily treatment.

The application stores data under the `boneguard-demo-state-v1` key in browser LocalStorage. Clearing that site's storage restores the fictional initial sample data.
