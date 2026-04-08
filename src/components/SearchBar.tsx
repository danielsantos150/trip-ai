import { useSearch } from "@/contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedPlaceholder from "./AnimatedPlaceholder";
import LocationAutocomplete from "./LocationAutocomplete";

const SearchBar = () => {
  const { data, updateData, resetData } = useSearch();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (data.destination.trim()) {
      const dest = data.destination;
      resetData();
      updateData({ destination: dest });
      navigate("/wizard");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-md rounded-xl p-2 md:p-2.5">
      <div className="flex items-center gap-2" onKeyDown={handleKeyDown}>
        <div className="flex-1 relative">
          <LocationAutocomplete
            value={data.destination}
            onChange={(val) => updateData({ destination: val })}
            placeholder="Para onde você quer ir?"
            icon={<Search className="w-5 h-5 text-primary" />}
            inputClassName="py-3.5 text-base md:text-lg font-body placeholder:text-transparent text-foreground"
          />
          {!data.destination && <AnimatedPlaceholder />}
        </div>
        <Button
          onClick={handleSearch}
          className="px-6 md:px-8 h-12 rounded-xl text-base font-semibold shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
