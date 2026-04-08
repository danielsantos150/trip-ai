import { Star, Plane } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface FiltersState {
  priceRange: [number, number];
  selectedStars: number[];
  sortBy: string;
  stopsFilter: "all" | "direct" | "1" | "2plus";
  airlineFilter: string[];
}

export const defaultFilters: FiltersState = {
  priceRange: [0, 10000],
  selectedStars: [],
  sortBy: "price",
  stopsFilter: "all",
  airlineFilter: [],
};

interface ResultsFiltersProps {
  type: "hotels" | "flights";
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
  availableAirlines?: string[];
  maxPrice?: number;
}

const ResultsFilters = ({ type, filters, onChange, availableAirlines = [], maxPrice = 10000 }: ResultsFiltersProps) => {
  const update = (partial: Partial<FiltersState>) => onChange({ ...filters, ...partial });

  const hotelSorts = [
    { id: "price", label: "💰 Mais barato primeiro" },
    { id: "price_desc", label: "💎 Mais caro primeiro" },
    { id: "rating", label: "⭐ Melhor avaliado" },
    { id: "stars", label: "🌟 Mais estrelas" },
  ];

  const flightSorts = [
    { id: "price", label: "💰 Mais barato primeiro" },
    { id: "duration", label: "⚡ Mais rápido" },
    { id: "departure", label: "🕐 Saída mais cedo" },
  ];

  const sorts = type === "hotels" ? hotelSorts : flightSorts;

  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">🔄 Ordenar por</p>
        <div className="flex flex-col gap-1">
          {sorts.map((s) => (
            <button
              key={s.id}
              onClick={() => update({ sortBy: s.id })}
              className={cn(
                "text-left text-sm px-3 py-2 rounded-lg transition-colors",
                filters.sortBy === s.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-sm font-medium text-foreground mb-3">💵 Faixa de preço</p>
        <Slider
          defaultValue={[0, maxPrice]}
          max={maxPrice}
          step={50}
          value={filters.priceRange}
          onValueChange={(v) => update({ priceRange: v as [number, number] })}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>R$ {filters.priceRange[0]}</span>
          <span>R$ {filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Stars (hotels only) */}
      {type === "hotels" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">⭐ Estrelas</p>
          <div className="flex gap-1.5 flex-wrap">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() =>
                  update({
                    selectedStars: filters.selectedStars.includes(s)
                      ? filters.selectedStars.filter((x) => x !== s)
                      : [...filters.selectedStars, s],
                  })
                }
                className={cn(
                  "flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                  filters.selectedStars.includes(s)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {s} <Star className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stops (flights only) */}
      {type === "flights" && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">🛬 Paradas</p>
          <div className="flex flex-col gap-1">
            {[
              { id: "all" as const, label: "Todas" },
              { id: "direct" as const, label: "Direto" },
              { id: "1" as const, label: "1 parada" },
              { id: "2plus" as const, label: "2+ paradas" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => update({ stopsFilter: opt.id })}
              className={cn(
                  "text-left text-sm px-3 py-2 rounded-lg transition-colors",
                  filters.stopsFilter === opt.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Airlines (flights only) */}
      {type === "flights" && availableAirlines.length > 0 && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">🛩️ Companhias</p>
          <div className="flex flex-col gap-1">
            {availableAirlines.map((airline) => (
              <button
                key={airline}
                onClick={() =>
                  update({
                    airlineFilter: filters.airlineFilter.includes(airline)
                      ? filters.airlineFilter.filter((a) => a !== airline)
                      : [...filters.airlineFilter, airline],
                  })
                }
              className={cn(
                  "flex items-center gap-2 text-left text-sm px-3 py-2 rounded-lg transition-colors",
                  filters.airlineFilter.includes(airline)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Plane className="w-3.5 h-3.5" />
                {airline}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => onChange({ ...defaultFilters, priceRange: [0, maxPrice] })}
        className="w-full text-sm text-muted-foreground hover:text-foreground py-2 border border-border rounded-lg transition-colors"
      >
        🧹 Limpar filtros
      </button>
    </div>
  );
};

export default ResultsFilters;
