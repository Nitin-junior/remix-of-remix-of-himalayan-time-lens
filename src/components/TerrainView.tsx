import { useEffect, useRef } from "react";
import type { DemGrid, Site } from "@/lib/sites";

/**
 * Canvas shaded-relief + hypsometric tint rendered from the SRTM DEM grid.
 * Runs entirely in the browser after mount; no external dependency.
 */
export default function TerrainView({ dem, site }: { dem: DemGrid; site: Site }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { rows, cols, elev, min, max } = dem;
    const span = Math.max(1, max - min);

    // light direction (from NW, high angle) in grid-z units
    const lx = -0.6,
      ly = -0.6,
      lz = 0.9;
    const ll = Math.hypot(lx, ly, lz);
    const Lx = lx / ll,
      Ly = ly / ll,
      Lz = lz / ll;

    // cell size in metres (approx) for gradient scaling — only relative shade matters
    const cellM = 30;

    const shade = (r: number, c: number) => {
      const get = (rr: number, cc: number) => {
        const ri = Math.min(rows - 1, Math.max(0, rr));
        const ci = Math.min(cols - 1, Math.max(0, cc));
        return elev[ri]?.[ci] ?? min;
      };
      const dzdx = (get(r, c + 1) - get(r, c - 1)) / (2 * cellM);
      const dzdy = (get(r + 1, c) - get(r - 1, c)) / (2 * cellM);
      const nlen = Math.hypot(dzdx, dzdy, 1);
      return Math.max(0, (-dzdx * Lx - dzdy * Ly + 1 * Lz) / nlen);
    };

    // hypsometric ramp: deep rock -> ochre -> pale ice
    const ramp = (t: number) => {
      // stops in [r,g,b]
      const stops: [number, [number, number, number]][] = [
        [0.0, [38, 44, 54]],
        [0.35, [86, 70, 54]],
        [0.6, [150, 120, 86]],
        [0.8, [196, 184, 168]],
        [1.0, [236, 240, 246]],
      ];
      for (let i = 0; i < stops.length - 1; i++) {
        const [t0, c0] = stops[i]!;
        const [t1, c1] = stops[i + 1]!;
        if (t <= t1) {
          const f = (t - t0) / (t1 - t0);
          return [
            Math.round(c0[0] + (c1[0] - c0[0]) * f),
            Math.round(c0[1] + (c1[1] - c0[1]) * f),
            Math.round(c0[2] + (c1[2] - c0[2]) * f),
          ];
        }
      }
      return stops[stops.length - 1]![1];
    };

    // draw to a small canvas at grid resolution, then scale up smoothly
    const tmp = document.createElement("canvas");
    tmp.width = cols;
    tmp.height = rows;
    const tctx = tmp.getContext("2d");
    if (!tctx) return;
    const img = tctx.createImageData(cols, rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = elev[r]?.[c] ?? min;
        const t = (v - min) / span;
        const [cr, cg, cb] = ramp(t) as [number, number, number];
        const s = 0.35 + 0.75 * shade(r, c);
        const idx = (r * cols + c) * 4;
        img.data[idx] = Math.min(255, cr * s);
        img.data[idx + 1] = Math.min(255, cg * s);
        img.data[idx + 2] = Math.min(255, cb * s);
        img.data[idx + 3] = 255;
      }
    }
    tctx.putImageData(img, 0, 0);

    // render scaled to display
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.clientWidth,
      H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);

    // site center marker
    const fx = ((site.lon - dem.lonMin) / (dem.lonMax - dem.lonMin)) * canvas.width;
    const fy = ((dem.latMax - site.lat) / (dem.latMax - dem.latMin)) * canvas.height;
    ctx.beginPath();
    ctx.arc(fx, fy, 7 * dpr, 0, Math.PI * 2);
    ctx.strokeStyle = "#d9a441";
    ctx.lineWidth = 2 * dpr;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(fx, fy, 2.5 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = "#d9a441";
    ctx.fill();
  }, [dem, site]);

  return (
    <canvas
      ref={canvasRef}
      className="h-[360px] w-full rounded-md border border-border"
      role="img"
      aria-label={`Shaded relief of ${site.name} from ${dem.dataset}`}
    />
  );
}
