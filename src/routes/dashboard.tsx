import { createFileRoute } from "@tanstack/react-router";
import { CloudSun, Users, AlertTriangle, Leaf, TrendingUp, Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live Tourism Dashboard — EcoExplore" },
      { name: "description", content: "Real-time crowd levels, weather, alerts and sustainability across Goa." },
    ],
  }),
  component: Dashboard,
});

const crowdData = [
  { h: "06", v: 12 }, { h: "08", v: 28 }, { h: "10", v: 56 }, { h: "12", v: 78 },
  { h: "14", v: 86 }, { h: "16", v: 72 }, { h: "18", v: 64 }, { h: "20", v: 38 },
];

const popular = [
  { name: "Baga Beach", crowd: 92, trend: "+12%" },
  { name: "Anjuna Flea Market", crowd: 74, trend: "+5%" },
  { name: "Old Goa Basilica", crowd: 41, trend: "-3%" },
  { name: "Palolem", crowd: 33, trend: "-9%" },
  { name: "Dudhsagar", crowd: 88, trend: "+18%" },
];

const events = [
  { date: "Sat", title: "Saturday Night Market", place: "Arpora", tag: "Culture" },
  { date: "Sun", title: "Heritage Walk · Fontainhas", place: "Panjim", tag: "Heritage" },
  { date: "Mon", title: "Sunset Yoga", place: "Ashvem Beach", tag: "Wellness" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
      <SectionHeader eyebrow="Live · Updated 2 min ago" title="Goa, in real time." subtitle="The signals worth watching, all in one calm view." />

      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        <Stat icon={Users} label="Tourists active now" value="48,210" delta="+6.2%" tone="primary" />
        <Stat icon={CloudSun} label="Weather · Panjim" value="29° clear" delta="UV 7" tone="sun" />
        <Stat icon={Leaf} label="Avg eco score" value="8.1 / 10" delta="+0.3" tone="eco" />
        <Stat icon={AlertTriangle} label="Active alerts" value="2" delta="watch" tone="coral" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-soft border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-2xl">Crowd density · today</h3>
              <p className="text-sm text-muted-foreground">North Goa beach belt average</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-coral/15 text-coral font-medium">Peak 14:00</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={crowdData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.46 0.11 190)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.46 0.11 190)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.9 0.02 180)" vertical={false} />
                <XAxis dataKey="h" stroke="oklch(0.5 0.025 200)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.5 0.025 200)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 180)" }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.46 0.11 190)" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/60">
          <h3 className="font-display text-2xl mb-1">Trending spots</h3>
          <p className="text-sm text-muted-foreground mb-4">Live crowd index</p>
          <ul className="space-y-3">
            {popular.map(p => (
              <li key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{p.name}</span>
                  <span className={p.trend.startsWith("+") ? "text-coral" : "text-eco"}>{p.trend}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full ${p.crowd > 70 ? "bg-coral" : p.crowd > 45 ? "bg-sun" : "bg-eco"}`} style={{ width: `${p.crowd}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-gradient-eco rounded-3xl p-7 shadow-soft text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-90"><TrendingUp className="size-4" /> AI Recommendation</div>
          <h3 className="font-display text-3xl mt-3 leading-tight max-w-2xl">
            Skip Baga between 1–4pm. Try Morjim — same vibe, 38% less crowd, eco score 8.7.
          </h3>
          <button className="mt-6 inline-flex items-center gap-2 bg-card text-foreground rounded-full px-5 py-2.5 text-sm font-medium">
            Add to my plan
          </button>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/60">
          <h3 className="font-display text-2xl mb-4 flex items-center gap-2"><Calendar className="size-5 text-primary" /> Nearby events</h3>
          <ul className="space-y-3">
            {events.map(e => (
              <li key={e.title} className="flex gap-3 items-start">
                <div className="size-10 rounded-xl bg-secondary grid place-items-center text-xs font-semibold text-primary">{e.date}</div>
                <div>
                  <div className="font-medium text-sm">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.place} · {e.tag}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, delta, tone }: any) {
  const toneCls =
    tone === "primary" ? "bg-primary/10 text-primary" :
    tone === "sun" ? "bg-sun/20 text-foreground" :
    tone === "eco" ? "bg-eco/15 text-eco" :
    "bg-coral/15 text-coral";
  return (
    <div className="bg-card rounded-3xl p-5 shadow-soft border border-border/60 flex items-center gap-4">
      <div className={`size-12 rounded-2xl grid place-items-center ${toneCls}`}><Icon className="size-6" /></div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-display text-2xl truncate">{value}</div>
        <div className="text-xs text-muted-foreground">{delta}</div>
      </div>
    </div>
  );
}
