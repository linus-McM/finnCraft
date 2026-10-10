# Itacaré 3D Trails

A single-page Progressive Web App (PWA) that shows a **3D terrain model of Itacaré, Bahia (Brazil)** and its
beaches, with every walking trail from OpenStreetMap draped over it, plus **your live phone GPS position**.

Built with plain HTML + JavaScript and [three.js](https://threejs.org). No build step and no npm install.

## Features

- **3D terrain** from SRTM elevation data covering Itacaré town south to Itacarezinho (about 13 × 18 km).
- **Two map styles**: satellite imagery (Esri World Imagery), or a topo style with hillshading and contour lines
  every 10 m (bold every 50 m).
- **Trails** loaded from OpenStreetMap, colour-coded by type: hiking routes, paths, dirt tracks, steps and roads.
- **Tap a trail** to see its length, ascent and descent, lowest and highest points, a walking-time estimate and an elevation profile.
- **Tap the ground** to see its elevation, its distance from you, and a link for walking directions.
- **Restaurants, bars and cafés** as markers (from OpenStreetMap), with Google **ratings** if you add an API key (see below).
  Tap a marker to see its rating, cuisine, opening hours, phone, website, distance and directions.
  You can filter by type or by minimum rating.
- **List view** with search: trails, plus a "Food & drink" tab sorted by rating.
- **Live GPS**: a blue dot with an accuracy circle and a heading arrow. "Follow me" mode keeps the map centred on you.
  The status bar shows your elevation and the nearest trail.
- **Track recording**: record your walk, see it in 3D (red line), and export it as GPX.
- **Vertical exaggeration** slider (1× to 4×) to make the terrain easier to read.
- **Works offline after the first visit**: the app, terrain and trail data are cached, and so are the satellite tiles you have loaded.
  You can install it to your home screen.

## Controls

| Action | Phone | Desktop |
| --- | --- | --- |
| Pan | one finger drag | left drag |
| Rotate / tilt | two finger twist / drag | right drag |
| Zoom | pinch | scroll wheel |
| Reset to north | tap the compass | click the compass |

## Run it locally

The browser needs the files to come from a web server; opening `index.html` directly won't work. Any static server will do:

```bash
cd finnCraft
python3 -m http.server 8000
# then open http://localhost:8000
```

## Using it on your phone (GPS needs HTTPS)

Browsers only allow GPS on `https://` pages (or `localhost`). The easiest free option is **GitHub Pages**:

1. On GitHub, open the repository's **Settings → Pages**.
2. Under "Build and deployment", choose **Deploy from a branch** and pick the branch and `/ (root)`.
3. After a minute the site is live at `https://<user>.github.io/<repo>/`. Open it on your phone and allow location access.
4. To install it, use **Add to Home Screen** (Share menu on iPhone Safari, ⋮ menu on Android Chrome).

## Restaurant ratings (optional Google API key)

OpenStreetMap lists the restaurants, bars and cafés but has **no ratings**. Ratings come from the Google Places API, which needs a key:

1. In the [Google Cloud console](https://console.cloud.google.com/), create a project and enable billing
   (Google includes a monthly free usage allowance).
2. Enable **Places API (New)**.
3. Create an API key under **APIs & Services → Credentials**. Restrict it to **Places API (New)**, and set
   **Website restrictions** to your site (for example `https://<user>.github.io/*`) so nobody else can use it.
4. In the app, open **Layers → Ratings**, paste the key and tap **Save & load ratings**.

The key is stored only in your browser. One refresh makes up to 18 Text Search requests, and the results are cached for 7 days.
Google ratings are matched to OpenStreetMap venues by name and location. Places that only Google knows about are added as extra markers.

## Project layout

```
index.html            The whole app: HTML, CSS and JavaScript (three.js scene, GPS, UI)
manifest.webmanifest  PWA metadata (name, icons, colours)
sw.js                 Service worker that caches files for offline use
data/terrain.bin      Elevation grid (512 × 698, int16 decimetres, north row first)
data/terrain.json     Bounding box, grid size and real-world size of the elevation grid
vendor/               three.js r170 and the addons used (map controls, thick lines)
icons/                App icons
tools/bake_terrain.py Script that regenerates data/terrain.* from AWS Terrain Tiles
```

### How it works (short version)

1. `data/terrain.bin` is turned into a three.js `PlaneGeometry`. Each vertex's height comes from the grid.
2. Latitude and longitude are converted to local metres with the Web Mercator projection (`toLocal()` in `index.html`).
   The terrain, the satellite tiles and the GPS position therefore all line up.
3. Trails come from the [Overpass API](https://overpass-api.de) (OpenStreetMap). Each trail gets extra points
   about every 12 m, and each point is lifted a little above the ground so the line follows the terrain.
4. `navigator.geolocation.watchPosition` provides the GPS fixes. These are converted with the same `toLocal()` and drawn as the blue marker.

### Changing the map area

Edit `WEST/EAST/SOUTH/NORTH` in `tools/bake_terrain.py`, then run it (it needs Python with Pillow and numpy):

```bash
pip install pillow numpy
python3 tools/bake_terrain.py
```

The trails and imagery follow the new bounding box automatically. Also update `TOWN` in `index.html` if you move far away.
If you change any cached file, bump `VERSION` in `sw.js` so installed copies update.

## Data sources and licences

- Elevation: [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (SRTM and others).
- Trails and place names: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL.
- Satellite imagery: © Esri World Imagery and its contributors.
- three.js: MIT licence (`vendor/THREE-LICENSE`).
