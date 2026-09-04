import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  imagery,
  siteById,
  featuredPairs,
  pairCaption,
  fmtDate,
  daysBetween,
  sensorLabel,
  type SiteId,
} from "@/lib/sites";
import ImageCompare from "./ImageCompare";

export default function ImageryPanel({
  siteId,
  initialA,
  initialB,
}: {
  siteId: SiteId;
  initialA?: string | undefined;
  initialB?: string | undefined;
}) {
  const scenes = imagery[siteId];
  const site = siteById(siteId);

  const featuredForSite = featuredPairs.filter((p) => p.site === siteId);

  const resolve = (date?: string, fallback: number = 0) => {
    if (date) {
      const found = scenes.find((s) => s.date === date);
      if (found) return found;
    }
    return scenes[fallback]!;
  };

  const [aDate, setADate] = useState<string>(
    initialA && scenes.some((s) => s.date === initialA)
      ? initialA
      : (featuredForSite[0]?.a ?? scenes[0]!.date),
  );
  const [bDate, setBDate] = useState<string>(
    initialB && scenes.some((s) => s.date === initialB)
      ? initialB
      : (featuredForSite[0]?.b ?? scenes[1]!.date),
  );

  const a = useMemo(() => resolve(aDate, 0), [aDate, siteId]);
  const b = useMemo(() => resolve(bDate, 1), [bDate, siteId]);
  const caption = useMemo(
    () => pairCaption(siteId, a.date, b.date),
    [siteId, a.date, b.date],
  );
  const gap = daysBetween(a.date, b.date);

  return (
    <div className="space-y-5">
      {/* selectors */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="field-label block pb-1">Before</label>
          <Select value={aDate} onValueChange={setADate}>
            <SelectTrigger className="w-[230px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenes.map((s) => (
                <SelectItem key={s.date} value={s.date}>
                  {fmtDate(s.date)} · {s.cloudPct.toFixed(0)}% cloud
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label block pb-1">After</label>
          <Select value={bDate} onValueChange={setBDate}>
            <SelectTrigger className="w-[230px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {scenes.map((s) => (
                <SelectItem key={s.date} value={s.date}>
                  {fmtDate(s.date)} · {s.cloudPct.toFixed(0)}% cloud
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto self-end">
          <span className="field-label block pb-1">Gap</span>
          <span className="data-value text-sm">{gap} days</span>
        </div>
      </div>

      {/* featured quick pairs */}
      {featuredForSite.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="field-label">Documented events</span>
          {featuredForSite.map((p) => (
            <Button
              key={`${p.a}-${p.b}`}
              variant="outline"
              size="sm"
              className="h-7 border-border-strong font-mono text-[11px]"
              onClick={() => {
                setADate(p.a);
                setBDate(p.b);
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      {/* comparison */}
      <div className="h-[440px] w-full">
        <ImageCompare a={a} b={b} />
      </div>

      {/* caption */}
      <div className="panel p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="field-label">Interpretation</span>
          {caption.documented ? (
            <span className="chip" style={{ color: "var(--gold)", borderColor: "var(--gold)" }}>
              published
            </span>
          ) : (
            <span className="chip">open · reader compare</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{caption.text}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-muted-foreground">
          <span>
            <span className="text-muted-foreground/70">A:</span> {sensorLabel(a)}
          </span>
          <span>
            <span className="text-muted-foreground/70">B:</span> {sensorLabel(b)}
          </span>
          <span>scene ids {a.sceneId} · {b.sceneId}</span>
        </div>
      </div>

      {/* browse strip */}
      <div>
        <span className="field-label block pb-2">All scenes · {site.name}</span>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {scenes.map((s) => {
            const active = s.date === a.date || s.date === b.date;
            return (
              <button
                key={s.date}
                onClick={() => setADate(s.date)}
                className={`group relative shrink-0 overflow-hidden rounded border text-left transition ${
                  active
                    ? "border-gold glow-gold"
                    : "border-border hover:border-border-strong"
                }`}
                title={`${fmtDate(s.date)} · ${s.cloudPct}% cloud`}
              >
                <img
                  src={s.url}
                  alt={s.date}
                  className="h-20 w-20 object-cover"
                  loading="lazy"
                  draggable={false}
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 font-mono text-[9px] text-foreground">
                  {s.date}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
