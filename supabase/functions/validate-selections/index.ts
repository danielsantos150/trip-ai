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

    const { preferences, selectedHotel, selectedFlight, totalCost, budgetLimit } = await req.json();

    const prompt = `Você é um consultor de viagens inteligente. Analise as seleções do usuário e valide se estão alinhadas com as preferências definidas.

## Preferências do usuário:
- Destino: ${preferences.destination || "Não definido"}
- Mês da viagem: ${preferences.travelMonth || "Flexível"}
- Duração: ${preferences.travelDays} dias
- Viajando: ${preferences.isSolo ? "Sozinho" : `com ${preferences.companions} pessoas`}
- Orçamento máximo: R$ ${preferences.budgetMax} (${preferences.budgetType === "per_day" ? "por dia" : "total"})
- Tipo de hospedagem preferido: ${preferences.accommodationType || "hotel"}
- Estrelas mínimas: ${preferences.minStars || 3}
- Quer ficar perto da praia: ${preferences.wantsBeachProximity === true ? "Sim" : preferences.wantsBeachProximity === false ? "Não" : "Indiferente"}
- Gosta de vida noturna: ${preferences.likesNightlife === true ? "Sim" : preferences.likesNightlife === false ? "Não" : "Indiferente"}

## Hotel selecionado:
${selectedHotel ? `- Nome: ${selectedHotel.name}
- Preço: R$ ${selectedHotel.price}/noite
- Estrelas: ${selectedHotel.stars}
- Avaliação: ${selectedHotel.rating}
- Localização: ${selectedHotel.location || "Não informada"}
- Descrição: ${selectedHotel.description || "Sem descrição"}` : "Nenhum hotel selecionado"}

## Voo selecionado:
${selectedFlight ? `- Companhia: ${selectedFlight.airline}
- Origem: ${selectedFlight.origin}
- Destino: ${selectedFlight.destination}
- Preço: R$ ${selectedFlight.price}
- Duração: ${selectedFlight.duration}
- Paradas: ${selectedFlight.stops}` : "Nenhum voo selecionado"}

## Custo total estimado: R$ ${totalCost || 0}
## Limite de orçamento: ${budgetLimit ? `R$ ${budgetLimit}` : "Não definido"}

Responda em JSON com este formato exato (sem markdown, sem código, apenas JSON puro):
{
  "score": <número de 0 a 100 representando compatibilidade geral>,
  "status": "<verde|amarelo|vermelho>",
  "summary": "<1-2 frases resumindo a análise>",
  "checks": [
    {
      "label": "<nome do critério>",
      "passed": <true|false>,
      "detail": "<explicação curta>"
    }
  ],
  "tips": ["<sugestão 1>", "<sugestão 2>"],
  "budgetAnalysis": "<análise do orçamento em 1 frase>"
}

Critérios obrigatórios a verificar:
1. Orçamento (custo total vs limite)
2. Tipo de hospedagem (corresponde ao preferido?)
3. Estrelas do hotel (atende ao mínimo?)
4. Localização (próximo à praia se solicitado?)
5. Compatibilidade geral com o perfil do viajante`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Você é um assistente de viagens que responde APENAS em JSON válido, sem markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error [${response.status}]: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "{}";

    // Parse JSON from response (handle potential markdown wrapping)
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      analysis = {
        score: 50,
        status: "amarelo",
        summary: "Não foi possível analisar completamente as seleções.",
        checks: [],
        tips: ["Verifique manualmente se as seleções atendem suas preferências."],
        budgetAnalysis: "Análise de orçamento indisponível.",
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in validate-selections:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
