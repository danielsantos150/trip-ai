import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const SearchHero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Full background image */}
      <img
        src={heroBg}
        alt="Tropical paradise destination"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      {/* Decorative floating glass orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 backdrop-blur-3xl blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-500/10 backdrop-blur-3xl blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span className="text-sm font-medium text-white/90">Sua próxima viagem começa aqui</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4 leading-tight">
            Encontre sua{" "}
            <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              viagem ideal
            </span>
          </h1>
          <p className="text-lg text-white/60 font-body max-w-xl mx-auto">
            Diga para onde quer ir — a gente cuida do resto.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {/* Liquid glass search container */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] p-1.5">
            <SearchBar />
          </div>
          <p className="text-center text-white/40 text-sm">
            Ex: "Florianópolis", "Lisboa", "Buenos Aires"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchHero;
