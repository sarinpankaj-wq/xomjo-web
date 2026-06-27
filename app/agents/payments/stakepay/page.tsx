"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Zap, Search, Lock, CheckCircle, Bell,
  ChevronLeft, AlertCircle, KeyRound, ChevronDown,
  Eye, EyeOff, Shield, CreditCard, Wallet,
  CheckCheck, Timer, Activity, Sparkles, X,
} from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface LogMessage {
  type: string; action?: string; detail?: string;
  tool?: string; status?: string; timestamp?: string;
}

type ScreenKind = "intercepted" | "scanning" | "paysheet" | "executed" | "monitoring" | "resolved";

interface JourneyStep {
  id: string; label: string; icon: React.ReactNode;
  detail: string; timestamp: string;
  status: "pending" | "active" | "done";
  screen: ScreenKind;
}

type Mode = "deterministic" | "gemini" | "anthropic";

/* ─── Modes ──────────────────────────────────────────────────────────────── */
const MODES: { value: Mode; label: string; description: string }[] = [
  { value: "deterministic", label: "Deterministic",    description: "Scripted — no API key needed" },
  { value: "gemini",        label: "Gemini 2.0 Flash", description: "Live AI via your Gemini key" },
  { value: "anthropic",     label: "Anthropic Claude", description: "Live AI via your Anthropic key" },
];

const JOURNEY_TEMPLATE: Pick<JourneyStep, "id" | "label" | "icon" | "screen">[] = [
  { id: "SPAWN",   label: "Spawn",   icon: <Zap className="w-3.5 h-3.5" />,        screen: "intercepted" },
  { id: "OBSERVE", label: "Observe", icon: <Search className="w-3.5 h-3.5" />,     screen: "intercepted" },
  { id: "ORIENT",  label: "Orient",  icon: <Activity className="w-3.5 h-3.5" />,   screen: "scanning"    },
  { id: "DECIDE",  label: "Decide",  icon: <Sparkles className="w-3.5 h-3.5" />,   screen: "paysheet"    },
  { id: "ACT",     label: "Act",     icon: <Lock className="w-3.5 h-3.5" />,       screen: "executed"    },
  { id: "MONITOR", label: "Monitor", icon: <Timer className="w-3.5 h-3.5" />,      screen: "monitoring"  },
  { id: "RESOLVE", label: "Resolve", icon: <CheckCheck className="w-3.5 h-3.5" />, screen: "resolved"    },
];

const STATUS_TO_STEP: Record<string, string> = {
  SPAWNING: "SPAWN", OBSERVING: "OBSERVE", ORIENTING: "ORIENT",
  DECIDING: "DECIDE", ACTING: "ACT", MONITORING: "MONITOR",
  RESOLVED: "RESOLVE", EXECUTED: "RESOLVE",
};

/* ─── Financial apps for scan screen ────────────────────────────────────── */
const STAKE_APPS = [
  { id: "bofa",   label: "Bank of\nAmerica", color: "#B22222", abbr: "BofA",  selected: true  },
  { id: "schwab", label: "Schwab\n401K",     color: "#006BB6", abbr: "SCH",   selected: true  },
  { id: "rh",     label: "Robinhood",        color: "#00C805", abbr: "RH",    selected: true  },
  { id: "chase",  label: "Chase",            color: "#117ACA", abbr: "Chase", selected: false },
  { id: "fid",    label: "Fidelity",         color: "#155E3B", abbr: "F",     selected: false },
  { id: "vg",     label: "Vanguard",         color: "#730000", abbr: "VG",    selected: false },
  { id: "etrade", label: "E*Trade",          color: "#6B2D8B", abbr: "ET",    selected: false },
  { id: "td",     label: "TD Ameri-\ntrade", color: "#3E7C17", abbr: "TDA",   selected: false },
  { id: "cb",     label: "Coinbase",         color: "#0052FF", abbr: "CB",    selected: false },
];

/* ════════════════════════════════════════════════════════════════════════════
   PHONE SCREENS
   ════════════════════════════════════════════════════════════════════════════ */

/* ── 1. INTERCEPTED ─────────────────────────────────────────────────────── */
function InterceptedScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"warning" | "agent">("warning");
  const ref = useRef(false);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("agent"), 4000);
    const t2 = setTimeout(() => { if (!ref.current) { ref.current = true; onDone(); } }, 11000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col px-5 pt-[74px] pb-8"
      style={{ background: "linear-gradient(170deg, #1a0505 0%, #2d0909 40%, #1a0505 100%)" }}>

      {/* Big warning icon */}
      <div className="flex flex-col items-center mb-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ repeat: phase === "warning" ? Infinity : 0, duration: 2 }}
          className="w-20 h-20 rounded-[28px] bg-red-600/20 border-2 border-red-500/40 flex items-center justify-center mb-4">
          <span className="text-5xl">⚠️</span>
        </motion.div>
        <p className="text-red-400 text-[11px] font-bold uppercase tracking-widest mb-1">Payment Intercepted</p>
        <p className="text-white text-[22px] font-black text-center leading-tight">Code 51 · ShopNow</p>
      </div>

      {/* Transaction card */}
      <div className="rounded-2xl mb-3 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,80,80,0.25)" }}>
        <div className="h-0.5 bg-gradient-to-r from-red-600 to-red-400" />
        <div className="px-4 py-4 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">Amount</span>
            <span className="text-white text-xl font-black">$164.98</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">Merchant</span>
            <span className="text-white text-sm font-semibold">ShopNow</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">Decline reason</span>
            <span className="text-red-300 text-sm font-semibold">Insufficient funds</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50 text-xs">Time</span>
            <span className="text-white/70 text-sm">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      {/* Agent card */}
      <AnimatePresence>
        {phase === "agent" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.3)" }}>
            <div className="h-0.5 bg-gradient-to-r from-blue-600 to-blue-400" />
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#1B4F72] flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-0.5">StakePay Agent</p>
                <p className="text-white text-sm font-bold">Recovery Initiated</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="dot-pulse"><span /><span /><span /></div>
                  <span className="text-white/40 text-[11px]">Scanning stake assets…</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── 2. SCAN SCREEN ─────────────────────────────────────────────────────── */
function ScanScreen({ onDone }: { onDone: () => void }) {
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [identified, setIdentified] = useState(false);
  const ref = useRef(false);

  useEffect(() => {
    const ids = STAKE_APPS.filter(a => a.selected).map(a => a.id);
    const timers = [
      setTimeout(() => setTapped(new Set([ids[0]])),             2500),
      setTimeout(() => setTapped(new Set([ids[0], ids[1]])),     5000),
      setTimeout(() => setTapped(new Set(ids)),                  7500),
      setTimeout(() => setIdentified(true),                      9000),
      setTimeout(() => { if (!ref.current) { ref.current = true; onDone(); } }, 13000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col pt-[74px] pb-6"
      style={{ background: "linear-gradient(160deg, #050d18 0%, #0c1e33 50%, #050d18 100%)" }}>

      {/* Scan sweep */}
      {!identified && (
        <motion.div animate={{ y: [0, 380, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute left-4 right-4 h-px z-50 pointer-events-none"
          style={{ top: "80px", background: "linear-gradient(90deg,transparent,rgba(59,130,246,0.9),transparent)", boxShadow: "0 0 10px rgba(59,130,246,0.7)" }} />
      )}

      {/* Header */}
      <div className="text-center px-5 mb-5">
        <div className="flex items-center justify-center gap-2.5 mb-1">
          {!identified
            ? <motion.div animate={{ rotate: [0,360] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            : <CheckCircle className="w-4 h-4 text-green-400" />}
          <p className="text-white text-[14px] font-bold">
            {identified ? "Stakes Identified ✓" : "Searching Stake Candidates…"}
          </p>
        </div>
        <p className="text-white/35 text-[11px]">
          {identified ? "3 pre-authorized assets ranked" : "Scanning connected financial apps"}
        </p>
      </div>

      {/* App grid */}
      <div className="flex-1 px-5">
        <div className="grid grid-cols-3 gap-3">
          {STAKE_APPS.map((app, i) => {
            const isTapped = tapped.has(app.id);
            return (
              <motion.div key={app.id} initial={{ opacity: 0, scale: 0.65 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1, type: "spring", damping: 16, stiffness: 260 }}
                className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  <motion.div
                    animate={isTapped ? { scale: [1, 0.8, 1.1, 1] } : {}}
                    transition={{ duration: 0.45 }}
                    className="w-[54px] h-[54px] rounded-[15px] flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: app.selected ? app.color : `${app.color}44`,
                      opacity: app.selected ? 1 : 0.3,
                      border: isTapped ? "2px solid #22c55e" : "2px solid transparent",
                      boxShadow: isTapped ? `0 0 20px ${app.color}80, 0 0 8px rgba(34,197,94,0.5)` : app.selected ? `0 4px 16px ${app.color}50` : "none",
                      transition: "border 0.2s, box-shadow 0.3s",
                    }}>
                    <span className="text-white text-[11px] font-black text-center px-1 leading-tight">{app.abbr}</span>
                    {isTapped && (
                      <motion.div initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 2.8, opacity: 0 }}
                        transition={{ duration: 0.55 }}
                        className="absolute inset-0 rounded-[15px] bg-green-400" />
                    )}
                  </motion.div>
                  <AnimatePresence>
                    {isTapped && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 400, delay: 0.18 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-black z-10">
                        <CheckCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className={`text-[9px] text-center leading-tight whitespace-pre-line transition-all duration-500
                  ${isTapped ? "text-green-400 font-bold" : app.selected ? "text-white/70" : "text-white/20"}`}>
                  {app.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Stake Identified banner */}
      <div className="px-5" style={{ minHeight: 88 }}>
        <AnimatePresence>
          {identified && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.93 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(24px)", border: "1px solid rgba(34,197,94,0.45)", boxShadow: "0 0 28px rgba(34,197,94,0.2)" }}>
              <div className="h-0.5 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="flex items-start gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-[12px] bg-green-600 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-bold">Stake Identified ✓</p>
                  <p className="text-white/55 text-[11px] mt-0.5">Bank of America · Schwab 401K · Robinhood</p>
                  <p className="text-green-400 text-[10px] mt-1 font-semibold">$4,200 total pre-authorized</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── 3. APPLE PAY SHEET (DECIDE) ─────────────────────────────────────────── */
function PaySheet({ onDone, fee = "$4.99" }: { onDone: () => void; fee?: string }) {
  const [phase, setPhase] = useState<"sheet" | "faceid" | "confirmed">("sheet");
  const ref = useRef(false);
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("faceid"),    4500);
    const t2 = setTimeout(() => setPhase("confirmed"), 7000);
    const t3 = setTimeout(() => { if (!ref.current) { ref.current = true; onDone(); } }, 11000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 z-40"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 240, mass: 1.1 }}
        className="absolute bottom-0 left-0 right-0 rounded-t-[32px] overflow-hidden"
        style={{ background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pb-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 mt-2">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">StakePay Recovery</p>
              <p className="text-white text-[19px] font-black">Confirm Hold</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1B4F72] flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Merchant */}
          <div className="flex items-center gap-3 mb-3 rounded-2xl px-4 py-3"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-black">SN</span>
            </div>
            <div>
              <p className="text-white text-sm font-bold">ShopNow</p>
              <p className="text-white/35 text-[11px]">Payment Recovery · Code 51</p>
            </div>
          </div>

          {/* Fee breakdown */}
          <div className="rounded-2xl px-4 py-4 mb-4 flex flex-col gap-3"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            {(() => {
              const feeNum = parseFloat(fee.replace("$","")) || 4.99;
              const total = (164.98 + feeNum).toFixed(2);
              const rows: ({ label: string; value: string; highlight: boolean; tag?: string; bold?: boolean } | null)[] = [
                { label: "Transaction amount",   value: "$164.98",    highlight: false },
                null,
                { label: "StakePay service fee", value: fee,          highlight: true, tag: "ONE-TIME" },
                null,
                { label: "Total guaranteed",     value: `$${total}`,  highlight: false, bold: true },
              ];
              return rows.map((row, i) =>
              row === null
                ? <div key={i} className="h-px bg-white/10" />
                : (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[12px] ${row.bold ? "text-white font-bold" : "text-white/55"}`}>{row.label}</span>
                      {row.tag && (
                        <span className="text-[9px] bg-blue-500/25 text-blue-300 px-1.5 py-0.5 rounded-full font-bold">{row.tag}</span>
                      )}
                    </div>
                    <span className={`font-black ${row.highlight ? "text-blue-300 text-[15px]" : row.bold ? "text-white text-[17px]" : "text-white text-[13px]"}`}>
                      {row.value}
                    </span>
                  </div>
                )
              );
            })()}
          </div>

          {/* Asset */}
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="w-9 h-9 rounded-xl bg-[#B22222] flex items-center justify-center shrink-0">
              <span className="text-white text-[9px] font-black">BofA</span>
            </div>
            <div className="flex-1">
              <p className="text-white/40 text-[10px] uppercase tracking-wide">Stake asset · 72-hour hold</p>
              <p className="text-white text-[12px] font-semibold">Bank of America Checking ···4521</p>
            </div>
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          </div>

          {/* Auth button */}
          <AnimatePresence mode="wait">
            {phase === "sheet" && (
              <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="h-[52px] rounded-2xl flex items-center justify-center gap-2"
                style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="dot-pulse"><span /><span /><span /></div>
                <span className="text-white/35 text-sm">Awaiting authorization…</span>
              </motion.div>
            )}
            {phase === "faceid" && (
              <motion.div key="fi" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2.5">
                <p className="text-white/40 text-[11px]">Authorize with</p>
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0px rgba(255,255,255,0.15)","0 0 0 10px rgba(255,255,255,0.06)","0 0 0 0px rgba(255,255,255,0)"] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="w-16 h-16 rounded-2xl border-2 border-white/35 flex items-center justify-center">
                  <div className="relative w-9 h-9">
                    {[["top-0 left-0","border-t-2 border-l-2"],["top-0 right-0","border-t-2 border-r-2"],
                      ["bottom-0 left-0","border-b-2 border-l-2"],["bottom-0 right-0","border-b-2 border-r-2"]
                    ].map(([p,c],i) => <div key={i} className={`absolute w-3 h-3 ${p} ${c} border-white rounded-sm`} />)}
                    <motion.div animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-1 flex flex-col items-center justify-center gap-1">
                      <div className="flex gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>
                      <div className="w-3.5 h-0.5 rounded-full bg-white/60" />
                    </motion.div>
                  </div>
                </motion.div>
                <p className="text-white font-semibold text-sm">Face ID</p>
              </motion.div>
            )}
            {phase === "confirmed" && (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 320 }}
                className="h-[52px] rounded-2xl bg-green-500 flex items-center justify-center gap-2.5">
                <CheckCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                <span className="text-white font-bold text-sm">Confirmed · $164.98 + {fee} fee</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-white/18 text-[10px] text-center mt-3 leading-relaxed">
            No charge unless unresolved after 72 hrs · Hold releases automatically on payment
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 4. EXECUTED (ACT) ──────────────────────────────────────────────────── */
function ExecutedScreen({ onDone }: { onDone: () => void }) {
  const [rows, setRows] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    const timers = [
      setTimeout(() => setRows(1), 2000),
      setTimeout(() => setRows(2), 4500),
      setTimeout(() => setRows(3), 7000),
      setTimeout(() => { if (!ref.current) { ref.current = true; onDone(); } }, 12000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const deadline = new Date(Date.now() + 72 * 3600 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const ROWS = [
    {
      icon: <Lock className="w-5 h-5 text-white" />,
      iconBg: "bg-violet-600", accent: "rgba(139,92,246,0.25)", border: "rgba(139,92,246,0.35)",
      label: "HOLD PLACED", title: "Bank of America ···4521",
      rows: [
        { k: "Amount",   v: "$164.98" },
        { k: "Status",   v: "Active", vClass: "text-green-400" },
        { k: "Expires",  v: deadline },
        { k: "Hold ID",  v: "HLD-4F8A2C1D" },
      ]
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-white" />,
      iconBg: "bg-emerald-600", accent: "rgba(16,185,129,0.2)", border: "rgba(16,185,129,0.3)",
      label: "MERCHANT CONFIRMED", title: "ShopNow",
      rows: [
        { k: "Status",    v: "Guaranteed ✓", vClass: "text-green-400" },
        { k: "Token",     v: "GTK-9B3F..." },
        { k: "Action",    v: "Order will ship" },
      ]
    },
    {
      icon: <Bell className="w-5 h-5 text-white" />,
      iconBg: "bg-amber-500", accent: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.28)",
      label: "CUSTOMER NOTIFIED", title: "Push · SMS · Email",
      rows: [
        { k: "Channel",  v: "Push notification" },
        { k: "Window",   v: "72 hours to resolve" },
        { k: "Link",     v: "xomjo.com/resolve" },
      ]
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col pt-[74px] pb-6 px-4 overflow-hidden"
      style={{ background: "linear-gradient(165deg, #050f05 0%, #0a1f0a 50%, #050f05 100%)" }}>

      {/* Header */}
      <div className="flex flex-col items-center mb-5">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 300, delay: 0.3 }}
          className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center mb-3">
          <CheckCheck className="w-8 h-8 text-green-400" strokeWidth={2.5} />
        </motion.div>
        <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Recovery Executed</p>
        <p className="text-white text-[20px] font-black">3 Actions Complete</p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {ROWS.map((row, i) => (
          <AnimatePresence key={i}>
            {rows > i && (
              <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", damping: 22, stiffness: 240 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: row.accent, border: `1px solid ${row.border}` }}>
                <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: row.border }}>
                  <div className={`w-9 h-9 rounded-xl ${row.iconBg} flex items-center justify-center shrink-0`}>
                    {row.icon}
                  </div>
                  <div>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{row.label}</p>
                    <p className="text-white text-[13px] font-bold">{row.title}</p>
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}
                    className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCheck className="w-3 h-3 text-white" strokeWidth={3} />
                  </motion.div>
                </div>
                <div className="px-4 py-3 flex flex-col gap-1.5">
                  {row.rows.map(r => (
                    <div key={r.k} className="flex justify-between">
                      <span className="text-white/40 text-[11px]">{r.k}</span>
                      <span className={`text-[11px] font-semibold ${(r as { vClass?: string }).vClass || "text-white/80"}`}>{r.v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </motion.div>
  );
}

/* ── 5. MONITORING ──────────────────────────────────────────────────────── */
function MonitoringScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    // Animate progress bar filling up slowly (showing 0h of 72h elapsed)
    const prog = setTimeout(() => setProgress(2), 800); // just started — almost 0% used
    const done = setTimeout(() => { if (!ref.current) { ref.current = true; onDone(); } }, 11000);
    return () => { clearTimeout(prog); clearTimeout(done); };
  }, [onDone]);

  const milestones = [
    { label: "Now",  sublabel: "Hold active",      done: true,    pct: 0   },
    { label: "36h",  sublabel: "Reminder fires",   done: false,   pct: 50  },
    { label: "65h",  sublabel: "Final warning",    done: false,   pct: 90  },
    { label: "72h",  sublabel: "Auto-execute",     done: false,   pct: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-40 flex flex-col pt-[74px] pb-6 px-5"
      style={{ background: "linear-gradient(165deg, #0d0a00 0%, #1f1800 50%, #0d0a00 100%)" }}>

      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/35 flex items-center justify-center mb-3">
          <Timer className="w-8 h-8 text-amber-400" />
        </motion.div>
        <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Monitoring Active</p>
        <p className="text-white text-[20px] font-black">72-Hour Window</p>
        <p className="text-white/35 text-[11px] mt-1">Hold active on Bank of America ···4521</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-white/40 text-[10px]">0h elapsed</span>
          <span className="text-white/40 text-[10px]">72h deadline</span>
        </div>
        <div className="h-3 rounded-full bg-white/8 overflow-hidden">
          <motion.div initial={{ width: "0%" }} animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
            style={{ boxShadow: "0 0 10px rgba(251,191,36,0.5)" }} />
        </div>
        {/* Milestone ticks */}
        <div className="flex justify-between mt-1.5">
          {["0h","36h","65h","72h"].map(t => (
            <span key={t} className="text-white/25 text-[9px]">{t}</span>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-0 mb-5">
        {milestones.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.25, type: "spring", damping: 22 }}
            className="flex gap-3 items-start">
            <div className="flex flex-col items-center w-6 shrink-0">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${m.done ? "bg-amber-500 border-amber-400" : "bg-transparent border-white/20"}`}>
                {m.done && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              {i < milestones.length - 1 && (
                <div className="w-px flex-1 my-1 bg-white/10" style={{ minHeight: 22 }} />
              )}
            </div>
            <div className="pb-4">
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-bold ${m.done ? "text-amber-300" : "text-white/40"}`}>{m.label}</span>
                {m.done && <span className="text-[9px] bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>}
              </div>
              <p className="text-white/35 text-[11px]">{m.sublabel}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hold details */}
      <div className="rounded-2xl px-4 py-3 mt-auto"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(251,191,36,0.2)" }}>
        <div className="flex justify-between mb-1.5">
          <span className="text-white/40 text-[11px]">Hold ID</span>
          <span className="text-white/70 text-[11px] font-mono">HLD-4F8A2C1D</span>
        </div>
        <div className="flex justify-between mb-1.5">
          <span className="text-white/40 text-[11px]">Asset</span>
          <span className="text-white/70 text-[11px]">BofA Checking ···4521</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/40 text-[11px]">Amount at risk</span>
          <span className="text-amber-300 text-[11px] font-bold">$164.98</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ── 6. RESOLVED ────────────────────────────────────────────────────────── */
function ResolvedScreen({ agentId }: { agentId: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center pt-[74px] pb-8 px-5 text-center"
      style={{ background: "linear-gradient(165deg, #011208 0%, #012518 50%, #011208 100%)" }}>

      {/* Particle-like glow rings */}
      {[1.6,2.2,2.9].map((s,i) => (
        <motion.div key={i}
          animate={{ scale: [1, s], opacity: [0.25, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.8, ease: "easeOut" }}
          className="absolute w-24 h-24 rounded-full border border-emerald-400/40"
          style={{ top: "50%", left: "50%", transform: "translate(-50%,-50%)", marginTop: "-40px" }} />
      ))}

      {/* Big checkmark */}
      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 280, delay: 0.3 }}
        className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center mb-5 relative z-10">
        <CheckCheck className="w-12 h-12 text-emerald-400" strokeWidth={2} />
      </motion.div>

      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-1">
        Mission Complete
      </motion.p>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
        className="text-white text-[24px] font-black mb-6 leading-tight">
        Payment<br />Guaranteed 🎉
      </motion.p>

      {/* Summary card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
        className="w-full rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(16,185,129,0.3)" }}>
        <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-green-400" />
        <div className="px-4 py-4 flex flex-col gap-2.5">
          {[
            { k: "Amount secured", v: "$164.98", vClass: "text-emerald-300 font-black text-[15px]" },
            { k: "Merchant",       v: "ShopNow — order active" },
            { k: "StakePay fee",   v: "$4.99 charged" },
            { k: "Hold asset",     v: "BofA ···4521 — releasing" },
          ].map(r => (
            <div key={r.k} className="flex justify-between">
              <span className="text-white/40 text-[11px]">{r.k}</span>
              <span className={`text-[11px] font-semibold ${(r as { vClass?: string }).vClass || "text-white/75"}`}>{r.v}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Journey token */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        className="mt-4 text-center">
        <p className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Journey Token</p>
        <p className="text-emerald-500/60 text-[11px] font-mono">{agentId || "AGT-DEMO"}</p>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   iPHONE SHELL
   ════════════════════════════════════════════════════════════════════════════ */
function IPhoneMockup({
  screen, isRunning, agentId, onScreenDone, fee,
}: {
  screen: ScreenKind | null;
  isRunning: boolean;
  agentId: string;
  onScreenDone: () => void;
  fee: string;
}) {
  const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="flex justify-center select-none">
      <div className="relative w-[278px] flex-shrink-0"
        style={{ filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.45))" }}>

        {/* Buttons */}
        <div className="absolute -left-[5px] top-[68px]  w-[4px] h-[20px] bg-[#48484A] rounded-l-sm" />
        <div className="absolute -left-[5px] top-[100px] w-[4px] h-[38px] bg-[#48484A] rounded-l-sm" />
        <div className="absolute -left-[5px] top-[148px] w-[4px] h-[38px] bg-[#48484A] rounded-l-sm" />
        <div className="absolute -right-[5px] top-[110px] w-[4px] h-[56px] bg-[#48484A] rounded-r-sm" />

        {/* Body */}
        <div className="rounded-[46px] p-[10px]" style={{
          background: "linear-gradient(145deg, #3A3A3C 0%, #1C1C1E 35%, #2C2C2E 70%, #1C1C1E 100%)",
          border: "1.5px solid #48484A",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
        }}>
          <div className="rounded-[38px] overflow-hidden" style={{ height: "590px", position: "relative" }}>

            {/* Default wallpaper */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(165deg, #050d18 0%, #0d1f35 30%, #091929 60%, #040d18 100%)" }} />
            {[...Array(22)].map((_,i) => (
              <div key={i} className="absolute rounded-full bg-white" style={{
                width: i%3===0?2:1, height: i%3===0?2:1,
                top:`${8+(i*31)%75}%`, left:`${5+(i*43)%90}%`,
                opacity: 0.07+(i%5)*0.04,
              }} />
            ))}

            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-1.5"
              style={{ width:"108px", height:"34px", background:"#000", borderRadius:"20px" }}>
              {isRunning && (
                <>
                  <motion.div animate={{ scale:[1,1.5,1], opacity:[0.5,1,0.5] }}
                    transition={{ repeat:Infinity, duration:1.3 }}
                    className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[9px] text-green-400 font-bold tracking-widest">LIVE</span>
                </>
              )}
            </div>

            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-7"
              style={{ paddingTop:"50px", paddingBottom:"6px" }}>
              <span className="text-white text-[12px] font-semibold">{timeStr}</span>
              <div className="flex items-center gap-1.5 text-white">
                <div className="flex gap-[2px] items-end">
                  {[3,5,7,9].map(h => <div key={h} className="w-[3px] rounded-sm bg-white opacity-80" style={{height:h}} />)}
                </div>
                <span className="text-[10px] font-semibold opacity-80">5G</span>
                <div className="w-6 h-[13px] rounded-[3px] border border-white/70 flex items-center px-[2px]">
                  <div className="h-[7px] w-3/4 bg-green-400 rounded-[1px]" />
                </div>
              </div>
            </div>

            {/* Idle lock screen */}
            {!screen && (
              <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }}
                className="absolute left-0 right-0 z-10 text-center" style={{ top:"82px" }}>
                <p className="text-white font-thin leading-none" style={{ fontSize:"64px", letterSpacing:"-2px" }}>{timeStr}</p>
                <p className="text-white/40 text-sm mt-2">
                  {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
                </p>
                {!isRunning && (
                  <motion.div className="mt-14 flex flex-col items-center gap-2"
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
                    <Zap className="w-7 h-7 text-yellow-400/30" />
                    <p className="text-white/18 text-xs px-8 leading-relaxed text-center">
                      Trigger above · or tap any step →
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Screen router */}
            <AnimatePresence mode="wait">
              {screen === "intercepted" && <InterceptedScreen key="intercepted" onDone={onScreenDone} />}
              {screen === "scanning"    && <ScanScreen        key="scanning"    onDone={onScreenDone} />}
              {screen === "paysheet"    && <PaySheet          key="paysheet"    onDone={onScreenDone} fee={fee} />}
              {screen === "executed"    && <ExecutedScreen    key="executed"    onDone={onScreenDone} />}
              {screen === "monitoring"  && <MonitoringScreen  key="monitoring"  onDone={onScreenDone} />}
              {screen === "resolved"    && <ResolvedScreen    key="resolved"    agentId={agentId}     />}
            </AnimatePresence>

            {/* Home indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] rounded-full bg-white/20 z-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   JOURNEY MAP
   ════════════════════════════════════════════════════════════════════════════ */
function JourneyMap({
  steps, onStepClick, pinnedId,
}: {
  steps: JourneyStep[];
  onStepClick: (s: JourneyStep) => void;
  pinnedId: string | null;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-[#1B4F72] flex items-center justify-center">
          <Activity className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="font-bold text-[#1B4F72] text-sm uppercase tracking-wide">Agent Journey</h3>
        <span className="text-[10px] text-gray-400 ml-auto font-mono bg-gray-100 px-2 py-0.5 rounded-full">Tap any step</span>
      </div>

      {steps.map((step, i) => {
        const isLast   = i === steps.length - 1;
        const isDone   = step.status === "done";
        const isActive = step.status === "active";
        const canClick = isDone || isActive;
        const isPinned = pinnedId === step.id;

        return (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center w-8 shrink-0">
              <motion.button type="button" disabled={!canClick}
                onClick={() => canClick && onStepClick(step)}
                animate={isActive && !isPinned
                  ? { scale:[1,1.18,1], boxShadow:["0 0 0 0px rgba(46,134,193,0.3)","0 0 0 8px rgba(46,134,193,0.15)","0 0 0 0px rgba(46,134,193,0)"] }
                  : {}}
                whileHover={canClick ? { scale:1.12 } : {}}
                whileTap={canClick ? { scale:0.88 } : {}}
                transition={{ repeat: isActive && !isPinned ? Infinity : 0, duration: 1.5 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300
                  ${isDone   ? "bg-[#2E86C1] text-white shadow-md" : ""}
                  ${isActive ? "bg-[#1B4F72] text-white ring-2 ring-[#2E86C1] ring-offset-1" : ""}
                  ${step.status==="pending" ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "cursor-pointer"}
                  ${isPinned ? "ring-4 ring-yellow-400 ring-offset-1 scale-110" : ""}`}>
                {isDone ? <CheckCheck className="w-3.5 h-3.5" /> : step.icon}
              </motion.button>
              {!isLast && (
                <div className="relative w-[2px] flex-1 my-1 bg-gray-200 rounded-full overflow-hidden" style={{minHeight:36}}>
                  <motion.div initial={{height:"0%"}} animate={{height: isDone?"100%":"0%"}}
                    transition={{duration:0.7,ease:"easeOut"}}
                    className="absolute top-0 left-0 w-full bg-[#2E86C1] rounded-full" />
                </div>
              )}
            </div>

            <motion.button type="button" disabled={!canClick}
              onClick={() => canClick && onStepClick(step)}
              whileHover={canClick ? {x:3} : {}}
              transition={{type:"spring",stiffness:400,damping:25}}
              className={`flex-1 min-w-0 text-left ${isLast?"pb-0":"pb-5"} ${canClick?"cursor-pointer":"cursor-default"}`}>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-sm font-bold transition-colors duration-300
                  ${isDone||isActive ? "text-[#1B4F72]" : "text-gray-300"}`}>{step.label}</span>
                {isActive && !isPinned && (
                  <motion.span initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}}
                    className="text-[9px] bg-[#2E86C1] text-white px-1.5 py-0.5 rounded-full font-bold tracking-wider">LIVE</motion.span>
                )}
                {isPinned && (
                  <motion.span initial={{opacity:0}} animate={{opacity:1}}
                    className="text-[9px] bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-bold tracking-wider">PREVIEW</motion.span>
                )}
                {step.timestamp && !isPinned && (
                  <span className="text-[10px] text-gray-400 ml-auto font-mono">{step.timestamp}</span>
                )}
              </div>
              <AnimatePresence>
                {step.detail && (
                  <motion.p key="d" initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                    className="text-xs text-gray-500 mt-0.5 leading-relaxed pr-2 overflow-hidden">
                    {step.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════════════════ */
export default function StakePayDemo() {
  const [studioFee, setStudioFee] = useState("$4.99");

  useEffect(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("xomjo_stakepay_config") || "{}");
      if (cfg.fee) setStudioFee(cfg.fee);
    } catch {}
  }, []);

  // Single phone screen state
  const [phoneScreen,  setPhoneScreen]  = useState<ScreenKind | null>(null);
  const [pinnedStepId, setPinnedStepId] = useState<string | null>(null);
  const screenQueueRef  = useRef<ScreenKind[]>([]);
  const screenActiveRef = useRef(false);
  const pinTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>(
    JOURNEY_TEMPLATE.map(t => ({ ...t, detail:"", timestamp:"", status:"pending" as const }))
  );
  const [isRunning, setIsRunning] = useState(false);
  const [agentId,   setAgentId]   = useState("");
  const [isDone,    setIsDone]    = useState(false);
  const [error,     setError]     = useState("");
  const [mode,      setMode]      = useState<Mode>("deterministic");
  const [apiKey,    setApiKey]    = useState("");
  const [showKey,   setShowKey]   = useState(false);
  const [modeOpen,  setModeOpen]  = useState(false);

  const selectedMode = MODES.find(m => m.value === mode)!;

  useEffect(() => {
    if (!modeOpen) return;
    const h = () => setModeOpen(false);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [modeOpen]);

  // Screen queue drain — only show resolved if it's in queue (never auto-dismiss)
  const drainScreen = useCallback(() => {
    if (screenActiveRef.current) return;
    const next = screenQueueRef.current.shift();
    if (!next) return;
    screenActiveRef.current = true;
    setPinnedStepId(null);
    setPhoneScreen(next);
  }, []);

  function enqueueScreen(s: ScreenKind) {
    screenQueueRef.current.push(s);
    drainScreen();
  }

  // Called by each screen when its own timer finishes
  const handleScreenDone = useCallback(() => {
    setPhoneScreen(prev => (prev === "resolved" ? prev : null)); // resolved stays
    setTimeout(() => {
      screenActiveRef.current = false;
      drainScreen();
    }, 700);
  }, [drainScreen]);

  // Step click: immediately show that screen (pinned)
  function handleStepClick(step: JourneyStep) {
    if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
    screenActiveRef.current = true;
    screenQueueRef.current  = []; // clear pending queue
    setPhoneScreen(step.screen);
    setPinnedStepId(step.id);
    // Auto-unpin after screen's natural duration (long fallback)
    const dur = step.screen === "paysheet" ? 13000 : step.screen === "scanning" ? 15000 : step.screen === "resolved" ? 999999 : 14000;
    pinTimerRef.current = setTimeout(() => {
      setPinnedStepId(null);
      setPhoneScreen(null);
      setTimeout(() => { screenActiveRef.current = false; drainScreen(); }, 600);
    }, dur);
  }

  function advanceJourney(status: string, detail: string) {
    const stepId = STATUS_TO_STEP[status];
    if (!stepId) return;
    setJourneySteps(prev => prev.map(s => {
      const idx = JOURNEY_TEMPLATE.findIndex(t => t.id === s.id);
      const tgt = JOURNEY_TEMPLATE.findIndex(t => t.id === stepId);
      if (s.id === stepId) return { ...s, status:"active", detail: detail.slice(0,88),
        timestamp: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}) };
      if (idx < tgt) return { ...s, status:"done" };
      return s;
    }));
  }

  async function triggerDemo() {
    if (mode !== "deterministic" && !apiKey.trim()) { setError(`Enter your ${selectedMode.label} API key.`); return; }
    if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
    screenQueueRef.current  = [];
    screenActiveRef.current = false;
    setPhoneScreen(null); setPinnedStepId(null);
    setIsRunning(true); setIsDone(false); setError(""); setAgentId("");
    setJourneySteps(JOURNEY_TEMPLATE.map(t => ({ ...t, detail:"", timestamp:"", status:"pending" as const })));

    try {
      const params = new URLSearchParams({ mode });
      if (apiKey.trim()) params.set("api_key", apiKey.trim());
      const res  = await fetch(`${API_BASE}/demo/stakepay?${params}`);
      const data = await res.json();
      setAgentId(data.agent_id);

      const es = new EventSource(`${API_BASE}/stream/${data.agent_id}`);
      es.onmessage = (e) => {
        const msg: LogMessage = JSON.parse(e.data);
        if (msg.type === "done")  { setIsRunning(false); setIsDone(true); es.close(); return; }
        if (msg.type === "log" || msg.type === "complete") {
          if (msg.status) advanceJourney(msg.status, msg.detail || "");
          const a = msg.action || "";
          if (a === "SPAWN")                  enqueueScreen("intercepted");
          if (a === "TOOL:query_stake_stack") enqueueScreen("scanning");
          if (a === "DECIDE")                 enqueueScreen("paysheet");
          if (a === "TOOL:place_asset_hold")  enqueueScreen("executed");
          if (a === "TOOL:check_resolution_status") enqueueScreen("monitoring");
          if (a === "COMPLETE")               enqueueScreen("resolved");
        }
        if (msg.type === "error") { setError(msg.detail || "Agent error"); setIsRunning(false); es.close(); }
      };
      es.onerror = () => { setIsRunning(false); es.close(); };
    } catch {
      setError("Could not connect to backend. Is it running on port 8000?");
      setIsRunning(false);
    }
  }

  const modeColors: Record<Mode,string> = {
    deterministic: "text-green-700 bg-green-50 border-green-300",
    gemini:        "text-blue-700  bg-blue-50  border-blue-300",
    anthropic:     "text-purple-700 bg-purple-50 border-purple-300",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
        <Link href="/" className="flex items-center gap-1 text-sm text-[#2E86C1] hover:underline mb-5">
          <ChevronLeft className="w-4 h-4" /> All Agents
        </Link>
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-yellow-50 rounded-xl"><Zap className="w-7 h-7 text-yellow-500" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-[#1B4F72]">StakePay Recovery Agent</h1>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">● LIVE</Badge>
              <Link href="/pano"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] bg-[#ECEBFF] hover:bg-[#ddd9ff] px-2.5 py-1 rounded-full transition-colors">
                ⚙ Configured in Pano
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Payments · OODA Loop · Watch the agent think in real time</p>
          </div>
        </div>
      </motion.div>

      {/* Trigger */}
      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="mb-5">
        <Card className="p-4 bg-gradient-to-r from-[#1B4F72] to-[#2E86C1] border-0 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-bold text-base mb-0.5">📋 Demo Scenario</p>
              <p className="text-sm text-blue-100 leading-snug">
                A <strong className="text-white">$164.98</strong> payment at <strong className="text-white">ShopNow</strong> is
                declined (code 51). The agent recovers it — no human involved.
              </p>
            </div>
            <Button onClick={triggerDemo} disabled={isRunning}
              className={`shrink-0 font-bold gap-2 px-6 transition-all
                ${isRunning?"bg-white/20 text-white/50 cursor-not-allowed":"bg-white text-[#1B4F72] hover:bg-blue-50 shadow-lg"}`}>
              <Zap className="w-4 h-4" />
              {isRunning ? "Running…" : isDone ? "Run Again" : "Trigger Decline"}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ── IMPACT METRICS ── */}
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.18}} className="mb-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              emoji: "🇺🇸",
              label: "2026 US Decline Projections",
              value: "$300B+",
              unit: "annually",
              desc: "US merchants lose over $300B per year to failed & declined transactions — the recoverable floor, per Worldpay.",
              accent: "from-blue-900/30 to-blue-800/10",
              border: "border-blue-800/30",
              valueColor: "text-blue-300",
            },
            {
              emoji: "🌍",
              label: "Global Projections 2027–30",
              value: "$1.8T",
              unit: "cumulative",
              desc: "Global merchants stand to lose $1.8 trillion in declined payments 2027–2030 if authorization rates aren't improved.",
              accent: "from-indigo-900/30 to-indigo-800/10",
              border: "border-indigo-800/30",
              valueColor: "text-indigo-300",
            },
            {
              emoji: "🚪",
              label: "Customer Abandonment Rate",
              value: "32%",
              unit: "never return",
              desc: "1 in 3 customers who experience a declined payment permanently abandon the merchant — Javelin Strategy & Research.",
              accent: "from-rose-900/30 to-rose-800/10",
              border: "border-rose-800/30",
              valueColor: "text-rose-300",
            },
            {
              emoji: "⚠️",
              label: "False Declines vs. Fraud",
              value: "$13:$1",
              unit: "ratio",
              desc: "For every $1 lost to actual fraud, merchants lose $13 to false declines — making over-rejection the bigger threat.",
              accent: "from-amber-900/30 to-amber-800/10",
              border: "border-amber-800/30",
              valueColor: "text-amber-300",
            },
          ].map((stat, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.22 + i * 0.07, type:"spring", damping:22, stiffness:240 }}
              className={`rounded-2xl p-4 bg-gradient-to-br ${stat.accent} border ${stat.border} flex flex-col gap-2`}
              style={{ background: "rgba(15,23,42,0.85)" }}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl leading-none">{stat.emoji}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 text-right leading-tight">{stat.label}</span>
              </div>
              <div>
                <span className={`text-[28px] font-black leading-none ${stat.valueColor}`}>{stat.value}</span>
                <span className="text-white/30 text-[10px] ml-1.5 font-semibold">{stat.unit}</span>
              </div>
              <p className="text-white/45 text-[10px] leading-relaxed">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mode selector */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.15}} className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">AI Mode</p>
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button type="button" onClick={() => setModeOpen(o => !o)}
            className={`w-full flex items-center justify-between gap-3 border rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#2E86C1] ${modeColors[mode]}`}>
            <span>{selectedMode.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal opacity-70 hidden sm:block">{selectedMode.description}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${modeOpen?"rotate-180":""}`} />
            </div>
          </button>
          <AnimatePresence>
            {modeOpen && (
              <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
                exit={{opacity:0,y:-6}} transition={{duration:0.13}}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                {MODES.map(m => (
                  <button key={m.value} type="button"
                    onClick={() => { setMode(m.value); setModeOpen(false); setApiKey(""); setError(""); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${mode===m.value?"bg-gray-50 font-semibold":""}`}>
                    <span className={`font-semibold ${modeColors[m.value].split(" ")[0]}`}>{m.label}</span>
                    <span className="text-xs text-gray-400">{m.description}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {mode !== "deterministic" && (
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
              exit={{opacity:0,height:0}} transition={{duration:0.2}} className="overflow-hidden">
              <div className="mt-2 relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showKey?"text":"password"} value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder={`Paste your ${selectedMode.label} API key…`}
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E86C1] bg-white placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowKey(s => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">🔒 Key stays in your browser — never sent to our servers.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <motion.div initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:0.2}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">📱 Customer Experience</p>
          <IPhoneMockup
            screen={phoneScreen}
            isRunning={isRunning}
            agentId={agentId}
            onScreenDone={handleScreenDone}
            fee={studioFee}
          />
          {isDone && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}
              className="mt-3 text-center text-xs text-gray-400">
              Journey Token · <span className="font-mono text-[#2E86C1]">{agentId}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.25}}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">🗺️ Agent Journey Map</p>
          <Card className="p-5">
            <JourneyMap steps={journeySteps} onStepClick={handleStepClick} pinnedId={pinnedStepId} />
          </Card>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs text-muted-foreground">
            {[["Mode",selectedMode.label],["Loop","OODA"],["Data","Mocked · safe"]].map(([k,v]) => (
              <Card key={k} className="p-2.5">
                <p className="font-semibold text-gray-600 mb-0.5">{k}</p>
                <p className="text-[11px]">{v}</p>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── WHY FINTECHS & BANKS FAIL ── */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="mt-14">

        {/* Section header */}
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-full mb-3">
            The Industry Gap
          </span>
          <h2 className="text-2xl font-extrabold text-[#1B4F72] mb-2">
            Why FinTechs & Banks Fail Here
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Three structural gaps cost the industry billions in recoverable declines.
          </p>
        </div>

        {/* Failure cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {[
            {
              num: "01",
              emoji: "🔍",
              title: "No Journey Awareness",
              subtitle: "Blind to context",
              body: "Payment systems fire a binary approve/decline with no context on customer intent, history, or alternatives. A rule engine just says no.",
              tag: "Systemic Blindness",
              tagColor: "bg-red-100 text-red-600",
              border: "border-red-100",
              numColor: "text-red-200",
              icon: "🚫",
            },
            {
              num: "02",
              emoji: "💳",
              title: "Reactive at Best — Silent at Worst",
              subtitle: "The minority guides, the majority ghosts",
              body: "Few providers prompt a retry with another instrument. Most don't even tell the customer why it failed — leaving money and trust on the table.",
              tag: "Missed Recovery",
              tagColor: "bg-orange-100 text-orange-600",
              border: "border-orange-100",
              numColor: "text-orange-200",
              icon: "📵",
            },
            {
              num: "03",
              emoji: "🔗",
              title: "Zero Stake Intelligence",
              subtitle: "The whitespace no one has filled",
              body: "No payment system places a temporary stake on funds in other linked apps (Robinhood, Bank of America, Schwab) using a verified identity. StakePay fills that gap.",
              tag: "Xomjo's StakePay fills this",
              tagColor: "bg-blue-100 text-blue-700",
              border: "border-blue-100",
              numColor: "text-blue-200",
              icon: "✅",
            },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.5 + i * 0.12, type:"spring", damping:22 }}
              whileHover={{ y:-4, transition:{ duration:0.2 } }}
              className={`relative rounded-2xl border-2 ${f.border} bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow`}>

              {/* Icon + tag */}
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="text-4xl leading-none">{f.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${f.tagColor}`}>
                  {f.tag}
                </span>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="font-extrabold text-[#1B4F72] text-sm leading-snug mb-0.5 whitespace-nowrap">{f.title}</h3>
                <p className="text-xs text-gray-400 font-semibold">{f.subtitle}</p>
              </div>

              {/* Body */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1 text-center">{f.body}</p>

              {/* Footer icon */}
              <div className="text-lg text-center">{f.icon}</div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <div className="rounded-2xl bg-[#1B4F72] text-white p-6 text-center">
          <p className="text-sm uppercase tracking-widest text-blue-300 font-bold mb-2">StakePay Changes This</p>
          <p className="text-lg font-extrabold mb-1">
            An autonomous agent that observes, reasons, and acts — in under 3 seconds.
          </p>
          <p className="text-blue-200 text-sm max-w-2xl mx-auto leading-relaxed">
            StakePay intercepts the decline event, scans the customer's pre-authorized stake stack across
            installed financial apps, selects the optimal asset, places a temporary hold, guarantees the merchant,
            and notifies the customer — all before the checkout session expires.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
            {["No customer friction","No alternate card prompt","No manual intervention","72-hour resolution window"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-blue-100">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5}/>{t}
              </span>
            ))}
          </div>
        </div>

      </motion.div>

    </div>
  );
}
