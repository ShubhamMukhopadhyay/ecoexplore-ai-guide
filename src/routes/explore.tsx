import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import beach from "@/assets/gem-beach.jpg";
import cafe from "@/assets/gem-cafe.jpg";
import heritage from "@/assets/gem-heritage.jpg";
import waterfall from "@/assets/gem-waterfall.jpg";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore Goa — EcoExplore" },
      { name: "description", content: "Browse curated destinations across North and South Goa with crowd, vibe and eco signals." },
    ],
  }),
  component: Explore,
});

const tags = ["All", "Beaches", "Heritage", "Nature", "Food", "Nightlife", "Wellness"];

const places = [
  { name: "Palolem Beach", region: "South Goa", img: beach, tag: "Beaches", crowd: "Low", eco: 8.4, rating: 4.8, blurb: "Crescent of soft sand, calm enough to swim." },
  { name: "Old Goa Churches", region: "Tiswadi", img: heritage, tag: "Heritage", crowd: "Medium", eco: 9.1, rating: 4.7, blurb: "UNESCO-listed Portuguese-era basilicas." },
  { name: "Dudhsagar Falls", region: "Mollem", img: waterfall, tag: "Nature", crowd: "High", eco: 7.2, rating: 4.6, blurb: "India's tallest tiered waterfall in deep jungle." },
  { name: "Assagao Cafés", region: "North Goa", img: cafe, tag: "Food", crowd: "Medium", eco: 8.9, rating: 4.9, blurb: "Bohemian eateries hidden in leafy lanes." },
  { name: "Butterfly Beach", region: "Canacona", img: beach, tag: "Beaches", crowd: "Low", eco: 9.4, rating: 4.7, blurb: "Reachable only by boat — quiet, magical." },
  { name: "Fontainhas Quarter", region: "Panjim", img: heritage, tag: "Heritage", crowd: "Low", eco: 9.0, rating: 4.8, blurb: "Latin Quarter of pastel houses and azulejos." },
];

function Explore() {
  const [active, setActive] = useState("All");
  const [q, setQ] = useState("");
  const filtered = places.filter(p =>
    (active === "All" || p.tag === active) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
      <SectionHeader
        eyebrow="Explore"
        title="Goa, mapped by mood — not just postcards."
        subtitle="Filter by vibe, see real-time crowd levels and pick what fits your day."
      />

      <div className="mt-10 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1 glass rounded-full px-5 py-3 flex items-center gap-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search beaches, cafés, heritage…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {tags.map(t => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                active === t ? "bg-primary text-primary-foreground shadow-soft" : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p, i) => (
          <motion.article
            key={p.name + i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group bg-card rounded-3xl overflow-hidden shadow-soft border border-border/60 hover:shadow-glow hover:-translate-y-1 transition-all"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={p.img} alt={p.name} loading="lazy" className="size-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  p.crowd === "Low" ? "bg-eco text-primary-foreground" :
                  p.crowd === "Medium" ? "bg-sun text-foreground" :
                  "bg-coral text-coral-foreground"
                }`}>{p.crowd} crowd</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium glass-strong">Eco {p.eco}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-xl">{p.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="size-3" />{p.region}</p>
                </div>
                <div className="flex items-center gap-1 text-sm"><Star className="size-4 fill-sun text-sun" />{p.rating}</div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.blurb}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
