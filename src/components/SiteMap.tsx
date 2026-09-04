import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Site, SiteId } from "@/lib/sites";
import { sites as allSites } from "@/lib/sites";

type LeafletMap = {
  remove: () => void;
  setView: (c: [number, number], z: number) => void;
  invalidateSize: () => void;
};

export default function SiteMap({
  activeId,
  height = 440,
  onSelect,
}: {
  activeId?: SiteId;
  height?: number;
  onSelect?: (id: SiteId) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;

    (async () => {
      const L = (await import("leaflet")).default as any;
      if (disposed || !ref.current) return;

      map = L.map(ref.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      }).setView([28.3, 85.55], 9);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        },
      ).addTo(map);

      allSites.forEach((s: Site) => {
        const active = s.id === activeId;
        const marker = L.circleMarker([s.lat, s.lon], {
          radius: active ? 9 : 6,
          weight: 1.5,
          color: active ? "#d9a441" : "#7fb8d4",
          fillColor: active ? "#d9a441" : "#7fb8d4",
          fillOpacity: active ? 0.55 : 0.3,
          className: active ? "tpw-pin-active" : "tpw-pin",
        }).addTo(map);
        marker.bindPopup(
          `<div style="font-family:var(--font-mono);color:#e8e2d4">
            <div style="color:#d9a441;font-size:10px;letter-spacing:.12em;text-transform:uppercase">Site</div>
            <div style="font-family:var(--font-sans);font-weight:700;font-size:13px;margin:2px 0">${s.name}</div>
            <div style="font-size:10px;opacity:.75">${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</div>
          </div>`,
        );
        if (onSelect) marker.on("click", () => onSelect(s.id));
      });

      mapRef.current = map;
      // ensure correct sizing after mount
      setTimeout(() => map?.invalidateSize(), 60);
    })();

    return () => {
      disposed = true;
      if (map) map.remove();
      mapRef.current = null;
    };
  }, [activeId, onSelect]);

  return (
    <div
      ref={ref}
      className="w-full overflow-hidden rounded-md border border-border"
      style={{ height }}
      aria-label="Map of monitored glacier sites"
    />
  );
}
