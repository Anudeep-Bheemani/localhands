"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Navigation, Clock } from "lucide-react";

type Coordinate = [number, number];

const workerIcon = L.divIcon({
  className: "",
  html: `<div style="width:22px;height:22px;border-radius:9999px;background:#e2530c;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const destIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:9999px;background:#183557;border:4px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitRoute({ points }: { points: Coordinate[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (points.length > 1 && !fitted.current) {
      map.fitBounds(points, { padding: [48, 48], maxZoom: 15 });
      fitted.current = true;
    }
  }, [map, points]);
  return null;
}

function interpolate(route: Coordinate[], progress: number): Coordinate {
  if (route.length < 2) return route[0];
  const clamped = Math.max(0, Math.min(1, progress));
  const totalSegments = route.length - 1;
  const idx = Math.floor(clamped * totalSegments);
  const segProgress = clamped * totalSegments - idx;
  const a = route[Math.min(idx, totalSegments - 1)];
  const b = route[Math.min(idx + 1, totalSegments)];
  return [
    a[0] + (b[0] - a[0]) * segProgress,
    a[1] + (b[1] - a[1]) * segProgress,
  ];
}

function formatDuration(seconds: number) {
  if (seconds <= 0) return "Arriving now";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  return `${Math.ceil(seconds / 60)} min`;
}

function formatDistance(metres: number) {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}

export function TrackingMap({
  startLat,
  startLng,
  endLat,
  endLng,
  travelStartedAt,
  travelDurationSeconds,
  isBooked,
}: {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  travelStartedAt?: string | null;
  travelDurationSeconds?: number | null;
  isBooked?: boolean;
}) {
  const fallbackRoute: Coordinate[] = [[startLat, startLng], [endLat, endLng]];
  const [route, setRoute] = useState<Coordinate[]>(fallbackRoute);
  const [distanceM, setDistanceM] = useState<number | null>(null);
  const [routeDurationS, setRouteDurationS] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  // Fetch OSRM route
  useEffect(() => {
    const controller = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const r0 = data?.routes?.[0];
        if (!r0) return;
        const coords = r0.geometry?.coordinates;
        if (Array.isArray(coords) && coords.length > 1) {
          setRoute(coords.map(([lng, lat]: [number, number]) => [lat, lng]));
        }
        if (r0.distance) setDistanceM(r0.distance);
        if (r0.duration) setRouteDurationS(r0.duration);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [startLat, startLng, endLat, endLng]);

  // Tick every second while travelling
  useEffect(() => {
    if (!travelStartedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [travelStartedAt]);

  const elapsed = travelStartedAt ? (now - new Date(travelStartedAt).getTime()) / 1000 : 0;
  const totalDuration = travelDurationSeconds ?? routeDurationS ?? 120;
  const progress = travelStartedAt ? Math.min(elapsed / totalDuration, 1) : 0;
  const remaining = Math.max(0, totalDuration - elapsed);

  const workerPos = travelStartedAt ? interpolate(route, progress) : ([startLat, startLng] as Coordinate);

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {/* Info bar */}
      <div className="flex items-center gap-6 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Navigation size={15} className="text-accent" />
          <span className="font-medium text-ink">
            {distanceM != null ? formatDistance(distanceM) : "Calculating…"}
          </span>
          <span className="text-ink-muted">to job location</span>
        </div>
        {travelStartedAt && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={15} className="text-accent" />
            <span className="font-medium text-ink">{formatDuration(remaining)}</span>
            <span className="text-ink-muted">{remaining <= 0 ? "" : "remaining"}</span>
          </div>
        )}
        {isBooked && !travelStartedAt && (
          <span className="text-xs text-ink-muted">Worker hasn&apos;t started travelling yet</span>
        )}
      </div>

      <MapContainer center={fallbackRoute[0]} zoom={13} style={{ height: 320, width: "100%" }} scrollWheelZoom>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitRoute points={route} />

        {/* Route lines */}
        <Polyline positions={route} pathOptions={{ color: "#183557", weight: 8, opacity: 0.15 }} />
        <Polyline positions={route} pathOptions={{ color: "#e2530c", weight: 4, opacity: 0.85 }} />

        {/* Worker marker — animated along route when travelling */}
        <Marker position={workerPos} icon={workerIcon}>
          <Tooltip direction="top" offset={[0, -14]} permanent={false}>
            {travelStartedAt ? `Worker · ${formatDuration(remaining)} away` : "Worker location"}
          </Tooltip>
        </Marker>

        {/* Destination marker */}
        <Marker position={[endLat, endLng]} icon={destIcon}>
          <Tooltip direction="top" offset={[0, -12]}>
            Job location
          </Tooltip>
        </Marker>
      </MapContainer>

      <div className="border-t border-border bg-surface px-4 py-2">
        <p className="text-xs text-ink-muted">
          {travelStartedAt
            ? `Worker is on the way · ${Math.round(progress * 100)}% of route covered`
            : "Route preview · map will animate when worker starts travelling"}
        </p>
      </div>
    </div>
  );
}
