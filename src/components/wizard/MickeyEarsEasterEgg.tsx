import { motion } from "framer-motion";

const DISNEY_KEYWORDS = [
  "disney", "orlando", "anaheim", "magic kingdom", "epcot",
  "hollywood studios", "animal kingdom", "disneyland", "disneylândia",
  "walt disney", "paris disney", "eurodisney", "tokyo disney", "shanghai disney",
];

export const isDisneyDestination = (destination: string) =>
  DISNEY_KEYWORDS.some((kw) => destination.toLowerCase().includes(kw));

/* --- Mickey silhouette with proper proportions --- */
const MickeyHead = ({ size, delay, rotate }: { size: number; delay: number; rotate: number }) => {
  const headR = size * 0.38;
  const earR = size * 0.26;
  const earY = headR * 0.72;
  const earX = headR * 0.78;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial={{ scale: 0, opacity: 0, rotate: rotate - 20 }}
      animate={{ scale: 1, opacity: 0.18, rotate }}
      transition={{ type: "spring", stiffness: 180, damping: 20, delay }}
      className="pointer-events-none select-none"
    >
      <g transform={`translate(${size / 2}, ${size / 2 + earR * 0.3})`}>
        {/* Left ear */}
        <circle cx={-earX} cy={-earY} r={earR} className="fill-foreground" />
        {/* Right ear */}
        <circle cx={earX} cy={-earY} r={earR} className="fill-foreground" />
        {/* Head */}
        <circle cx={0} cy={0} r={headR} className="fill-foreground" />
      </g>
    </motion.svg>
  );
};

const mickeyPositions = [
  { top: "6rem", left: "1.5rem", size: 64, delay: 0.2, rotate: -12 },
  { top: "10rem", right: "2rem", size: 50, delay: 0.6, rotate: 15 },
  { bottom: "12rem", left: "2.5rem", size: 42, delay: 1.0, rotate: -20 },
  { bottom: "6rem", right: "1.5rem", size: 56, delay: 1.4, rotate: 8 },
];

/* --- Sparkle particles --- */
const sparkles = Array.from({ length: 12 }, (_, i) => ({
  left: `${8 + Math.random() * 84}%`,
  top: `${10 + Math.random() * 80}%`,
  delay: i * 0.25,
  duration: 2.5 + Math.random() * 2,
  size: 4 + Math.random() * 6,
}));

const MickeyEarsEasterEgg = ({ destination }: { destination: string }) => {
  if (!isDisneyDestination(destination)) return null;

  return (
    <>
      {/* Mickey silhouettes */}
      {mickeyPositions.map((pos, i) => (
        <div
          key={`mickey-${i}`}
          className="fixed z-40 pointer-events-none"
          style={{
            top: pos.top,
            bottom: (pos as any).bottom,
            left: (pos as any).left,
            right: (pos as any).right,
          }}
        >
          <MickeyHead size={pos.size} delay={pos.delay} rotate={pos.rotate} />
        </div>
      ))}

      {/* Sparkle particles */}
      {sparkles.map((s, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="fixed z-40 pointer-events-none"
          style={{ left: s.left, top: s.top }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.3, 1, 0.3],
            y: [0, -10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: s.duration,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 24 24" className="text-primary">
            <path
              d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41Z"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </motion.div>
      ))}

    </>
  );
};

export default MickeyEarsEasterEgg;
