import React, { createContext, useContext, useState, ReactNode } from "react";

export type FlightTime = "morning" | "afternoon" | "night";
export type BudgetType = "per_day" | "total";
export type AccommodationType = "hotel" | "hostel" | "pousada" | "resort" | "airbnb";
export type FareClass = "economy" | "premium_economy" | "business" | "first";
export type BaggagePreference = "carry_on" | "checked_1" | "checked_2";

interface SearchData {
  destination: string;
  // Step 1 - Período
  travelMonth: string;
  travelDays: number;
  // Step 2 - Companhia
  isSolo: boolean;
  companions: number;
  hasBabies: boolean;
  babiesCount: number;
  hasPet: boolean;
  // Step 2b - Idades
  travelerAges: number[];
  // Step 3 - Orçamento
  budgetType: BudgetType;
  budgetMax: number;
  // Step 4 - Tipo de hospedagem
  accommodationType: AccommodationType;
  // Step 5 - Praia (condicional)
  isCoastalCity: boolean;
  wantsBeachProximity: boolean | null;
  // Step 6 - Hotel estrelas
  minStars: number;
  // Step 7 - Aéreo
  wantsFlights: boolean | null;
  origin: string;
  preferredFlightTime: FlightTime;
  fareClass: FareClass;
  baggagePreference: BaggagePreference;
  // Step 8 - Vida noturna
  likesNightlife: boolean | null;
  // AI dynamic answers
  aiAnswers: Record<string, string>;
}

interface SearchContextType {
  data: SearchData;
  updateData: (partial: Partial<SearchData>) => void;
  resetData: () => void;
  currentWizardStep: number;
  setCurrentWizardStep: (step: number) => void;
}

const defaultData: SearchData = {
  destination: "",
  travelMonth: "",
  travelDays: 7,
  isSolo: false,
  companions: 1,
  hasBabies: false,
  babiesCount: 0,
  hasPet: false,
  travelerAges: [],
  budgetType: "per_day",
  budgetMax: 500,
  accommodationType: "hotel",
  isCoastalCity: false,
  wantsBeachProximity: null,
  minStars: 3,
  wantsFlights: null,
  origin: "",
  preferredFlightTime: "morning",
  fareClass: "economy",
  baggagePreference: "carry_on",
  likesNightlife: null,
  aiAnswers: {},
};

const SearchContext = createContext<SearchContextType | null>(null);

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SearchData>(defaultData);
  const [currentWizardStep, setCurrentWizardStep] = useState(0);

  const updateData = (partial: Partial<SearchData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const resetData = () => {
    setData(defaultData);
    setCurrentWizardStep(0);
  };

  return (
    <SearchContext.Provider
      value={{ data, updateData, resetData, currentWizardStep, setCurrentWizardStep }}
    >
      {children}
    </SearchContext.Provider>
  );
};
