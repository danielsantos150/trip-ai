import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const { preferences, hotels, flights } = await req.json();

    const hotelSummaries = (hotels || []).slice(0, 15).map((h: any, i: number) =>
      `${i}: "${h.name}" | ${h.stars}★ | R$${h.price || 0}/noite | avaliação ${h.rating || 0}/10 | ${h.location || "sem localização"} | tags: ${(h.tags || []).join(", ")}`
    ).join("\n");

    const flightSummaries = (flights || []).slice(0, 15).map((f: any, i: number) =>
      `${i}: ${f.airline} | saída ${f.departure} chegada ${f.arrival} | ${f.duration} | ${f.stops} parada(s) | R$${f.price || 0}`
    ).join("\n");

    const hasChildren = (preferences.travelerAges || []).some((a: number) => a < 12);
    const hasElderly = (preferences.travelerAges || []).some((a: number) => a >= 60);
    const isLuxury = (preferences.minStars || 0) >= 4 || preferences.accommodationType === "resort";
    const isBudget = preferences.accommodationType === "hostel" || (preferences.budgetMax && preferences.budgetMax < 300 && preferences.budgetType === "per_day");

    const prompt = `Você é um consultor especialista em viagens. Analise CUIDADOSAMENTE cada opção e recomende as MELHORES.

## Perfil do viajante:
- Destino: ${preferences.destination || "?"}
- Período: ${preferences.travelDays} dias em ${preferences.travelMonth || "data flexível"}
- Viajantes: ${preferences.isSolo ? "Solo" : `${preferences.companions} pessoas`}
- Idades: ${(preferences.travelerAges || []).join(", ") || "não informado"}
${hasChildren ? "- ⚠️ TEM CRIANÇAS: priorize conforto, segurança e localização familiar" : ""}
${hasElderly ? "- ⚠️ TEM IDOSOS: priorize acessibilidade e conforto" : ""}
- Orçamento: R$${preferences.budgetMax} ${preferences.budgetType === "per_day" ? "/dia" : "total"}
- Tipo hospedagem: ${preferences.accommodationType || "hotel"}
- Estrelas mínimas: ${preferences.minStars || 3}
- Praia próxima: ${preferences.wantsBeachProximity === true ? "SIM, importante" : "indiferente"}
- Vida noturna: ${preferences.likesNightlife === true ? "SIM, importante" : "indiferente"}
- Classe aérea: ${preferences.fareClass || "economy"}
- Bagagem: ${preferences.baggagePreference || "carry_on"}

## CRITÉRIOS PARA HOTÉIS (IMPORTANTE):
1. AVALIAÇÃO: hotéis com nota >= 8.0 devem ter prioridade forte
2. ESTRELAS: ${isLuxury ? "Cliente quer LUXO - priorize 4-5 estrelas" : isBudget ? "Cliente quer ECONOMIA - bom custo-benefício" : "Bom equilíbrio entre estrelas e preço"}
3. PREÇO: Deve caber no orçamento (R$${preferences.budgetMax} ${preferences.budgetType === "per_day" ? "/dia" : "total para " + preferences.travelDays + " dias"})
4. LOCALIZAÇÃO: ${preferences.wantsBeachProximity ? "Perto da praia é ESSENCIAL" : "Localização central é preferível"}
5. Se dois hotéis têm preço similar, prefira o de MELHOR avaliação e mais estrelas

## Hotéis disponíveis:
${hotelSummaries || "Nenhum"}

## Voos disponíveis:
${flightSummaries || "Nenhum"}

## TAREFA:
Selecione os TOP 3 hotéis e TOP 2 voos. Para cada um, dê um motivo CURTO e ESPECÍFICO (máx 6 palavras).

Responda APENAS com este JSON:
{
  "recommendedHotels": [{"index": 0, "reason": "Melhor avaliação e custo"}],
  "recommendedFlights": [{"index": 0, "reason": "Direto e mais barato"}]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é um consultor de viagens expert. Responda APENAS em JSON válido, sem markdown, sem explicações. Analise os dados numéricos (avaliação, estrelas, preço) com cuidado." },
          { role: "user", content: prompt },
        ],
        temperature: 0.15,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error [${response.status}]: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "{}";

    let recommendations;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recommendations = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      recommendations = { recommendedHotels: [], recommendedFlights: [] };
    }

    // Validate indices
    const maxH = (hotels || []).length;
    const maxF = (flights || []).length;
    recommendations.recommendedHotels = (recommendations.recommendedHotels || []).filter(
      (r: any) => typeof r.index === "number" && r.index >= 0 && r.index < maxH
    );
    recommendations.recommendedFlights = (recommendations.recommendedFlights || []).filter(
      (r: any) => typeof r.index === "number" && r.index >= 0 && r.index < maxF
    );

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-recommend:", error);
    return new Response(
      JSON.stringify({ error: error.message, recommendedHotels: [], recommendedFlights: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
