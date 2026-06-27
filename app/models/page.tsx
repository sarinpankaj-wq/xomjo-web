"use client";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay },
});

export default function ModelsPage() {
  return (
    <div className="px-6 md:px-12 py-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div {...fadeUp(0)}>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B8AA8] mb-2">Models</p>
          <h1 className="text-4xl font-black text-[#1C1C28] mb-4">Bring your own model.</h1>
          <p className="text-[#8B8AA8] text-base max-w-lg mx-auto leading-relaxed">
            Xomjo agents run in deterministic mode out of the box — zero API keys required.
            Plug in any LLM provider for reasoning-heavy agent behavior. Details coming soon.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
