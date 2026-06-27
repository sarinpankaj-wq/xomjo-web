"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { AGENTS, CATEGORY_META, AgentCategory } from "@/lib/agents";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay },
});

export default function AgentCategoryPage({ category }: { category: AgentCategory }) {
  const meta = CATEGORY_META[category];
  const agents = AGENTS.filter(a => a.category === category);

  return (
    <div className="px-6 md:px-12 py-20">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B8AA8] mb-2">Agent catalog</p>
          <h1 className="text-4xl font-black text-[#1C1C28] mb-3">{meta.title}</h1>
          <p className="text-[#8B8AA8] text-base max-w-lg mx-auto leading-relaxed">{meta.tagline}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((a, i) => {
            const card = (
              <motion.div {...fadeUp(i * 0.06)}
                className="rounded-2xl p-6 border border-gray-100 bg-white transition-shadow hover:shadow-md h-full">
                <div className="text-2xl mb-3">{a.icon}</div>
                <div className="text-base font-black text-[#1C1C28] mb-1.5">{a.name}</div>
                <p className="text-sm text-[#8B8AA8] leading-relaxed mb-4">{a.desc}</p>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full
                  ${a.live ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  {a.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {a.live ? "Live" : "Coming soon"}
                </span>
              </motion.div>
            );
            return a.href ? (
              <Link key={a.name} href={a.href} className="block">{card}</Link>
            ) : (
              <div key={a.name}>{card}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
