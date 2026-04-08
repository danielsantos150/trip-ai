import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const { destination } = await req.json();
    if (!destination) {
      return new Response(JSON.stringify({ error: "destination required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `Analise o destino turístico "${destination}" e retorne informações sobre temporadas de viagem.

Para CADA mês do ano (Janeiro a Dezembro), classifique como:
- "baixa" = temporada baixa (mais barato, menos turistas)
- "media" = temporada intermediária
- "alta" = temporada alta (mais caro, mais turistas)

Também inclua uma dica curta (máximo 25 caracteres) para cada mês, como "💰 Mais barato", "🔥 Alta temporada", "✈️ Bom custo-benefício", "🌧️ Época de chuvas", "❄️ Frio intenso", "☀️ Clima perfeito", etc.

Responda APENAS com JSON válido neste formato exato:
{
  "months": {
    "Janeiro": { "season": "baixa", "tip": "💰 Mais barato" },
    "Fevereiro": { "season": "alta", "tip": "🔥 Carnaval" },
    "Março": { "season": "media", "tip": "✈️ Bom custo" },
    "Abril": { "season": "baixa", "tip": "💰 Preços baixos" },
    "Maio": { "season": "baixa", "tip": "💰 Bem barato" },
    "Junho": { "season": "media", "tip": "🎉 São João" },
    "Julho": { "season": "alta", "tip": "🔥 Férias escolares" },
    "Agosto": { "season": "media", "tip": "☀️ Clima seco" },
    "Setembro": { "season": "baixa", "tip": "💰 Ótimos preços" },
    "Outubro": { "season": "baixa", "tip": "💰 Baixa demanda" },
    "Novembro": { "season": "media", "tip": "✈️ Pré-temporada" },
    "Dezembro": { "season": "alta", "tip": "🔥 Fim de ano" }
  },
  "bestMonth": "Setembro",
  "insight": "Dica curta sobre o melhor momento para visitar (máx 80 chars)"
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Você é um especialista em turismo brasileiro. Responda APENAS com JSON válido, sem markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq error: ${response.status} ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-seasons error:", e);
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
