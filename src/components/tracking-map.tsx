"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";

const workerIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#c1502d;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#17140f;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function TrackingMap({
  startLat,
  startLng,
  endLat,
  endLng,
  startedAt,
  durationSeconds,
}: {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startedAt: string;
  durationSeconds: number;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000;
      setProgress(Math.min(1, Math.max(0, elapsed / durationSeconds)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, durationSeconds]);

  const currentLat = startLat + (endLat - startLat) * progress;
  const currentLng = startLng + (endLng - startLng) * progress;
  const center: [number, number] = [(startLat + endLat) / 2, (startLng + endLng) / 2];

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <MapContainer center={center} zoom={13} style={{ height: 280, width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={[[startLat, startLng], [endLat, endLng]]} pathOptions={{ color: "#e7e2d9", weight: 3, dashArray: "6 6" }} />
        <Marker position={[currentLat, currentLng]} icon={workerIcon} />
        <Marker position={[endLat, endLng]} icon={destIcon} />
      </MapContainer>
      <div className="border-t border-border bg-surface px-4 py-2.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">
          {progress >= 1 ? "Arriving now" : `On the way · ${Math.max(0, Math.round(durationSeconds * (1 - progress)))}s remaining`}
        </p>
      </div>
    </div>
  );
}
