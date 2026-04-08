import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known coastal cities for instant response (no API call needed)
const COASTAL_CITIES = new Set([
  "rio de janeiro", "salvador", "recife", "fortaleza", "natal", "maceió", "maceio",
  "joão pessoa", "joao pessoa", "florianópolis", "florianopolis", "floripa",
  "vitória", "vitoria", "santos", "guarujá", "guaruja", "são luís", "sao luis",
  "aracaju", "belém", "belem", "manaus", "macapá", "macapa",
  "búzios", "buzios", "cabo frio", "arraial do cabo", "paraty", "parati",
  "angra dos reis", "ilha grande", "ubatuba", "ilhabela", "são sebastião", "sao sebastiao",
  "porto seguro", "trancoso", "arraial d'ajuda", "itacaré", "itacare", "ilhéus", "ilheus",
  "jericoacoara", "jeri", "canoa quebrada", "pipa", "praia da pipa",
  "maragogi", "são miguel dos milagres", "fernando de noronha", "noronha",
  "porto de galinhas", "praia do forte", "costa do sauípe", "costa do sauipe",
  "morro de são paulo", "morro de sao paulo", "boipeba",
  "balneário camboriú", "balneario camboriu", "bombinhas", "garopaba",
  "imbituba", "laguna", "navegantes", "itapema",
  "caraguatatuba", "bertioga", "praia grande", "mongaguá", "mongagua",
  "são vicente", "sao vicente", "peruíbe", "peruibe",
  "alter do chão", "alter do chao",
  "cancún", "cancun", "punta cana", "miami", "barcelona", "lisboa",
  "rio", "copacabana", "ipanema",
]);

const NON_COASTAL_CITIES = new Set([
  "gramado", "canela", "campos do jordão", "campos do jordao", "monte verde",
  "são paulo", "sao paulo", "sp", "belo horizonte", "bh", "brasília", "brasilia",
  "curitiba", "goiânia", "goiania", "campinas", "londrina", "maringá", "maringa",
  "bonito", "chapada dos guimarães", "chapada dos guimaraes",
  "chapada diamantina", "lençóis", "lencois", "jalapão", "jalapao",
  "pirenópolis", "pirenopolis", "alto paraíso", "alto paraiso", "caldas novas",
  "ouro preto", "tiradentes", "diamantina", "inhotim",
  "serra gaúcha", "serra gaucha", "bento gonçalves", "bento goncalves",
  "vale dos vinhedos", "são joaquim", "sao joaquim", "urubici",
  "foz do iguaçu", "foz do iguacu", "cuiabá", "cuiaba", "campo grande",
  "teresina", "palmas", "porto velho", "rio branco", "boa vista",
  "paris", "londres", "london", "madrid", "berlim", "roma", "milão", "milao",
  "amsterdam", "nova york", "new york", "orlando", "buenos aires", "santiago",
  "lima", "bogotá", "bogota",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();
    if (!destination) {
      return new Response(JSON.stringify({ isCoastal: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const city = destination.split(",")[0].trim().toLowerCase();

    // Check known lists first (instant, no API call)
    if (COASTAL_CITIES.has(city)) {
      return new Response(JSON.stringify({ isCoastal: true, source: "known" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (NON_COASTAL_CITIES.has(city)) {
      return new Response(JSON.stringify({ isCoastal: false, source: "known" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For unknown cities, ask Groq
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      // Fallback: assume not coastal if we can't check
      return new Response(JSON.stringify({ isCoastal: false, source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Responda APENAS com JSON: {\"isCoastal\": true/false}. Nada mais." },
          { role: "user", content: `"${destination}" é uma cidade/destino litorâneo, com praias acessíveis (mar, não rio/lago)? Considere se tem praias de mar a menos de 30km.` },
        ],
        temperature: 0,
        max_tokens: 30,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ isCoastal: false, source: "error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "{}";
    
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      parsed = { isCoastal: false };
    }

    return new Response(JSON.stringify({ isCoastal: !!parsed.isCoastal, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in detect-coastal:", error);
    return new Response(JSON.stringify({ isCoastal: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
