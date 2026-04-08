import { useSearch, BudgetType } from "@/contexts/SearchContext";
import { Wallet, CalendarDays, Briefcase } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const BudgetStep = () => {
  const { data, updateData } = useSearch();

  const budgetTypes: { id: BudgetType; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: "per_day", label: "Por dia", desc: "Valor máximo por diária", icon: <CalendarDays className="w-6 h-6" /> },
    { id: "total", label: "Total da viagem", desc: "Orçamento total para hospedagem", icon: <Briefcase className="w-6 h-6" /> },
  ];

  const budgetType = data.budgetType || "per_day";
  const budgetMax = data.budgetMax ?? 500;
  const maxSlider = budgetType === "per_day" ? 2000 : 20000;
  const step = budgetType === "per_day" ? 50 : 500;

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Qual seu orçamento?</h2>
        <p className="text-muted-foreground mt-1">Defina um teto para a hospedagem</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {budgetTypes.map((bt) => (
          <button
            key={bt.id}
            onClick={() => updateData({ budgetType: bt.id, budgetMax: bt.id === "per_day" ? 500 : 5000 })}
            className={cn(
              "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
              budgetType === bt.id
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/30"
            )}
          >
            <div className={cn(budgetType === bt.id && "text-primary")}>{bt.icon}</div>
            <div className="text-center">
              <span className="font-semibold text-foreground text-sm">{bt.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{bt.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Valor máximo {budgetType === "per_day" ? "por dia" : "total"}
          </label>
          <div className="flex items-center gap-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-lg font-heading font-bold text-foreground">
              R$ {budgetMax.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>
        <Slider
          value={[budgetMax]}
          onValueChange={(v) => updateData({ budgetMax: v[0] })}
          max={maxSlider}
          min={budgetType === "per_day" ? 50 : 500}
          step={step}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>R$ {budgetType === "per_day" ? "50" : "500"}</span>
          <span>R$ {maxSlider.toLocaleString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
};

export default BudgetStep;
