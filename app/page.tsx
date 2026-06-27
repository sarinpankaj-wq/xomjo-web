"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AGENTS, CATEGORY_META } from "@/lib/agents";

const HERO_PHRASES = [
  "Declined payments.",
  "Onboarding drop-offs.",
  "Add card failures.",
  "Fraud detected.",
  "Cart abandonment.",
  "Repeat contacts.",
  "Out of hours contact.",
  "KYC verification failure.",
  "Account locked.",
  "Failed bank transfer.",
  "Direct debit failure.",
  "Passkey login failure.",
  "Chargeback filed.",
];


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay },
});

const PILLARS = [
  {
    label: "Stitch journeys",
    color: "#1ABC9C",
    bg: "#E8F8F5",
    desc: "Every signal unified — voice, chat, payments, web, SMS — into one real-time journey timeline.",
  },
  {
    label: "Orchestrate via AI",
    color: "#5E5CE6",
    bg: "#ECEBFF",
    desc: "Agents observe, decide, and act on breakdowns instantly. No rules engine. No manual intervention.",
  },
  {
    label: "Launch across 8 channels",
    color: "#E74C3C",
    bg: "#FDEDEC",
    desc: "Push, SMS, email, voice, IVR, chatbot, CRM — priority-routed, fallback-safe, fully automated.",
  },
];

const FOOTER_COLS = [
  { heading: "FinTech Agents",         links: [{ label: "StakePay Recovery", href: "/agents/payments/stakepay" }, { label: "Issuer Declines", href: "/agents/fintech" }, { label: "Passkey Drop-off", href: "/agents/fintech" }] },
  { heading: "Customer Service Agents", links: [{ label: "Churn Detector", href: "/agents/customer-service" }, { label: "Doc AI", href: "/agents/customer-service" }, { label: "Fraudulent Contact", href: "/agents/customer-service" }] },
  { heading: "Pano Studio",            links: [{ label: "Overview", href: "/pano" }, { label: "A2A Network", href: "/pano" }, { label: "Channels", href: "/pano" }] },
  { heading: "Company",                links: [{ label: "About Me", href: "/about" }, { label: "Docs", href: "https://github.com/Xomjo/finagents#readme" }, { label: "GitHub", href: "https://github.com/Xomjo/finagents" }] },
];

function HeroCycler() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_PHRASES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="block h-[1.15em] overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: "60%" }}
          animate={{ opacity: 1, y: "0%" }}
          exit={{ opacity: 0, y: "-60%" }}
          transition={{ duration: 0.38, ease: [0.32, 0, 0.18, 1] }}
          className="block"
        >
          {HERO_PHRASES[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="bg-white px-6 md:px-12 pt-16 pb-0">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div {...fadeUp(0)} className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-[#5E5CE6] bg-[#ECEBFF] px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live now · open source · zero infra required
            </span>
          </motion.div>

          <motion.h1 {...fadeUp(0.08)} className="text-4xl md:text-[60px] font-black text-[#1C1C28] leading-[1.04] tracking-tight mb-5">
            <HeroCycler />
            <span className="text-[#5E5CE6]">Recovered Autonomously.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.14)} className="text-lg text-[#8B8AA8] max-w-md mx-auto leading-relaxed mb-8">
            Context-aware AI agents that detect every breakdown across your customer journey — and recover it automatically.
          </motion.p>

          <motion.div {...fadeUp(0.2)} className="flex flex-wrap items-center justify-center gap-3 mb-14">
            <Link href="/agents/payments/stakepay"
              className="inline-flex items-center gap-2 bg-[#5E5CE6] hover:bg-[#4338CA] text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shadow-sm">
              See it recover a decline →
            </Link>
            <a href="https://github.com/Xomjo/finagents" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-gray-200 text-[#8B8AA8] font-semibold text-sm px-6 py-3.5 rounded-xl hover:border-gray-300 hover:text-[#1C1C28] transition-colors">
              ★ Star on GitHub
            </a>
          </motion.div>

        </div>
      </section>

      {/* ── PIPELINE FLOW ── */}
      <section className="bg-white px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8B8AA8] mb-3">The platform</p>
            <h2 className="text-3xl md:text-4xl font-black text-[#1C1C28]">Three steps. Every breakdown fixed.</h2>
          </motion.div>

          {/* Chevron flow */}
          <div className="flex flex-col md:flex-row items-stretch gap-0">
            {PILLARS.map((p, i) => (
              <div key={i} className="flex flex-col md:flex-row items-stretch flex-1 min-w-0">
                <motion.div {...fadeUp(i * 0.12)}
                  className="flex-1 relative border border-gray-100 rounded-2xl md:rounded-none overflow-hidden
                    md:first:rounded-l-2xl md:last:rounded-r-2xl
                    group hover:border-gray-200 transition-all duration-200"
                  style={{ borderColor: `${p.color}22` }}>
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ background: p.color }} />
                  <div className="p-8">
                    {/* Step number */}
                    <p className="text-[11px] font-black uppercase tracking-widest mb-4"
                      style={{ color: p.color }}>
                      Step 0{i + 1}
                    </p>
                    {/* Label */}
                    <h3 className="text-xl font-black text-[#1C1C28] mb-3 leading-snug">{p.label}</h3>
                    {/* Desc */}
                    <p className="text-sm text-[#8B8AA8] leading-relaxed">{p.desc}</p>
                  </div>
                  {/* Bottom color fill on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-2xl md:rounded-none"
                    style={{ background: p.bg }} />
                  {/* Content above hover fill */}
                  <div className="absolute inset-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: p.color }}>Step 0{i + 1}</p>
                    <h3 className="text-xl font-black text-[#1C1C28] mb-3 leading-snug">{p.label}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: p.color }}>
                      {p.desc}
                    </p>
                  </div>
                </motion.div>

                {/* Chevron connector */}
                {i < PILLARS.length - 1 && (
                  <div className="hidden md:flex items-center justify-center w-8 shrink-0 z-10">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M6 4l8 6-8 6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                {/* Mobile: down arrow */}
                {i < PILLARS.length - 1 && (
                  <div className="flex md:hidden items-center justify-center h-8">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 6l6 8 6-8" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENT CATALOG ── */}
      <section className="bg-gray-50 px-6 md:px-12 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp(0)} className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8B8AA8] mb-2">Agent catalog</p>
            <h2 className="text-3xl font-black text-[#1C1C28]">One platform.<br className="md:hidden" /> Every journey, covered.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {(["fintech", "customer-service"] as const).map((cat, ci) => (
              <motion.div key={cat} {...fadeUp(ci * 0.08)} className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-[#1C1C28]">{CATEGORY_META[cat].title}</h3>
                  <Link href={`/agents/${cat}`} className="text-xs font-bold text-[#5E5CE6] hover:text-[#4338CA] transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {AGENTS.filter(a => a.category === cat).map(a => (
                    <Link key={a.name} href={a.href ?? `/agents/${cat}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 transition-colors">
                      <span className="flex items-center gap-2.5 text-sm font-bold text-[#1C1C28]">
                        <span>{a.icon}</span>{a.name}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0
                        ${a.live ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                        {a.live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {a.live ? "Live" : "Coming soon"}
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GET STARTED ── */}
      <section className="bg-[#FAFAFB] border-t border-gray-100 px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full mb-4">100% open source</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1C1C28] mb-3">Running in under 30 seconds.</h2>
            <p className="text-[#8B8AA8] text-base max-w-sm mx-auto">Zero infra. Zero API keys for deterministic mode. One command to trigger a live recovery.</p>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="max-w-2xl mx-auto mb-10">
            <div className="bg-[#0d1a26] rounded-2xl overflow-hidden border border-white/[0.07] shadow-xl">
              <div className="bg-[#1a2e3f] px-4 py-2.5 flex items-center gap-2 border-b border-white/[0.06]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs text-white/30 font-mono">quick-start.sh</span>
              </div>
              <div className="px-6 py-6 font-mono text-[13px] leading-[2.1] space-y-0">
                <div className="text-white/25 text-xs mb-1"># 1 — clone</div>
                <div><span className="text-violet-400">git</span> <span className="text-blue-400">clone</span> <span className="text-emerald-400">github.com/xomjo/finagents</span> <span className="text-white/20">&amp;&amp;</span> <span className="text-violet-400">cd</span> finagents</div>
                <div className="text-white/25 text-xs mt-3 mb-1"># 2 — install</div>
                <div><span className="text-violet-400">pip</span> <span className="text-blue-400">install</span> -r requirements.txt <span className="text-white/20">&amp;&amp;</span> <span className="text-violet-400">uvicorn</span> gateway.api.main:app</div>
                <div className="text-white/25 text-xs mt-3 mb-1"># 3 — trigger a live StakePay recovery</div>
                <div><span className="text-violet-400">curl</span> -X POST localhost:<span className="text-amber-400">8000</span>/demo/stakepay</div>
                <div className="mt-2 pt-2 border-t border-white/[0.06]">
                  <span className="text-white/30">→ </span>
                  <span className="text-white/40">{"{ "}</span>
                  <span className="text-emerald-400">"status"</span><span className="text-white/30">: </span>
                  <span className="text-emerald-400">"recovered"</span>
                  <span className="text-white/30">, </span>
                  <span className="text-emerald-400">"time"</span><span className="text-white/30">: </span>
                  <span className="text-amber-400">"9.2s"</span>
                  <span className="text-white/40">{" }"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.18)} className="flex flex-wrap justify-center gap-3">
            <a href="https://github.com/Xomjo/finagents" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1C1C28] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#2d2d3d] transition-colors">
              ★ Star on GitHub
            </a>
            <Link href="/pano"
              className="inline-flex items-center gap-2 border border-gray-200 text-[#1C1C28] font-bold text-sm px-6 py-3 rounded-xl hover:border-gray-300 transition-colors">
              Open Pano Studio →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0a1621] px-6 md:px-12 pt-14 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-lg font-black text-white">XOMJO</span>
              </div>
              <p className="text-sm text-white/30 leading-relaxed max-w-[160px]">
                The open-source agent layer for fintech and customer success.
              </p>
            </div>
            {FOOTER_COLS.map((col, i) => (
              <div key={i}>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">{col.heading}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(l => (
                    <li key={l.label}>
                      {l.href.startsWith("http") ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</a>
                      ) : (
                        <Link href={l.href} className="text-sm text-white/50 hover:text-white transition-colors">{l.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-white/25">© 2026 Xomjo. All rights reserved.</p>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
              ★ Open Source · MIT License
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
