import { useSearch } from "@/contexts/SearchContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiQuestion {
  id: string;
  question: string;
  type: string;
  options: string[];
  impact: string;
  filterHint: string;
}

const AiQuestionsStep = () => {
  const { data, updateData } = useSearch();
  const [questions, setQuestions] = useState<AiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(data.aiAnswers || {});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("suggest-questions", {
        body: { preferences: data, context: "wizard" },
      });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);
      setQuestions(result.questions || []);
    } catch (err: any) {
      setError(err.message || "Erro ao gerar perguntas");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    updateData({ aiAnswers: newAnswers });
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
          <Sparkles className="w-3 h-3" />
          Perguntas inteligentes
        </div>
        <h2 className="text-2xl font-heading font-bold text-foreground">Algumas perguntas extras</h2>
        <p className="text-muted-foreground mt-1">
          Com base no seu perfil, a IA preparou perguntas para refinar sua busca
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Analisando seu perfil...
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive text-center">
          ⚠️ {error}
          <button
            onClick={fetchQuestions}
            className="block mx-auto mt-2 text-xs underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && questions.length === 0 && !error && (
        <div className="rounded-xl bg-accent/50 p-6 text-center text-sm text-muted-foreground">
          <p>Tudo certo! Nenhuma pergunta adicional necessária para o seu perfil.</p>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <div className="space-y-5">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full shrink-0">
                  {q.impact === "hotel" ? "🏨" : q.impact === "flight" ? "✈️" : "🔄"}{" "}
                  {q.impact === "hotel" ? "Hotel" : q.impact === "flight" ? "Voo" : "Ambos"}
                </span>
              </div>
              <p className="font-medium text-sm text-foreground">{q.question}</p>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(q.id || `q_${idx}`, opt)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                      answers[q.id || `q_${idx}`] === opt
                        ? "border-primary bg-accent text-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && questions.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">
          Estas perguntas são opcionais. Você pode pular para os resultados a qualquer momento.
        </p>
      )}
    </div>
  );
};

export default AiQuestionsStep;
