# Survival App

An offline emergency app for Android. It has a home screen of tools: a U.S. survival map, first aid, a triage tree, water and food guides, calculators, a $1,000 supply list, a grid-down playbook and a family plan.

**Download:** open [Releases](../../releases/latest) on your phone and tap **Survival-App.apk**.

## How it works

| Part | Where it lives |
|---|---|
| App screens and tools | `web/index.src.html`: one HTML page. Edit this file to change content. |
| Library guides, gear tiers, app list | `tools/library_content.py`. Edit it, then run `python3 tools/library_content.py`. |
| Map points (whole U.S.) | Built by `tools/build_poi.py` from OpenStreetMap at release time, stored in the APK, and loaded only for the area you're zoomed into |
| Styling and icons | Tailwind CSS and Lucide are inlined at build time (`tools/build_web.py`), so nothing loads from the internet |
| Android wrapper | `app/`: a WebView that shows the page |
| Build | `.github/workflows/build-apk.yml`. Every push to `main` builds a new APK and posts it under Releases. |

To make your own version, fork this repo, edit `web/index.src.html`, and push. GitHub builds the APK for you.

Map imagery (satellite, topo, streets) is too large to bundle. It loads when you have signal, and you can save areas for offline use with the ⤓ button.

Map data © OpenStreetMap contributors (ODbL). Local points for The Dalles come from USGS. Imagery © Esri and OpenTopoMap.

## Updates

- **Nov 15, 2026 (your situation)**: New My Situation screen: set your household, days, budget, diet, vehicle or EV, and backup power once, and every list and calculator adjusts. The supply list now fits any budget and scales to your household. The Food section builds a plan for your diet and food style. New Fuel & Power tool: vehicle range, cost to fill, what stored fuel can power, generator and power-station runtimes, and EV charge times and costs. On the map, tap any place and open Services & what to expect for what you'll find there, typical costs and emergency tips. EV chargers are now on the map.
- **Nov 15, 2026 (look & updates)**: Every home tile now has its own illustration. The top tabs are gone, and everything lives in the bottom menu. Drag the menu down by its handle to close it. Map and Library moved to the dock, and offline tools are now inside the Library. New: Menu → Find latest update downloads and installs new versions from inside the app. After each update, this What's new note appears once.
- **Nov 15, 2026 (update fix)**: The app now clears its old cached page after every update, so new features always show up. The version number is shown on the home screen and at the bottom of the menu. Tapping Take me there now previews the whole route on the map above the planner.
- **Nov 15, 2026 (navigation fix)**: The whole route from A to B now stays on the map while you scroll or zoom (it was being cut off). Tap the yellow direction banner for a list of every turn, with the distance to each one. Routes can start from any place, not just your location. Library guides now list the nearest matching places (water, shelters, hospitals and more) with distance, direction, walk and drive estimates, plus Show on map and Take me there.
- **Nov 15, 2026 (redesign)**: Black-and-yellow look with a floating oval dock, a center quick-action button (nearest hospital, water, shelter, fuel, first aid) and a slide-up menu. Every section opens with a short overview. New offline **Survival Library**: 43 guides, gear from budget to premium, and recommended apps, with dropdown filters. Map: one Filters button, a cleaner point menu, and **Take me there** with drive, bike or walk routes, ETA, turn-by-turn and live position (needs signal), Compass mode offline, and a Google Maps/Waze handoff for live closures. Swiping left now opens the map. New app icon.
- **Nov 15, 2026 (fixer-upper)**: Tap any map icon for details and actions: **Guide me** (an offline compass arrow with live distance), Directions, open in your map app, Street View, Save, and Copy GPS. Added one-tap **Find nearest** hospital, water, shelter and fuel on the home screen. Search now finds towns and points saved on the phone with no signal. New icon set and cleaner panels.
- **Nov 15, 2026 (fix)**: Every build now uses the same signing key, so updates install over the old app. If you installed an earlier version, uninstall it once first.
- **Nov 15, 2026**: New home-screen layout (AEGIS). Emergency points for the whole U.S. now come built in: hospitals, fire and police, water, shelters, fuel, food, campgrounds, peaks and towns. The map opens in satellite view and has a one-button map-type switch. Added a triage tree, calculators and an offline-downloads checklist. About 790,000 points and 7,700 city and town labels.
- **Nov 14, 2026**: First APK. Offline manual with a map of The Dalles.
