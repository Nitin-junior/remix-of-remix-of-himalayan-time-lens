import imageryRaw from "@/data/imagery.json";
import demRaw from "@/data/dem.json";
import climateRaw from "@/data/climate.json";

export type SiteId = "purepu" | "langtang" | "rasuwagadhi";

export type Scene = {
  file: string;
  date: string;
  cloudPct: number;
  sceneId: string;
  platform: string;
  bboxDeg: number[];
  url: string;
};

export type DemGrid = {
  rows: number;
  cols: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  min: number;
  max: number;
  elev: number[][];
  dataset: string;
};

export type ClimateYear = { year: number; annualMean: number; summerMean: number | null };

export type Climate = {
  gridElevation: number;
  gridLat: number;
  gridLon: number;
  series: ClimateYear[];
};

export const imagery = imageryRaw as unknown as Record<SiteId, Scene[]>;
export const dem = demRaw as unknown as Record<SiteId, DemGrid>;
export const climate = climateRaw as unknown as Record<SiteId, Climate>;

export type Site = {
  id: SiteId;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  country: string;
  note: string;
};

export const sites: Site[] = [
  {
    id: "purepu",
    name: "Purepu Glacier supraglacial lake",
    subtitle: "Sale, Gyirong (Kyirong) County, Xizang, China — Gyirong Tsangpo / Bhote Koshi headwaters",
    lat: 28.402561,
    lon: 85.646705,
    country: "China (transboundary to Nepal)",
    note: "Source of the 7–8 July 2025 outburst flood that reached Rasuwagadhi. Coordinates as reported in the HiRISK rapid hazard assessment RHA No. CN1.",
  },
  {
    id: "langtang",
    name: "Langtang Lirung / Langtang valley",
    subtitle: "Rasuwa District, Nepal — debris-covered glacier tongue and 2015 collapse zone",
    lat: 28.2131,
    lon: 85.5581,
    country: "Nepal",
    note: "Valley floor buried by the co-seismic ice-and-rock avalanche of 25 April 2015. Long-studied debris-covered glacier system.",
  },
  {
    id: "rasuwagadhi",
    name: "Rasuwagadhi border crossing",
    subtitle: "Lhende Khola / Bhote Koshi confluence, Nepal–China border",
    lat: 28.2789,
    lon: 85.3789,
    country: "Nepal / China border",
    note: "Friendship bridge, dry port and hydropower infrastructure damaged by the 8 July 2025 flood wave.",
  },
];

export function siteById(id: SiteId): Site {
  return sites.find((s) => s.id === id) ?? (sites[0] as Site);
}

/* ---------- DEM maths (SRTM 30 m grid, static reference survey) ---------- */

function cell(g: DemGrid, r: number, c: number): number {
  const rr = Math.min(g.rows - 1, Math.max(0, r));
  const cc = Math.min(g.cols - 1, Math.max(0, c));
  const row = g.elev[rr];
  if (!row) return 0;
  return row[cc] ?? 0;
}

/** Bilinear elevation sample in metres. Row 0 = latMin. */
export function elevationAt(g: DemGrid, lat: number, lon: number): number {
  const fy = ((lat - g.latMin) / (g.latMax - g.latMin)) * (g.rows - 1);
  const fx = ((lon - g.lonMin) / (g.lonMax - g.lonMin)) * (g.cols - 1);
  const y0 = Math.floor(fy);
  const x0 = Math.floor(fx);
  const ty = fy - y0;
  const tx = fx - x0;
  const a = cell(g, y0, x0);
  const b = cell(g, y0, x0 + 1);
  const c = cell(g, y0 + 1, x0);
  const d = cell(g, y0 + 1, x0 + 1);
  return a * (1 - tx) * (1 - ty) + b * tx * (1 - ty) + c * (1 - tx) * ty + d * tx * ty;
}

/** Slope in degrees from the central-difference gradient of the DEM grid. */
export function slopeAt(g: DemGrid, lat: number, lon: number): number {
  const latSpanM = (g.latMax - g.latMin) * 111320;
  const lonSpanM = (g.lonMax - g.lonMin) * 111320 * Math.cos((lat * Math.PI) / 180);
  const dy = latSpanM / (g.rows - 1);
  const dx = lonSpanM / (g.cols - 1);
  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLon = (g.lonMax - g.lonMin) / (g.cols - 1);
  const gz =
    (elevationAt(g, lat, lon + dLon) - elevationAt(g, lat, lon - dLon)) / (2 * dx);
  const gy =
    (elevationAt(g, lat + dLat, lon) - elevationAt(g, lat - dLat, lon)) / (2 * dy);
  return (Math.atan(Math.hypot(gz, gy)) * 180) / Math.PI;
}

/** Downslope aspect (compass bearing the terrain faces), degrees from north. */
export function aspectAt(g: DemGrid, lat: number, lon: number): number {
  const dLat = (g.latMax - g.latMin) / (g.rows - 1);
  const dLon = (g.lonMax - g.lonMin) / (g.cols - 1);
  const dzdx = elevationAt(g, lat, lon + dLon) - elevationAt(g, lat, lon - dLon);
  const dzdy = elevationAt(g, lat + dLat, lon) - elevationAt(g, lat - dLat, lon);
  let deg = (Math.atan2(-dzdx, -dzdy) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

export function compass(deg: number): string {
  const names = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return names[Math.round(deg / 22.5) % 16] as string;
}

/* ---------- Formatting + provenance helpers ---------- */

export function sensorLabel(scene: Scene): string {
  const p = scene.platform.toUpperCase().replace("SENTINEL-2", "Sentinel-2 ");
  return `${p.trim()} · MSI L2A · 10 m`;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

export function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export function elapsedLabel(a: string, b: string): string {
  const d = daysBetween(a, b);
  if (d < 45) return `${d} day${d === 1 ? "" : "s"}`;
  if (d < 700) return `${d} days (~${(d / 30.44).toFixed(1)} months)`;
  return `${d} days (~${(d / 365.25).toFixed(1)} years)`;
}

/** Plain-language caption for a specific documented pair; otherwise a neutral prompt. */
export function pairCaption(site: SiteId, a: string, b: string): { text: string; documented: boolean } {
  const key = `${site}|${a}|${b}`;
  const known: Record<string, string> = {
    "purepu|2023-07-09|2023-07-21":
      "The large supraglacial lake on the glacier tongue is present on 9 July 2023 and largely absent 12 days later — the 2023 drainage event described by Xu et al. (2026) as near-complete.",
    "purepu|2025-07-05|2025-07-08":
      "Three days apart, across the 7–8 July 2025 outburst. The lake surface visible on 5 July is greatly reduced on 8 July; published analysis reports drainage was incomplete, with residual water remaining.",
    "rasuwagadhi|2025-07-03|2025-07-13":
      "Before and after the 8 July 2025 flood wave on the Lhende Khola / Bhote Koshi. Look along the river corridor for widened, sediment-brightened channel and missing road and bridge sections.",
  };
  const text = known[key];
  if (text) return { text, documented: true };
  return {
    text:
      "No published interpretation is attached to this pair. Drag the divider and compare snow cover, lake surfaces, debris and river channel position yourself — this tool does not decide what changed.",
    documented: false,
  };
}

/** Featured comparisons anchored to the published Purepu record. */
export const featuredPairs: { site: SiteId; a: string; b: string; label: string }[] = [
  { site: "purepu", a: "2023-07-09", b: "2023-07-21", label: "Purepu 2023 drainage — 9 Jul vs 21 Jul 2023" },
  { site: "purepu", a: "2025-07-05", b: "2025-07-08", label: "Purepu 2025 drainage — 5 Jul vs 8 Jul 2025" },
  { site: "rasuwagadhi", a: "2025-07-03", b: "2025-07-13", label: "Rasuwagadhi — 3 Jul vs 13 Jul 2025" },
];

/** Linear trend (°C per decade) over a year-indexed series. */
export function trendPerDecade(pts: { year: number; value: number }[]): number {
  const n = pts.length;
  if (n < 3) return 0;
  const mx = pts.reduce((s, p) => s + p.year, 0) / n;
  const my = pts.reduce((s, p) => s + p.value, 0) / n;
  let num = 0;
  let den = 0;
  for (const p of pts) {
    num += (p.year - mx) * (p.value - my);
    den += (p.year - mx) ** 2;
  }
  return den === 0 ? 0 : (num / den) * 10;
}
