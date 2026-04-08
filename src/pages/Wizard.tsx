import { useSearch } from "@/contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import ProgressBar from "@/components/wizard/ProgressBar";
import SelectionsSummary from "@/components/wizard/SelectionsSummary";
import PeriodStep from "@/components/wizard/PeriodStep";
import CompanionsStep from "@/components/wizard/CompanionsStep";
import TravelerAgesStep from "@/components/wizard/TravelerAgesStep";
import BudgetStep from "@/components/wizard/BudgetStep";
import AccommodationTypeStep from "@/components/wizard/AccommodationTypeStep";
import BeachStep from "@/components/wizard/BeachStep";
import StarsStep from "@/components/wizard/StarsStep";
import FlightsStep from "@/components/wizard/FlightsStep";
import NightlifeStep from "@/components/wizard/NightlifeStep";
import AiQuestionsStep from "@/components/wizard/AiQuestionsStep";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

const Wizard = () => {
  const { data, updateData, currentWizardStep, setCurrentWizardStep } = useSearch();
  const navigate = useNavigate();
  const coastalChecked = useRef(false);

  // Detect if destination is coastal on mount
  useEffect(() => {
    if (!data.destination || coastalChecked.current) return;
    coastalChecked.current = true;

    supabase.functions.invoke("detect-coastal", {
      body: { destination: data.destination },
    }).then(({ data: result }) => {
      if (result?.isCoastal) {
        updateData({ isCoastalCity: true });
      }
    }).catch(() => {
      // Silent fail — beach step just won't show
    });
  }, [data.destination]);

  const steps: { component: React.ReactNode; label: string }[] = [
    { component: <PeriodStep />, label: "Período" },
    { component: <CompanionsStep />, label: "Companhia" },
    { component: <TravelerAgesStep />, label: "Idades" },
    { component: <BudgetStep />, label: "Orçamento" },
    { component: <AccommodationTypeStep />, label: "Hospedagem" },
    ...(data.isCoastalCity ? [{ component: <BeachStep />, label: "Praia" }] : []),
    ...(data.accommodationType === "hotel" || data.accommodationType === "pousada" || data.accommodationType === "resort"
      ? [{ component: <StarsStep />, label: "Estrelas" }]
      : []),
    { component: <FlightsStep />, label: "Aéreo" },
    { component: <NightlifeStep />, label: "Noite" },
    { component: <AiQuestionsStep />, label: "IA" },
  ];

  const labels = steps.map((s) => s.label);

  const next = () => {
    if (currentWizardStep < steps.length - 1) {
      setCurrentWizardStep(currentWizardStep + 1);
    } else {
      navigate("/results");
    }
  };

  const prev = () => {
    if (currentWizardStep > 0) setCurrentWizardStep(currentWizardStep - 1);
    else navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 pt-20 pb-16 max-w-3xl">
        <button
          onClick={prev}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentWizardStep > 0 ? `Voltar para ${labels[currentWizardStep - 1]}` : "Voltar para busca"}
        </button>

        <ProgressBar currentStep={currentWizardStep} totalSteps={steps.length} labels={labels} />

        <div className="mb-6">
          <SelectionsSummary />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentWizardStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentWizardStep]?.component}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 max-w-lg mx-auto">
          <Button variant="outline" onClick={prev} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button onClick={next} className="gap-2">
            {currentWizardStep < steps.length - 1 ? "Próximo" : "Buscar resultados"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Skip button - visible from step 1 (after period) */}
        {currentWizardStep >= 1 && currentWizardStep < steps.length - 1 && (
          <div className="text-center mt-4 max-w-lg mx-auto">
            <button
              onClick={() => navigate("/results")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Pular e ver resultados direto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wizard;
