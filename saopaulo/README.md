# São Paulo Eats & Markets

A Progressive Web App (PWA) with São Paulo's **key markets, restaurants, bars, cafés and sights**, rated the same way the
Itacaré app rates its restaurants, with your **live GPS position** and a **route from where you are** to the place you pick.

It lives at `/saopaulo/` next to the Itacaré 3D app and is deployed by the same GitHub Pages workflow:
`https://<user>.github.io/<repo>/saopaulo/`. Plain HTML + JavaScript and [Leaflet](https://leafletjs.com); no build step.

## Features

- **Curated places** (`data/places.json`): 14 markets and fairs (Mercadão, Mercado de Pinheiros, Feira da Benedito Calixto,
  Feira da Liberdade, Rua 25 de Março, CEAGESP…), 31 restaurants (A Casa do Porco, D.O.M., Maní, Mocotó, Hocca Bar…),
  9 bars, 5 cafés and 11 sights, each with a short note on what to eat or why to go, the neighbourhood and opening days.
- **Ratings the Itacaré way**: Google rating out of 5, the number of Google reviews, and a badge colour that shows how many
  reviews a place has **compared with the other places on this map** (red = fewest, amber = middle, green = most). A
  "Minimum rating" slider hides anything below the bar. Lists can be sorted by best rated or nearest.
- **Live GPS**: blue dot with accuracy circle, "follow me" mode, distance and compass direction to every place, and the
  nearest listed place in the status bar. The GPS starts automatically once you have granted location permission.
- **Route here**: from any place, computes a route from your live position along the real street network for
  **walking**, **bike / moped** or **car / taxi**, draws it on the map and shows the remaining distance, time and direction.
  It re-routes when you leave the path and tells you when you arrive. Routes come from the public
  [Valhalla](https://valhalla1.openstreetmap.de) server (proper walking and cycling profiles), falling back to the
  [OSRM](https://router.project-osrm.org) demo server (car network) and then to a dashed straight line.
  A **Metro / bus** button opens Google Maps transit directions, since no free router covers São Paulo's public transport.
- **Works offline after the first visit**: the app, place list and the map tiles you have viewed are cached, and the Google
  ratings are kept for a week. Install it from the browser's "Add to Home Screen".

## Google ratings (optional API key)

Ratings, opening hours, "open now" and exact positions come from the Google Places API (New), exactly as in the Itacaré app.
The deploy workflow injects the `GOOGLE_PLACES_KEY` repository secret into `config.js` at the repository root, and this app
reads that same file, so **nothing extra is needed** if the Itacaré app already has ratings. Any user can also paste a key under
**Layers → Ratings** (stored only in their browser).

One refresh makes one Text Search request per place (about 70) and the result is cached for 7 days.
Without a key, the app still works: places, notes, hours from the data file, GPS and routing.

## Data notes

The coordinates in `data/places.json` were entered by hand and are approximate (usually within 100–200 m). When a Google
key is configured each place snaps to Google's exact position, which is what the routing then uses. To add or correct a
place, edit `data/places.json` (fields: `id`, `name`, `group` = market | restaurant | bar | cafe | sight, `kind`, `lat`, `lon`,
`area`, `hours`, `notes`) and bump `VERSION` in `sw.js` so installed copies refresh.

## Project layout

```
saopaulo/index.html            The whole app: HTML, CSS and JavaScript (Leaflet map, GPS, ratings, routing, UI)
saopaulo/data/places.json      Curated list of markets, restaurants, bars, cafés and sights
saopaulo/manifest.webmanifest  PWA metadata
saopaulo/sw.js                 Service worker: offline shell, tile cache
saopaulo/vendor/               Leaflet 1.9.4 (BSD-2-Clause, see LEAFLET-LICENSE)
saopaulo/icons/                App icons
```

Run it locally with any static server from the repository root (the app loads `../config.js`):

```bash
cd finnCraft
python3 -m http.server 8000
# then open http://localhost:8000/saopaulo/
```

Map tiles © [CARTO](https://carto.com/attributions) / © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
Ratings © Google. Routing by Valhalla and OSRM public demo servers (fair-use, no guarantee of availability).
