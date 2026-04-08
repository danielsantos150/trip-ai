import { Star, MapPin, ExternalLink, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HotelCardProps {
  name: string;
  image: string;
  stars: number;
  price: number;
  location: string;
  description?: string;
  nearbyPlaces?: string[];
  rating: number;
  tags: string[];
  link?: string;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  recommended?: boolean;
  recommendReason?: string;
  destination?: string;
}

const buildAffiliateUrl = (hotelName: string, destination: string, partner: string) => {
  const q = encodeURIComponent(hotelName + " " + destination);
  switch (partner) {
    case "booking":
      return `https://www.booking.com/searchresults.pt-br.html?ss=${q}&group_adults=1&no_rooms=1`;
    case "hotels":
      return `https://www.hotels.com/search.do?q-destination=${q}`;
    case "tripadvisor":
      return `https://www.tripadvisor.com.br/Search?q=${q}`;
    default:
      return "#";
  }
};

const HotelCard = ({ name, image, stars, price, location, description, nearbyPlaces, rating, tags, selected, onSelect, onClick, recommended, recommendReason, destination = "" }: HotelCardProps) => (
  <div
    className={cn(
      "relative flex flex-col sm:flex-row bg-card rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-all group",
      selected && "ring-2 ring-primary border-primary",
      recommended && !selected && "ring-1 ring-amber-400/60 border-amber-400/40"
    )}
  >
    {recommended && (
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-amber-400 text-amber-950 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
        <Sparkles className="w-3 h-3" />
        {recommendReason || "Top pick ✨"}
      </div>
    )}

    <div className="sm:w-64 h-48 sm:h-auto shrink-0 bg-muted relative cursor-pointer" onClick={onClick}>
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/placeholder.svg";
        }}
      />
      {stars > 0 && (
        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-0.5">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
          ))}
        </div>
      )}
      {selected && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
    <div className="flex-1 p-4 flex flex-col justify-between">
      <div className="cursor-pointer" onClick={onClick}>
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground leading-tight">{name}</h3>
          {rating > 0 && (
            <div className="bg-primary text-primary-foreground text-sm font-bold px-2.5 py-1 rounded-lg shrink-0 ml-2">
              {rating}
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{description}</p>
        )}

        {(location || (nearbyPlaces && nearbyPlaces.length > 0)) && (
          <div className="mt-2 space-y-1">
            {location && (
              <div className="flex items-center gap-1.5 text-sm text-foreground/70">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {nearbyPlaces && nearbyPlaces.length > 1 && nearbyPlaces[1] !== location && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{nearbyPlaces[1]}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-end justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {(tags || []).slice(0, 3).map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {price > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground">a partir de</p>
                  <p className="text-xl font-heading font-bold text-primary">
                    R$ {price.toLocaleString("pt-BR")}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-primary font-medium text-sm">
                  <ExternalLink className="w-4 h-4" />
                  Conferir preços
                </div>
              )}
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
        <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground shrink-0">Reservar via:</span>
          {[
            { key: "booking", label: "Booking" },
            { key: "hotels", label: "Hotels.com" },
            { key: "tripadvisor", label: "TripAdvisor" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={(e) => {
                e.stopPropagation();
                window.open(buildAffiliateUrl(name, destination, p.key), "_blank", "noopener,noreferrer");
              }}
              className="text-[10px] text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default HotelCard;
