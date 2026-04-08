const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
    if (!SERPAPI_KEY) {
      return new Response(JSON.stringify({ error: "SERPAPI_KEY not configured" }), {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { origin, destination, departureDate, returnDate, adults = 1, type = 1, travelMonth, travelDays = 7 } = body;

    if (!origin || !destination) {
      return new Response(JSON.stringify({ error: "origin and destination are required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Map common Brazilian city names to IATA codes
    const cityToIata: Record<string, string> = {
      "são paulo": "GRU", "sao paulo": "GRU", "sp": "GRU", "guarulhos": "GRU",
      "rio de janeiro": "GIG", "rio": "GIG", "galeão": "GIG",
      "brasília": "BSB", "brasilia": "BSB",
      "belo horizonte": "CNF", "confins": "CNF", "bh": "CNF",
      "salvador": "SSA", "porto alegre": "POA", "recife": "REC",
      "fortaleza": "FOR", "curitiba": "CWB", "manaus": "MAO",
      "belém": "BEL", "belem": "BEL", "goiânia": "GYN", "goiania": "GYN",
      "florianópolis": "FLN", "florianopolis": "FLN", "floripa": "FLN",
      "vitória": "VIX", "vitoria": "VIX", "natal": "NAT",
      "maceió": "MCZ", "maceio": "MCZ", "joão pessoa": "JPA", "joao pessoa": "JPA",
      "campinas": "VCP", "viracopos": "VCP",
      "cuiabá": "CGB", "cuiaba": "CGB", "campo grande": "CGR",
      "são luís": "SLZ", "sao luis": "SLZ", "teresina": "THE",
      "aracaju": "AJU", "porto velho": "PVH", "macapá": "MCP", "macapa": "MCP",
      "palmas": "PMW", "rio branco": "RBR", "boa vista": "BVB",
      "londrina": "LDB", "maringá": "MGF", "maringa": "MGF",
      "foz do iguaçu": "IGU", "foz do iguacu": "IGU",
      "navegantes": "NVT", "joinville": "JOI",
      // Destinos turísticos sem aeroporto próprio (mapeados para aeroporto mais próximo)
      "gramado": "POA", "canela": "POA", "bento gonçalves": "POA", "bento goncalves": "POA",
      "serra gaúcha": "POA", "serra gaucha": "POA", "vale dos vinhedos": "POA",
      "campos do jordão": "VCP", "campos do jordao": "VCP",
      "monte verde": "VCP",
      "serra catarinense": "FLN", "urubici": "FLN", "são joaquim": "FLN", "sao joaquim": "FLN",
      "bonito": "CGR", "chapada dos guimarães": "CGB", "chapada dos guimaraes": "CGB",
      "chapada diamantina": "SSA", "lençóis": "SSA", "lencois": "SSA",
      "jericoacoara": "FOR", "jeri": "FOR", "canoa quebrada": "FOR",
      "porto seguro": "BPS", "trancoso": "BPS", "arraial d'ajuda": "BPS",
      "búzios": "GIG", "buzios": "GIG", "cabo frio": "GIG", "arraial do cabo": "GIG",
      "paraty": "GIG", "parati": "GIG", "angra dos reis": "GIG", "ilha grande": "GIG",
      "fernando de noronha": "REC", "noronha": "REC",
      "alter do chão": "STM", "alter do chao": "STM", "santarém": "STM", "santarem": "STM",
      "jalapão": "PMW", "jalapao": "PMW",
      "lençóis maranhenses": "SLZ", "lencois maranhenses": "SLZ", "barreirinhas": "SLZ",
      "praia do forte": "SSA", "costa do sauípe": "SSA", "costa do sauipe": "SSA",
      "itacaré": "IOS", "itacare": "IOS", "ilhéus": "IOS", "ilheus": "IOS",
      "pirenópolis": "BSB", "pirenopolis": "BSB", "alto paraíso": "BSB", "alto paraiso": "BSB",
      "caldas novas": "GYN", "rio quente": "GYN",
      "ouro preto": "CNF", "tiradentes": "CNF", "diamantina": "CNF",
      "ubatuba": "GRU", "são sebastião": "GRU", "sao sebastiao": "GRU", "ilhabela": "GRU",
      "guarujá": "GRU", "guaruja": "GRU", "santos": "GRU",
      "morro de são paulo": "SSA", "morro de sao paulo": "SSA",
      "pipa": "NAT", "praia da pipa": "NAT", "são miguel do gostoso": "NAT",
      "maragogi": "MCZ", "são miguel dos milagres": "MCZ",
      // International
      "lisboa": "LIS", "porto": "OPO", "madrid": "MAD", "barcelona": "BCN",
      "paris": "CDG", "londres": "LHR", "london": "LHR",
      "new york": "JFK", "nova york": "JFK", "miami": "MIA",
      "orlando": "MCO", "buenos aires": "EZE", "santiago": "SCL",
      "lima": "LIM", "bogotá": "BOG", "bogota": "BOG",
      "cancún": "CUN", "cancun": "CUN", "punta cana": "PUJ",
      "roma": "FCO", "milão": "MXP", "milao": "MXP",
      "amsterdam": "AMS", "berlim": "BER", "berlín": "BER",
    };

    const resolveIata = (input: string): string => {
      const raw = input.trim();
      const cityOnly = raw.split(",")[0].trim().toLowerCase();
      // Already a 3-letter IATA code
      if (/^[A-Za-z]{3}$/.test(cityOnly) && cityOnly === cityOnly.toUpperCase()) return cityOnly;
      if (/^[a-z]{3}$/.test(cityOnly)) return cityOnly.toUpperCase();
      if (cityOnly.startsWith("/m")) return raw;
      // Exact match
      if (cityToIata[cityOnly]) return cityToIata[cityOnly];
      // Partial match: search for a key that contains the input or vice versa
      for (const [key, code] of Object.entries(cityToIata)) {
        if (cityOnly.includes(key) || key.includes(cityOnly)) return code;
      }
      // If it's longer than 3 chars and no match found, it's likely not an IATA code
      // Return an error-safe fallback using first 3 uppercase chars only if they look like a real code
      if (cityOnly.length === 3) return cityOnly.toUpperCase();
      // Fallback: can't resolve
      console.warn(`Could not resolve IATA code for: "${input}". Returning as-is for SerpAPI.`);
      return cityOnly.toUpperCase().substring(0, 3);
    };

    const originCode = resolveIata(origin);
    const destinationCode = resolveIata(destination);

    // Compute dates from month+days if not provided
    let outboundDate = departureDate;
    let retDate = returnDate;

    if (!outboundDate && travelMonth) {
      const monthMap: Record<string, number> = {
        "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3,
        "Maio": 4, "Junho": 5, "Julho": 6, "Agosto": 7,
        "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11,
      };
      const monthIndex = monthMap[travelMonth];
      if (monthIndex !== undefined) {
        const now = new Date();
        let year = now.getFullYear();
        if (monthIndex < now.getMonth() || (monthIndex === now.getMonth() && now.getDate() > 15)) {
          year++;
        }
        const start = new Date(year, monthIndex, 15);
        const end = new Date(start);
        end.setDate(start.getDate() + (travelDays || 7));
        outboundDate = start.toISOString().split("T")[0];
        retDate = end.toISOString().split("T")[0];
      }
    }

    if (!outboundDate) {
      const start = new Date();
      start.setDate(start.getDate() + 30);
      const end = new Date(start);
      end.setDate(start.getDate() + (travelDays || 7));
      outboundDate = start.toISOString().split("T")[0];
      retDate = end.toISOString().split("T")[0];
    }

    const params = new URLSearchParams({
      engine: "google_flights",
      departure_id: originCode,
      arrival_id: destinationCode,
      api_key: SERPAPI_KEY,
      hl: "pt-br",
      gl: "br",
      currency: "BRL",
      adults: String(adults),
      type: String(type),
      outbound_date: outboundDate,
    });

    if (retDate) params.set("return_date", retDate);

    console.log(`Fetching flights: ${originCode} -> ${destinationCode}, ${outboundDate}`);
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();

    if (!response.ok) {
      console.error("SerpAPI flights error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "SerpAPI request failed", details: data }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const mapFlight = (f: any) => {
      const leg = f.flights?.[0] || {};
      // Build Google Flights search URL
      const gfUrl = `https://www.google.com/travel/flights?q=flights+from+${originCode}+to+${destinationCode}+on+${outboundDate}`;
      return {
        airline: leg.airline || "Airline",
        airlineLogo: leg.airline_logo || "",
        departure: leg.departure_airport?.time || "",
        arrival: leg.arrival_airport?.time || "",
        duration: `${Math.floor((f.total_duration || 0) / 60)}h${(f.total_duration || 0) % 60 > 0 ? String((f.total_duration % 60)).padStart(2, "0") + "m" : ""}`,
        stops: (f.flights?.length || 1) - 1,
        price: f.price || 0,
        origin: leg.departure_airport?.id || origin,
        destination: leg.arrival_airport?.id || destination,
        departureDate: outboundDate,
        returnDate: retDate || "",
        bookingLink: f.booking_token
          ? `https://www.google.com/travel/flights/booking?token=${f.booking_token}`
          : gfUrl,
      };
    };

    const bestFlights = (data.best_flights || []).map(mapFlight);
    const otherFlights = (data.other_flights || []).map(mapFlight);
    const flights = [...bestFlights, ...otherFlights];

    return new Response(JSON.stringify({ flights, total: flights.length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in search-flights:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
