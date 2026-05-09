import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `You are EcoExplore, an AI travel concierge specialised in Goa, India.
You help tourists discover beaches, food, hidden gems, heritage spots, eco-friendly options, routes and crowd-aware suggestions across North and South Goa.
Reply concisely (2-5 sentences), warm and practical. Prefer specific place names. When relevant, mention crowd levels, eco impact, best time to visit, and budget tips.
If asked about anything unrelated to travel/Goa, gently steer the conversation back.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: { messages?: ChatMsg[] };
        try { body = await request.json(); } catch { return new Response("Bad JSON", { status: 400 }); }

        const incoming = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
        const messages: ChatMsg[] = [{ role: "system", content: SYSTEM_PROMPT }, ...incoming];

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a moment." }), { status: 429, headers: { "Content-Type": "application/json" } });
          if (res.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }), { status: 402, headers: { "Content-Type": "application/json" } });
          return new Response(JSON.stringify({ error: `AI gateway error: ${text.slice(0, 200)}` }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const data = await res.json();
        const reply: string = data?.choices?.[0]?.message?.content ?? "Sorry — I didn't catch that.";
        return new Response(JSON.stringify({ reply }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
