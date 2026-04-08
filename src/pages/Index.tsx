import Navbar from "@/components/Navbar";
import SearchHero from "@/components/SearchHero";
import SocialProof from "@/components/SocialProof";
import DealsGrid from "@/components/DealsGrid";
import PartnersCarousel from "@/components/PartnersCarousel";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SearchHero />
      <SocialProof />
      <DealsGrid />
      <PartnersCarousel />
      <footer className="py-8 bg-foreground text-background/60 text-center text-sm">
        <p>© 2026 TripAI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
