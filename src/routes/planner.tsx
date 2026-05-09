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
  const [form, setForm] = useState({ days: 5, budget: "Mid", vibe: "Beaches & cafés", group: "Couple", food: "Vegetarian" });
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

            <Field label="Budget">
              <Pills value={form.budget} onChange={v => setForm({ ...form, budget: v })} options={["Low", "Mid", "Lux"]} />
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
                className="bg-card rounded-3xl p-6 sm:p-7 shadow-soft border border-border/60">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary font-semibold">Day {d.day}</div>
                    <h3 className="font-display text-2xl mt-1">{d.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-eco/15 text-eco rounded-full px-3 py-1 text-sm font-medium">
                    <Leaf className="size-3.5" /> Eco {d.eco}
                  </span>
                </div>
                <ol className="space-y-3">
                  {d.items.map((it, j) => (
                    <li key={j} className="flex gap-4 group">
                      <div className="text-xs text-muted-foreground w-12 pt-2">{it.time}</div>
                      <div className="size-9 rounded-xl bg-secondary grid place-items-center text-primary shrink-0">
                        <it.icon className="size-4" />
                      </div>
                      <div className="flex-1 border-l-2 border-border pl-4 pb-1">
                        <div className="font-medium flex items-center gap-1.5"><MapPin className="size-3.5 text-muted-foreground" />{it.place}</div>
                        <div className="text-sm text-muted-foreground">{it.note}</div>
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
