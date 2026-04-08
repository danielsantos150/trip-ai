import { useSearch } from "@/contexts/SearchContext";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const StarsStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Qual o padrão do hotel?</h2>
        <p className="text-muted-foreground mt-1">Prefere hotel de quantas estrelas?</p>
      </div>

      <div className="grid gap-3">
        {[1, 2, 3, 4, 5].map((stars) => (
          <button
            key={stars}
            onClick={() => updateData({ minStars: stars })}
            className={cn(
              "flex items-center gap-4 p-5 rounded-xl border-2 transition-all",
              data.minStars === stars
                ? "border-primary bg-accent"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div className="flex gap-0.5">
              {Array.from({ length: stars }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    data.minStars === stars ? "fill-primary text-primary" : "fill-muted-foreground/30 text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">
                {stars === 1 && "Econômico"}
                {stars === 2 && "Simples"}
                {stars === 3 && "Confortável"}
                {stars === 4 && "Superior"}
                {stars === 5 && "Luxo"}
              </p>
              <p className="text-xs text-muted-foreground">
                {stars === 1 && "O básico para dormir bem"}
                {stars === 2 && "Bom custo-benefício"}
                {stars === 3 && "Conforto e bom serviço"}
                {stars === 4 && "Experiência premium"}
                {stars === 5 && "O melhor do melhor"}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarsStep;
