import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, MapPin, Sun, Utensils, Bike, Leaf } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { RequireAuth } from "@/components/RequireAuth";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — EcoExplore" },
      { name: "description", content: "Generate a personalized, sustainable Goa itinerary in seconds." },
    ],
  }),
  component: () => <RequireAuth><Planner /></RequireAuth>,
});

type Day = { day: number; title: string; items: { time: string; icon: typeof Sun; place: string; note: string }[]; eco: number };

const sampleItinerary = (days: number, vibe: string): Day[] => {
  const base = [
    { time: "08:30", icon: Sun, place: "Sunrise at Vagator", note: "Low crowd window, perfect for photos." },
    { time: "11:00", icon: Utensils, place: "Brunch at Bean Me Up", note: "Local, plant-forward, supports neighbourhood." },
    { time: "15:00", icon: Bike, place: "Scooter to Chapora Fort", note: "Avoid taxis — eco bonus +0.4." },
    { time: "19:30", icon: Utensils, place: "Dinner at Gunpowder, Assagao", note: "Coastal South-Indian. Reserve ahead." },
  ];
  return Array.from({ length: days }).map((_, i) => ({
    day: i + 1,
    title: i === 0 ? `Settle in & ${vibe}` : i === days - 1 ? "Slow farewell" : `Explore deeper · day ${i + 1}`,
    items: base,
    eco: +(7.5 + Math.random() * 2).toFixed(1),
  }));
};

function Planner() {
  const [form, setForm] = useState({ days: 5, budget: 25000, vibe: "Beaches & cafés", group: "Couple", food: "Vegetarian" });
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Day[] | null>(null);

  const generate = () => {
    setLoading(true);
    setTrip(null);
    setTimeout(() => {
      setTrip(sampleItinerary(form.days, form.vibe));
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
      <SectionHeader
        eyebrow="AI Planner"
        title="Your trip, written by an AI that respects Goa."
        subtitle="Tell us how you travel. We'll write a balanced day-by-day plan in seconds."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* FORM */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-soft border border-border/60 h-fit lg:sticky lg:top-28">
          <div className="space-y-5">
            <Field label="Days">
              <input type="range" min={2} max={14} value={form.days}
                onChange={e => setForm({ ...form, days: +e.target.value })}
                className="w-full accent-primary" />
              <div className="text-sm text-muted-foreground mt-1">{form.days} days</div>
            </Field>

            <Field label="Budget (₹ total)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">₹</span>
                <input
                  type="number"
                  min={0}
                  step={500}
                  inputMode="numeric"
                  value={form.budget}
                  onChange={e => setForm({ ...form, budget: Math.max(0, +e.target.value || 0) })}
                  placeholder="25000"
                  className="w-full rounded-full bg-secondary/60 border border-border pl-8 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-card transition tabular-nums"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                ≈ ₹{Math.round(form.budget / Math.max(1, form.days)).toLocaleString("en-IN")} / day
              </div>
            </Field>

            <Field label="Vibe">
              <Pills value={form.vibe} onChange={v => setForm({ ...form, vibe: v })} options={["Beaches & cafés", "Heritage", "Nature", "Nightlife", "Wellness"]} />
            </Field>

            <Field label="Group">
              <Pills value={form.group} onChange={v => setForm({ ...form, group: v })} options={["Solo", "Couple", "Family", "Friends"]} />
            </Field>

            <Field label="Food">
              <Pills value={form.food} onChange={v => setForm({ ...form, food: v })} options={["Anything", "Vegetarian", "Vegan", "Seafood"]} />
            </Field>

            <button onClick={generate} disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-primary text-primary-foreground py-3.5 font-medium shadow-glow hover:translate-y-[-1px] transition disabled:opacity-60">
              {loading ? <><Loader2 className="size-4 animate-spin" /> Composing…</> : <><Sparkles className="size-4" /> Generate itinerary</>}
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {!trip && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-secondary/50 rounded-3xl p-12 text-center border border-dashed border-border">
                <Sparkles className="size-8 mx-auto text-primary mb-3" />
                <p className="text-muted-foreground">Your AI-crafted plan will appear here.</p>
              </motion.div>
            )}
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-card rounded-3xl p-12 text-center shadow-soft">
                <Loader2 className="size-8 mx-auto text-primary animate-spin mb-3" />
                <p>Routing through 240 spots, 12 weather signals, your vibe…</p>
              </motion.div>
            )}
            {trip && !loading && trip.map((d, i) => (
              <motion.div key={d.day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="relative bg-card rounded-3xl shadow-soft border border-border/60 overflow-hidden hover:shadow-glow transition-all">
                {/* Decorative gradient header */}
                <div className="relative bg-gradient-to-br from-primary/12 via-eco/10 to-sun/15 px-6 sm:px-7 pt-6 pb-5 border-b border-border/60">
                  <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-eco text-primary-foreground grid place-items-center shadow-glow shrink-0">
                        <div className="text-center leading-tight">
                          <div className="text-[9px] uppercase tracking-widest opacity-80">Day</div>
                          <div className="font-display text-xl">{d.day}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-display text-2xl text-foreground leading-tight">{d.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{d.items.length} stops · curated by AI</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-card/80 backdrop-blur text-eco rounded-full px-3 py-1.5 text-sm font-semibold shadow-soft border border-eco/20 shrink-0">
                      <Leaf className="size-3.5" /> {d.eco}
                    </span>
                  </div>
                </div>
                <ol className="p-6 sm:p-7 space-y-1">
                  {d.items.map((it, j) => (
                    <li key={j} className="flex gap-4 group relative">
                      <div className="text-xs font-semibold text-primary w-14 pt-3 tabular-nums shrink-0">{it.time}</div>
                      <div className="relative flex flex-col items-center shrink-0">
                        <div className="size-10 rounded-xl bg-gradient-to-br from-secondary to-accent grid place-items-center text-primary shadow-soft group-hover:scale-110 group-hover:shadow-glow transition">
                          <it.icon className="size-4" />
                        </div>
                        {j < d.items.length - 1 && (
                          <div className="w-px flex-1 bg-gradient-to-b from-border to-transparent my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-5 pt-2">
                        <div className="font-medium text-foreground flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-primary" />{it.place}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{it.note}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Pills({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3.5 py-1.5 rounded-full text-sm transition ${
            value === o ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary hover:bg-accent"
          }`}>{o}</button>
      ))}
    </div>
  );
}
