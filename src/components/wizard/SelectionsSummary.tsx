import { useSearch } from "@/contexts/SearchContext";
import { isDisneyDestination } from "@/components/wizard/MickeyEarsEasterEgg";
import { MapPin, Calendar, Users, Baby, Dog, Star, Plane, Wine, Waves, Building, X, Wallet, Hotel, Home, BedDouble, Palmtree, Building2 } from "lucide-react";

const accommodationLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  hotel: { label: "Hotel", icon: <Hotel className="w-3.5 h-3.5" /> },
  pousada: { label: "Pousada", icon: <Home className="w-3.5 h-3.5" /> },
  hostel: { label: "Hostel", icon: <BedDouble className="w-3.5 h-3.5" /> },
  resort: { label: "Resort", icon: <Palmtree className="w-3.5 h-3.5" /> },
  airbnb: { label: "Casa/Apto", icon: <Building2 className="w-3.5 h-3.5" /> },
};

const SelectionsSummary = () => {
  const { data } = useSearch();

  const items: { icon: React.ReactNode; label: string; value: string }[] = [];

  if (data.destination) {
    items.push({ icon: <MapPin className="w-3.5 h-3.5" />, label: "Destino", value: data.destination });
  }

  if (data.travelMonth) {
    items.push({
      icon: <Calendar className="w-3.5 h-3.5" />,
      label: "Período",
      value: `${data.travelMonth}, ${data.travelDays} dias`,
    });
  }

  if (data.isSolo) {
    items.push({ icon: <Users className="w-3.5 h-3.5" />, label: "Viajantes", value: "Viajando sozinho" });
  } else if (data.companions > 0) {
    items.push({ icon: <Users className="w-3.5 h-3.5" />, label: "Viajantes", value: `${data.companions} pessoas` });
  }

  if (data.hasBabies && data.babiesCount > 0) {
    items.push({ icon: <Baby className="w-3.5 h-3.5" />, label: "Bebês", value: `${data.babiesCount} bebê${data.babiesCount > 1 ? "s" : ""}` });
  }

  if (data.hasPet) {
    items.push({ icon: <Dog className="w-3.5 h-3.5" />, label: "Pet", value: "Sim, leva pet" });
  }

  // Budget
  if (data.budgetMax) {
    const typeLabel = data.budgetType === "per_day" ? "/dia" : " total";
    items.push({
      icon: <Wallet className="w-3.5 h-3.5" />,
      label: "Orçamento",
      value: `R$ ${data.budgetMax.toLocaleString("pt-BR")}${typeLabel}`,
    });
  }

  // Accommodation type
  if (data.accommodationType) {
    const acc = accommodationLabels[data.accommodationType];
    items.push({ icon: acc?.icon || <Hotel className="w-3.5 h-3.5" />, label: "Tipo", value: acc?.label || data.accommodationType });
  }

  // Beach
  if (data.wantsBeachProximity === true) {
    items.push({ icon: <Waves className="w-3.5 h-3.5" />, label: "Localização", value: "Perto da praia" });
  } else if (data.wantsBeachProximity === false) {
    items.push({ icon: <Building className="w-3.5 h-3.5" />, label: "Localização", value: "Tanto faz" });
  }

  // Stars
  if (data.minStars && (data.accommodationType === "hotel" || data.accommodationType === "pousada" || data.accommodationType === "resort")) {
    const labels: Record<number, string> = { 1: "Econômico", 2: "Simples", 3: "Confortável", 4: "Superior", 5: "Luxo" };
    items.push({ icon: <Star className="w-3.5 h-3.5" />, label: "Estrelas", value: `${data.minStars}★ ${labels[data.minStars]}` });
  }

  // Flights
  if (data.wantsFlights === true) {
    const timeLabels: Record<string, string> = { morning: "Manhã", afternoon: "Tarde", night: "Noite" };
    const flightInfo = data.origin ? `De ${data.origin} · ${timeLabels[data.preferredFlightTime]}` : timeLabels[data.preferredFlightTime];
    items.push({ icon: <Plane className="w-3.5 h-3.5" />, label: "Aéreo", value: flightInfo });
  } else if (data.wantsFlights === false) {
    items.push({ icon: <X className="w-3.5 h-3.5" />, label: "Aéreo", value: "Não precisa" });
  }

  // Nightlife
  if (data.likesNightlife === true) {
    items.push({ icon: <Wine className="w-3.5 h-3.5" />, label: "Noite", value: "Gosta de sair" });
  } else if (data.likesNightlife === false) {
    items.push({ icon: <Wine className="w-3.5 h-3.5" />, label: "Noite", value: "Prefere sossego" });
  }

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="bg-card rounded-xl border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suas escolhas</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <span className="text-primary">{item.icon}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {isDisneyDestination(data.destination) && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent rounded-xl border border-primary/20 px-4 py-2.5">
          <span className="text-xl">🏰</span>
          <div>
            <p className="text-sm font-bold text-foreground">✨ Destino mágico detectado!</p>
            <p className="text-xs text-muted-foreground">A magia Disney acompanha sua viagem</p>
          </div>
          <span className="text-xl ml-auto">✨</span>
        </div>
      )}
    </div>
  );
};

export default SelectionsSummary;
