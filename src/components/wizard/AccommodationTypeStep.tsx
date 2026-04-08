import { useSearch, AccommodationType } from "@/contexts/SearchContext";
import { Hotel, Home, Building2, Palmtree, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

const options: { id: AccommodationType; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "hotel", label: "Hotel", desc: "Tradicional, com serviços completos", icon: <Hotel className="w-7 h-7" /> },
  { id: "pousada", label: "Pousada", desc: "Aconchegante, clima familiar", icon: <Home className="w-7 h-7" /> },
  { id: "hostel", label: "Hostel", desc: "Econômico, ideal para socializar", icon: <BedDouble className="w-7 h-7" /> },
  { id: "resort", label: "Resort", desc: "All-inclusive, lazer completo", icon: <Palmtree className="w-7 h-7" /> },
  { id: "airbnb", label: "Casa / Apartamento", desc: "Estilo Airbnb, mais privacidade", icon: <Building2 className="w-7 h-7" /> },
];

const AccommodationTypeStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Onde prefere ficar?</h2>
        <p className="text-muted-foreground mt-1">Escolha o tipo de hospedagem ideal para você</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => updateData({ accommodationType: opt.id })}
            className={cn(
              "flex items-center gap-4 p-5 rounded-xl border-2 transition-all",
              data.accommodationType === opt.id
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className={cn(
              "shrink-0",
              data.accommodationType === opt.id ? "text-primary" : "text-muted-foreground"
            )}>
              {opt.icon}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccommodationTypeStep;
