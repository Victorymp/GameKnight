import { motion, type Variants } from "framer-motion";
import { PixelGlyph } from "./PixelStyle";

const dotVariants: Variants = {
  jump: {
    y: -30,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
};

function Dot() {
  return (
    <motion.div
      className="w-5 h-5 rounded-full will-change-transform"
      variants={dotVariants}
    >
    <PixelGlyph
        name={"square"}
        size={20}
        className="relative"
      />
    </motion.div>
  );
}



export default function LoadingThreeDotsJumping() {
  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="flex justify-center items-center gap-2.5"
    >
      <Dot />
      <Dot />
      <Dot />
    </motion.div>
  );
}