import { createFileRoute } from "@tanstack/react-router";
import { Leaf, TreePine, Bike, HeartHandshake } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Eco Score — EcoExplore" },
      { name: "description", content: "See your trip's sustainability score and how to improve it." },
    ],
  }),
  component: Sustainability,
});

const breakdown = [
  { name: "Transport", value: 32, color: "oklch(0.46 0.11 190)" },
  { name: "Stay", value: 24, color: "oklch(0.62 0.14 150)" },
  { name: "Food", value: 22, color: "oklch(0.82 0.15 80)" },
  { name: "Activities", value: 22, color: "oklch(0.72 0.18 35)" },
];

const tips = [
  { icon: Bike, title: "Swap one taxi for a scooter", impact: "+0.6 score · −2.4 kg CO₂" },
  { icon: TreePine, title: "Stay one extra night in a homestay", impact: "+0.4 score · supports local family" },
  { icon: HeartHandshake, title: "Eat at 2 family-run shacks", impact: "+0.3 score · keeps money in Goa" },
];

function Sustainability() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
      <SectionHeader eyebrow="Eco Score" title="Travel that gives back, measurably." subtitle="Every itinerary gets a single, honest number — and concrete ways to raise it." />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden bg-gradient-eco rounded-3xl p-8 sm:p-10 text-primary-foreground shadow-glow">
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-sun/40 blur-3xl" />
          <div className="relative">
            <div className="text-sm uppercase tracking-widest opacity-80 flex items-center gap-2"><Leaf className="size-4" /> Your trip</div>
            <div className="mt-4 flex items-end gap-2">
              <span className="font-display text-8xl leading-none">8.4</span>
              <span className="opacity-80 mb-3">/ 10</span>
            </div>
            <p className="mt-3 max-w-md opacity-90">Better than 78% of trips of similar length. You're avoiding the 3 most-crowded hours and using ferries on day 4. Nice.</p>
            <div className="mt-7 grid grid-cols-3 gap-3 max-w-md">
              {[
                { l: "CO₂ saved", v: "−14 kg" },
                { l: "Local spend", v: "62%" },
                { l: "Crowd impact", v: "Low" },
              ].map(s => (
                <div key={s.l} className="bg-card/15 backdrop-blur rounded-2xl p-3 text-center">
                  <div className="font-display text-xl">{s.v}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/60">
          <h3 className="font-display text-2xl">Where your impact comes from</h3>
          <div className="mt-4 grid grid-cols-[1fr_1.2fr] items-center gap-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={breakdown} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {breakdown.map(b => <Cell key={b.name} fill={b.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2.5 text-sm">
              {breakdown.map(b => (
                <li key={b.name} className="flex items-center gap-2.5">
                  <span className="size-3 rounded-full" style={{ background: b.color }} />
                  <span className="flex-1">{b.name}</span>
                  <span className="text-muted-foreground">{b.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-3xl p-6 sm:p-8 shadow-soft border border-border/60">
        <h3 className="font-display text-2xl">Lift your score in 3 small moves</h3>
        <p className="text-muted-foreground text-sm mt-1">Each suggestion is doable today. We've already checked the logistics.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {tips.map(t => (
            <div key={t.title} className="rounded-2xl border border-border p-5 hover:border-primary/40 transition">
              <div className="size-11 rounded-xl bg-eco/15 text-eco grid place-items-center mb-3"><t.icon className="size-5" /></div>
              <div className="font-medium">{t.title}</div>
              <div className="text-xs text-eco mt-1">{t.impact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
