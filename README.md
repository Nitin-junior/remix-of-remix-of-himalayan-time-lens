# Remix of Remix of Himalayan Time Lens

Prompt

Build a web app called "Third Pole Watch" — a change-detection dashboard for monitoring glacier and terrain change over time in the Himalaya (Langtang / Purepu / Rasuwa region, China-Nepal border). The core idea: let a user compare the same location across different dates/years using real satellite imagery, elevation data, and temperature trends, to visually and numerically see what has changed. This is a hackathon proof-of-concept — every number and image must trace to real, citable data, never fabricated "live" values.

Visual style

Dark, scientific-field-report aesthetic (not a typical SaaS dashboard):

Background near-black (#0a0c10), panels (#161b24)

Text: warm off-white (#f3efe6), muted gray (#9a9488)

Accent gold (#d4a24a) for labels, ice-blue (#8eb4d4) for glacier/elevation elements, warm red-orange (#ff6b4a) for temperature/warming indicators

Serif font for body copy, monospace for data labels/coordinates/dates, bold sans for headings

Thin borders, subtle glow on active/selected elements, generous whitespace

Core features

1. Location picker

A simple map (Leaflet or Mapbox, free tier) centered on the Langtang/Purepu/Rasuwa region

Preset pins for known points of interest: Purepu Glacier terminus, Langtang Lirung collapse zone, Rasuwagadhi Bridge — clicking a pin loads that location's full profile

Show lat/lon coordinates clearly as monospace text next to the selected pin

2. Time-Compare Image Slider (core feature)

A before/after swipe slider (drag left-right to reveal) comparing two satellite images of the same selected location from two different dates

Populate this with real, freely available optical imagery:

Sentinel-2 (10m resolution, since 2015) via the Copernicus Browser or Sentinel Hub's free tier — has a documented API for pulling true-color imagery for a bounding box + date

Landsat 8/9 (30m, since 2013, and earlier Landsat going back decades) via USGS EarthExplorer or the AWS Landsat public bucket

Let the user pick two dates from a dropdown (populated from actual image acquisition dates available for that location — don't offer a date with no real image behind it)

Below the slider, auto-display: date of each image, sensor used, and a plain-language caption (e.g. "Lake area visibly reduced between these two dates")

For the Purepu case specifically, hardcode the real before/after image pairs and dates from the published paper (9 July 2023 pre-drainage vs 20 July 2023 post-drainage; 6 July 2025 vs 9 July 2025) as a "featured comparison" users can jump straight to

3. Elevation Profile Panel

Load a NASADEM/SRTM elevation grid (30m) for the selected location via OpenTopography's API or a pre-fetched GeoTIFF bundled with the app

Render a simple 3D terrain mesh (Three.js) for the selected point's surrounding area, rotatable/zoomable

Show a numeric elevation readout for the exact selected point (in meters), plus the surrounding slope angle (computed from the DEM grid — basic gradient math, no external data needed)

Note clearly in the UI: "Elevation data reflects a single reference survey — not real-time or repeated per date" (NASADEM is a static one-time global product, so be upfront this isn't a "change over time" layer, only the imagery and temperature are)

4. Temperature Trend Chart

Pull historical air temperature data for the selected coordinates from ERA5 reanalysis data (ECMWF, free, accessible via the Copernicus Climate Data Store API, or Google Earth Engine's ERA5 collection for easier querying) — this is the realistic source since ground weather stations are sparse at this elevation

Display as a line chart showing temperature trend over the available years for that point, with a clear "long-term average" reference line so warming trend is visible

Label the chart honestly: "Reanalysis model estimate, ~9-31km grid resolution — not a precise on-site reading" so it isn't mistaken for exact local measurement

5. Change Summary Card

For any two-date image comparison selected in Feature 2, generate a simple auto-summary combining what's known:

Time elapsed between the two images

Elevation and slope at that point (static reference)

Temperature trend direction for that period (from Feature 4's data, if available)

A plainly-labeled "Visual change observed" note that the user themselves confirms by looking at the slider — do NOT auto-generate a percentage or hazard score claiming the software detected the change; the human eye comparing the slider is the actual detection method in this version

6. Purepu Case Study anchor panel

A dedicated section using the real published data from "Repeated supraglacial lake drainage from the Purepu Glacier system, central Himalaya" (Xu et al., 2026, EGUsphere, doi.org/10.5194/egusphere-2026-4065):

Pre-drainage lake area ~0.70–0.72 km² in both 2023 and 2025

DEM-constrained volume loss: 0.87 ×10⁶ m³ (2023) vs 3.55 ×10⁶ m³ (2025)

2023: near-complete drainage; 2025: incomplete, residual water into 2026

Link this panel directly to the Feature 2 image slider pre-loaded with the real dates from the paper

7. About / Limitations panel

State plainly: this tool lets a human visually compare real satellite imagery over time and see real elevation/temperature context for a point — it does not automatically detect change, predict hazards, or provide real-time alerts

List what would be needed to go further: automated change-detection algorithms (e.g. image differencing, NDWI/NDSI comparison for water/snow), InSAR for ground movement, and institutional data-sharing partnerships (e.g. ICIMOD, Nepal DHM) for anything used operationally

Data & technical notes

All imagery, elevation, and temperature data must come from real free sources: Sentinel-2 / Landsat (Copernicus Browser, Sentinel Hub free tier, or AWS Landsat bucket), NASADEM/SRTM (OpenTopography), ERA5 (Copernicus Climate Data Store or Google Earth Engine)

If live API calls are unreliable inside Lovable, pre-fetch a small, fixed set of image pairs and data points for the 3-4 featured locations and bundle them as static assets — clearly label these as "cached" rather than pretending they're live

Use Three.js for the 3D elevation view, a lightweight charting library (Recharts) for the temperature chart, and a simple before/after slider component (can be built with two stacked <img> tags and a clip-path driven by drag position — no heavy library needed)

Front-end-only for this version, no backend/database required

Persistent footer crediting all data sources with links, plus the Purepu paper DOI

Tone

Precise and honest. This is a tool for seeing real change with your own eyes across real data layers — not a tool that claims to detect or predict on its own. Every label should make clear what's a real dated measurement versus a static reference layer.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/fb95a24d-d4ec-47e1-b2c5-fddbefdc399e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
