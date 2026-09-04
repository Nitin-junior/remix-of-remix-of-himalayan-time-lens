import { useCallback, useEffect, useRef, useState } from "react";
import type { Scene } from "@/lib/sites";
import { fmtDate, sensorLabel } from "@/lib/sites";

function SideLabel({ scene, side }: { scene: Scene; side: "A" | "B" }) {
  return (
    <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
      <span className="field-label">{side === "A" ? "Before" : "After"}</span>
      <span className="data-value text-sm text-foreground">{fmtDate(scene.date)}</span>
      <span className="font-mono text-[10px] text-muted-foreground">
        cloud {scene.cloudPct.toFixed(1)}% · {sensorLabel(scene)}
      </span>
    </div>
  );
}

export default function ImageCompare({ a, b }: { a: Scene; b: Scene }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const onMove = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      onMove(e.clientX);
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [onMove]);

  return (
    <div
      ref={ref}
      className="relative h-full w-full select-none overflow-hidden rounded-md border border-border"
      onPointerDown={(e) => {
        dragging.current = true;
        onMove(e.clientX);
      }}
      role="slider"
      aria-label="Before/after image divider"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* bottom layer: after (B) full */}
      <img
        src={b.url}
        alt={`Sentinel-2 image ${b.date}`}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
      <SideLabel scene={b} side="B" />
      {/* top layer: before (A) clipped to left portion */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={a.url}
          alt={`Sentinel-2 image ${a.date}`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        <SideLabel scene={a} side="A" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {/* divider handle */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-gold"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gold bg-card text-gold shadow-lg glow-gold">
          <span className="text-xs">⇆</span>
        </div>
      </div>
    </div>
  );
}
