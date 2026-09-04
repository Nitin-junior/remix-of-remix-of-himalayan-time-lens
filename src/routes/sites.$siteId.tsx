import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Mountain, Satellite, Thermometer } from "lucide-react";
import {
  sites,
  siteById,
  imagery,
  dem,
  climate,
  elevationAt,
  slopeAt,
  aspectAt,
  compass,
  type SiteId,
} from "@/lib/sites";
import ImageryPanel from "@/components/ImageryPanel";
import TerrainView from "@/components/TerrainView";
import ClimateChart from "@/components/ClimateChart";

export const Route = createFileRoute("/sites/$siteId")({
  validateSearch: (search): { a?: string; b?: string } => {
    const next: { a?: string; b?: string } = {};
    if (typeof search['a'] === "string") next.a = search['a'];
    if (typeof search['b'] === "string") next.b = search['b'];
    return next;
  },
  head: ({ params }) => {
    const site = sites.find((s) => s.id === params.siteId);
    const title = site
      ? `${site.name} — Third Pole Watch`
      : "Site — Third Pole Watch";
    const desc = site
      ? `Sentinel-2 imagery, SRTM terrain and climate trends for ${site.name} (${site.country}).`
      : "Glacier site report.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: SiteRoute,
  notFoundComponent: () => <div className="p-10 text-muted-foreground">Site not found.</div>,
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="data-value mt-0.5">{value}</div>
    </div>
  );
}

function SiteRoute() {
  const { siteId } = Route.useParams();
  const { a, b } = Route.useSearch();

  if (!sites.some((s) => s.id === (siteId as SiteId))) {
    throw notFound();
  }
  const id = siteId as SiteId;
  const site = siteById(id);
  const grid = dem[id];
  const elev = elevationAt(grid, site.lat, site.lon);
  const slope = slopeAt(grid, site.lat, site.lon);
  const aspect = aspectAt(grid, site.lat, site.lon);
  const sceneCount = imagery[id].length;
  const clim = climate[id];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
      {/* breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Overview
      </Link>

      {/* header */}
      <header className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="field-label">{site.country}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">
            {site.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{site.subtitle}</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/85">
            {site.note}
          </p>
        </div>
        <div className="panel grid grid-cols-2 gap-x-6 gap-y-4 p-5 self-start">
          <Stat label="Latitude" value={`${site.lat.toFixed(4)}°N`} />
          <Stat label="Longitude" value={`${site.lon.toFixed(4)}°E`} />
          <Stat label="Elevation" value={`${elev.toFixed(0)} m`} />
          <Stat label="Slope" value={`${slope.toFixed(1)}°`} />
          <Stat label="Aspect" value={`${aspect.toFixed(0)}° ${compass(aspect)}`} />
          <Stat label="DEM range" value={`${grid.min}–${grid.max} m`} />
        </div>
      </header>

      <div className="my-10 rule-hair" />

      {/* IMAGERY */}
      <section>
        <div className="flex items-center gap-2">
          <Satellite className="h-4 w-4 text-gold" />
          <h2 className="text-xl font-bold text-foreground">Imagery comparison</h2>
          <span className="ml-2 chip">{sceneCount} scenes</span>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Sentinel-2 MSI Level-2A, 10 m. Drag the divider to compare snow cover,
          lake surfaces, debris and river channel position.
        </p>
        <div className="mt-5">
          <ImageryPanel siteId={id} initialA={a} initialB={b} />
        </div>
      </section>

      <div className="my-10 rule-hair" />

      {/* TERRAIN */}
      <section>
        <div className="flex items-center gap-2">
          <Mountain className="h-4 w-4 text-gold" />
          <h2 className="text-xl font-bold text-foreground">Terrain</h2>
          <span className="ml-2 chip">{grid.dataset}</span>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Shaded relief rendered from the {grid.rows}×{grid.cols} SRTM 30 m grid.
          The marker is the site centre. Stats sampled at the site coordinate via
          bilinear interpolation.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <TerrainView dem={grid} site={site} />
          <div className="panel flex flex-col justify-between gap-4 p-5">
            <div>
              <div className="field-label">Site centre</div>
              <div className="mt-1 data-value text-2xl">{elev.toFixed(0)} m</div>
              <div className="mt-1 text-xs text-muted-foreground">bilinear elevation</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Slope" value={`${slope.toFixed(1)}°`} />
              <Stat label="Aspect" value={`${aspect.toFixed(0)}°`} />
              <Stat label="Facing" value={compass(aspect)} />
              <Stat label="Cell" value="30 m" />
            </div>
            <div>
              <div className="field-label">Grid extent</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {grid.latMin.toFixed(4)}–{grid.latMax.toFixed(4)}°N
                <br />
                {grid.lonMin.toFixed(4)}–{grid.lonMax.toFixed(4)}°E
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="my-10 rule-hair" />

      {/* CLIMATE */}
      <section>
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-gold" />
          <h2 className="text-xl font-bold text-foreground">Climate context</h2>
        </div>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          Near-surface air temperature at the {clim.gridElevation.toFixed(0)} m grid
          cell ({clim.gridLat.toFixed(2)}°N, {clim.gridLon.toFixed(2)}°E). Trend as
          context for melt conditions, not a forecast.
        </p>
        <div className="mt-5 panel p-5">
          <ClientOnly
            fallback={
              <div className="h-[300px] animate-pulse rounded bg-card" />
            }
          >
            <ClimateChart siteId={id} />
          </ClientOnly>
        </div>
      </section>

      {/* site switcher */}
      <div className="my-12 rule-hair" />
      <section>
        <div className="field-label">Other sites</div>
        <div className="mt-3 flex flex-wrap gap-3">
          {sites
            .filter((s) => s.id !== id)
            .map((s) => (
              <Link
                key={s.id}
                to="/sites/$siteId"
                params={{ siteId: s.id }}
                className="panel inline-flex items-center gap-2 px-4 py-2.5 transition hover:border-border-strong"
              >
                <MapPin className="h-3.5 w-3.5 text-ice" />
                <span className="font-sans text-sm font-medium text-foreground">
                  {s.name}
                </span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
