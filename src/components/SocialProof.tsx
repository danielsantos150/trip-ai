import { motion } from "framer-motion";
import { Compass, Shield, Zap, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Busca inteligente",
    desc: "Encontre hospedagens e voos ideais com base nas suas preferências",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Comparação instantânea",
    desc: "Compare preços de centenas de fontes em tempo real",
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: "Recomendações personalizadas",
    desc: "Sugestões baseadas no seu perfil de viagem e orçamento",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Melhores preços garantidos",
    desc: "Transparência total nos valores, sem taxas escondidas",
  },
];

const SocialProof = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          Por que usar o TripAI?
        </h2>
        <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
          Tudo o que você precisa para planejar sua viagem em um só lugar
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-primary mb-4">
              {f.icon}
            </div>
            <h3 className="font-heading font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProof;
