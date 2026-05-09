import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Travel Assistant — EcoExplore" },
      { name: "description", content: "Chat with an AI that knows Goa — places, food, routes, vibes." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string };

const seed: Msg[] = [
  { role: "ai", text: "Hi! I'm your Goa travel concierge. Ask me anything — best beach for sunset, cheap thali nearby, a quiet corner of Old Goa…" },
];

const suggestions = [
  "Best sunset beach with low crowd?",
  "Cheap authentic Goan thali in Panjim",
  "3-day eco itinerary, no parties",
  "Hidden waterfall trek for monsoon",
];

const fakeReply = (q: string) => {
  const k = q.toLowerCase();
  if (k.includes("sunset")) return "Try Cabo de Rama or Kakolem — both quiet, both stunning. Avoid Anjuna after 5pm this week (festival overflow).";
  if (k.includes("thali")) return "Hotel Venite in Fontainhas does a Goan fish thali for ₹250. Or Ritz Classic — locals' favourite, full meal under ₹400.";
  if (k.includes("eco") || k.includes("itinerary")) return "Day 1 Assagao + Vagator (scooter). Day 2 Divar Island ferry + heritage. Day 3 Cola lagoon homestay. Eco score ~8.6.";
  if (k.includes("waterfall") || k.includes("trek")) return "Tambdi Surla → Hivre Falls is perfect monsoon — 4 km, lush, almost empty. Bring waterproof shoes.";
  return "Lovely question. In short: aim for South Goa for calm, North for buzz. Tell me your dates and vibe and I'll draft a plan.";
};

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "ai", text: fakeReply(text) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-12">
      <SectionHeader eyebrow="AI Assistant" title="Your concierge for Goa." subtitle="It listens, suggests, and never up-sells." align="center" />

      <div className="mt-10 bg-card rounded-3xl shadow-soft border border-border/60 overflow-hidden flex flex-col h-[70vh]">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3 bg-secondary/40">
          <div className="size-9 rounded-xl bg-gradient-eco grid place-items-center"><Sparkles className="size-4 text-primary-foreground" /></div>
          <div>
            <div className="font-medium text-sm">EcoExplore AI</div>
            <div className="text-xs text-eco flex items-center gap-1"><span className="size-1.5 rounded-full bg-eco" /> Online</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "ai" && <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0"><Bot className="size-4" /></div>}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-secondary-foreground rounded-bl-sm"
              }`}>{m.text}</div>
              {m.role === "user" && <div className="size-8 rounded-full bg-coral/15 text-coral grid place-items-center shrink-0"><User className="size-4" /></div>}
            </motion.div>
          ))}
          <AnimatePresence>
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3">
                <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center"><Bot className="size-4" /></div>
                <div className="bg-secondary rounded-2xl px-4 py-3 flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:120ms]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:240ms]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent transition">
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-4 border-t border-border flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Goa — beaches, food, routes…"
            className="flex-1 bg-secondary rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" className="size-11 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-soft hover:scale-105 transition">
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
