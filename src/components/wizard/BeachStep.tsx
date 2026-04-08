import { useSearch } from "@/contexts/SearchContext";
import { Waves, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const BeachStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Proximidade da praia</h2>
        <p className="text-muted-foreground mt-1">
          {data.destination} é uma cidade litorânea! Quer ficar pertinho do mar?
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => updateData({ wantsBeachProximity: true })}
          className={cn(
            "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all",
            data.wantsBeachProximity === true
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Waves className={cn("w-10 h-10", data.wantsBeachProximity === true && "text-primary")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Perto da praia</p>
            <p className="text-xs mt-1 text-muted-foreground">Quero acordar ouvindo o mar</p>
          </div>
        </button>
        <button
          onClick={() => updateData({ wantsBeachProximity: false })}
          className={cn(
            "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all",
            data.wantsBeachProximity === false
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Building className={cn("w-10 h-10", data.wantsBeachProximity === false && "text-primary")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Tanto faz</p>
            <p className="text-xs mt-1 text-muted-foreground">Pode ser mais no centro</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default BeachStep;
