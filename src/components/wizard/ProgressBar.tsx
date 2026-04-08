import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

const ProgressBar = ({ currentStep, totalSteps, labels }: ProgressBarProps) => (
  <div className="w-full max-w-2xl mx-auto mb-8">
    <div className="flex items-center justify-between">
      {labels.map((label, i) => (
        <div key={i} className="flex flex-col items-center flex-1">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div className={cn("h-0.5 flex-1 transition-colors", i <= currentStep ? "bg-primary" : "bg-border")} />
            )}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all shrink-0",
                i < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div className={cn("h-0.5 flex-1 transition-colors", i < currentStep ? "bg-primary" : "bg-border")} />
            )}
          </div>
          <span className={cn("text-xs mt-2 text-center hidden sm:block", i === currentStep ? "text-foreground font-medium" : "text-muted-foreground")}>
            {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default ProgressBar;
