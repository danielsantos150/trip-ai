import { useSearch } from "@/contexts/SearchContext";
import { Calendar, TrendingDown, TrendingUp, Minus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const months = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const dayOptions = [3, 5, 7, 10, 14, 21, 30];

interface MonthInfo {
  season: "baixa" | "media" | "alta";
  tip: string;
}

interface SeasonData {
  months: Record<string, MonthInfo>;
  bestMonth: string;
  insight: string;
}

const seasonConfig = {
  baixa: {
    icon: TrendingDown,
    label: "Baixa",
    border: "border-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    ring: "ring-emerald-400/30",
  },
  media: {
    icon: Minus,
    label: "Média",
    border: "border-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    ring: "ring-amber-400/30",
  },
  alta: {
    icon: TrendingUp,
    label: "Alta",
    border: "border-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    text: "text-rose-700 dark:text-rose-300",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
    ring: "ring-rose-400/30",
  },
};

const PeriodStep = () => {
  const { data, updateData } = useSearch();
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(false);

  const hasChild = data.travelerAges.some((age) => age < 12);
  const schoolVacationMonths = ["Janeiro", "Fevereiro", "Julho", "Dezembro"];

  useEffect(() => {
    if (!data.destination) return;
    setLoading(true);

    supabase.functions
      .invoke("analyze-seasons", {
        body: { destination: data.destination },
      })
      .then(({ data: result, error }) => {
        if (!error && result?.months) {
          setSeasonData(result as SeasonData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [data.destination]);

  // Pre-select a school vacation month if there's a child and no month selected yet
  useEffect(() => {
    if (hasChild && !data.travelMonth) {
      updateData({ travelMonth: "Julho" });
    }
  }, [hasChild]);

  const getMonthInfo = (month: string): MonthInfo | null => {
    return seasonData?.months?.[month] || null;
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Quando você quer ir? ✈️</h2>
        <p className="text-muted-foreground mt-1">
          Destino: <span className="font-medium text-foreground">{data.destination}</span>
        </p>
      </div>

      {/* Season insight banner */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-muted/50 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analisando temporadas para {data.destination}...
        </div>
      )}

      {/* Child vacation suggestion */}
      {hasChild && !loading && (
        <div className="flex items-start gap-3 py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
          <span className="text-lg shrink-0">🎒</span>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Viajando com criança!</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Pré-selecionamos <strong>Julho</strong> por ser férias escolares. Outros meses de férias: Jan, Fev e Dez (destacados com 🎒).
            </p>
          </div>
        </div>
      )}

      {seasonData?.insight && !loading && (
        <div className="flex items-start gap-3 py-3 px-4 rounded-xl bg-primary/5 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Dica da IA</p>
            <p className="text-sm text-muted-foreground">{seasonData.insight}</p>
            {seasonData.bestMonth && (
              <p className="text-xs text-primary mt-1 font-medium">
                🏆 Melhor mês: {seasonData.bestMonth}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      {seasonData && !loading && (
        <div className="flex items-center justify-center gap-4 text-xs">
          {(["baixa", "media", "alta"] as const).map((s) => {
            const cfg = seasonConfig[s];
            const Icon = cfg.icon;
            return (
              <div key={s} className={cn("flex items-center gap-1 px-2 py-1 rounded-full", cfg.badge)}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <label className="text-sm font-medium text-foreground">Mês da viagem</label>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {months.map((month) => {
            const info = getMonthInfo(month);
            const cfg = info ? seasonConfig[info.season] : null;
            const isSelected = data.travelMonth === month;
            const isBest = seasonData?.bestMonth === month;
            const isSchoolVacation = hasChild && schoolVacationMonths.includes(month);

            return (
              <button
                key={month}
                onClick={() => updateData({ travelMonth: month })}
                className={cn(
                  "relative py-2.5 rounded-lg text-sm font-medium transition-all border-2",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md border-primary ring-2 ring-primary/30"
                    : cfg
                      ? cn(cfg.bg, cfg.text, cfg.border, "hover:ring-2", cfg.ring)
                      : "bg-muted text-muted-foreground border-transparent hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {isBest && !isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs">🏆</span>
                )}
                {isSchoolVacation && !isBest && !isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 text-xs">🎒</span>
                )}
                <span className="block">{month}</span>
                {info && !isSelected && (
                  <span className="block text-[10px] mt-0.5 opacity-80 truncate px-1">
                    {isSchoolVacation ? "🎒 Férias escolares" : info.tip}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Por quantos dias?</label>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((d) => (
            <button
              key={d}
              onClick={() => updateData({ travelDays: d })}
              className={cn(
                "px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                data.travelDays === d
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {d} dias
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeriodStep;
