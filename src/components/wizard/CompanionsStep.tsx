import { useSearch } from "@/contexts/SearchContext";
import { User, Users, Baby, Dog, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CompanionsStep = () => {
  const { data, updateData } = useSearch();

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Vai sozinho?</h2>
        <p className="text-muted-foreground mt-1">Conte para a gente quem vai com você</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => updateData({ isSolo: true, companions: 0 })}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
            data.isSolo
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <User className={cn("w-8 h-8", data.isSolo && "text-primary")} />
          <span className="font-semibold text-foreground">Vou sozinho</span>
        </button>
        <button
          onClick={() => updateData({ isSolo: false, companions: data.companions || 2 })}
          className={cn(
            "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
            !data.isSolo
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/30"
          )}
        >
          <Users className={cn("w-8 h-8", !data.isSolo && "text-primary")} />
          <span className="font-semibold text-foreground">Com companhia</span>
        </button>
      </div>

      {!data.isSolo && (
        <div className="space-y-3 animate-fade-in">
          <Counter
            icon={<Users className="w-5 h-5" />}
            label="Quantas pessoas no total?"
            sub="Incluindo você"
            value={data.companions}
            onChange={(v) => updateData({ companions: v })}
            min={2}
          />

          <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">Vai ter bebê na viagem?</p>
                  <p className="text-xs text-muted-foreground">Menores de 2 anos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateData({ hasBabies: false, babiesCount: 0 })}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    !data.hasBabies ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  Não
                </button>
                <button
                  onClick={() => updateData({ hasBabies: true, babiesCount: data.babiesCount || 1 })}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    data.hasBabies ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  Sim
                </button>
              </div>
            </div>
            {data.hasBabies && (
              <div className="mt-3 pt-3 border-t animate-fade-in">
                <Counter
                  icon={<Baby className="w-5 h-5" />}
                  label="Quantos bebês?"
                  sub=""
                  value={data.babiesCount}
                  onChange={(v) => updateData({ babiesCount: v })}
                  min={1}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dog className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm text-foreground">Vai levar pet?</p>
              <p className="text-xs text-muted-foreground">Filtraremos opções pet-friendly</p>
            </div>
          </div>
          <button
            onClick={() => updateData({ hasPet: !data.hasPet })}
            className={cn(
              "w-12 h-6 rounded-full transition-colors relative",
              data.hasPet ? "bg-primary" : "bg-muted"
            )}
          >
            <div className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform", data.hasPet ? "translate-x-6" : "translate-x-0.5")} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Counter = ({ icon, label, sub, value, onChange, min = 0 }: {
  icon: React.ReactNode; label: string; sub: string; value: number; onChange: (v: number) => void; min?: number;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="font-medium text-sm text-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors">
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-6 text-center font-semibold text-foreground">{value}</span>
      <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default CompanionsStep;
