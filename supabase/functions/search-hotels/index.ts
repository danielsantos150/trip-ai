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
    const { destination, checkIn, checkOut, adults = 2, travelMonth, travelDays = 7, accommodationType = "hotel", minStars = 0 } = body;

    if (!destination) {
      return new Response(JSON.stringify({ error: "destination is required" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    let checkInDate = checkIn;
    let checkOutDate = checkOut;

    if (!checkInDate && travelMonth) {
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
        checkInDate = start.toISOString().split("T")[0];
        checkOutDate = end.toISOString().split("T")[0];
      }
    }

    if (!checkInDate) {
      const start = new Date();
      start.setDate(start.getDate() + 30);
      const end = new Date(start);
      end.setDate(start.getDate() + (travelDays || 7));
      checkInDate = start.toISOString().split("T")[0];
      checkOutDate = end.toISOString().split("T")[0];
    }

    // Strip state/region from destination for cleaner query
    const cleanDestination = destination.split(",")[0].trim();

    // Build query based on accommodation type
    const typeQueryMap: Record<string, string> = {
      hotel: "hotéis",
      hostel: "hostels",
      pousada: "pousadas",
      resort: "resorts",
      airbnb: "casas para alugar",
    };
    const typeQuery = typeQueryMap[accommodationType] || "hotéis";

    const serpParams: Record<string, string> = {
      engine: "google_hotels",
      q: `${typeQuery} em ${cleanDestination}`,
      api_key: SERPAPI_KEY,
      hl: "pt-br",
      gl: "br",
      currency: "BRL",
      adults: String(adults),
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      sort_by: "3",
    };

    // Apply star filter at API level — hotel_class accepts values 2-5
    // We send all classes >= minStars to act as a minimum filter
    if (minStars >= 2 && minStars <= 5) {
      const classes = [];
      for (let s = minStars; s <= 5; s++) classes.push(String(s));
      serpParams.hotel_class = classes.join(",");
    }

    const params = new URLSearchParams(serpParams);

    console.log(`Fetching hotels for: ${cleanDestination}, ${checkInDate} to ${checkOutDate}, minStars: ${minStars}`);
    let response = await fetch(`https://serpapi.com/search.json?${params}`);
    let data = await response.json();

    if (!response.ok) {
      console.error("SerpAPI error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "SerpAPI request failed", details: data }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Fallback: if no results with star filter, retry without it
    let fallbackUsed = false;
    if ((data.properties || []).length === 0 && minStars >= 2) {
      console.log("No results with star filter, retrying without hotel_class...");
      const fallbackParams = new URLSearchParams(serpParams);
      fallbackParams.delete("hotel_class");
      const fallbackResp = await fetch(`https://serpapi.com/search.json?${fallbackParams}`);
      const fallbackData = await fallbackResp.json();
      if (fallbackResp.ok && (fallbackData.properties || []).length > 0) {
        data = fallbackData;
        fallbackUsed = true;
      }
    }

    const hotels = (data.properties || []).map((p: any) => {
      // Try ALL possible price paths from SerpAPI
      const price = p.rate_per_night?.extracted_lowest
        || p.rate_per_night?.lowest
        || p.total_rate?.extracted_lowest
        || p.total_rate?.lowest
        || p.price?.extracted_lowest
        || p.price?.lowest
        || (typeof p.rate_per_night === "number" ? p.rate_per_night : 0)
        || (typeof p.total_rate === "number" ? p.total_rate : 0)
        || (typeof p.price === "number" ? p.price : 0);

      // Parse stars
      let stars = 0;
      if (typeof p.extracted_hotel_class === "number") {
        stars = p.extracted_hotel_class;
      } else if (typeof p.hotel_class === "number") {
        stars = p.hotel_class;
      } else if (typeof p.hotel_class === "string") {
        const match = p.hotel_class.match(/(\d)/);
        if (match) stars = parseInt(match[1]);
      }

      // Build nearby info
      const nearbyPlaces = (p.nearby_places || []).slice(0, 2).map((np: any) => {
        const transport = np.transportations?.[0];
        return `${np.name}${transport ? ` (${transport.duration})` : ""}`;
      });

      return {
        name: p.name || "Hotel",
        image: p.images?.[0]?.thumbnail || p.images?.[0]?.original_image || "",
        stars,
        price,
        location: p.neighborhood || nearbyPlaces[0] || "",
        description: p.description || "",
        nearbyPlaces,
        rating: p.overall_rating || 0,
        reviewCount: p.reviews || 0,
        tags: (p.amenities || []).slice(0, 4),
        link: p.link || "",
        gps_coordinates: p.gps_coordinates || null,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      };
    });

    return new Response(JSON.stringify({ 
      hotels, 
      total: hotels.length,
      fallbackUsed,
      requestedMinStars: minStars,
    }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in search-hotels:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});