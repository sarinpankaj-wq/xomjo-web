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

export default function AgentsPage() {
  const categories: AgentCategory[] = ["fintech", "customer-service"];

  return (
    <div className="px-6 md:px-12 py-20">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B8AA8] mb-2">Agent catalog</p>
          <h1 className="text-4xl font-black text-[#1C1C28] mb-3">Agents</h1>
          <p className="text-[#8B8AA8] text-base max-w-lg mx-auto leading-relaxed">
            Context-aware AI agents for payments and customer success — live, open source, and ready to deploy.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          {categories.map((cat, ci) => (
            <motion.div key={cat} {...fadeUp(ci * 0.08)}>
              <h2 className="text-lg font-black text-[#1C1C28] mb-4">{CATEGORY_META[cat].title}</h2>
              <div className="space-y-3">
                {AGENTS.filter(a => a.category === cat).map(a => {
                  const card = (
                    <div className="rounded-2xl p-5 border border-gray-100 bg-white transition-shadow hover:shadow-md">
                      <div className="text-xl mb-2.5">{a.icon}</div>
                      <div className="text-sm font-black text-[#1C1C28] mb-1.5">{a.name}</div>
                      <p className="text-xs text-[#8B8AA8] leading-relaxed mb-3">{a.desc}</p>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full
                        ${a.live ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {a.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {a.live ? "Live" : "Coming soon"}
                      </span>
                    </div>
                  );
                  return a.href ? (
                    <Link key={a.name} href={a.href} className="block">{card}</Link>
                  ) : (
                    <div key={a.name}>{card}</div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
