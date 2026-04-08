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
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const { preferences, context } = await req.json();

    const prompt = `Você é um assistente de viagens inteligente. Com base nas informações do viajante, sugira de 2 a 4 perguntas adicionais relevantes que ajudem a refinar a busca de hotéis e voos.

## Perfil do viajante:
- Destino: ${preferences.destination}
- Mês: ${preferences.travelMonth}
- Duração: ${preferences.travelDays} dias
- ${preferences.isSolo ? "Viajando sozinho" : `Grupo de ${preferences.companions} pessoas`}
- Idades: ${(preferences.travelerAges || []).join(", ") || "Não informado"}
- Tipo de hospedagem: ${preferences.accommodationType}
- Estrelas mínimas: ${preferences.minStars}
- Orçamento: R$ ${preferences.budgetMax} (${preferences.budgetType === "per_day" ? "por dia" : "total"})
- Quer voo: ${preferences.wantsFlights ? "Sim" : "Não"}
- Classe tarifária: ${preferences.fareClass || "economy"}
- Bagagem: ${preferences.baggagePreference || "carry_on"}
- Praia: ${preferences.wantsBeachProximity === true ? "Sim" : preferences.wantsBeachProximity === false ? "Não" : "Indiferente"}
- Vida noturna: ${preferences.likesNightlife === true ? "Sim" : preferences.likesNightlife === false ? "Não" : "Indiferente"}
- Tem pet: ${preferences.hasPet ? "Sim" : "Não"}
- Tem bebês: ${preferences.hasBabies ? `Sim (${preferences.babiesCount})` : "Não"}

## Contexto: ${context || "wizard"}

Gere perguntas que realmente impactem na busca. Considere:
- Se tem crianças/idosos: pergunte sobre acessibilidade, atividades infantis
- Se é viagem de casal jovem: pergunte sobre romantismo, aventura
- Se é grupo grande: pergunte sobre quartos conectados, transfer
- Se destino é praia: pergunte sobre esportes aquáticos, passeios de barco
- Se destino é cidade: pergunte sobre museus, gastronomia
- Se tem pet: pergunte sobre tamanho do pet, se precisa de espaço
- Se escolheu classe executiva: pergunte sobre lounge, upgrades

Responda APENAS em JSON válido, sem markdown:
{
  "questions": [
    {
      "id": "<id_unico>",
      "question": "<pergunta>",
      "type": "choice",
      "options": ["<opção 1>", "<opção 2>", "<opção 3>"],
      "impact": "<hotel|flight|both>",
      "filterHint": "<como esse filtro deve ser aplicado na busca>"
    }
  ]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Você responde APENAS em JSON válido. Sem markdown, sem explicações extras." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error [${response.status}]: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { questions: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in suggest-questions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
