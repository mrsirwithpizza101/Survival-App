#!/usr/bin/env python3
"""Turn an OpenStreetMap GeoJSON-seq export into small map tiles the app loads on demand.

Usage: build_poi.py OUT_DIR INPUT.geojsonseq [...]

Writes:
  OUT_DIR/9/{x}_{y}.json  points per zoom-9 tile: [name, category, lat, lon, note, min_zoom]
  OUT_DIR/places.json     cities and towns for labels when zoomed out: [name, lat, lon, rank]
  OUT_DIR/meta.json       list of tiles, counts, build date
"""
import json, math, os, sys, datetime
from collections import defaultdict

Z = 9

def tile(lat, lon):
    n = 2 ** Z
    x = int((lon + 180) / 360 * n)
    s = math.sin(math.radians(max(-85, min(85, lat))))
    y = int((0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n)
    return x, y

def center(g):
    t, c = g['type'], g['coordinates']
    if t == 'Point':
        return c[1], c[0]
    if t == 'LineString':
        pts = c
    elif t == 'Polygon':
        pts = c[0]
    elif t == 'MultiPolygon':
        pts = c[0][0]
    else:
        return None
    if not pts:
        return None
    return sum(p[1] for p in pts) / len(pts), sum(p[0] for p in pts) / len(pts)

SHOPS = {'supermarket': 'Grocery store', 'convenience': 'Convenience store', 'hardware': 'Hardware store',
         'doityourself': 'Hardware store', 'outdoor': 'Outdoor store', 'general': 'General store'}

def classify(t):
    """Return (category, default_name, extra_note, min_zoom) or None."""
    a, n, sh = t.get('amenity'), t.get('natural'), t.get('shop')
    if a == 'hospital':
        return 'medical', 'Hospital', 'Emergency dept' if t.get('emergency') == 'yes' else '', 10
    if a in ('clinic', 'doctors'):
        return 'medical', 'Clinic', '', 12
    if a == 'pharmacy':
        return 'medical', 'Pharmacy', '', 12
    if t.get('emergency') == 'defibrillator':
        return 'medical', 'AED (defibrillator)', '', 15
    if a == 'fire_station':
        return 'fire', 'Fire station', '', 10
    if a == 'police':
        return 'fire', 'Police', '', 10
    if a == 'ranger_station':
        return 'fire', 'Ranger station', '', 10
    if a in ('drinking_water', 'water_point'):
        return 'water', 'Drinking water', 'Public tap. May stop working in an outage.', 13
    if n == 'spring':
        return 'water', 'Spring', 'Treat before drinking. Flow not verified.', 11
    if t.get('man_made') == 'water_well':
        return 'water', 'Water well', 'May be private or have no pump. Treat before drinking.', 12
    if a == 'social_facility' and t.get('social_facility') == 'shelter':
        return 'shelter', 'Shelter', '', 11
    if t.get('emergency') == 'assembly_point':
        return 'shelter', 'Emergency assembly point', '', 12
    if a == 'fuel':
        return 'fuel', 'Fuel', '', 12
    if a == 'townhall':
        return 'civic', 'Town hall', '', 12
    if t.get('tourism') == 'camp_site':
        return 'camp', 'Campground', '', 11
    if sh in SHOPS:
        return 'supply', SHOPS[sh], '', 13 if sh == 'convenience' else 12
    if n == 'peak':
        ele = t.get('ele', '')
        try:
            note = 'Elevation %s ft · high ground' % format(round(float(ele) * 3.281), ',')
        except ValueError:
            note = 'High ground'
        return 'rally', 'Peak', note, 12
    pl = t.get('place')
    if pl in ('village', 'hamlet') and t.get('name'):
        return 'place', '', '', 11 if pl == 'village' else 13
    return None

def main():
    out = sys.argv[1]
    tiles = defaultdict(list)
    places = []
    counts = defaultdict(int)
    seen = set()  # regions can overlap at borders
    for path in sys.argv[2:]:
        with open(path, encoding='utf-8') as f:
            for line in f:
                line = line.strip().lstrip('\x1e')
                if not line:
                    continue
                try:
                    feat = json.loads(line)
                except ValueError:
                    continue
                t = feat.get('properties') or {}
                c = center(feat.get('geometry') or {'type': None, 'coordinates': None})
                if not c:
                    continue
                lat, lon = round(c[0], 5), round(c[1], 5)
                sig = (t.get('name'), t.get('amenity'), t.get('shop'), t.get('natural'), t.get('place'), round(lat, 4), round(lon, 4))
                if sig in seen:
                    continue
                seen.add(sig)
                pl = t.get('place')
                if pl in ('city', 'town') and t.get('name'):
                    places.append([t['name'], lat, lon, 1 if pl == 'city' else 2])
                    counts['place'] += 1
                    continue
                k = classify(t)
                if not k:
                    continue
                cat, default, extra, minz = k
                name = t.get('name') or default
                info = []
                addr = ('%s %s' % (t.get('addr:housenumber', ''), t.get('addr:street', ''))).strip()
                if t.get('name') and default:
                    info.append(default)
                if extra:
                    info.append(extra)
                if addr:
                    info.append(addr)
                if t.get('phone'):
                    info.append(t['phone'])
                if t.get('opening_hours'):
                    info.append(t['opening_hours'])
                x, y = tile(lat, lon)
                tiles['%d_%d' % (x, y)].append([name, cat, lat, lon, ' · '.join(info), minz])
                counts[cat] += 1
    os.makedirs(os.path.join(out, str(Z)), exist_ok=True)
    order = {'medical': 0, 'fire': 1, 'water': 2, 'shelter': 3, 'civic': 4, 'camp': 5, 'fuel': 6, 'supply': 7, 'rally': 8, 'place': 9}
    for key, arr in tiles.items():
        arr.sort(key=lambda g: (order.get(g[1], 10), g[5]))
        with open(os.path.join(out, str(Z), key + '.json'), 'w', encoding='utf-8') as f:
            json.dump(arr, f, ensure_ascii=False, separators=(',', ':'))
    places.sort(key=lambda p: p[3])
    with open(os.path.join(out, 'places.json'), 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, separators=(',', ':'))
    meta = {'tiles': sorted(tiles), 'counts': counts, 'total': sum(len(a) for a in tiles.values()),
            'built': datetime.date.today().isoformat(), 'source': '© OpenStreetMap contributors (ODbL)'}
    with open(os.path.join(out, 'meta.json'), 'w') as f:
        json.dump(meta, f, separators=(',', ':'))
    print('tiles', len(tiles), 'points', meta['total'], 'places', len(places), dict(counts))

if __name__ == '__main__':
    main()
