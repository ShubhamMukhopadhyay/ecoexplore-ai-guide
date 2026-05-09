import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Navigation, Leaf, Users, Clock, Route as RouteIcon, KeyRound, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/maps")({
  head: () => ({
    meta: [
      { title: "Smart Maps & Navigation — EcoExplore" },
      { name: "description", content: "Crowd-aware route suggestions across Goa with live density overlays and eco-friendly alternatives." },
    ],
  }),
  component: MapsPage,
});

// Goa POIs with mock crowd + eco data
const POIS = [
  { id: "baga",    name: "Baga Beach",        lng: 73.7517, lat: 15.5560, crowd: 92, eco: 5.4, type: "beach" },
  { id: "anjuna",  name: "Anjuna Flea Mkt",   lng: 73.7400, lat: 15.5735, crowd: 74, eco: 6.8, type: "market" },
  { id: "morjim",  name: "Morjim Beach",      lng: 73.7322, lat: 15.6300, crowd: 38, eco: 8.7, type: "beach" },
  { id: "vagator", name: "Vagator Cliffs",    lng: 73.7395, lat: 15.5970, crowd: 54, eco: 8.1, type: "viewpoint" },
  { id: "fontain", name: "Fontainhas Quarter",lng: 73.8330, lat: 15.4969, crowd: 41, eco: 8.4, type: "heritage" },
  { id: "oldgoa",  name: "Old Goa Basilica",  lng: 73.9115, lat: 15.5009, crowd: 61, eco: 7.6, type: "heritage" },
  { id: "palolem", name: "Palolem Beach",     lng: 74.0233, lat: 15.0100, crowd: 33, eco: 9.0, type: "beach" },
  { id: "dudhsa",  name: "Dudhsagar Falls",   lng: 74.3140, lat: 15.3144, crowd: 88, eco: 7.2, type: "nature" },
  { id: "ashvem",  name: "Ashvem Beach",      lng: 73.7280, lat: 15.6480, crowd: 22, eco: 9.2, type: "beach" },
  { id: "panjim",  name: "Panjim Riverfront", lng: 73.8278, lat: 15.4989, crowd: 58, eco: 7.8, type: "city" },
];

const TOKEN_KEY = "ecoexplore.mapbox.token";

type Mode = "fastest" | "eco" | "scenic";

function crowdColor(c: number) {
  if (c >= 75) return "#ef6a55"; // coral
  if (c >= 45) return "#e9b949"; // sun
  return "#3aa775"; // eco
}

function MapsPage() {
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState("");
  const [from, setFrom] = useState("baga");
  const [to, setTo] = useState("morjim");
  const [mode, setMode] = useState<Mode>("eco");
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState<null | { distance: number; duration: number; crowd: number; eco: number; alt: { mode: Mode; saves: string }[] }>(null);

  // hydrate saved token
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (saved) setToken(saved);
  }, []);

  // init map
  useEffect(() => {
    if (!token || !mapEl.current || mapRef.current) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [73.85, 15.45],
      zoom: 9.4,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      // crowd heat circles
      POIS.forEach((p) => {
        const el = document.createElement("div");
        el.style.cssText = `width:${18 + p.crowd / 4}px;height:${18 + p.crowd / 4}px;border-radius:9999px;background:${crowdColor(p.crowd)};opacity:0.78;border:2px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.18);cursor:pointer;display:grid;place-items:center;color:white;font:600 10px/1 Inter,sans-serif;`;
        el.textContent = String(p.crowd);
        new mapboxgl.Marker(el)
          .setLngLat([p.lng, p.lat])
          .setPopup(new mapboxgl.Popup({ offset: 16 }).setHTML(
            `<div style="font-family:Inter,sans-serif;padding:4px 2px;min-width:160px">
              <div style="font-weight:600;font-size:14px;margin-bottom:4px">${p.name}</div>
              <div style="font-size:12px;color:#64748b">Crowd <b style="color:${crowdColor(p.crowd)}">${p.crowd}%</b> · Eco <b>${p.eco}</b></div>
            </div>`
          ))
          .addTo(map);
      });
    });

    return () => { map.remove(); mapRef.current = null; };
  }, [token]);

  const findRoute = async () => {
    const map = mapRef.current;
    if (!map || !token) return;
    const a = POIS.find(p => p.id === from)!;
    const b = POIS.find(p => p.id === to)!;
    if (!a || !b || a.id === b.id) return;
    setLoadingRoute(true);
    setRouteInfo(null);

    try {
      const profile = mode === "fastest" ? "driving-traffic" : mode === "eco" ? "cycling" : "walking";
      const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${a.lng},${a.lat};${b.lng},${b.lat}?geometries=geojson&overview=full&access_token=${token}`;
      const res = await fetch(url);
      const json = await res.json();
      const route = json.routes?.[0];
      if (!route) throw new Error("No route");

      const geo = {
        type: "Feature" as const,
        properties: {},
        geometry: route.geometry,
      };
      const src = map.getSource("ecoroute") as mapboxgl.GeoJSONSource | undefined;
      if (src) {
        src.setData(geo as any);
      } else {
        map.addSource("ecoroute", { type: "geojson", data: geo as any });
        map.addLayer({
          id: "ecoroute-line",
          type: "line",
          source: "ecoroute",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": mode === "fastest" ? "#ef6a55" : mode === "eco" ? "#3aa775" : "#0f766e",
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      }
      // recolor on subsequent runs
      if (map.getLayer("ecoroute-line")) {
        map.setPaintProperty("ecoroute-line", "line-color",
          mode === "fastest" ? "#ef6a55" : mode === "eco" ? "#3aa775" : "#0f766e");
      }

      // fit bounds
      const coords: [number, number][] = route.geometry.coordinates;
      const bounds = coords.reduce((b, c) => b.extend(c as any), new mapboxgl.LngLatBounds(coords[0], coords[0]));
      map.fitBounds(bounds, { padding: 80, duration: 900 });

      // mock crowd-aware scoring
      const avgCrowd = Math.round((a.crowd + b.crowd) / 2 + (mode === "fastest" ? 8 : mode === "eco" ? -14 : -6));
      const ecoBoost = mode === "eco" ? 1.6 : mode === "scenic" ? 0.8 : -0.4;
      const ecoScore = +Math.min(10, Math.max(3, (a.eco + b.eco) / 2 + ecoBoost)).toFixed(1);

      setRouteInfo({
        distance: route.distance,
        duration: route.duration,
        crowd: Math.max(8, Math.min(98, avgCrowd)),
        eco: ecoScore,
        alt: [
          { mode: "fastest", saves: "−12 min" },
          { mode: "eco", saves: "−38% crowd · +1.4 eco" },
          { mode: "scenic", saves: "+3 hidden gems" },
        ].filter(o => o.mode !== mode),
      });
    } catch (e) {
      console.error(e);
      setRouteInfo(null);
    } finally {
      setLoadingRoute(false);
    }
  };

  const saveToken = () => {
    const t = tokenInput.trim();
    if (!t.startsWith("pk.")) return;
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
      <SectionHeader
        eyebrow="Smart Maps · Live"
        title="Navigate Goa, crowd-aware."
        subtitle="See real-time density across hotspots and let the AI route you around the chaos — with a greener footprint."
      />

      {!token && (
        <div className="mt-10 bg-card rounded-3xl border border-border/60 shadow-soft p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center"><KeyRound className="size-5" /></div>
            <div>
              <h3 className="font-display text-2xl">Connect Mapbox</h3>
              <p className="text-sm text-muted-foreground">Paste your free Mapbox public token to enable the live map.</p>
            </div>
          </div>
          <ol className="text-sm text-muted-foreground space-y-1 mb-4 list-decimal pl-5">
            <li>Sign up at <a className="text-primary underline" href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">mapbox.com</a> (free tier).</li>
            <li>Copy your <b>default public token</b> (starts with <code>pk.</code>).</li>
            <li>Paste it below — stored locally in your browser only.</li>
          </ol>
          <div className="flex gap-2">
            <input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="pk.eyJ..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm font-mono"
            />
            <button onClick={saveToken} className="rounded-xl bg-primary text-primary-foreground px-5 text-sm font-medium shadow-glow">
              Connect
            </button>
          </div>
        </div>
      )}

      {token && (
        <div className="mt-10 grid gap-5 lg:grid-cols-[360px_1fr]">
          {/* CONTROLS */}
          <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/60 h-fit lg:sticky lg:top-28">
            <h3 className="font-display text-xl flex items-center gap-2 mb-5"><RouteIcon className="size-5 text-primary" /> Plan a route</h3>

            <Field label="From">
              <Select value={from} onChange={setFrom} />
            </Field>
            <Field label="To">
              <Select value={to} onChange={setTo} />
            </Field>

            <Field label="Routing intent">
              <div className="grid grid-cols-3 gap-2">
                {(["fastest", "eco", "scenic"] as Mode[]).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`rounded-xl py-2.5 text-xs font-medium capitalize transition ${
                      mode === m ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary hover:bg-accent"
                    }`}>{m}</button>
                ))}
              </div>
            </Field>

            <button
              onClick={findRoute}
              disabled={loadingRoute || from === to}
              className="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-full bg-gradient-eco text-primary-foreground py-3.5 font-medium shadow-glow disabled:opacity-60"
            >
              <Navigation className="size-4" /> {loadingRoute ? "Routing…" : "Find smart route"}
            </button>

            <button
              onClick={() => { localStorage.removeItem(TOKEN_KEY); setToken(""); }}
              className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Disconnect Mapbox token
            </button>

            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Crowd legend</div>
              <div className="space-y-1.5 text-xs">
                <Legend color="#3aa775" label="Calm · under 45%" />
                <Legend color="#e9b949" label="Moderate · 45–75%" />
                <Legend color="#ef6a55" label="Packed · 75%+" />
              </div>
            </div>
          </div>

          {/* MAP + INSIGHT */}
          <div className="space-y-5">
            <div className="relative rounded-3xl overflow-hidden shadow-soft border border-border/60 bg-secondary" style={{ height: "560px" }}>
              <div ref={mapEl} className="absolute inset-0" />
            </div>

            <AnimatePresence>
              {routeInfo && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-card rounded-3xl p-6 shadow-soft border border-border/60">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                    <Sparkles className="size-3.5" /> AI route insight
                  </div>
                  <div className="grid sm:grid-cols-4 gap-4 mb-5">
                    <Metric icon={Clock} label="Duration" value={`${Math.round(routeInfo.duration / 60)} min`} />
                    <Metric icon={RouteIcon} label="Distance" value={`${(routeInfo.distance / 1000).toFixed(1)} km`} />
                    <Metric icon={Users} label="Avg crowd" value={`${routeInfo.crowd}%`} tone={crowdColor(routeInfo.crowd)} />
                    <Metric icon={Leaf} label="Eco score" value={`${routeInfo.eco}/10`} tone="#3aa775" />
                  </div>
                  <div className={`rounded-2xl p-4 flex gap-3 items-start ${routeInfo.crowd >= 70 ? "bg-coral/10" : "bg-eco/10"}`}>
                    <AlertTriangle className={`size-5 shrink-0 ${routeInfo.crowd >= 70 ? "text-coral" : "text-eco"}`} />
                    <div className="text-sm">
                      {routeInfo.crowd >= 70
                        ? <>This corridor is <b>busy right now</b>. Try the <b>eco</b> alternative — it cuts crowd density by ~38% and improves your trip's eco score.</>
                        : <>Smooth sailing. <b>Crowd density is low</b> on this segment; great window to depart in the next 45 minutes.</>}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Switch route style</div>
                    <div className="flex flex-wrap gap-2">
                      {routeInfo.alt.map(a => (
                        <button key={a.mode} onClick={() => { setMode(a.mode); setTimeout(findRoute, 50); }}
                          className="rounded-full px-4 py-2 text-xs bg-secondary hover:bg-accent">
                          <span className="capitalize font-medium">{a.mode}</span> <span className="text-muted-foreground">· {a.saves}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
      {POIS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-3 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-2xl bg-secondary/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" /> {label}</div>
      <div className="font-display text-2xl mt-1" style={tone ? { color: tone } : undefined}>{value}</div>
    </div>
  );
}
