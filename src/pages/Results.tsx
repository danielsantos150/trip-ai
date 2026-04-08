import { useSearch } from "@/contexts/SearchContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import HotelCard from "@/components/results/HotelCard";
import FlightCard from "@/components/results/FlightCard";
import ResultsFilters, { FiltersState, defaultFilters } from "@/components/results/ResultsFilters";
import SelectionsSummary from "@/components/wizard/SelectionsSummary";
import TripCart from "@/components/results/TripCart";

import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, Loader2, AlertCircle, ChevronLeft, AlertTriangle, X, Home, Sparkles } from "lucide-react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  type: "hotels" | "flights";
  rawCount: number;
  filters: FiltersState;
  wizardMinStars?: number;
  accommodationType?: string;
  onRelaxFilter: (action: string) => void;
}

const EmptyState = ({ type, rawCount, filters, wizardMinStars, accommodationType, onRelaxFilter }: EmptyStateProps) => {
  const blockingFilters: { label: string; action: string }[] = [];

  if (type === "hotels") {
    if (rawCount === 0 && wizardMinStars && wizardMinStars >= 4) {
      blockingFilters.push({ label: `⭐ Mínimo de ${wizardMinStars} estrelas (definido no wizard)`, action: "lowerWizardStars" });
    }
    if (rawCount === 0 && accommodationType) {
      const typeLabels: Record<string, string> = { hotel: "Hotel", hostel: "Hostel", pousada: "Pousada", resort: "Resort", airbnb: "Airbnb" };
      blockingFilters.push({ label: `🏠 Tipo: ${typeLabels[accommodationType] || accommodationType}`, action: "lowerWizardStars" });
    }
    if (filters.selectedStars.length > 0) {
      blockingFilters.push({ label: `⭐ Filtro de estrelas: ${filters.selectedStars.join(", ")}`, action: "clearStars" });
    }
    if (filters.priceRange[0] > 0) {
      blockingFilters.push({ label: `💰 Preço mínimo: R$ ${filters.priceRange[0]}`, action: "clearPrice" });
    }
  } else {
    if (filters.stopsFilter !== "all") {
      const stopLabels: Record<string, string> = { direct: "Direto", "1": "1 parada", "2plus": "2+ paradas" };
      blockingFilters.push({ label: `🛬 Paradas: ${stopLabels[filters.stopsFilter] || filters.stopsFilter}`, action: "clearStops" });
    }
    if (filters.airlineFilter.length > 0) {
      blockingFilters.push({ label: `🛩️ Companhias: ${filters.airlineFilter.join(", ")}`, action: "clearAirlines" });
    }
    if (filters.priceRange[0] > 0) {
      blockingFilters.push({ label: `💰 Preço mínimo: R$ ${filters.priceRange[0]}`, action: "clearPrice" });
    }
  }

  const isApiEmpty = rawCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-border bg-muted/30"
    >
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Search className="w-7 h-7 text-primary" />
      </div>
      <h3 className="text-lg font-heading font-bold text-foreground mb-2">
        {type === "hotels" ? "Nenhuma hospedagem encontrada 😕" : "Nenhum voo encontrado 😕"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
        {isApiEmpty && blockingFilters.length <= 2
          ? type === "hotels"
            ? "A busca não retornou resultados para esse destino com as preferências do wizard. Tente relaxar algum critério abaixo!"
            : "Não encontramos voos para essa rota. Verifique o destino e a origem ou tente outra data!"
          : `Encontramos ${rawCount} ${type === "hotels" ? "hospedagens" : "voos"}, mas os filtros aplicados estão bloqueando todos. Clique pra remover:`
        }
      </p>

      {blockingFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {blockingFilters.map((bf, idx) => (
            <button
              key={idx}
              onClick={() => onRelaxFilter(bf.action)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <X className="w-3.5 h-3.5" />
              {bf.label}
            </button>
          ))}
        </div>
      )}

      {isApiEmpty && (
        <Button
          variant="outline"
          onClick={() => onRelaxFilter("lowerWizardStars")}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Voltar ao wizard e ajustar preferências
        </Button>
      )}
    </motion.div>
  );
};

const Results = () => {
  const { data, resetData } = useSearch();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [hotelFilters, setHotelFilters] = useState<FiltersState>(defaultFilters);
  const [flightFilters, setFlightFilters] = useState<FiltersState>({ ...defaultFilters, sortBy: "price" });
  const [activeTab, setActiveTab] = useState<"hotels" | "flights">("hotels");
  const showFlights = data.wantsFlights === true;
  

  // Cart state
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  // Budget warning popup
  const [budgetWarning, setBudgetWarning] = useState<{ show: boolean; total: number; budget: number; onConfirm: () => void } | null>(null);

  // Calculate total budget limit
  const budgetLimit = useMemo(() => {
    if (!data.budgetMax || data.budgetMax <= 0) return null;
    if (data.budgetType === "per_day") {
      return data.budgetMax * (data.travelDays || 7);
    }
    return data.budgetMax;
  }, [data.budgetMax, data.budgetType, data.travelDays]);

  const calcTotal = useCallback((hotel: any, flight: any) => {
    const hotelTotal = hotel?.price > 0 ? hotel.price * (data.travelDays || 7) : 0;
    const flightTotal = flight?.price > 0 ? flight.price : 0;
    return hotelTotal + flightTotal;
  }, [data.travelDays]);

  const toggleHotel = (hotel: any) => {
    const isRemoving = selectedHotel?.name === hotel.name;
    if (isRemoving) {
      setSelectedHotel(null);
      return;
    }
    const newTotal = calcTotal(hotel, selectedFlight);
    if (budgetLimit && newTotal > budgetLimit) {
      setBudgetWarning({
        show: true,
        total: newTotal,
        budget: budgetLimit,
        onConfirm: () => { setSelectedHotel(hotel); setBudgetWarning(null); },
      });
      return;
    }
    setSelectedHotel(hotel);
  };

  const toggleFlight = (flight: any) => {
    const isRemoving = selectedFlight?.airline === flight.airline && selectedFlight?.departure === flight.departure;
    if (isRemoving) {
      setSelectedFlight(null);
      return;
    }
    const newTotal = calcTotal(selectedHotel, flight);
    if (budgetLimit && newTotal > budgetLimit) {
      setBudgetWarning({
        show: true,
        total: newTotal,
        budget: budgetLimit,
        onConfirm: () => { setSelectedFlight(flight); setBudgetWarning(null); },
      });
      return;
    }
    setSelectedFlight(flight);
  };

  const { data: hotelsData, isLoading: hotelsLoading, error: hotelsError } = useQuery({
    queryKey: ["hotels", data.destination, data.travelMonth, data.travelDays, data.companions, data.isSolo, data.accommodationType, data.minStars],
    queryFn: async () => {
      const adults = data.isSolo ? 1 : (data.companions || 2);
      const { data: result, error } = await supabase.functions.invoke("search-hotels", {
        body: {
          destination: data.destination,
          travelMonth: data.travelMonth,
          travelDays: data.travelDays,
          adults,
          accommodationType: data.accommodationType || "hotel",
          minStars: data.minStars || 0,
        },
      });
      if (error) throw error;
      return result;
    },
    enabled: !!data.destination,
  });

  const { data: flightsData, isLoading: flightsLoading, error: flightsError } = useQuery({
    queryKey: ["flights", data.origin, data.destination, data.travelMonth, data.travelDays],
    queryFn: async () => {
      const adults = data.isSolo ? 1 : (data.companions || 2);
      const { data: result, error } = await supabase.functions.invoke("search-flights", {
        body: {
          origin: data.origin,
          destination: data.destination,
          travelMonth: data.travelMonth,
          travelDays: data.travelDays,
          adults,
        },
      });
      if (error) throw error;
      return result;
    },
    enabled: showFlights && !!data.origin && !!data.destination,
  });

  const rawHotels: any[] = hotelsData?.hotels || [];
  const hotelFallbackUsed: boolean = hotelsData?.fallbackUsed || false;
  const rawFlights: any[] = flightsData?.flights || [];

  // AI recommendations
  const [aiRecs, setAiRecs] = useState<{ recommendedHotels: { index: number; reason: string }[]; recommendedFlights: { index: number; reason: string }[] }>({ recommendedHotels: [], recommendedFlights: [] });
  const [aiRecsLoading, setAiRecsLoading] = useState(false);

  useEffect(() => {
    if (rawHotels.length === 0 && rawFlights.length === 0) return;
    if (aiRecsLoading) return;
    
    const fetchRecs = async () => {
      setAiRecsLoading(true);
      try {
        const { data: result, error } = await supabase.functions.invoke("ai-recommend", {
          body: {
            preferences: data,
            hotels: rawHotels.slice(0, 15),
            flights: rawFlights.slice(0, 15),
          },
        });
        if (!error && result) {
          setAiRecs({
            recommendedHotels: result.recommendedHotels || [],
            recommendedFlights: result.recommendedFlights || [],
          });
        }
      } catch (e) {
        console.error("AI recommend error:", e);
      } finally {
        setAiRecsLoading(false);
      }
    };
    fetchRecs();
  }, [rawHotels.length, rawFlights.length]);

  // Build recommendation lookup maps from raw indices
  const hotelRecMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const rec of aiRecs.recommendedHotels) {
      const hotel = rawHotels[rec.index];
      if (hotel) map.set(hotel.name, rec.reason);
    }
    return map;
  }, [aiRecs.recommendedHotels, rawHotels]);

  const flightRecMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const rec of aiRecs.recommendedFlights) {
      const flight = rawFlights[rec.index];
      if (flight) map.set(`${flight.airline}-${flight.departure}`, rec.reason);
    }
    return map;
  }, [aiRecs.recommendedFlights, rawFlights]);

  const hotelMaxPrice = useMemo(() => {
    if (rawHotels.length === 0) return 5000;
    return Math.ceil(Math.max(...rawHotels.map((h: any) => h.price || 0)) / 100) * 100 + 500;
  }, [rawHotels]);

  const flightMaxPrice = useMemo(() => {
    if (rawFlights.length === 0) return 5000;
    return Math.ceil(Math.max(...rawFlights.map((f: any) => f.price || 0)) / 100) * 100 + 500;
  }, [rawFlights]);

  const availableAirlines = useMemo(() => {
    const set = new Set(rawFlights.map((f: any) => f.airline));
    return Array.from(set).sort();
  }, [rawFlights]);

  const filteredHotels = useMemo(() => {
    let results = [...rawHotels];
    // Pre-filter: enforce wizard minStars only if API returned filtered results (no fallback)
    if (data.minStars > 1 && !hotelFallbackUsed) {
      results = results.filter((h: any) => h.stars === 0 || h.stars >= data.minStars);
    }
    results = results.filter(
      (h: any) => (h.price || 0) >= hotelFilters.priceRange[0] && (h.price || 0) <= hotelFilters.priceRange[1]
    );
    if (hotelFilters.selectedStars.length > 0) {
      results = results.filter((h: any) => hotelFilters.selectedStars.includes(h.stars));
    }
    switch (hotelFilters.sortBy) {
      case "price": results.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case "price_desc": results.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case "rating": results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "stars": results.sort((a, b) => (b.stars || 0) - (a.stars || 0)); break;
    }
    return results;
  }, [rawHotels, hotelFilters, data.minStars, hotelFallbackUsed]);

  const filteredFlights = useMemo(() => {
    let results = [...rawFlights];
    results = results.filter(
      (f: any) => (f.price || 0) >= flightFilters.priceRange[0] && (f.price || 0) <= flightFilters.priceRange[1]
    );
    if (flightFilters.stopsFilter !== "all") {
      results = results.filter((f: any) => {
        if (flightFilters.stopsFilter === "direct") return f.stops === 0;
        if (flightFilters.stopsFilter === "1") return f.stops === 1;
        if (flightFilters.stopsFilter === "2plus") return f.stops >= 2;
        return true;
      });
    }
    if (flightFilters.airlineFilter.length > 0) {
      results = results.filter((f: any) => flightFilters.airlineFilter.includes(f.airline));
    }
    switch (flightFilters.sortBy) {
      case "price": results.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case "duration": {
        const pd = (d: string) => {
          const h = d.match(/(\d+)h/); const m = d.match(/(\d+)m/);
          return (parseInt(h?.[1] || "0") * 60) + parseInt(m?.[1] || "0");
        };
        results.sort((a, b) => pd(a.duration) - pd(b.duration));
        break;
      }
      case "departure": results.sort((a, b) => (a.departure || "").localeCompare(b.departure || "")); break;
    }
    return results;
  }, [rawFlights, flightFilters]);

  const currentFilters = activeTab === "hotels" ? hotelFilters : flightFilters;
  const setCurrentFilters = activeTab === "hotels" ? setHotelFilters : setFlightFilters;
  const currentMaxPrice = activeTab === "hotels" ? hotelMaxPrice : flightMaxPrice;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-24">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => { resetData(); navigate("/"); }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-4 h-4" /> Nova pesquisa
          </button>
          <span className="text-muted-foreground/40">|</span>
          <button
            onClick={() => navigate("/wizard")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar e refinar o plano
          </button>
        </div>

        <div className="mb-6">
          <SelectionsSummary />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              🗺️ {data.destination || "Sua próxima aventura"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {hotelsLoading ? "🔍 Caçando os melhores cantinhos pra você..." : `🏨 ${filteredHotels.length} opções de hospedagem`}
              {showFlights && (flightsLoading ? " · ✈️ Procurando voos..." : ` · ✈️ ${filteredFlights.length} voos`)}
              {!hotelsLoading && !flightsLoading && " prontos pra você escolher!"}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 text-sm text-muted-foreground"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
        </div>

        {showFlights && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("hotels")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "hotels" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              🏨 Hospedagens ({filteredHotels.length})
            </button>
            <button
              onClick={() => setActiveTab("flights")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "flights" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              ✈️ Voos ({filteredFlights.length})
            </button>
          </div>
        )}

        

        <div className="flex gap-6">
          <aside className="w-64 shrink-0 hidden md:block">
            <div className="sticky top-24 p-4 bg-card rounded-xl border">
              <h3 className="font-heading font-semibold mb-4">Filtros</h3>
              <ResultsFilters
                type={activeTab}
                filters={currentFilters}
                onChange={setCurrentFilters}
                availableAirlines={activeTab === "flights" ? availableAirlines : []}
                maxPrice={currentMaxPrice}
              />
            </div>
          </aside>

          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setShowFilters(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-card p-6 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-heading font-semibold mb-4">Filtros</h3>
                <ResultsFilters
                  type={activeTab}
                  filters={currentFilters}
                  onChange={setCurrentFilters}
                  availableAirlines={activeTab === "flights" ? availableAirlines : []}
                  maxPrice={currentMaxPrice}
                />
              </div>
            </div>
          )}

          <div className="flex-1 space-y-8">
            {(activeTab === "hotels" || !showFlights) && (
              <div className="space-y-3">
                <h2 className="text-lg font-heading font-semibold text-foreground">🏨 Onde ficar</h2>
                {hotelsLoading && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>🔎 Vasculhando os melhores lugares em {data.destination}...</span>
                  </div>
                )}
                {!hotelsLoading && hotelFallbackUsed && rawHotels.length > 0 && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-foreground mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm">
                      <span className="font-medium">Não encontramos hotéis de {data.minStars}★ nessa região.</span>{" "}
                      Mostrando as melhores opções disponíveis. Você pode{" "}
                      <button onClick={() => navigate("/wizard")} className="underline font-medium text-primary hover:text-primary/80">
                        ajustar suas preferências
                      </button>.
                    </p>
                  </div>
                )}
                {hotelsError && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Ops! Algo deu errado ao buscar hospedagens. Tenta de novo? 🙏</span>
                  </div>
                )}
                {!hotelsLoading && filteredHotels.length === 0 && !hotelsError && (
                  <EmptyState
                    type="hotels"
                    rawCount={rawHotels.length}
                    filters={hotelFilters}
                    wizardMinStars={data.minStars}
                    accommodationType={data.accommodationType}
                    onRelaxFilter={(action) => {
                      if (action === "clearStars") setHotelFilters(f => ({ ...f, selectedStars: [] }));
                      if (action === "clearPrice") setHotelFilters(f => ({ ...f, priceRange: [0, hotelMaxPrice] }));
                      if (action === "lowerWizardStars") navigate("/wizard");
                    }}
                  />
                )}
                {/* AI Recommended Hotels - pinned at top */}
                {(() => {
                  const recommended = filteredHotels.filter((h: any) => hotelRecMap.has(h.name));
                  const rest = filteredHotels.filter((h: any) => !hotelRecMap.has(h.name));

                  return (
                    <>
                      {recommended.length > 0 && (
                        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-heading font-bold text-primary">Sugestões da IA pra você ✨</h3>
                          </div>
                          <p className="text-xs text-muted-foreground -mt-2">
                            Selecionadas com base nas suas preferências e orçamento
                          </p>
                          {recommended.map((hotel: any, i: number) => {
                            const recReason = hotelRecMap.get(hotel.name);
                            return (
                              <motion.div key={`rec-${hotel.name}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <HotelCard
                                  name={hotel.name}
                                  image={hotel.image}
                                  stars={hotel.stars}
                                  price={hotel.price}
                                  location={hotel.location}
                                  description={hotel.description}
                                  nearbyPlaces={hotel.nearbyPlaces}
                                  rating={hotel.rating}
                                  tags={hotel.tags}
                                  link={hotel.link}
                                  selected={selectedHotel?.name === hotel.name}
                                  onSelect={() => toggleHotel(hotel)}
                                  recommended={true}
                                  recommendReason={recReason}
                                  destination={data.destination}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {rest.map((hotel: any, i: number) => (
                        <motion.div key={`${hotel.name}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                          <HotelCard
                            name={hotel.name}
                            image={hotel.image}
                            stars={hotel.stars}
                            price={hotel.price}
                            location={hotel.location}
                            description={hotel.description}
                            nearbyPlaces={hotel.nearbyPlaces}
                            rating={hotel.rating}
                            tags={hotel.tags}
                            link={hotel.link}
                            selected={selectedHotel?.name === hotel.name}
                            onSelect={() => toggleHotel(hotel)}
                            recommended={false}
                            destination={data.destination}
                          />
                        </motion.div>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}

            {showFlights && activeTab === "flights" && (
              <div className="space-y-3">
                <h2 className="text-lg font-heading font-semibold text-foreground">✈️ Como chegar</h2>
                {flightsLoading && (
                  <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>🛫 Buscando as melhores rotas pra você...</span>
                  </div>
                )}
                {flightsError && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Ops! Não conseguimos buscar voos agora. Tenta de novo? ✈️</span>
                  </div>
                )}
                {!flightsLoading && filteredFlights.length === 0 && !flightsError && (
                  <EmptyState
                    type="flights"
                    rawCount={rawFlights.length}
                    filters={flightFilters}
                    onRelaxFilter={(action) => {
                      if (action === "clearStops") setFlightFilters(f => ({ ...f, stopsFilter: "all" }));
                      if (action === "clearAirlines") setFlightFilters(f => ({ ...f, airlineFilter: [] }));
                      if (action === "clearPrice") setFlightFilters(f => ({ ...f, priceRange: [0, flightMaxPrice] }));
                    }}
                  />
                )}
                {/* AI Recommended Flights - pinned at top */}
                {(() => {
                  const recommended = filteredFlights.filter((f: any) => flightRecMap.has(`${f.airline}-${f.departure}`));
                  const rest = filteredFlights.filter((f: any) => !flightRecMap.has(`${f.airline}-${f.departure}`));

                  return (
                    <>
                      {recommended.length > 0 && (
                        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <h3 className="text-sm font-heading font-bold text-primary">Voos recomendados pela IA ✨</h3>
                          </div>
                          <p className="text-xs text-muted-foreground -mt-2">
                            Os melhores voos considerando suas preferências
                          </p>
                          {recommended.map((flight: any, i: number) => {
                            const flightKey = `${flight.airline}-${flight.departure}`;
                            const recReason = flightRecMap.get(flightKey);
                            return (
                              <motion.div key={`rec-${flightKey}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                <FlightCard
                                  airline={flight.airline}
                                  airlineLogo={flight.airlineLogo}
                                  departure={flight.departure}
                                  arrival={flight.arrival}
                                  duration={flight.duration}
                                  stops={flight.stops}
                                  price={flight.price}
                                  origin={flight.origin}
                                  destination={flight.destination}
                                  departureDate={flight.departureDate}
                                  selected={selectedFlight?.airline === flight.airline && selectedFlight?.departure === flight.departure}
                                  onSelect={() => toggleFlight(flight)}
                                  recommended={true}
                                  recommendReason={recReason}
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {rest.map((flight: any, i: number) => {
                        const flightKey = `${flight.airline}-${flight.departure}`;
                        return (
                          <motion.div key={`${flightKey}-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <FlightCard
                              airline={flight.airline}
                              airlineLogo={flight.airlineLogo}
                              departure={flight.departure}
                              arrival={flight.arrival}
                              duration={flight.duration}
                              stops={flight.stops}
                              price={flight.price}
                              origin={flight.origin}
                              destination={flight.destination}
                              departureDate={flight.departureDate}
                              selected={selectedFlight?.airline === flight.airline && selectedFlight?.departure === flight.departure}
                              onSelect={() => toggleFlight(flight)}
                              recommended={false}
                            />
                          </motion.div>
                        );
                      })}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trip Cart */}
      <TripCart
        selectedHotel={selectedHotel}
        selectedFlight={selectedFlight}
        onRemoveHotel={() => setSelectedHotel(null)}
        onRemoveFlight={() => setSelectedFlight(null)}
        budgetLimit={budgetLimit}
      />

      {/* Budget warning popup */}
      <AnimatePresence>
        {budgetWarning?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setBudgetWarning(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl border shadow-2xl max-w-md w-full p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                 <h3 className="font-heading font-bold text-foreground text-lg">Epa, orçamento estourado! 💸</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Se você selecionar esse item, sua trip vai custar{" "}
                    <span className="font-bold text-destructive">
                      R$ {budgetWarning.total.toLocaleString("pt-BR")}
                    </span>
                    , passando do seu limite de{" "}
                    <span className="font-bold text-foreground">
                      R$ {budgetWarning.budget.toLocaleString("pt-BR")}
                    </span>{" "}
                    em{" "}
                    <span className="font-bold text-destructive">
                      R$ {(budgetWarning.total - budgetWarning.budget).toLocaleString("pt-BR")}
                    </span>.
                  </p>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-destructive transition-all"
                  style={{ width: `${Math.min((budgetWarning.total / budgetWarning.budget) * 100, 100)}%` }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setBudgetWarning(null)}
                >
                  Melhor não 😅
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={budgetWarning.onConfirm}
                >
                  Vida que segue! 🤷
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Results;