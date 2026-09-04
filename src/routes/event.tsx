import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { featuredPairs, imagery, fmtDate, elapsedLabel, pairCaption, sites } from "@/lib/sites";

export const Route = createFileRoute("/event")({
  head: () => ({
    meta: [
      { title: "July 2025 outburst chronology — Third Pole Watch" },
      {
        name: "description",
        content:
          "Chronology of the 7–8 July 2025 Purepu supraglacial lake drainage and the flood wave that reached Rasuwagadhi, with the Sentinel-2 scene pairs that document each step.",
      },
      { property: "og:title", content: "July 2025 outburst chronology — Third Pole Watch" },
      {
        property: "og:description",
        content:
          "What the Sentinel-2 record shows before and after the 7–8 July 2025 Purepu drainage on the Gyirong Tsangpo / Bhote Koshi.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventPage,
});

const steps = [
  {
    when: "July 2023",
    site: "purepu" as const,
    title: "Earlier drainage of the same lake",
    body:
      "A large supraglacial lake on the Purepu glacier tongue drains between 9 and 21 July 2023. Published analysis describes this earlier event as near-complete, establishing the lake as a repeat source.",
  },
  {
    when: "5 July 2025",
    site: "purepu" as const,
    title: "Lake present before the outburst",
    body:
      "The last cloud-workable Sentinel-2 scene before the event shows the lake surface on the glacier tongue.",
  },
  {
    when: "7–8 July 2025",
    site: "purepu" as const,
    title: "Drainage and flood wave",
    body:
      "The lake drains and a flood wave travels down the Gyirong Tsangpo / Bhote Koshi. The 8 July scene shows a greatly reduced lake surface; published analysis reports drainage was incomplete, with residual water remaining.",
  },
  {
    when: "8 July 2025",
    site: "rasuwagadhi" as const,
    title: "Damage at the border crossing",
    body:
      "The wave reaches the Lhende Khola / Bhote Koshi confluence at Rasuwagadhi, damaging the Friendship bridge, dry port and hydropower infrastructure.",
  },
  {
    when: "13 July 2025",
    site: "rasuwagadhi" as const,
    title: "First clear post-event imagery",
    body:
      "The river corridor appears widened and sediment-brightened, with road and bridge sections missing relative to the 3 July scene.",
  },
];

function EventPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-8">
      <div className="field-label">HiRISK rapid hazard assessment · RHA No. CN1</div>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        The 7–8 July 2025 outburst
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        A chronology of the Purepu supraglacial lake drainage and the flood wave
        that travelled roughly 40 km down the transboundary Gyirong Tsangpo /
        Bhote Koshi. Each step links to the satellite scenes that document it, so
        you can check the observation yourself.
      </p>

      <div className="my-10 rule-hair" />

      <ol className="relative border-l border-border pl-6">
        {steps.map((s) => {
          const site = sites.find((x) => x.id === s.site)!;
          return (
            <li key={s.when + s.title} className="relative pb-9">
              <span className="absolute -left-[31px] top-1.5 h-2.5 w-2.5 rotate-45 bg-gold" />
              <div className="font-mono text-[11px] tracking-wide text-gold">{s.when}</div>
              <h2 className="mt-1 font-sans text-base font-semibold text-foreground">{s.title}</h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
              <Link
                to="/sites/$siteId"
                params={{ siteId: s.site }}
                className="mt-2 inline-flex items-center gap-1 text-xs text-gold hover:underline"
              >
                {site.name} <ArrowRight className="h-3 w-3" />
              </Link>
            </li>
          );
        })}
      </ol>

      <div className="my-6 rule-hair" />

      <section>
        <h2 className="text-2xl font-bold text-foreground">Scene pairs behind the chronology</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {featuredPairs.map((p) => {
            const a = imagery[p.site].find((s) => s.date === p.a)!;
            const b = imagery[p.site].find((s) => s.date === p.b)!;
            const caption = pairCaption(p.site, p.a, p.b);
            return (
              <Link
                key={p.label}
                to="/sites/$siteId"
                params={{ siteId: p.site }}
                search={{ a: p.a, b: p.b }}
                className="panel group overflow-hidden p-0 transition hover:border-border-strong"
              >
                <div className="flex h-32">
                  <img src={a.url} alt={`${p.site} ${a.date}`} className="h-full w-1/2 object-cover" loading="lazy" draggable={false} />
                  <img src={b.url} alt={`${p.site} ${b.date}`} className="h-full w-1/2 border-l border-border object-cover" loading="lazy" draggable={false} />
                </div>
                <div className="p-4">
                  <h3 className="font-sans text-sm font-semibold text-foreground">{p.label}</h3>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {fmtDate(p.a)} → {fmtDate(p.b)} · {elapsedLabel(p.a, p.b)}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption.text}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="panel mt-10 flex gap-3 p-5">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          This page summarises published reporting and the cached scene record. It
          is not a forecast and does not attribute cause. See{" "}
          <Link to="/methods" className="text-gold hover:underline">
            data &amp; methods
          </Link>{" "}
          for sources and limits.
        </p>
      </div>
    </div>
  );
}
