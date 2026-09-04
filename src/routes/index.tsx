import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { MapPin, ArrowRight, Satellite, Mountain, Thermometer } from "lucide-react";
import { sites, featuredPairs, imagery, fmtDate } from "@/lib/sites";
import SiteMap from "@/components/SiteMap";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Third Pole Watch — Bhote Koshi glacier-lake hazard monitor" },
      {
        name: "description",
        content:
          "Sentinel-2 imagery, SRTM terrain and climate trends for the Purepu, Langtang and Rasuwagadhi sites along the transboundary Bhote Koshi / Gyirong Tsangpo.",
      },
      { property: "og:title", content: "Third Pole Watch — Bhote Koshi glacier-lake hazard monitor" },
      {
        property: "og:description",
        content:
          "Sentinel-2 imagery, SRTM terrain and climate trends for the Purepu, Langtang and Rasuwagadhi sites along the transboundary Bhote Koshi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
      {/* hero */}
      <header className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end">
        <div>
          <div className="field-label">HiRISK rapid hazard assessment · RHA No. CN1</div>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Third Pole Watch
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Satellite monitoring of transboundary Himalayan glacier-lake hazards
            along the Bhote Koshi / Gyirong Tsangpo — from the{" "}
            <span className="text-ice">Purepu</span> source lake in Xizang to the{" "}
            <span className="text-ice">Rasuwagadhi</span> border crossing in Nepal.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            On 7–8 July 2025 a supraglacial lake on the Purepu glacier tongue
            drained, sending a flood wave down the Gyirong Tsangpo / Bhote Koshi
            that damaged the Friendship bridge, dry port and hydropower
            infrastructure at Rasuwagadhi. This tool lets you compare the
            before/after imagery yourself.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">Sentinel-2 · MSI L2A · 10 m</span>
            <span className="chip">SRTM 30 m DEM</span>
            <span className="chip">CHELSA / ERA5 climate</span>
          </div>
        </div>
        <div>
          <ClientOnly fallback={<div className="h-[440px] rounded-md border border-border bg-card" />}>
            <SiteMap onSelect={(id) => navigate({ to: "/sites/$siteId", params: { siteId: id } })} />
          </ClientOnly>
        </div>
      </header>

      <div className="my-12 rule-hair" />

      {/* sites */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-foreground">Monitored sites</h2>
          <span className="field-label">3 locations</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {sites.map((s) => {
            const scene = imagery[s.id][0]!;
            return (
              <Link
                key={s.id}
                to="/sites/$siteId"
                params={{ siteId: s.id }}
                className="panel group block overflow-hidden p-0 transition hover:border-border-strong"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={scene.url}
                    alt={s.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-gold" />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {s.lat.toFixed(4)}, {s.lon.toFixed(4)}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="field-label">{s.country}</div>
                  <h3 className="mt-1 font-sans text-base font-semibold text-foreground">
                    {s.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {s.note}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-gold">
                    Open site report <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="my-12 rule-hair" />

      {/* featured events */}
      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-bold text-foreground">Documented event pairs</h2>
          <span className="field-label">before / after</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredPairs.map((p) => {
            const a = imagery[p.site].find((s) => s.date === p.a)!;
            const b = imagery[p.site].find((s) => s.date === p.b)!;
            return (
              <Link
                key={p.label}
                to="/sites/$siteId"
                params={{ siteId: p.site }}
                search={{ a: p.a, b: p.b }}
                className="panel group p-0 overflow-hidden transition hover:border-border-strong"
              >
                <div className="flex h-32">
                  <div className="relative w-1/2 overflow-hidden">
                    <img src={a.url} alt={a.date} className="h-full w-full object-cover" loading="lazy" draggable={false} />
                    <span className="absolute left-2 top-2 field-label">A</span>
                  </div>
                  <div className="relative w-1/2 overflow-hidden border-l border-border">
                    <img src={b.url} alt={b.date} className="h-full w-full object-cover" loading="lazy" draggable={false} />
                    <span className="absolute right-2 top-2 field-label">B</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-sans text-sm font-semibold text-foreground">{p.label}</h3>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {fmtDate(p.a)} → {fmtDate(p.b)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* what you can do */}
      <section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Satellite, t: "Compare imagery", d: "Drag the before/after slider across documented drainage events." },
            { icon: Mountain, t: "Read terrain", d: "Shaded SRTM relief with elevation, slope and aspect at each site." },
            { icon: Thermometer, t: "Trace climate", d: "Seven-decade temperature trend as context for melt conditions." },
          ].map((f) => (
            <div key={f.t} className="panel p-5">
              <f.icon className="h-5 w-5 text-gold" />
              <h3 className="mt-3 font-sans text-sm font-semibold text-foreground">{f.t}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
