import { useSearch } from "@/contexts/SearchContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, ArrowRight, ArrowLeft, Plane, Hotel, FileDown, Calendar, Users, DollarSign, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { generateTripPdf } from "@/lib/generateTripPdf";
import { toast } from "sonner";

const TripSummary = () => {
  const { data } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedHotel, selectedFlight, checkIn, checkOut } = (location.state || {}) as {
    selectedHotel?: any;
    selectedFlight?: any;
    checkIn?: string;
    checkOut?: string;
  };

  const hotelCost = selectedHotel?.price > 0 ? selectedHotel.price * (data.travelDays || 7) : 0;
  const flightCost = selectedFlight?.price > 0 ? selectedFlight.price : 0;
  const totalCost = hotelCost + flightCost;

  const budgetTotal = data.budgetType === "per_day" ? data.budgetMax * (data.travelDays || 7) : data.budgetMax;
  const overBudget = budgetTotal > 0 && totalCost > budgetTotal;
  const pct = budgetTotal > 0 ? Math.min((totalCost / budgetTotal) * 100, 100) : 0;

  const handleExportPdf = () => {
    generateTripPdf({
      destination: data.destination,
      travelMonth: data.travelMonth,
      travelDays: data.travelDays,
      isSolo: data.isSolo,
      companions: data.companions,
      budgetMax: data.budgetMax,
      budgetType: data.budgetType,
      accommodationType: data.accommodationType,
      minStars: data.minStars,
      wantsBeachProximity: data.wantsBeachProximity,
      likesNightlife: data.likesNightlife,
      wantsFlights: data.wantsFlights,
      origin: data.origin,
      fareClass: data.fareClass,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      selectedHotel,
      selectedFlight,
    });
    toast.success("PDF gerado! Abrindo em nova aba...");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-heading font-bold">🧳 Minha Trip</h1>
                <p className="text-sm text-primary-foreground/70">Resumo completo do seu plano de viagem</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleExportPdf}
            >
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Trip overview cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="rounded-xl bg-card border p-4 text-center">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Destino</p>
            <p className="font-heading font-bold text-sm text-foreground">{data.destination || "—"}</p>
          </div>
          <div className="rounded-xl bg-card border p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="font-heading font-bold text-sm text-foreground">{data.travelMonth || "Flexível"} · {data.travelDays} dias</p>
          </div>
          <div className="rounded-xl bg-card border p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Viajantes</p>
            <p className="font-heading font-bold text-sm text-foreground">{data.isSolo ? "1 pessoa" : `${data.companions} pessoas`}</p>
          </div>
          <div className="rounded-xl bg-card border p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Orçamento {data.budgetType === "per_day" ? "(por dia)" : "(total)"}
            </p>
            <p className="font-heading font-bold text-sm text-foreground">
              R$ {data.budgetMax.toLocaleString("pt-BR")}{data.budgetType === "per_day" ? "/dia" : ""}
            </p>
            {data.budgetType === "per_day" && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Total: R$ {(data.budgetMax * (data.travelDays || 7)).toLocaleString("pt-BR")} ({data.travelDays || 7} dias)
              </p>
            )}
          </div>
        </motion.div>

        {/* Dates */}
        {checkIn && checkOut && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-accent/50 border p-4 mb-8 flex items-center justify-center gap-6"
          >
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Check-in</p>
              <p className="font-heading font-bold text-foreground">{checkIn}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Check-out</p>
              <p className="font-heading font-bold text-foreground">{checkOut}</p>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Hotel card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Hotel className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-foreground">Hospedagem</h2>
            </div>
            {selectedHotel ? (
              <div className="rounded-xl border overflow-hidden bg-card">
                {selectedHotel.image && (
                  <div className="h-52 bg-muted">
                    <img
                      src={selectedHotel.image}
                      alt={selectedHotel.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <h3 className="font-heading font-bold text-xl text-foreground">{selectedHotel.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: selectedHotel.stars || 0 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {selectedHotel.rating > 0 && (
                      <Badge variant="secondary" className="text-xs">{selectedHotel.rating}/10</Badge>
                    )}
                  </div>
                  {selectedHotel.location && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {selectedHotel.location}
                    </div>
                  )}
                  {selectedHotel.description && (
                    <p className="text-sm text-muted-foreground">{selectedHotel.description}</p>
                  )}
                  {selectedHotel.tags && selectedHotel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedHotel.tags.slice(0, 6).map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Preço por noite</p>
                    <p className="text-2xl font-heading font-bold text-primary">
                      R$ {selectedHotel.price?.toLocaleString("pt-BR")}
                    </p>
                    {hotelCost > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Total ({data.travelDays} noites): <span className="font-semibold text-foreground">R$ {hotelCost.toLocaleString("pt-BR")}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
                <Hotel className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">Nenhuma hospedagem selecionada</p>
                <p className="text-sm mt-1">Volte aos resultados para escolher</p>
              </div>
            )}
          </motion.div>

          {/* Flight card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-foreground">Voo</h2>
            </div>
            {selectedFlight ? (
              <div className="rounded-xl border overflow-hidden bg-card">
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedFlight.airlineLogo && (
                      <img src={selectedFlight.airlineLogo} alt="" className="w-10 h-10 object-contain" />
                    )}
                    <div>
                      <h3 className="font-heading font-bold text-xl text-foreground">{selectedFlight.airline}</h3>
                      <Badge variant={selectedFlight.stops === 0 ? "default" : "secondary"} className="text-xs">
                        {selectedFlight.stops === 0 ? "Direto" : `${selectedFlight.stops} parada(s)`}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 px-2 bg-accent/30 rounded-xl">
                    <div className="text-center">
                      <p className="text-2xl font-heading font-bold text-foreground">{selectedFlight.departure}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.origin}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selectedFlight.duration}</span>
                      <div className="w-20 h-px bg-border relative">
                        <ArrowRight className="w-4 h-4 text-muted-foreground absolute -right-2 -top-2" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-heading font-bold text-foreground">{selectedFlight.arrival}</p>
                      <p className="text-sm text-muted-foreground">{selectedFlight.destination}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Preço</p>
                    <p className="text-2xl font-heading font-bold text-primary">
                      R$ {selectedFlight.price?.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed p-12 text-center text-muted-foreground">
                <Plane className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">{data.wantsFlights ? "Nenhum voo selecionado" : "Sem voo nesta viagem"}</p>
                <p className="text-sm mt-1">{data.wantsFlights ? "Volte aos resultados para escolher" : "Você optou por não incluir voos"}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Total + Budget */}
        {totalCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl border-2 p-6 mb-8 ${overBudget ? "border-destructive/40 bg-destructive/5" : "border-primary/30 bg-primary/5"}`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h3 className="font-heading font-bold text-lg text-foreground">Custo Total Estimado</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {hotelCost > 0 && (
                    <div className="flex justify-between max-w-xs">
                      <span>Hospedagem ({data.travelDays} noites)</span>
                      <span className="font-medium text-foreground">R$ {hotelCost.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {flightCost > 0 && (
                    <div className="flex justify-between max-w-xs">
                      <span>Voo</span>
                      <span className="font-medium text-foreground">R$ {flightCost.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className={`text-4xl font-heading font-bold ${overBudget ? "text-destructive" : "text-primary"}`}>
                  R$ {totalCost.toLocaleString("pt-BR")}
                </p>
                {budgetTotal > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="w-48 bg-muted rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${overBudget ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-xs ${overBudget ? "text-destructive" : "text-muted-foreground"}`}>
                      {overBudget
                        ? `⚠️ Excede o orçamento em R$ ${(totalCost - budgetTotal).toLocaleString("pt-BR")}`
                        : `Restam R$ ${(budgetTotal - totalCost).toLocaleString("pt-BR")} no orçamento`
                      }
                    </p>
                    {data.budgetType === "per_day" && (
                      <p className="text-[10px] text-muted-foreground">
                        Orçamento total: R$ {budgetTotal.toLocaleString("pt-BR")} (R$ {data.budgetMax.toLocaleString("pt-BR")}/dia × {data.travelDays || 7} dias)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Preferences summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-card border p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-bold text-lg text-foreground">Preferências da Viagem</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Hospedagem", value: data.accommodationType },
              { label: "Estrelas mínimas", value: "★".repeat(data.minStars) },
              { label: "Praia", value: data.wantsBeachProximity === true ? "Sim" : data.wantsBeachProximity === false ? "Não" : "Indiferente" },
              { label: "Vida noturna", value: data.likesNightlife === true ? "Sim" : data.likesNightlife === false ? "Não" : "Indiferente" },
              ...(data.wantsFlights ? [
                { label: "Origem", value: data.origin || "—" },
                { label: "Classe", value: data.fareClass || "economy" },
              ] : []),
            ].map((pref, i) => (
              <div key={i} className="rounded-lg bg-accent/50 p-3">
                <p className="text-xs text-muted-foreground">{pref.label}</p>
                <p className="text-sm font-medium text-foreground capitalize">{pref.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="gap-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
            Voltar aos resultados
          </Button>
          <Button className="gap-2" onClick={handleExportPdf}>
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TripSummary;
