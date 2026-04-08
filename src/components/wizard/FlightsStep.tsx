import { useSearch, FlightTime, FareClass, BaggagePreference } from "@/contexts/SearchContext";
import { Plane, Sun, Sunset, Moon, Briefcase, Package, Luggage } from "lucide-react";
import { cn } from "@/lib/utils";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const timeOptions: { id: FlightTime; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "morning", label: "Manhã", desc: "6h - 12h", icon: <Sun className="w-6 h-6" /> },
  { id: "afternoon", label: "Tarde", desc: "12h - 18h", icon: <Sunset className="w-6 h-6" /> },
  { id: "night", label: "Noite", desc: "18h - 6h", icon: <Moon className="w-6 h-6" /> },
];

const fareOptions: { id: FareClass; label: string; desc: string }[] = [
  { id: "economy", label: "Econômica", desc: "Melhor custo-benefício" },
  { id: "premium_economy", label: "Premium Economy", desc: "Mais espaço e conforto" },
  { id: "business", label: "Executiva", desc: "Conforto premium" },
  { id: "first", label: "Primeira Classe", desc: "Experiência top" },
];

const baggageOptions: { id: BaggagePreference; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: "carry_on", label: "Só bagagem de mão", desc: "Mais econômico", icon: <Briefcase className="w-5 h-5" /> },
  { id: "checked_1", label: "1 mala despachada", desc: "23kg por pessoa", icon: <Package className="w-5 h-5" /> },
  { id: "checked_2", label: "2 malas despachadas", desc: "2x 23kg por pessoa", icon: <Luggage className="w-5 h-5" /> },
];

const FlightsStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Vai querer aéreo também?</h2>
        <p className="text-muted-foreground mt-1">Podemos buscar passagens para {data.destination}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => updateData({ wantsFlights: true })}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
            data.wantsFlights === true
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Plane className={cn("w-8 h-8", data.wantsFlights === true && "text-primary")} />
          <span className="font-semibold text-foreground">Sim, quero!</span>
        </button>
        <button
          onClick={() => updateData({ wantsFlights: false, origin: "" })}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
            data.wantsFlights === false
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <span className="text-3xl">🚗</span>
          <span className="font-semibold text-foreground">Não precisa</span>
        </button>
      </div>

      {data.wantsFlights && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">De onde você sai?</label>
            <div className="border rounded-lg">
              <LocationAutocomplete
                value={data.origin}
                onChange={(val) => updateData({ origin: val })}
                placeholder="São Paulo, Belo Horizonte..."
                icon={<Plane className="w-4 h-4" />}
                inputClassName="py-3 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Qual horário prefere voar?</label>
            <div className="grid grid-cols-3 gap-3">
              {timeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateData({ preferredFlightTime: opt.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    data.preferredFlightTime === opt.id
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <div className={cn(data.preferredFlightTime === opt.id && "text-primary")}>{opt.icon}</div>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fare Class */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Classe tarifária preferida</label>
            <div className="grid grid-cols-2 gap-2">
              {fareOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateData({ fareClass: opt.id })}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left",
                    data.fareClass === opt.id
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Baggage */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Bagagem</label>
            <div className="space-y-2">
              {baggageOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateData({ baggagePreference: opt.id })}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                    data.baggagePreference === opt.id
                      ? "border-primary bg-accent"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className={cn(data.baggagePreference === opt.id ? "text-primary" : "text-muted-foreground")}>
                    {opt.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightsStep;
