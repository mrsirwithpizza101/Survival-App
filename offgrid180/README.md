# OFFGRID 180

An offline survival companion for one person living independently for 90–180 days. It runs as an installable Progressive Web App (PWA) and as an Android APK, with no account, subscription or internet needed for any core or emergency feature.

**Download:** open [Releases](../../releases) and pick the newest **OFFGRID 180** release. Tap **OFFGRID-180.apk** on your Android phone. **OFFGRID-180-web.zip** is the same app for any browser.

> OFFGRID 180 is a planning and reference tool. It is **not a substitute** for professional medical training, emergency services or official weather and evacuation guidance.

## What's inside

| Section | What it does |
|---|---|
| **Dashboard** | Survival day, days remaining, food/water/fuel/energy/medical status, phone battery, weather, alerts, maintenance reminders, daily checklist, preparedness score, big emergency button |
| **Knowledge Library** | 55 offline guides across the 16 modules. Each guide has the 10 required parts: explanation, why it matters, materials, steps, diagram, common mistakes, safety warnings, emergency considerations, skills checklist and quiz. Each is labeled **Verified** (matches a named source such as CDC, Red Cross, NWS, USDA, NPS) or **General guidance** |
| **Equipment Inventory** | 67-item catalog in Tier 1 (life-critical), Tier 2 (sustainability) and Tier 3 (comfort), with quantities scaled to your plan. Your own gear: quantity, condition, expiry, replace-by date, maintenance schedule, location and a photo from your camera. CSV export |
| **Food & Water** | Calculators for 90/120/180 days: calories (Mifflin–St Jeor × activity, climate, hard labor), protein, water (with the Ready.gov 1 gal/day floor), food quantities by staple, water storage and treatment (CDC bleach dose, tablets, filter capacity), fuel (propane, kerosene, firewood, generator), solar and battery, medical and hygiene supplies, Tier 1 equipment reserves and depletion dates. Configurable reserve % |
| **Medical Center** | First-aid guides, guided medical emergency, medication tracker (count, doses/day, expiry, run-out warnings), medical info card for rescuers, box-breathing timer, mental health support |
| **Maps & Navigation** | GPS position offline (decimal, DMS, UTM), compass with declination and bearing to a waypoint, waypoints with an offline plot, import your own map images, distance/bearing and travel-time calculators, weather log with 3-hour pressure trend, optional online forecast |
| **Training Center** | 12 courses with lessons, quizzes, course exams (80% pass), completion tracking and skill self-assessment |
| **Daily Operations** | Editable daily checklist with history and streak, quick logs (water, food, battery, check-ins), mood and sleep journal, weekly and monthly routines |
| **Emergency Center** | 11 decision trees (medical, water contamination, food shortage, shelter damage, fire, severe weather, equipment failure, power failure, lost, wildlife, evacuation), SOS screen with large coordinates and a copyable SOS message, flashlight/screen SOS strobe, whistle signal, and a rescue & exit plan you can export |

**Accessibility and battery:** text size from 85% to 160%, dark (OLED), low-light red, high-contrast and light modes, read-aloud for any page (native Android text-to-speech in the APK), screen-reader labels, 48 px+ touch targets, large emergency buttons, reduce-motion option, metric/imperial units, and GPS/compass that run only while their screen is open.

**Data:** stored on the device in IndexedDB (with a localStorage fallback). Backups export and import as JSON from Settings. Nothing is sent anywhere.

## How it's built

| Part | Where |
|---|---|
| App (plain HTML/CSS/JS, no framework, no build step needed) | `web/` |
| Content: modules, guides, catalog, decision trees, courses, diagrams | `web/js/content/` |
| Calculators (pure functions, unit tested) | `web/js/calc.js`, `tests/calc.test.js` |
| Local database | `web/js/db.js` |
| Screens | `web/js/views/` |
| Offline service worker (generated) | `build.py` → `web/sw.js` |
| Android wrapper (WebView + text-to-speech, file save, flashlight, vibration bridges) | `android/` |
| CI: tests, APK, release, optional GitHub Pages | `../.github/workflows/offgrid180.yml` |

Every push that changes `offgrid180/` builds a new APK and posts it as a release tagged `offgrid180-v1.N`. To host the PWA, turn on **Settings → Pages → Source: GitHub Actions**. The site deploys from `main`.

### Run locally

```bash
python3 offgrid180/build.py dev          # regenerate sw.js
cd offgrid180/web && python3 -m http.server 8080   # open http://localhost:8080
node offgrid180/tests/calc.test.js       # calculator tests
node offgrid180/tests/smoke.mjs          # headless browser test of every screen (needs Playwright + Chrome)
```

## Not finished yet

These are not built yet, so the app doesn't pretend they are:

- **Photographs.** The catalog and guides use drawn icons and schematic diagrams, not photos. You can attach your own photos to inventory items.
- **Built-in topographic maps.** The app doesn't ship map tiles. Import map images you saved while online, and carry paper maps.
- **Map calibration.** Imported maps are pictures only. Your GPS position is not drawn on them.
- **Automatic sync.** There is no cloud sync, by design. Updates install from Releases, or through the service worker in the PWA, when you're online.
- **Plant and animal ID from photos.** Left out on purpose because it isn't reliable enough to be safe.
- **Background notifications.** Alerts appear in the app, not as phone notifications.
- **Content review.** The guides follow the cited sources, but a qualified instructor hasn't reviewed them. Practice every skill under supervision.
