import { useSearch } from "@/contexts/SearchContext";
import { User, Minus, Plus } from "lucide-react";
import { useEffect } from "react";

const TravelerAgesStep = () => {
  const { data, updateData } = useSearch();
  const totalTravelers = data.isSolo ? 1 : (data.companions || 1);

  // Initialize ages array if needed
  useEffect(() => {
    if (data.travelerAges.length !== totalTravelers) {
      const newAges = Array.from({ length: totalTravelers }, (_, i) =>
        data.travelerAges[i] ?? 30
      );
      updateData({ travelerAges: newAges });
    }
  }, [totalTravelers]);

  const setAge = (index: number, age: number) => {
    const newAges = [...data.travelerAges];
    newAges[index] = Math.max(0, Math.min(120, age));
    updateData({ travelerAges: newAges });
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-foreground">Idade dos viajantes</h2>
        <p className="text-muted-foreground mt-1">
          Isso nos ajuda a encontrar opções mais adequadas para o grupo
        </p>
      </div>

      <div className="space-y-3">
        {Array.from({ length: totalTravelers }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 rounded-xl border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {i === 0 ? "Você" : `Viajante ${i + 1}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(data.travelerAges[i] || 30) < 2
                    ? "Bebê"
                    : (data.travelerAges[i] || 30) < 12
                    ? "Criança"
                    : (data.travelerAges[i] || 30) < 18
                    ? "Adolescente"
                    : (data.travelerAges[i] || 30) < 60
                    ? "Adulto"
                    : "Idoso"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAge(i, (data.travelerAges[i] || 30) - 1)}
                disabled={(data.travelerAges[i] || 0) <= 0}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={data.travelerAges[i] ?? 30}
                onChange={(e) => setAge(i, parseInt(e.target.value) || 0)}
                className="w-14 text-center font-semibold text-foreground bg-transparent border rounded-lg py-1 text-sm"
                min={0}
                max={120}
              />
              <span className="text-xs text-muted-foreground">anos</span>
              <button
                onClick={() => setAge(i, (data.travelerAges[i] || 30) + 1)}
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {data.travelerAges.some((a) => a < 12) && (
        <div className="rounded-xl bg-accent/50 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">👶 Crianças detectadas</p>
          <p>Vamos priorizar opções family-friendly e com atividades para crianças.</p>
        </div>
      )}

      {data.travelerAges.some((a) => a >= 60) && (
        <div className="rounded-xl bg-accent/50 p-3 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">🧓 Idosos no grupo</p>
          <p>Buscaremos opções com acessibilidade e conforto adequados.</p>
        </div>
      )}
    </div>
  );
};

export default TravelerAgesStep;
