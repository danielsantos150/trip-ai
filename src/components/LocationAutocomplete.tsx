import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NominatimResult {
  place_id: number;
  display_name: string;
  name: string;
  type: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Digite uma cidade...",
  className,
  inputClassName,
  icon,
}: LocationAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: "json",
        addressdetails: "1",
        limit: "6",
        featuretype: "city",
        "accept-language": "pt-BR",
      });

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { "User-Agent": "OnHappy/1.0" },
      });
      const data: NominatimResult[] = await res.json();

      // Filter to cities/towns and deduplicate
      const seen = new Set<string>();
      const filtered = data.filter((r) => {
        const city = r.address?.city || r.address?.town || r.address?.village || r.name;
        const state = r.address?.state || "";
        const key = `${city}-${state}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (result: NominatimResult) => {
    const city = result.address?.city || result.address?.town || result.address?.village || result.name;
    const state = result.address?.state || "";
    const country = result.address?.country || "";
    const label = state ? `${city}, ${state}` : `${city}, ${country}`;

    setQuery(label);
    onChange(label);
    setIsOpen(false);
    setResults([]);
  };

  const formatDisplay = (r: NominatimResult) => {
    const city = r.address?.city || r.address?.town || r.address?.village || r.name;
    const state = r.address?.state || "";
    const country = r.address?.country || "";
    return { city, subtitle: [state, country].filter(Boolean).join(", ") };
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            {icon}
          </div>
        )}
        <input
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-transparent outline-none text-foreground",
            icon ? "pl-12 pr-4" : "px-4",
            inputClassName
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 overflow-hidden max-h-72 overflow-y-auto">
          {results.map((r) => {
            const { city, subtitle } = formatDisplay(r);
            return (
              <button
                key={r.place_id}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{city}</p>
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                </div>
              </button>
            );
          })}
          <div className="px-4 py-1.5 bg-muted/50 text-[10px] text-muted-foreground text-center">
            Dados © OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
