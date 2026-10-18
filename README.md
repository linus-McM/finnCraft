# Itacaré 3D Trails

A single-page Progressive Web App (PWA) that shows a **3D terrain model of Itacaré, Bahia (Brazil)** and its
beaches, with every walking trail from OpenStreetMap draped over it, plus **your live phone GPS position**.

Built with plain HTML + JavaScript and [three.js](https://threejs.org). No build step and no npm install.

## Features

- **3D terrain** from SRTM elevation data covering Itacaré town south to Itacarezinho (about 13 × 18 km).
- **Two map styles**: satellite imagery, or a topo style with hillshading and contour lines every 10 m (bold every 50 m).
- **Sharp imagery where you look**: the terrain is split into 1 km chunks; chunks near the camera stream in imagery at
  about 0.6 m per pixel (zoom 18), enough to see individual houses, while the rest shows a coarse overview. Imagery comes from
  Esri World Imagery (free) or, with a Google key that has **Map Tiles API** enabled, Google satellite tiles (choose in Layers).
- **3D buildings** extruded from OpenStreetMap footprints (height from OSM tags where present).
- **Trails** loaded from OpenStreetMap, colour-coded by type: hiking routes, paths, dirt tracks, steps and roads.
- **Tap a trail** to see its length, ascent and descent, lowest and highest points, a walking-time estimate and an elevation profile.
- **Tap the ground** to see its elevation, its distance from you, and a link for walking directions.
- **Restaurants, bars and cafés** as markers (from OpenStreetMap), with Google **ratings** if you add an API key (see below).
  Tap a marker to see its rating, cuisine, opening hours, phone, website, distance and directions.
  You can filter by type or by minimum rating.
- **Places**: beaches, viewpoints, waterfalls, sights and towns as tappable labels, with a list sorted by distance from you.
- **Route here**: from any place, restaurant, trail or tapped map point, computes the shortest route from your
  live GPS position along the real trail and road network, for **moped / e-bike** (default: roads, tracks, cycleways and
  paths OpenStreetMap marks as open to bicycles or mopeds; no footpaths, steps or private roads) or **walking** (everything), draws it on the 3D map, and shows remaining distance,
  estimated time, climb and compass direction. It re-routes if you leave the path and tells you when you arrive.
  If the data has no connected path, a dashed straight line is drawn instead.
- **List view** with search: Places, Food & drink (sorted by rating) and Trails tabs.
- **Live GPS**: a blue dot with an accuracy circle and a heading arrow. "Follow me" mode keeps the map centred on you.
  The status bar shows your elevation and the nearest trail.
- **Track recording**: record your walk, see it in 3D (red line), and export it as GPX.
- **Vertical exaggeration** slider (1× to 4×) to make the terrain easier to read.
- **Works offline after the first visit**: the app, terrain and trail data are cached, and so are the satellite tiles you have loaded.
  You can install it to your home screen.

## Two areas: Itacaré and São Paulo

The same app covers two areas. Tap **⇄ São Paulo** / **⇄ Itacaré** in the title bar (or **Layers → Area**) to switch;
the choice is remembered, and `?area=saopaulo` in the URL selects it directly (the installed app also offers both as
home-screen shortcuts). Everything works the same way in both: 3D terrain, OpenStreetMap streets and paths, restaurants,
bars and cafés with Google ratings, live GPS, and routes from your position.

The São Paulo area covers the centre of the city (about 15 × 12 km: Luz, Centro, Paulista, Jardins, Pinheiros,
Vila Madalena, Itaim, Ibirapuera, Moema, Vila Mariana, Barra Funda and Lapa, west to CEAGESP). Differences from Itacaré:

- **Data points**: besides restaurants, bars and cafés it loads **markets** (`amenity=marketplace`), **parks**, museums,
  attractions, viewpoints and neighbourhood names from OpenStreetMap, and a curated list of **top picks**
  (`data/saopaulo/places.json`: 14 markets and fairs, 31 restaurants, 9 bars, 5 cafés, 11 sights, each with a note on what
  to eat or why to go and the neighbourhood). Picks are marked ⭐, have their own **Picks** filter in the Food & drink list,
  and are matched to the OpenStreetMap listing when one exists.
- **Lean map data**: no 3D buildings, service roads, sidewalks or crossings (São Paulo has hundreds of thousands of each);
  trunk roads are shown but never used for walking routes.
- **Ratings**: Google Text Search is run over four busy districts plus the whole area, so the best-known places are rated;
  the badge colour still ranks review counts among all rated places on the map.
- **Terrain**: the city sits at 700–870 m, so the topo tint and contours are relative to the lowest point, and there is no sea.

Picks outside the area box (Mocotó in Vila Medeiros, Mercado de Santo Amaro) are not shown. Pick coordinates were entered
by hand and are approximate until a Google key snaps them to the real listing.

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
4. Add it to the repository as a secret: **Settings → Secrets and variables → Actions → New repository secret**,
   name `GOOGLE_PLACES_KEY`. The deploy workflow writes it into `config.js` on the published site, so ratings load
   for everyone automatically. The key is never committed to git.

   Alternatively, any user can paste a key in the app under **Layers → Ratings** (stored only in their browser; it overrides the built-in one).

A key on a public web page is visible to anyone who looks, which is why step 3's restrictions matter: they make the key useless anywhere but your site. One refresh makes up to 18 Text Search requests, and the results are cached for 7 days.
Google ratings are matched to OpenStreetMap venues by name and location. Places that only Google knows about are added as extra markers.

## Project layout

```
index.html            The whole app: HTML, CSS and JavaScript (three.js scene, GPS, UI)
manifest.webmanifest  PWA metadata (name, icons, colours)
sw.js                 Service worker that caches files for offline use
data/terrain.bin      Itacaré elevation grid (512 × 698, int16 decimetres, north row first)
data/terrain.json     Bounding box, grid size and real-world size of the elevation grid
data/saopaulo/        The same two files for central São Paulo (640 × 512), plus places.json (curated top picks)
vendor/               three.js r170 and the addons used (map controls, thick lines)
icons/                App icons
tools/bake_terrain.py Script that regenerates the terrain files of an area from AWS Terrain Tiles
```

### How it works (short version)

1. `data/terrain.bin` is turned into a three.js `PlaneGeometry`. Each vertex's height comes from the grid.
2. Latitude and longitude are converted to local metres with the Web Mercator projection (`toLocal()` in `index.html`).
   The terrain, the satellite tiles and the GPS position therefore all line up.
3. Trails come from the [Overpass API](https://overpass-api.de) (OpenStreetMap). Each trail gets extra points
   about every 12 m, and each point is lifted a little above the ground so the line follows the terrain.
4. `navigator.geolocation.watchPosition` provides the GPS fixes. These are converted with the same `toLocal()` and drawn as the blue marker.
5. Routing is done in the browser: every trail and road becomes edges of a graph (`buildGraph()`), the user's position and the
   destination are snapped to the nearest edge, and Dijkstra's algorithm (`findRoute()`) finds the shortest path. No server involved.

### Changing the map area

Edit the area's bounding box in `AREAS` in `tools/bake_terrain.py`, then run it for that area (it needs Python with Pillow and numpy):

```bash
pip install pillow numpy
python3 tools/bake_terrain.py            # Itacaré → data/
python3 tools/bake_terrain.py saopaulo   # São Paulo → data/saopaulo/
```

The streets, places and imagery follow the new bounding box automatically. Also update that area's `center` in `REGIONS`
in `index.html` if you move far away. To add a third area, add an entry to `AREAS` and to `REGIONS`, bake its terrain,
and list its files in `sw.js`.
If you change any cached file, bump `VERSION` in `sw.js` so installed copies update.

## Data sources and licences

- Elevation: [AWS Terrain Tiles](https://registry.opendata.aws/terrain-tiles/) (SRTM and others).
- Trails and place names: © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, ODbL.
- Satellite imagery: © Esri World Imagery and its contributors.
- three.js: MIT licence (`vendor/THREE-LICENSE`).
