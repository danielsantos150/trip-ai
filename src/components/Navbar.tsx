import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50", !isHome && "bg-background border-b")}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className={cn(
            "w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center",
            isHome ? "bg-white/20 border border-white/30" : "bg-primary/10 border border-primary/20"
          )}>
            <Sparkles className={cn("w-5 h-5", isHome ? "text-white" : "text-primary")} />
          </div>
          <span className={cn("text-xl font-heading font-bold", isHome ? "text-white" : "text-foreground")}>
            Trip<span className={isHome ? "text-purple-200" : "text-primary"}>AI</span>
          </span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;