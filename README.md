# Survival App

An offline emergency app for Android. It has a home screen of tools: a U.S. survival map, first aid, a triage tree, water and food guides, calculators, a $1,000 supply list, a grid-down playbook and a family plan.

**Download:** open [Releases](../../releases/latest) on your phone and tap **Survival-App.apk**.

## How it works

| Part | Where it lives |
|---|---|
| App screens and tools | `web/index.src.html`: one HTML page. Edit this file to change content. |
| Map points (whole U.S.) | Built by `tools/build_poi.py` from OpenStreetMap at release time, stored in the APK, and loaded only for the area you're zoomed into |
| Styling and icons | Tailwind CSS and Lucide are inlined at build time (`tools/build_web.py`), so nothing loads from the internet |
| Android wrapper | `app/`: a WebView that shows the page |
| Build | `.github/workflows/build-apk.yml`. Every push to `main` builds a new APK and posts it under Releases. |

To make your own version, fork this repo, edit `web/index.src.html`, and push. GitHub builds the APK for you.

Map imagery (satellite, topo, streets) is too large to bundle. It loads when you have signal, and you can save areas for offline use with the ⤓ button.

Map data © OpenStreetMap contributors (ODbL). Local points for The Dalles come from USGS. Imagery © Esri and OpenTopoMap.

## Updates

- **Nov 15, 2026**: New home-screen layout (AEGIS). Emergency points for the whole U.S. now come built in: hospitals, fire and police, water, shelters, fuel, food, campgrounds, peaks and towns. The map opens in satellite view and has a one-button map-type switch. Added a triage tree, calculators and an offline-downloads checklist. About 790,000 points and 7,700 city and town labels.
- **Nov 14, 2026**: First APK. Offline manual with a map of The Dalles.
