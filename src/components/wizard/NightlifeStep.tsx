import { useSearch } from "@/contexts/SearchContext";
import { Wine, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const NightlifeStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Você gosta de sair à noite?</h2>
        <p className="text-muted-foreground mt-1">
          Assim conseguimos priorizar hotéis perto de bares e restaurantes
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => updateData({ likesNightlife: true })}
          className={cn(
            "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all",
            data.likesNightlife === true
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Wine className={cn("w-10 h-10", data.likesNightlife === true && "text-primary")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Com certeza!</p>
            <p className="text-xs mt-1 text-muted-foreground">Quero bares e restaurantes por perto</p>
          </div>
        </button>
        <button
          onClick={() => updateData({ likesNightlife: false })}
          className={cn(
            "flex flex-col items-center gap-3 p-8 rounded-xl border-2 transition-all",
            data.likesNightlife === false
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Moon className={cn("w-10 h-10", data.likesNightlife === false && "text-primary")} />
          <div className="text-center">
            <p className="font-semibold text-foreground">Prefiro sossego</p>
            <p className="text-xs mt-1 text-muted-foreground">Lugar tranquilo para descansar</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default NightlifeStep;
