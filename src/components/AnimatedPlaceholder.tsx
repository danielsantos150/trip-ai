import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const placeholders = [
  "Florianópolis",
  "Lisboa",
  "Buenos Aires",
  "Gramado",
  "Porto de Galinhas",
  "Santiago do Chile",
];

const AnimatedPlaceholder = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center pl-12 pr-4 pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 0.45, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
          className="text-muted-foreground text-base md:text-lg"
        >
          {placeholders[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedPlaceholder;
