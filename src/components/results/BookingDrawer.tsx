import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Plane, Clock, ExternalLink, Calendar, Users, ArrowRight } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";

interface BookingDrawerProps {
  open: boolean;
  onClose: () => void;
  type: "hotel" | "flight";
  item: any;
}

const BookingDrawer = ({ open, onClose, type, item }: BookingDrawerProps) => {
  const { data } = useSearch();

  if (!item) return null;

  // Build external booking links
  const buildHotelLinks = () => {
    const q = encodeURIComponent(item.name + " " + (data.destination || ""));
    return [
      {
        name: "Google Hotels",
        url: item.link || `https://www.google.com/travel/hotels?q=${q}`,
        color: "bg-blue-600",
      },
      {
        name: "Booking.com",
        url: `https://www.booking.com/searchresults.html?ss=${q}`,
        color: "bg-blue-800",
      },
      {
        name: "Trivago",
        url: `https://www.trivago.com.br/pt-BR/srl?search=${q}`,
        color: "bg-teal-600",
      },
      {
        name: "Hotels.com",
        url: `https://www.hotels.com/search.do?q-destination=${q}`,
        color: "bg-red-600",
      },
    ];
  };

  const buildFlightLinks = () => {
    const origin = item.origin || "";
    const dest = item.destination || "";
    const date = item.departureDate || "";
    return [
      {
        name: "Google Flights",
        url: item.bookingLink || `https://www.google.com/travel/flights?q=flights+${origin}+to+${dest}`,
        color: "bg-blue-600",
      },
      {
        name: "Decolar",
        url: `https://www.decolar.com/shop/flights/results/oneway/${origin}/${dest}/${date}/1/0/0`,
        color: "bg-purple-600",
      },
      {
        name: "KAYAK",
        url: `https://www.kayak.com.br/flights/${origin}-${dest}/${date}`,
        color: "bg-orange-600",
      },
      {
        name: "Skyscanner",
        url: `https://www.skyscanner.com.br/transport/flights/${origin.toLowerCase()}/${dest.toLowerCase()}/${date?.replace(/-/g, "")}`,
        color: "bg-cyan-600",
      },
    ];
  };

  const links = type === "hotel" ? buildHotelLinks() : buildFlightLinks();

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left pb-4">
          <SheetTitle className="font-heading text-xl">
            {type === "hotel" ? "Reservar hospedagem" : "Reservar voo"}
          </SheetTitle>
        </SheetHeader>

        {/* Item summary */}
        <div className="space-y-6">
          {type === "hotel" ? (
            <div className="rounded-xl border overflow-hidden">
              {item.image && (
                <div className="h-48 bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{item.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: item.stars || 0 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-primary/70 text-primary/70" />
                    ))}
                    {item.rating > 0 && (
                      <Badge className="ml-2 text-xs">{item.rating}</Badge>
                    )}
                  </div>
                </div>
                {item.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" /> {item.location}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {data.travelMonth || "Flexível"}, {data.travelDays} dias</span>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {data.isSolo ? "1" : data.companions} pessoa(s)</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">a partir de</p>
                  <p className="text-2xl font-heading font-bold text-primary">R$ {item.price}<span className="text-sm font-normal text-muted-foreground">/noite</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border p-4 space-y-4">
              <div className="flex items-center gap-3">
                {item.airlineLogo && (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <img src={item.airlineLogo} alt={item.airline} className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{item.airline}</h3>
                  <Badge variant={item.stops === 0 ? "default" : "secondary"} className="text-xs">
                    {item.stops === 0 ? "Direto" : `${item.stops} parada(s)`}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-xl font-heading font-bold text-foreground">{item.departure}</p>
                  <p className="text-xs text-muted-foreground">{item.origin}</p>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-heading font-bold text-foreground">{item.arrival}</p>
                  <p className="text-xs text-muted-foreground">{item.destination}</p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">a partir de</p>
                <p className="text-2xl font-heading font-bold text-primary">R$ {item.price}</p>
              </div>
            </div>
          )}

          {/* Booking links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-foreground text-sm">
              Reserve nas plataformas parceiras
            </h4>
            <p className="text-xs text-muted-foreground">
              Clique para ser redirecionado e finalizar sua reserva
            </p>
            <div className="grid gap-2">
              {links.map((link) => (
                <Button
                  key={link.name}
                  variant="outline"
                  className="w-full justify-between h-12 text-sm"
                  onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
                >
                  <span className="font-medium">{link.name}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </Button>
              ))}
            </div>
          </div>

          {/* Itinerary hint */}
          <div className="rounded-xl bg-accent/50 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Dica de roteiro</p>
            <p>
              {type === "hotel"
                ? `Você pode reservar ${item.name} por ${data.travelDays} noites em ${data.travelMonth || "data flexível"}. Compare os preços nas plataformas acima para encontrar a melhor oferta!`
                : `Voo ${item.stops === 0 ? "direto" : `com ${item.stops} parada(s)`} de ${item.origin} para ${item.destination} com duração de ${item.duration}. Verifique disponibilidade e preços atualizados nos links acima.`
              }
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BookingDrawer;
