import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

import imgFloripa from "@/assets/destinations/florianopolis.jpg";
import imgGramado from "@/assets/destinations/gramado.jpg";
import imgSalvador from "@/assets/destinations/salvador.jpg";
import imgRio from "@/assets/destinations/rio.jpg";
import imgNoronha from "@/assets/destinations/noronha.jpg";
import imgLisboa from "@/assets/destinations/lisboa.jpg";

const destinations = [
  {
    city: "Florianópolis",
    state: "SC",
    country: "Brasil",
    image: imgFloripa,
    tag: "🏖️ Praia",
    desc: "Praias paradisíacas e natureza exuberante",
    featured: true,
  },
  {
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    image: imgRio,
    tag: "🌆 Cidade",
    desc: "Cristo Redentor, praias e muita energia",
    featured: true,
  },
  {
    city: "Gramado",
    state: "RS",
    country: "Brasil",
    image: imgGramado,
    tag: "🏔️ Serra",
    desc: "Charme europeu na serra gaúcha",
    featured: false,
  },
  {
    city: "Salvador",
    state: "BA",
    country: "Brasil",
    image: imgSalvador,
    tag: "🎭 Cultura",
    desc: "História, cultura e culinária baiana",
    featured: false,
  },
  {
    city: "Fernando de Noronha",
    state: "PE",
    country: "Brasil",
    image: imgNoronha,
    tag: "🐢 Paraíso",
    desc: "Mergulho em águas cristalinas",
    featured: false,
  },
  {
    city: "Lisboa",
    state: "",
    country: "Portugal",
    image: imgLisboa,
    tag: "✈️ Internacional",
    desc: "Bondes, pastéis de nata e história",
    featured: false,
  },
];

const DealsGrid = () => {
  const navigate = useNavigate();
  const { updateData, resetData } = useSearch();

  const handleSelect = (city: string) => {
    resetData();
    updateData({ destination: city });
    navigate("/wizard");
  };

  // Split: 2 featured + 4 regular
  const featured = destinations.filter((d) => d.featured);
  const regular = destinations.filter((d) => !d.featured);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            Destinos populares
          </h2>
          <p className="text-muted-foreground mt-2">
            Clique em um destino para começar a planejar sua viagem
          </p>
        </div>

        {/* Featured destinations - larger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featured.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSelect(dest.city)}
              className="group cursor-pointer relative rounded-2xl overflow-hidden h-72 shadow-md hover:shadow-xl transition-shadow"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
                width={640}
                height={640}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {dest.tag}
                </span>
                <h3 className="text-2xl font-heading font-bold text-white">{dest.city}</h3>
                <div className="flex items-center gap-1.5 text-white/70 text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.state ? `${dest.state}, ${dest.country}` : dest.country}</span>
                </div>
                <p className="text-white/60 text-sm mt-1">{dest.desc}</p>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Regular destinations - smaller cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {regular.map((dest, i) => (
            <motion.div
              key={dest.city}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleSelect(dest.city)}
              className="group cursor-pointer rounded-xl overflow-hidden bg-card border shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  width={640}
                  height={640}
                />
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  {dest.tag}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-semibold text-foreground">{dest.city}</h3>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                  <MapPin className="w-3 h-3" />
                  {dest.state ? `${dest.state}, ${dest.country}` : dest.country}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{dest.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsGrid;
