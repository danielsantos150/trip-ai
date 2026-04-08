import { useState, useMemo, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Star, MapPin, Clock, ArrowRight, ExternalLink, Trash2, CalendarIcon, BrainCircuit, CheckCircle2, XCircle, AlertTriangle as AlertTriangleIcon, Loader2, Sparkles } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TripCartProps {
  selectedHotel: any | null;
  selectedFlight: any | null;
  onRemoveHotel: () => void;
  onRemoveFlight: () => void;
  budgetLimit?: number | null;
}

const monthMap: Record<string, number> = {
  "Janeiro": 0, "Fevereiro": 1, "Março": 2, "Abril": 3, "Maio": 4, "Junho": 5,
  "Julho": 6, "Agosto": 7, "Setembro": 8, "Outubro": 9, "Novembro": 10, "Dezembro": 11,
};

const TripCart = ({ selectedHotel, selectedFlight, onRemoveHotel, onRemoveFlight, budgetLimit }: TripCartProps) => {
  const [open, setOpen] = useState(false);
  const { data } = useSearch();
  const itemCount = (selectedHotel ? 1 : 0) + (selectedFlight ? 1 : 0);

  // Date selection state
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();

  // Determine default month for calendar based on user's travel month selection
  const defaultMonth = useMemo(() => {
    const monthIdx = monthMap[data.travelMonth || ""];
    if (monthIdx === undefined) return new Date();
    const now = new Date();
    let year = now.getFullYear();
    if (monthIdx < now.getMonth()) year++;
    return new Date(year, monthIdx, 1);
  }, [data.travelMonth]);

  // When check-in is set, auto-set check-out
  const handleCheckIn = (date: Date | undefined) => {
    setCheckIn(date);
    if (date && data.travelDays) {
      setCheckOut(addDays(date, data.travelDays));
    }
  };

  const fmtDate = (d?: Date) => d ? format(d, "yyyy-MM-dd") : "";
  const fmtDateBR = (d?: Date) => d ? format(d, "dd/MM/yyyy", { locale: ptBR }) : "";
  const datesSelected = !!checkIn && !!checkOut;

  const buildHotelLinks = () => {
    if (!selectedHotel) return [];
    const q = encodeURIComponent(selectedHotel.name + " " + (data.destination || ""));
    const checkinStr = fmtDate(checkIn);
    const checkoutStr = fmtDate(checkOut);

    return [
      {
        name: "Booking.com",
        url: datesSelected
          ? `https://www.booking.com/searchresults.html?ss=${q}&checkin=${checkinStr}&checkout=${checkoutStr}`
          : `https://www.booking.com/searchresults.html?ss=${q}`,
      },
      {
        name: "Hotels.com",
        url: datesSelected
          ? `https://www.hotels.com/search.do?q-destination=${q}&q-check-in=${checkinStr}&q-check-out=${checkoutStr}`
          : `https://www.hotels.com/search.do?q-destination=${q}`,
      },
      {
        name: "TripAdvisor",
        url: `https://www.tripadvisor.com.br/Search?q=${q}`,
      },
    ];
  };

  const buildFlightLinks = () => {
    if (!selectedFlight) return [];
    const origin = (data.origin || "").trim();
    const dest = (data.destination || "").trim();
    const depDate = fmtDate(checkIn);
    const retDate = fmtDate(checkOut);

    return [
      {
        name: "GOL",
        url: datesSelected
          ? `https://www.voegol.com.br/passagens-aereas/${encodeURIComponent(origin)}/${encodeURIComponent(dest)}?departureDate=${depDate}&returnDate=${retDate}`
          : `https://www.voegol.com.br/`,
      },
      {
        name: "Azul",
        url: datesSelected
          ? `https://www.voeazul.com.br/passagens-aereas?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&departureDate=${depDate}&returnDate=${retDate}`
          : `https://www.voeazul.com.br/`,
      },
      {
        name: "LATAM",
        url: datesSelected
          ? `https://www.latamairlines.com/br/pt/oferta-voos?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}&outbound=${depDate}&inbound=${retDate}`
          : `https://www.latamairlines.com/br/pt`,
      },
    ];
  };

  return (
    <>
      {/* Floating cart button */}
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <Button
              onClick={() => setOpen(true)}
              size="lg"
              className="rounded-full h-14 px-6 shadow-lg shadow-primary/30 gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Minha Trip</span>
              <Badge variant="secondary" className="bg-white text-primary font-bold ml-1">
                {itemCount}
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="font-heading text-xl flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              🧳 Minha Trip
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            {/* Trip summary */}
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{data.destination || "Destino"}</span>
                {" · "}{data.travelMonth || "Flexível"}{" · "}{data.travelDays} dias
                {" · "}{data.isSolo ? "1 pessoa" : `${data.companions} pessoas`}
              </p>
            </div>

            {/* Date selection */}
            <div className="rounded-xl border p-4 space-y-3">
              <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
                📅 Quando vai rolar?
                {data.travelMonth && (
                  <span className="text-xs text-muted-foreground font-normal">({data.travelMonth})</span>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">
                Escolha o dia de chegada — a gente calcula o resto ({data.travelDays} dias). 😉
              </p>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !checkIn && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {checkIn ? fmtDateBR(checkIn) : "Check-in"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={handleCheckIn}
                      defaultMonth={defaultMonth}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !checkOut && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {checkOut ? fmtDateBR(checkOut) : "Check-out"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      defaultMonth={checkIn || defaultMonth}
                      disabled={(date) => date < (checkIn || new Date())}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {!datesSelected && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  ⚠️ Marca as datas pra gente gerar os links certinhos de reserva!
                </p>
              )}
            </div>

            {/* Selected hotel */}
            <div>
              <h4 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                🏨 Onde você vai ficar
                {!selectedHotel && <span className="text-muted-foreground font-normal text-xs">(escolha lá em cima!)</span>}
              </h4>
              {selectedHotel ? (
                <div className="rounded-xl border overflow-hidden">
                  {selectedHotel.image && (
                    <div className="h-36 bg-muted relative">
                      <img
                        src={selectedHotel.image}
                        alt={selectedHotel.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                      />
                      <button
                        onClick={onRemoveHotel}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="p-3 space-y-2">
                    <h5 className="font-heading font-semibold text-foreground">{selectedHotel.name}</h5>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: selectedHotel.stars || 0 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      {selectedHotel.rating > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">({selectedHotel.rating})</span>
                      )}
                    </div>
                    {selectedHotel.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {selectedHotel.location}
                      </div>
                    )}
                    {selectedHotel.price > 0 && (
                      <p className="text-lg font-heading font-bold text-primary">
                        R$ {selectedHotel.price.toLocaleString("pt-BR")}<span className="text-xs font-normal text-muted-foreground">/noite</span>
                      </p>
                    )}
                  </div>

                  {/* Hotel booking links */}
                  <div className="border-t p-3 space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">🔗 Reserve agora:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {buildHotelLinks().map((link) => (
                        <Button
                          key={link.name}
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 justify-between"
                          onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                        >
                          {link.name}
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Volta lá e escolhe uma hospedagem que te agrada! 🏡
                </div>
              )}
            </div>

            {/* Selected flight */}
            {data.wantsFlights && (
              <div>
                <h4 className="font-heading font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  ✈️ Como você vai chegar
                  {!selectedFlight && <span className="text-muted-foreground font-normal text-xs">(escolha lá em cima!)</span>}
                </h4>
                {selectedFlight ? (
                  <div className="rounded-xl border overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedFlight.airlineLogo && (
                            <img src={selectedFlight.airlineLogo} alt="" className="w-6 h-6 object-contain" />
                          )}
                          <span className="font-medium text-sm text-foreground">{selectedFlight.airline}</span>
                        </div>
                        <button
                          onClick={onRemoveFlight}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-lg font-heading font-bold text-foreground">{selectedFlight.departure}</p>
                          <p className="text-xs text-muted-foreground">{selectedFlight.origin}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {selectedFlight.duration}
                          </span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <Badge variant={selectedFlight.stops === 0 ? "default" : "secondary"} className="text-[10px]">
                            {selectedFlight.stops === 0 ? "Direto" : `${selectedFlight.stops} parada(s)`}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-heading font-bold text-foreground">{selectedFlight.arrival}</p>
                          <p className="text-xs text-muted-foreground">{selectedFlight.destination}</p>
                        </div>
                      </div>

                      <p className="text-lg font-heading font-bold text-primary">
                        R$ {selectedFlight.price?.toLocaleString("pt-BR") || "---"}
                      </p>
                    </div>

                    {/* Flight booking links */}
                    <div className="border-t p-3 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">🔗 Reserve agora:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {buildFlightLinks().map((link) => (
                          <Button
                            key={link.name}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 justify-between"
                            onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                          >
                            {link.name}
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Volta lá e escolhe um voo que combine com você! 🛫
                  </div>
                )}
              </div>
            )}

            {/* Total estimate + budget check */}
            {(selectedHotel || selectedFlight) && (() => {
              const hotelCost = selectedHotel?.price > 0 ? selectedHotel.price * (data.travelDays || 7) : 0;
              const flightCost = selectedFlight?.price > 0 ? selectedFlight.price : 0;
              const total = hotelCost + flightCost;
              const overBudget = budgetLimit ? total > budgetLimit : false;
              const pct = budgetLimit ? Math.min((total / budgetLimit) * 100, 100) : 0;

              return (
                <div className={cn(
                  "rounded-xl border p-4 space-y-3",
                  overBudget ? "bg-destructive/5 border-destructive/30" : "bg-primary/5 border-primary/20"
                )}>
                  <h4 className="font-heading font-semibold text-foreground text-sm">Estimativa de custo</h4>
                  {hotelCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hospedagem ({data.travelDays} noites)</span>
                      <span className="font-medium text-foreground">R$ {hotelCost.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {flightCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Voo</span>
                      <span className="font-medium text-foreground">R$ {flightCost.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  {(hotelCost > 0 || flightCost > 0) && (
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="font-semibold text-foreground">Total estimado</span>
                      <span className={cn(
                        "font-heading font-bold text-lg",
                        overBudget ? "text-destructive" : "text-primary"
                      )}>
                        R$ {total.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  )}

                  {/* Budget progress bar */}
                  {budgetLimit && budgetLimit > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Orçamento: R$ {budgetLimit.toLocaleString("pt-BR")}</span>
                        <span className={overBudget ? "text-destructive font-medium" : ""}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            overBudget ? "bg-destructive" : pct > 80 ? "bg-amber-500" : "bg-primary"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {overBudget && (
                        <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                          ⚠️ Orçamento excedido em R$ {(total - budgetLimit).toLocaleString("pt-BR")}
                        </p>
                      )}
                      {!overBudget && budgetLimit - total > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Restam R$ {(budgetLimit - total).toLocaleString("pt-BR")} no orçamento
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* AI Validation Section */}
            <AiValidation
              selectedHotel={selectedHotel}
              selectedFlight={selectedFlight}
              budgetLimit={budgetLimit}
              travelDays={data.travelDays}
              preferences={data}
            />


            {/* Tip */}
            <div className="rounded-xl bg-accent/50 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">💡 Dica</p>
              <p>Compare os preços nas plataformas parceiras. Os valores podem variar conforme disponibilidade e datas.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

/* ---------- AI Validation Sub-component ---------- */
interface AiValidationProps {
  selectedHotel: any;
  selectedFlight: any;
  budgetLimit?: number | null;
  travelDays: number;
  preferences: any;
}

interface AiAnalysis {
  score: number;
  status: string;
  summary: string;
  checks: { label: string; passed: boolean; detail: string }[];
  tips: string[];
  budgetAnalysis: string;
}

const AiValidation = ({ selectedHotel, selectedFlight, budgetLimit, travelDays, preferences }: AiValidationProps) => {
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSelection = !!selectedHotel || !!selectedFlight;

  const totalCost = useMemo(() => {
    const hotelCost = selectedHotel?.price > 0 ? selectedHotel.price * (travelDays || 7) : 0;
    const flightCost = selectedFlight?.price > 0 ? selectedFlight.price : 0;
    return hotelCost + flightCost;
  }, [selectedHotel, selectedFlight, travelDays]);

  const runValidation = async () => {
    if (!hasSelection) return;
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("validate-selections", {
        body: {
          preferences,
          selectedHotel,
          selectedFlight,
          totalCost,
          budgetLimit,
        },
      });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Erro ao validar seleções");
    } finally {
      setLoading(false);
    }
  };

  // Re-run when selections change
  useEffect(() => {
    setAnalysis(null);
  }, [selectedHotel?.name, selectedFlight?.airline, selectedFlight?.departure]);

  if (!hasSelection) return null;

  const statusColor = analysis?.status === "verde"
    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : analysis?.status === "vermelho"
    ? "text-destructive bg-destructive/5 border-destructive/20"
    : "text-amber-600 bg-amber-50 border-amber-200";

  const scoreColor = (analysis?.score ?? 0) >= 70
    ? "text-emerald-600"
    : (analysis?.score ?? 0) >= 40
    ? "text-amber-600"
    : "text-destructive";

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary" />
          Análise Inteligente
        </h4>
        <Button
          size="sm"
          variant={analysis ? "outline" : "default"}
          onClick={runValidation}
          disabled={loading}
          className="text-xs h-7 gap-1.5"
        >
          {loading ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Analisando...</>
          ) : analysis ? (
            <><Sparkles className="w-3 h-3" /> Reanalisar</>
          ) : (
            <><Sparkles className="w-3 h-3" /> Validar seleções</>
          )}
        </Button>
      </div>

      {!analysis && !loading && !error && (
        <p className="text-xs text-muted-foreground">
          Clique em "Validar seleções" para a IA analisar se suas escolhas estão alinhadas com suas preferências.
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          ⚠️ {error}
        </div>
      )}

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Score + Status */}
          <div className={cn("rounded-lg border p-3 flex items-center gap-3", statusColor)}>
            <div className={cn("text-2xl font-heading font-bold", scoreColor)}>
              {analysis.score}%
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{analysis.summary}</p>
            </div>
          </div>

          {/* Checks */}
          {analysis.checks?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Critérios analisados:</p>
              {analysis.checks.map((check, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {check.passed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-medium text-foreground">{check.label}: </span>
                    <span className="text-muted-foreground">{check.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget analysis */}
          {analysis.budgetAnalysis && (
            <div className="rounded-lg bg-accent/50 p-2.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">💰 Orçamento: </span>
              {analysis.budgetAnalysis}
            </div>
          )}

          {/* Tips */}
          {analysis.tips?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Sugestões:</p>
              {analysis.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TripCart;