import { Plane, Clock, ArrowRight, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FlightCardProps {
  airline: string;
  airlineLogo?: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  origin: string;
  destination: string;
  departureDate?: string;
  returnDate?: string;
  bookingLink?: string;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  recommended?: boolean;
  recommendReason?: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const buildFlightAffiliateUrl = (origin: string, destination: string, partner: string, departureDate?: string) => {
  const o = encodeURIComponent(origin);
  const d = encodeURIComponent(destination);
  switch (partner) {
    case "gol":
      return `https://b2c.voegol.com.br/compra/busca-parceiros?ori=${o}&des=${d}&adt=1&chd=0&inf=0&type=RT`;
    case "azul":
      return `https://www.voeazul.com.br/br/pt/home/selecao-voo?c[0].ds=${o}&c[0].as=${d}&c[0].dt=flex&c[1].ds=${d}&c[1].as=${o}&c[1].dt=flex&p[0].t=ADT&p[0].c=1`;
    case "latam":
      return `https://www.latamairlines.com/br/pt/oferta-voos?origin=${o}&inbound=null&outbound=null&destination=${d}&adt=1&chd=0&inf=0&trip=RT&cabin=Y&redemption=false&sort=RECOMMENDED`;
    default:
      return "#";
  }
};

const FlightCard = ({ airline, airlineLogo, departure, arrival, duration, stops, price, origin, destination, departureDate, selected, onSelect, onClick, recommended, recommendReason }: FlightCardProps) => (
  <div
    className={cn(
      "relative flex flex-col bg-card rounded-xl border shadow-sm p-4 hover:shadow-md transition-all gap-3",
      selected && "ring-2 ring-primary border-primary",
      recommended && !selected && "ring-1 ring-amber-400/60 border-amber-400/40"
    )}
  >
    {recommended && (
      <div className="absolute -top-2.5 left-4 flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
        <Sparkles className="w-3 h-3" />
        {recommendReason || "Recomendado pela IA"}
      </div>
    )}

    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={onClick}>
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
          {airlineLogo ? (
            <img
              src={airlineLogo}
              alt={airline}
              className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <Plane className="w-5 h-5 text-primary" />
          )}
          {selected && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
        <span className="font-medium text-sm text-foreground">{airline}</span>
      </div>

      <div className="flex-1 flex items-center gap-4 justify-center cursor-pointer" onClick={onClick}>
        <div className="text-center">
          <p className="text-lg font-heading font-bold text-foreground">{departure}</p>
          {departureDate && (
            <p className="text-[10px] text-muted-foreground">{formatDate(departureDate)}</p>
          )}
          <p className="text-xs text-muted-foreground">{origin}</p>
        </div>
        <div className="flex flex-col items-center flex-1 max-w-[200px]">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> {duration}
          </p>
          <div className="w-full h-px bg-border relative my-1">
            <ArrowRight className="w-3 h-3 text-muted-foreground absolute right-0 -top-1.5" />
          </div>
          <Badge variant={stops === 0 ? "default" : "secondary"} className="text-[10px]">
            {stops === 0 ? "Direto" : `${stops} parada${stops > 1 ? "s" : ""}`}
          </Badge>
        </div>
        <div className="text-center">
          <p className="text-lg font-heading font-bold text-foreground">{arrival}</p>
          <p className="text-xs text-muted-foreground">{destination}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">por pessoa</p>
          <p className="text-xl font-heading font-bold text-primary">R$ {price}</p>
        </div>
        <Button
          size="sm"
          variant={selected ? "outline" : "default"}
          onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          className="shrink-0"
        >
          {selected ? "✓ Selecionado" : "Quero esse!"}
        </Button>
      </div>
    </div>

    {/* Affiliate quick-reserve links */}
    <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
      <span className="text-[10px] text-muted-foreground shrink-0">Reservar via:</span>
      {[
        { key: "gol", label: "GOL" },
        { key: "azul", label: "Azul" },
        { key: "latam", label: "LATAM" },
      ].map((p) => (
        <button
          key={p.key}
          onClick={(e) => {
            e.stopPropagation();
            window.open(buildFlightAffiliateUrl(origin, destination, p.key, departureDate), "_blank", "noopener,noreferrer");
          }}
          className="text-[10px] text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
        >
          {p.label}
        </button>
      ))}
    </div>
  </div>
);

export default FlightCard;
