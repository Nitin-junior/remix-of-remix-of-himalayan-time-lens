import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, Satellite, Mountain, Thermometer, Info } from "lucide-react";
import { sites, imagery, dem, climate, trendPerDecade } from "@/lib/sites";

export const Route = createFileRoute("/methods")({
  head: () => ({
    meta: [
      { title: "Data & methods — Third Pole Watch" },
      {
        name: "description",
        content:
          "Sources, resolutions and limits behind Third Pole Watch: Sentinel-2 MSI L2A imagery, SRTM 30 m terrain, and CHELSA / ERA5 climate series for the Bhote Koshi sites.",
      },
      { property: "og:title", content: "Data & methods — Third Pole Watch" },
      {
        property: "og:description",
        content:
          "How the imagery, terrain and climate layers in Third Pole Watch are sourced, sampled and bounded.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MethodsPage,
});

function MethodsPage() {
  const totalScenes = sites.reduce((n, s) => n + imagery[s.id].length, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
      <div className="field-label">Provenance</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Data &amp; methods
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every number and picture in this tool comes from a cached reference
        snapshot. Nothing is modelled, interpolated across sites, or updated
        live. This page states exactly what you are looking at.
      </p>

      <div className="my-10 rule-hair" />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <Satellite className="h-5 w-5 text-gold" />
          <h2 className="mt-3 font-sans text-sm font-semibold text-foreground">Imagery</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Sentinel-2 MSI Level-2A true-colour composites at 10 m ground
            sampling, clipped to a fixed bounding box per site. {totalScenes}{" "}
            scenes total; each carries its acquisition date, platform, scene ID
            and reported cloud percentage.
          </p>
        </div>
        <div className="panel p-5">
          <Mountain className="h-5 w-5 text-gold" />
          <h2 className="mt-3 font-sans text-sm font-semibold text-foreground">Terrain</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            SRTM 30 m elevation grids. Shaded relief is rendered in the browser
            from the grid. Elevation is bilinearly interpolated at the site
            coordinate; slope and aspect come from the central-difference
            gradient of the same grid.
          </p>
        </div>
        <div className="panel p-5">
          <Thermometer className="h-5 w-5 text-gold" />
          <h2 className="mt-3 font-sans text-sm font-semibold text-foreground">Climate</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            CHELSA / ERA5-derived annual and summer mean near-surface air
            temperature for the grid cell containing each site. Trends are
            ordinary least-squares fits over the plotted years, reported in °C
            per decade.
          </p>
        </div>
      </section>

      <div className="my-10 rule-hair" />

      <section>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-gold" />
          <h2 className="text-xl font-bold text-foreground">Per-site inventory</h2>
        </div>
        <div className="panel mt-5 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 field-label">Site</th>
                <th className="px-4 py-3 field-label">Scenes</th>
                <th className="px-4 py-3 field-label">Date range</th>
                <th className="px-4 py-3 field-label">DEM grid</th>
                <th className="px-4 py-3 field-label">Elev. range</th>
                <th className="px-4 py-3 field-label">Climate years</th>
                <th className="px-4 py-3 field-label">Trend</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => {
                const scenes = [...imagery[s.id]].sort((a, b) => a.date.localeCompare(b.date));
                const g = dem[s.id];
                const c = climate[s.id];
                const series = c.series.map((y) => ({ year: y.year, value: y.annualMean }));
                const trend = trendPerDecade(series);
                return (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to="/sites/$siteId"
                        params={{ siteId: s.id }}
                        className="text-foreground hover:text-gold"
                      >
                        {s.name}
                      </Link>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{scenes.length}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {scenes[0]?.date} → {scenes[scenes.length - 1]?.date}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {g.rows}×{g.cols} · {g.dataset}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {g.min}–{g.max} m
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {c.series[0]?.year}–{c.series[c.series.length - 1]?.year}
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {trend >= 0 ? "+" : ""}
                      {trend.toFixed(2)} °C/dec
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="my-10 rule-hair" />

      <section>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-gold" />
          <h2 className="text-xl font-bold text-foreground">Limits</h2>
        </div>
        <ul className="mt-4 max-w-3xl space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            · Scene dates are constrained by cloud cover; the closest usable
            image may be days away from an event, so absence of a feature is not
            proof of when it disappeared.
          </li>
          <li>
            · Slope and aspect from a 30 m grid smooth real terrain; treat them
            as site-scale context, not engineering values.
          </li>
          <li>
            · Climate series describe a coarse grid cell, not the lake or the
            glacier tongue itself.
          </li>
          <li>
            · No hydrological or breach modelling is performed anywhere in this
            tool, and no forecast is issued.
          </li>
        </ul>
        <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Published interpretations referenced here come from the HiRISK rapid
          hazard assessment RHA No. CN1 and the cited literature on the Purepu
          drainage record. See the{" "}
          <Link to="/event" className="text-gold hover:underline">
            July 2025 chronology
          </Link>{" "}
          for how those sources line up with the scene record.
        </p>
      </section>
    </div>
  );
}
