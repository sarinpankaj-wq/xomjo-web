"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Settings2, Database, Upload, Webhook,
  MessageSquare, Smartphone, PhoneCall, Mail, Users,
  Network, Share2, BarChart3, ArrowRightLeft,
  Building2, Workflow, Zap, CheckCheck, ChevronRight,
  Boxes, Globe, Radio, FileText, Clock,
  AlertTriangle, Eye, Copy, RefreshCw,
  Wand2, Search, Globe2, BookOpen, TrendingUp, TrendingDown,
  Cpu, Sparkles, FlaskConical, History, RotateCcw, Activity,
} from "lucide-react";
import Link from "next/link";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ChannelId = "email" | "sms" | "push" | "ivr";
interface ChannelVariant { body: string; subject?: string; }

interface DeployRecord {
  id: string;
  version: string;
  timestamp: string;
  fee: string;
  hold: string;
  codes: string;
  channels: number;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const INGEST_MODES = [
  {
    icon: <Radio className="w-6 h-6 text-orange-400" />,
    bg: "bg-orange-50", border: "border-orange-200",
    title: "Kafka Stream", subtitle: "Real-time event ingestion",
    desc: "Connect your Kafka topic and StakePay intercepts decline events in under 50ms. Supports Confluent, MSK, and self-hosted clusters.",
    tags: ["Apache Kafka", "Confluent", "AWS MSK", "Schema Registry"],
    code: `kafka.topic("payment.events")\n  .filter(e => e.type === "DECLINE")\n  .pipe(xomjo.stakepay())`,
    status: "Supported", statusColor: "bg-green-100 text-green-700",
  },
  {
    icon: <Upload className="w-6 h-6 text-blue-500" />,
    bg: "bg-blue-50", border: "border-blue-200",
    title: "CSV / Batch Upload", subtitle: "Bulk historical replay",
    desc: "Upload historical decline files to simulate, backtest, and tune agent behaviour against your real transaction data before going live.",
    tags: ["CSV", "Parquet", "JSON Lines", "SFTP sync"],
    code: `pano.upload("declines_nov.csv")\n  .mapFields(schema)\n  .replay(agent: "stakepay")`,
    status: "Supported", statusColor: "bg-green-100 text-green-700",
  },
  {
    icon: <Webhook className="w-6 h-6 text-violet-500" />,
    bg: "bg-violet-50", border: "border-violet-200",
    title: "Webhook / REST", subtitle: "Custom journey events",
    desc: "Define your own journey event schema and POST it to a Pano endpoint. Map any field to agent inputs — decline codes, user IDs, amounts, merchant IDs.",
    tags: ["REST", "GraphQL", "mTLS", "OAuth 2.0"],
    code: `POST /pano/events\n{\n  "type": "PAYMENT_DECLINE",\n  "amount": 164.98,\n  "merchant_id": "MRC-001"\n}`,
    status: "Supported", statusColor: "bg-green-100 text-green-700",
  },
];

const CHANNELS = [
  { icon: <Smartphone className="w-5 h-5" />,    label: "Push Notification", color: "text-blue-600",   bg: "bg-blue-50",   active: true  },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Chatbot",           color: "text-violet-600", bg: "bg-violet-50", active: true  },
  { icon: <Mail className="w-5 h-5" />,          label: "SMS",               color: "text-green-600",  bg: "bg-green-50",  active: true  },
  { icon: <PhoneCall className="w-5 h-5" />,     label: "IVR",               color: "text-orange-600", bg: "bg-orange-50", active: false },
  { icon: <Globe className="w-5 h-5" />,         label: "In-App",            color: "text-cyan-600",   bg: "bg-cyan-50",   active: false },
  { icon: <Building2 className="w-5 h-5" />,     label: "Pega",              color: "text-red-600",    bg: "bg-red-50",    active: false },
  { icon: <Users className="w-5 h-5" />,         label: "Salesforce",        color: "text-sky-600",    bg: "bg-sky-50",    active: false },
  { icon: <Boxes className="w-5 h-5" />,         label: "Human Agent",       color: "text-amber-600",  bg: "bg-amber-50",  active: false },
];

const AGENT_PARAMS = [
  { label: "Hold Duration",    value: "72 hours",            options: ["24h","48h","72h","96h","7 days"],               type: "select"   },
  { label: "StakePay Fee",     value: "$4.99",               options: ["$2.99","$4.99","$6.99","Custom"],               type: "select"   },
  { label: "Asset Priority",   value: "Bank → ETF → 401K",   options: ["Bank → ETF → 401K","ETF → Bank → 401K","Custom"], type: "select" },
  { label: "Min Stake Amount", value: "$10.00",              options: ["$5","$10","$25","$50"],                         type: "select"   },
  { label: "Reminder Cadence", value: "36h, 65h",            options: ["12h,48h","36h,65h","48h,70h"],                  type: "select"   },
  { label: "Auto-execute",     value: "Enabled",             options: ["Enabled","Disabled","Manual"],                  type: "select"   },
  { label: "Channel Priority", value: "Push → SMS → In-App", options: [],                                               type: "readonly" },
];

const DECLINE_CODES = [
  { code: "51", label: "Insufficient Funds",               category: "Issuer Decline",    active: true  },
  { code: "54", label: "Subscription / Recurring Decline", category: "Subscription",      active: true  },
  { code: "61", label: "Exceeds Withdrawal Limit",         category: "Velocity Control",  active: true  },
  { code: "65", label: "Exceeds Frequency Limit",          category: "Velocity Control",  active: true  },
  { code: "05", label: "Do Not Honour",                    category: "Issuer Decline",    active: false },
  { code: "14", label: "Invalid Card Number",              category: "Card Management",   active: false },
  { code: "41", label: "Lost Card",                        category: "Card Management",   active: false },
  { code: "43", label: "Stolen Card",                      category: "Card Management",   active: false },
  { code: "57", label: "Transaction Not Permitted",        category: "Restriction",       active: false },
  { code: "91", label: "Issuer Unavailable",               category: "Network / Timeout", active: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Issuer Decline":    "bg-red-50 text-red-600 border-red-200",
  "Subscription":      "bg-purple-50 text-purple-600 border-purple-200",
  "Velocity Control":  "bg-amber-50 text-amber-700 border-amber-200",
  "Card Management":   "bg-blue-50 text-blue-600 border-blue-200",
  "Restriction":       "bg-orange-50 text-orange-600 border-orange-200",
  "Network / Timeout": "bg-gray-100 text-gray-600 border-gray-200",
};

const MSG_VARS = [
  { key: "{{customer_name}}",     desc: "Customer first name"            },
  { key: "{{amount}}",            desc: "Original transaction amount"    },
  { key: "{{merchant_name}}",     desc: "Merchant / retailer name"       },
  { key: "{{hold_expiry_hours}}", desc: "Hours remaining before expiry"  },
  { key: "{{stake_asset}}",       desc: "Identified asset (e.g. BofA)"   },
  { key: "{{fee}}",               desc: "StakePay service fee"           },
  { key: "{{resolve_link}}",      desc: "Secure one-click resolve URL"   },
];

/* ─── Channel template defaults ─────────────────────────────────────────── */
const DEFAULT_CHANNEL_TEMPLATES: Record<string, Record<ChannelId, ChannelVariant>> = {
  reminder_1: {
    email: {
      subject: "Action Required: Authorise Your Pending Payment",
      body: `Dear {{customer_name}},

We are writing to inform you that your recent payment of {{amount}} to {{merchant_name}} was initially declined. To protect your purchase and ensure continuity of service, StakePay has secured a provisional hold on eligible assets identified in your linked financial accounts ({{stake_asset}}).

Your transaction is currently in a 72-hour recovery window. To release the hold and complete your payment without disruption, please authorise the transaction at your earliest convenience.

Authorise Now → {{resolve_link}}

Should no action be taken within the remaining {{hold_expiry_hours}} hours, your staked asset position may be subject to proportional dilution in accordance with our StakePay Recovery Agreement.

A nominal service fee of {{fee}} will apply upon successful resolution.

If you have any questions or wish to dispute this hold, please contact our support team immediately.

Regards,
The StakePay Recovery Team`,
    },
    sms: {
      body: "StakePay: Your {{amount}} payment to {{merchant_name}} was declined. Order secured 36h. Resolve: {{resolve_link}} Reply STOP to opt out.",
    },
    push: {
      body: "Your {{amount}} payment was declined. StakePay secured your {{merchant_name}} order — tap to resolve before your hold expires.",
    },
    ivr: {
      body: "Hello, {{customer_name}}. This is StakePay regarding your payment of {{amount}} to {{merchant_name}}. Your payment was declined, however your order has been secured for 36 hours. To authorise and release the hold, press 1. To speak with a representative, press 2. To repeat this message, press 3.",
    },
  },
  reminder_2: {
    email: {
      subject: "Urgent: Your Staked Asset Will Be Diluted in {{hold_expiry_hours}} Hours",
      body: `Dear {{customer_name}},

This is a final reminder regarding your declined payment of {{amount}} to {{merchant_name}}.

Your StakePay hold on {{stake_asset}} is approaching expiry. If authorisation is not received within the next {{hold_expiry_hours}} hours, the staked position will be proportionally diluted and your transaction cannot be recovered.

To avoid asset dilution and complete your payment, please take action immediately:

Resolve Now → {{resolve_link}}

Key details:
  • Original amount:  {{amount}}
  • StakePay fee:     {{fee}}
  • Staked asset:     {{stake_asset}}
  • Hold expires in:  {{hold_expiry_hours}} hours

This notification is being delivered in accordance with our StakePay Recovery Agreement. No further reminders will be sent after this message.

For urgent assistance, please contact our priority support line.

Regards,
The StakePay Recovery Team`,
    },
    sms: {
      body: "URGENT StakePay: {{hold_expiry_hours}}h left on your {{amount}} hold at {{merchant_name}}. Assets dilute after this. Act: {{resolve_link}}",
    },
    push: {
      body: "⚠️ Final notice: Your {{amount}} hold expires in {{hold_expiry_hours}}h. Authorise now to avoid asset dilution.",
    },
    ivr: {
      body: "Urgent message for {{customer_name}}. Your StakePay hold of {{amount}} at {{merchant_name}} expires in {{hold_expiry_hours}} hours. Failure to act will result in asset dilution. To authorise immediately, press 1. For a priority agent, press 2.",
    },
  },
};

const CHANNEL_META: Record<ChannelId, { label: string; hint: string; maxChars?: number; icon: React.ReactNode }> = {
  email: { label: "Email", hint: "Full professional email body.", icon: <Mail className="w-3.5 h-3.5" /> },
  sms:   { label: "SMS",   hint: "Keep under 160 characters for single-part delivery.", maxChars: 160, icon: <MessageSquare className="w-3.5 h-3.5" /> },
  push:  { label: "Push",  hint: "Lock-screen preview truncates at ~100 chars.", icon: <Smartphone className="w-3.5 h-3.5" /> },
  ivr:   { label: "IVR",   hint: "Read aloud by TTS. Keep language simple and unambiguous.", icon: <PhoneCall className="w-3.5 h-3.5" /> },
};

const CRAWL_STEPS = [
  { icon: <Search className="w-3.5 h-3.5" />,     color: "text-blue-400",    label: "Scanning live journey events from Kafka topic…",                               duration: 900  },
  { icon: <Globe2 className="w-3.5 h-3.5" />,     color: "text-violet-400",  label: "Crawling Nacha, Visa, Mastercard decline code directories…",                   duration: 1100 },
  { icon: <BookOpen className="w-3.5 h-3.5" />,   color: "text-amber-400",   label: "Analysing Reddit r/personalfinance, Quora, fintech forums for drop-off patterns…", duration: 1200 },
  { icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-green-400",   label: "Benchmarking recovery rates across 3,200 similar decline cohorts…",             duration: 1000 },
  { icon: <Cpu className="w-3.5 h-3.5" />,        color: "text-cyan-400",    label: "Running OODA loop simulation on optimal hold window vs. dilution risk…",        duration: 1100 },
  { icon: <BarChart3 className="w-3.5 h-3.5" />,  color: "text-pink-400",    label: "Scoring channel effectiveness by customer segment and time-of-day…",            duration: 900  },
  { icon: <Sparkles className="w-3.5 h-3.5" />,   color: "text-emerald-400", label: "Applying best-practice templates — writing optimal reminder cadence…",          duration: 800  },
];

const AUTO_CFG_RESULT = [
  { label: "Hold Duration",    value: "72 hours",            reason: "Peak recovery window per 3.2K cohort benchmark — 91% of resolutions happen within 72h." },
  { label: "StakePay Fee",     value: "$4.99",               reason: "Forum sentiment analysis: $4.99 shows highest acceptance rate; above $6 triggers abandonment." },
  { label: "Asset Priority",   value: "Bank → ETF → 401K",  reason: "Bank accounts resolve fastest (avg 4h). Retirement assets reserved as last-resort per regulatory guidance." },
  { label: "Min Stake Amount", value: "$10.00",              reason: "Sub-$10 recoveries cost more to administer than they yield — industry floor recommendation." },
  { label: "Reminder Cadence", value: "36h, 65h",            reason: "36h reminder catches 68% of resolutions; 65h final notice converts a further 19% before dilution." },
  { label: "Auto-execute",     value: "Enabled",             reason: "Manual approval adds 8–12h latency. Automated execution improves recovery rate by 34%." },
  { label: "Channel Priority", value: "Push → SMS → In-App", reason: "Push open rate: 78%. SMS fallback adds 14% coverage. In-app for customers without push permission." },
  { label: "Active Codes",     value: "51, 54, 61, 65",      reason: "These 4 codes account for 89% of recoverable declines in your journey event history." },
];

const A2A_AGENTS = [
  { id: "stakepay", name: "StakePay",            cat: "Payments",         dot: "bg-blue-400",   live: true  },
  { id: "issuer",   name: "Issuer Declines",     cat: "Payments",         dot: "bg-indigo-400", live: false },
  { id: "churn",    name: "Churn Detector",      cat: "Customer Success", dot: "bg-purple-400", live: false },
  { id: "contact",  name: "Contact Concurrency", cat: "Customer Success", dot: "bg-violet-400", live: false },
  { id: "fraud",    name: "Fraudulent Contact",  cat: "Customer Success", dot: "bg-rose-400",   live: false },
  { id: "passkey",  name: "Passkey Drop-off",    cat: "Payments",         dot: "bg-cyan-400",   live: false },
  { id: "docai",    name: "Doc AI",              cat: "Payments",         dot: "bg-teal-400",   live: false },
];

const A2A_FLOWS = [
  { from: "stakepay", to: "churn",    label: "Decline signal → Churn risk score"     },
  { from: "stakepay", to: "contact",  label: "Recovery context → Agent handoff"       },
  { from: "churn",    to: "stakepay", label: "High-risk flag → Prioritise recovery"   },
  { from: "issuer",   to: "stakepay", label: "Decline classification → Stake trigger" },
];

const CONFIG_TABS = [
  { id: "params",    label: "Parameters",  icon: <Settings2 className="w-4 h-4" />    },
  { id: "templates", label: "Templates",   icon: <FileText className="w-4 h-4" />     },
  { id: "channels",  label: "Channels",    icon: <Smartphone className="w-4 h-4" />   },
  { id: "a2a",       label: "A2A Network", icon: <Network className="w-4 h-4" />      },
  { id: "analytics", label: "Analytics",   icon: <BarChart3 className="w-4 h-4" />    },
] as const;
type ConfigTab = typeof CONFIG_TABS[number]["id"];

/* ─── Subcomponents ──────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#5E5CE6] bg-blue-50 px-3 py-1.5 rounded-full mb-3">
      {children}
    </span>
  );
}
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-extrabold text-[#4338CA] mb-2">{children}</h2>;
}
function SectionSub({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-500 max-w-2xl leading-relaxed mb-8">{children}</p>;
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ─── Analytics shape ────────────────────────────────────────────────────── */
interface MetricsSummary {
  total_runs: number;
  recovered: number;
  recovery_rate_pct: number;
  revenue_recovered: number;
  fees_collected: number;
  avg_resolution_hours: number | null;
  active_holds: number;
  _note?: string;
}
interface ChannelAttr { channel: string; count: number; pct: number; }
interface CodePerf    { code: string; total: number; recovered: number; rate_pct: number; }
interface ActivityRow { agent_id: string; transaction_id: string; amount: number; channel_used: string; status: string; resolved_by: string | null; spawned_at: string; }
interface TrendRow    { week: string; total: number; recovered: number; rate_pct: number; }

interface AnalyticsData {
  summary: MetricsSummary;
  channel_attribution: ChannelAttr[];
  code_performance: CodePerf[];
  recent_activity: ActivityRow[];
  weekly_trend: TrendRow[];
}

export default function PanoPage() {
  const [activeIngest, setActiveIngest]   = useState(0);
  const [selectedAgent, setSelectedAgent] = useState("stakepay");
  const [activeTab, setActiveTab]         = useState<ConfigTab>("params");

  // Controlled param values
  const [paramValues, setParamValues] = useState<Record<string, string>>(
    Object.fromEntries(AGENT_PARAMS.map(p => [p.label, p.value]))
  );

  // Save & Deploy
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Deploy history
  const [deployHistory, setDeployHistory] = useState<DeployRecord[]>([]);
  const [showHistory, setShowHistory]     = useState(false);
  const [restoredId, setRestoredId]       = useState<string | null>(null);

  // Decline code toggles
  const [activeCodes, setActiveCodes] = useState<Set<string>>(
    new Set(DECLINE_CODES.filter(d => d.active).map(d => d.code))
  );

  // Channels
  const [activeChannels, setActiveChannels] = useState<Set<string>>(
    new Set(CHANNELS.filter(c => c.active).map(c => c.label))
  );

  // Analytics state — live from /metrics/stakepay
  const [analytics, setAnalytics]         = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError]     = useState<string | null>(null);

  // ── Load config from backend on mount (Fix 3) ─────────────────────────────
  useEffect(() => {
    fetch(`${API_BASE}/config/stakepay`)
      .then(r => r.ok ? r.json() : null)
      .then(cfg => {
        if (!cfg) return;
        // Map backend fields → paramValues labels
        const updates: Record<string, string> = {};
        if (cfg.fee !== undefined)              updates["StakePay Fee"]     = `$${cfg.fee}`;
        if (cfg.hold_duration_hours !== undefined) updates["Hold Duration"] = cfg.hold_duration_hours >= 168 ? "7 days" : `${cfg.hold_duration_hours}h`;
        if (cfg.min_stake_amount !== undefined)  updates["Min Stake Amount"] = `$${cfg.min_stake_amount}`;
        if (cfg.auto_execute !== undefined)      updates["Auto-execute"]    = cfg.auto_execute ? "Enabled" : "Disabled";
        if (cfg.reminder_cadence_hours)          updates["Reminder Cadence"] = cfg.reminder_cadence_hours.join("h, ") + "h";
        if (cfg.asset_priority)                  updates["Asset Priority"]  =
          cfg.asset_priority.map((a: string) => a.charAt(0).toUpperCase() + a.slice(1)).join(" → ");
        setParamValues(prev => ({ ...prev, ...updates }));
        if (cfg.active_decline_codes) setActiveCodes(new Set(cfg.active_decline_codes));
      })
      .catch(() => { /* backend not running — silently use defaults */ });
  }, []);

  // ── Fetch analytics when Analytics tab is opened (Fix 2) ──────────────────
  useEffect(() => {
    if (activeTab !== "analytics") return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    fetch(`${API_BASE}/metrics/stakepay`)
      .then(r => r.ok ? r.json() : Promise.reject("non-200"))
      .then((data: AnalyticsData) => { setAnalytics(data); setAnalyticsLoading(false); })
      .catch(() => { setAnalyticsError("Could not reach backend — showing illustrative data."); setAnalyticsLoading(false); });
  }, [activeTab]);

  // ── Save & Deploy: write to API + localStorage (Fix 4) ────────────────────
  async function handleSave() {
    setSaveState("saving");
    // Parse paramValues back to backend types
    const feeStr  = paramValues["StakePay Fee"].replace("$", "");
    const holdStr = paramValues["Hold Duration"].replace("h", "").replace(" hours", "").replace("7 days", "168");
    const minStr  = paramValues["Min Stake Amount"].replace("$", "");
    const priority= paramValues["Asset Priority"].toLowerCase().split(" → ").map(s => s.trim());
    const cadence = paramValues["Reminder Cadence"].split(",").map(s => parseInt(s.trim())).filter(Boolean);
    const auto    = paramValues["Auto-execute"] === "Enabled";

    const body = {
      fee: parseFloat(feeStr) || 4.99,
      hold_duration_hours: parseInt(holdStr) || 72,
      min_stake_amount: parseFloat(minStr) || 10,
      asset_priority: priority,
      reminder_cadence_hours: cadence,
      auto_execute: auto,
      active_decline_codes: [...activeCodes],
    };

    try {
      const res = await fetch(`${API_BASE}/config/stakepay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
    } catch {
      // Backend not running — fall back to localStorage only
    }

    // Always write localStorage so Demo page can read it (Fix 5)
    if (typeof window !== "undefined") {
      localStorage.setItem("xomjo_stakepay_config", JSON.stringify({
        fee: paramValues["StakePay Fee"],
        holdDuration: paramValues["Hold Duration"],
        assetPriority: paramValues["Asset Priority"],
        minStake: paramValues["Min Stake Amount"],
        reminderCadence: paramValues["Reminder Cadence"],
        autoExecute: paramValues["Auto-execute"],
        activeCodes: [...activeCodes],
        activeChannels: [...activeChannels],
        // Extra fields for Demo page (Fix 5)
        holdDurationHours: parseInt(holdStr) || 72,
        feeNum: parseFloat(feeStr) || 4.99,
        channelPriority: [...activeChannels],
      }));
    }

    const newRecord: DeployRecord = {
      id: Math.random().toString(16).slice(2, 8).toUpperCase(),
      version: `v${deployHistory.length + 1}.0`,
      timestamp: new Date().toISOString(),
      fee: paramValues["StakePay Fee"],
      hold: paramValues["Hold Duration"],
      codes: [...activeCodes].join(", "),
      channels: activeChannels.size,
    };
    setDeployHistory(prev => [newRecord, ...prev].slice(0, 5));
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  }

  // Nirvana Mode
  const [autoCfg, setAutoCfg]    = useState<"idle" | "crawling" | "done">("idle");
  const [crawlStep, setCrawlStep] = useState(0);
  function runAutoCfg() {
    setAutoCfg("crawling"); setCrawlStep(0);
    let elapsed = 0;
    CRAWL_STEPS.forEach((step, i) => { elapsed += step.duration; setTimeout(() => setCrawlStep(i + 1), elapsed); });
    const total = CRAWL_STEPS.reduce((s, c) => s + c.duration, 0);
    setTimeout(() => {
      const updates: Record<string, string> = {};
      AUTO_CFG_RESULT.forEach(r => { AGENT_PARAMS.forEach(p => { if (p.label === r.label) updates[p.label] = r.value; }); });
      setParamValues(prev => ({ ...prev, ...updates }));
      const codesEntry = AUTO_CFG_RESULT.find(r => r.label === "Active Codes");
      if (codesEntry) setActiveCodes(new Set(codesEntry.value.split(", ").map(s => s.trim())));
      setSaveState("idle");
      setAutoCfg("done");
    }, total + 400);
  }

  function toggleCode(code: string) {
    setActiveCodes(prev => { const n = new Set(prev); n.has(code) ? n.delete(code) : n.add(code); return n; });
  }

  function toggleChannel(label: string) {
    setActiveChannels(prev => { const n = new Set(prev); n.has(label) ? n.delete(label) : n.add(label); return n; });
  }

  // Channel templates state
  const [channelTemplates, setChannelTemplates] = useState<Record<string, Record<ChannelId, ChannelVariant>>>(
    JSON.parse(JSON.stringify(DEFAULT_CHANNEL_TEMPLATES))
  );
  const [activeTmplId, setActiveTmplId]   = useState<"reminder_1" | "reminder_2">("reminder_1");
  const [activeTmplCh, setActiveTmplCh]   = useState<ChannelId>("email");
  const [preview, setPreview]             = useState<"edit" | "preview">("edit");
  const [previewCh, setPreviewCh]         = useState<"push" | "sms" | "email" | "ivr">("push");
  const [copied, setCopied]               = useState(false);

  const currentVariant = channelTemplates[activeTmplId]?.[activeTmplCh] ?? { body: "" };
  const chMeta = CHANNEL_META[activeTmplCh];

  function updateVariantField(field: "body" | "subject", val: string) {
    setChannelTemplates(prev => ({
      ...prev,
      [activeTmplId]: {
        ...prev[activeTmplId],
        [activeTmplCh]: { ...prev[activeTmplId][activeTmplCh], [field]: val },
      },
    }));
  }

  function insertVar(v: string) {
    updateVariantField("body", currentVariant.body + v);
  }

  function copyBody() {
    navigator.clipboard.writeText(currentVariant.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetTemplate() {
    setChannelTemplates(prev => ({
      ...prev,
      [activeTmplId]: {
        ...prev[activeTmplId],
        [activeTmplCh]: { ...DEFAULT_CHANNEL_TEMPLATES[activeTmplId][activeTmplCh] },
      },
    }));
  }

  // Preview substitution — uses live paramValues for fee (Fix 8)
  function substituteVars(text: string, hours: string) {
    const liveFee = paramValues["StakePay Fee"] || "$4.99";
    return text
      .replace(/{{customer_name}}/g, "Alex")
      .replace(/{{amount}}/g, "$164.98")
      .replace(/{{merchant_name}}/g, "ShopNow")
      .replace(/{{hold_expiry_hours}}/g, hours)
      .replace(/{{stake_asset}}/g, "Bank of America Checking")
      .replace(/{{fee}}/g, liveFee)
      .replace(/{{resolve_link}}/g, "https://stakepay.xomjo.com/r/TXN-ABC");
  }

  const previewHours = activeTmplId === "reminder_1" ? "36" : "7";
  const previewBody  = substituteVars(currentVariant.body, previewHours);
  const previewSubj  = substituteVars(currentVariant.subject ?? "", previewHours);

  // Test Event Panel — uses live paramValues (Fix 8)
  const [showTest, setShowTest]         = useState(false);
  const [testCode, setTestCode]         = useState("51");
  const [testAmount, setTestAmount]     = useState("164.98");
  const [testMerchant, setTestMerchant] = useState("ShopNow");
  const [testState, setTestState]       = useState<"idle" | "running" | "done">("idle");
  const [testLogs, setTestLogs]         = useState<string[]>([]);
  const testLogRef = useRef<HTMLDivElement>(null);

  function fireTestDecline() {
    if (testState === "running") return;
    setTestState("running");
    setTestLogs([]);
    const hex     = Math.random().toString(16).slice(2, 6).toUpperCase();
    const liveFee = paramValues["StakePay Fee"];
    const liveHold= paramValues["Hold Duration"];
    const livePrio= paramValues["Asset Priority"];
    const liveCh  = [...activeChannels].slice(0, 2).join(" → ") || "Push → SMS";
    const steps: [number, string][] = [
      [400,  `Agent spawned · AGT-TEST-${hex} · deterministic mode`],
      [1100, `OBSERVE · Decline intercepted · code ${testCode} · $${testAmount} · ${testMerchant}`],
      [2100, "ORIENT · Scanning 9 linked financial apps…"],
      [3200, `ORIENT · Asset priority: ${livePrio} · BofA Checking ···4521 selected`],
      [4400, `DECIDE · StakePay offer computed · fee ${liveFee} · hold window ${liveHold}`],
      [5500, `ACT · ${liveHold} hold placed on BofA ···4521 · merchant confirmed`],
      [6600, `ACT · Customer notified via ${liveCh}`],
      [7700, `MONITOR · Recovery window active · reminders at ${paramValues["Reminder Cadence"]}`],
      [8500, `✓ RESOLVED · Payment recovered · fee ${liveFee} charged · transaction closed`],
    ];
    steps.forEach(([delay, msg]) => {
      setTimeout(() => {
        setTestLogs(prev => [...prev, msg]);
        if (testLogRef.current) testLogRef.current.scrollTop = testLogRef.current.scrollHeight;
      }, delay);
    });
    setTimeout(() => setTestState("done"), 8700);
  }

  function resetTest() {
    setTestState("idle");
    setTestLogs([]);
  }

  const agentObj = A2A_AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs font-bold px-3 py-1">⚡ Pano Beta</Badge>
        </div>
        <h1 className="text-5xl font-black text-[#4338CA] leading-tight mb-4">Pano</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-3">
          The platform underneath every Xomjo agent. Configure any agent, connect any channel, close the loop end-to-end.
        </p>
        <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
          Pano is the control plane behind every Xomjo agent — ingest journey events from Kafka or CSV,
          tune agent parameters, route to any servicing channel, and wire agents together via A2A context sharing.
          StakePay is the first agent live on Pano, with more shipping on the same platform.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { icon: <Database className="w-3.5 h-3.5" />,  label: "Kafka / CSV / Webhook" },
            { icon: <Settings2 className="w-3.5 h-3.5" />, label: "Agent Configuration"   },
            { icon: <FileText className="w-3.5 h-3.5" />,  label: "Message Templates"     },
            { icon: <Radio className="w-3.5 h-3.5" />,     label: "8 Servicing Channels"  },
            { icon: <Share2 className="w-3.5 h-3.5" />,    label: "Agent-to-Agent (A2A)"  },
            { icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Journey Analytics"     },
          ].map((p, i) => (
            <motion.span key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#4338CA] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
              {p.icon}{p.label}
            </motion.span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/agents/payments/stakepay"
            className="inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#154360] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm shadow-md">
            <Zap className="w-4 h-4 text-yellow-300" /> See StakePay Live
          </Link>
          <a href="https://github.com/Xomjo/finagents" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#5E5CE6] text-[#5E5CE6] hover:bg-blue-50 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
            Request Pano Access
          </a>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════
          1. JOURNEY EVENTS HUB
          ══════════════════════════════════════════════════════════════ */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20">
        <SectionLabel>Journey Events Hub</SectionLabel>
        <SectionHeading>Ingest events your way</SectionHeading>
        <SectionSub>
          Connect your existing data infrastructure — Kafka for real-time, CSV for batch replay,
          or define a fully custom event schema via webhook. Pano normalises everything into
          a unified Journey Event before the agent fires.
        </SectionSub>

        <div className="flex gap-2 mb-6 flex-wrap">
          {INGEST_MODES.map((m, i) => (
            <button key={i} onClick={() => setActiveIngest(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
                ${activeIngest === i ? "bg-[#4338CA] text-white border-[#4338CA] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#5E5CE6] hover:text-[#5E5CE6]"}`}>
              {m.icon} {m.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {INGEST_MODES.map((m, i) => activeIngest === i && (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={`p-6 border-2 ${m.border} ${m.bg}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm">{m.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-[#4338CA] text-lg">{m.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.statusColor}`}>{m.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">{m.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{m.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {m.tags.map(t => (
                      <span key={t} className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </Card>
                <Card className="p-0 overflow-hidden border border-gray-200">
                  <div className="bg-[#0d1117] h-full flex flex-col">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                      {["bg-red-400","bg-yellow-400","bg-green-400"].map(c => <div key={c} className={`w-3 h-3 rounded-full ${c}`} />)}
                      <span className="text-white/30 text-xs ml-2 font-mono">pano.config.ts</span>
                    </div>
                    <div className="p-5 flex-1">
                      <pre className="text-[13px] text-green-300 font-mono leading-relaxed whitespace-pre-wrap">{m.code}</pre>
                    </div>
                    <div className="border-t border-white/5 p-5">
                      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2 font-semibold">→ Normalised Journey Event</p>
                      <pre className="text-[11px] text-blue-300 font-mono leading-relaxed">{`{\n  "event": "PAYMENT_DECLINE",\n  "transaction_id": "TXN-...",\n  "amount": 164.98,\n  "user_id": "USR-...",\n  "decline_code": "51",\n  "agent": "stakepay"\n}`}</pre>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════
          2. UNIFIED AGENT CONFIGURATION
          ══════════════════════════════════════════════════════════════ */}
      <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20">
        <SectionLabel>Agent Configuration</SectionLabel>
        <SectionHeading>Every dimension of your agent, in one place</SectionHeading>
        <SectionSub>
          Select an agent, then configure its parameters, message templates, servicing channels,
          and A2A network connections — all without leaving this panel.
        </SectionSub>

        <div className="flex gap-5 items-start">

          {/* ── Left: Agent Picker (sticky) ── */}
          <div className="w-52 shrink-0 sticky top-20 self-start">
            <Card className="p-3 border border-gray-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1 mb-2">Agents</p>
              <div className="flex flex-col gap-1">
                {A2A_AGENTS.map(a => (
                  <button key={a.id} onClick={() => { setSelectedAgent(a.id); setActiveTab("params"); setAutoCfg("idle"); }}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all
                      ${selectedAgent === a.id ? "bg-[#ECEBFF] border border-[#5E5CE6]" : "hover:bg-gray-50 border border-transparent"}`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${a.live ? a.dot : "bg-gray-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${selectedAgent === a.id ? "text-[#4338CA]" : "text-gray-600"}`}>{a.name}</p>
                      <p className="text-[9px] text-gray-400 truncate">{a.cat}</p>
                    </div>
                    {a.live
                      ? <span className="text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded-full font-bold shrink-0">LIVE</span>
                      : <span className="text-[8px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded-full font-bold shrink-0">SOON</span>}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Right: Tabbed Config Panel ── */}
          <div className="flex-1 min-w-0">
            <Card className="border border-gray-200 overflow-hidden">

              {/* Card header: agent identity + buttons */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${agentObj?.live ? agentObj.dot : "bg-gray-300"}`} />
                  <div>
                    <p className="text-sm font-extrabold text-[#4338CA]">{agentObj?.name}</p>
                    <p className="text-[10px] text-gray-400">{agentObj?.cat}</p>
                  </div>
                  {agentObj?.live && (
                    <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">LIVE</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {saveState === "idle" && (
                    <>
                      <span className="text-[10px] text-gray-400 font-semibold">Unsaved changes</span>
                      {deployHistory.length > 0 && (
                        <button onClick={() => setShowHistory(h => !h)}
                          className="flex items-center gap-1 text-[10px] text-[#5E5CE6] font-semibold hover:text-[#4338CA]">
                          <History className="w-3 h-3" /> History
                        </button>
                      )}
                    </>
                  )}
                  {saveState === "saved" && (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Deployed
                    </span>
                  )}
                  {/* Test Event button */}
                  {selectedAgent === "stakepay" && (
                    <button onClick={() => { setShowTest(t => !t); setTestState("idle"); setTestLogs([]); }}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg border border-violet-300 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors">
                      <FlaskConical className="w-3.5 h-3.5" /> Test Event
                    </button>
                  )}
                  <button onClick={handleSave} disabled={saveState !== "idle" || selectedAgent !== "stakepay"}
                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5
                      ${selectedAgent !== "stakepay" ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : saveState === "saving" ? "bg-amber-400 text-white cursor-wait"
                      : saveState === "saved"  ? "bg-emerald-500 text-white"
                      : "bg-[#5E5CE6] text-white hover:bg-[#4338CA]"}`}>
                    {saveState === "saving" && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {saveState === "saved"  && <CheckCheck className="w-3 h-3" />}
                    {saveState === "saving" ? "Deploying…" : saveState === "saved" ? "Deployed!" : "Save & Deploy"}
                  </button>
                </div>
              </div>

              {/* Deploy History collapsible */}
              <AnimatePresence>
                {showHistory && deployHistory.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden border-b border-gray-100 bg-gray-50">
                    <div className="px-6 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Deploy History</p>
                      <div className="flex flex-col gap-1.5">
                        {deployHistory.map(rec => (
                          <div key={rec.id} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-3 py-2">
                            <span className="text-xs font-black text-[#4338CA] w-10 shrink-0">{rec.version}</span>
                            <span className="text-[10px] text-gray-400 font-mono shrink-0">
                              {new Date(rec.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-[10px] text-gray-500 shrink-0">Fee: <b>{rec.fee}</b></span>
                            <span className="text-[10px] text-gray-500 shrink-0">Hold: <b>{rec.hold}</b></span>
                            <span className="text-[10px] text-gray-500 flex-1 truncate">Codes: {rec.codes}</span>
                            <span className="text-[10px] text-gray-500 shrink-0">{rec.channels} ch</span>
                            <button onClick={() => { setRestoredId(rec.id); setTimeout(() => setRestoredId(null), 1500); }}
                              className="text-[10px] font-bold text-[#5E5CE6] hover:text-[#4338CA] shrink-0 flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" />
                              {restoredId === rec.id ? "Restored!" : "Restore"}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Test Event Panel */}
              <AnimatePresence>
                {showTest && selectedAgent === "stakepay" && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden border-b border-gray-100">
                    <div className="px-6 py-4 bg-violet-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-violet-600" />
                          <p className="text-sm font-bold text-violet-700">Test Event Simulator</p>
                        </div>
                        <button onClick={() => { setShowTest(false); setTestState("idle"); setTestLogs([]); }}
                          className="text-gray-400 hover:text-gray-600 text-xs font-semibold">Close</button>
                      </div>

                      <div className="flex gap-3 mb-4 flex-wrap">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Decline Code</label>
                          <select value={testCode} onChange={e => setTestCode(e.target.value)}
                            className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400">
                            {DECLINE_CODES.filter(d => activeCodes.has(d.code)).map(d => (
                              <option key={d.code} value={d.code}>{d.code} · {d.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Amount ($)</label>
                          <input value={testAmount} onChange={e => setTestAmount(e.target.value)}
                            className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-32" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Merchant</label>
                          <input value={testMerchant} onChange={e => setTestMerchant(e.target.value)}
                            className="text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-36" />
                        </div>
                        <div className="flex flex-col justify-end">
                          <button onClick={fireTestDecline} disabled={testState === "running"}
                            className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-colors
                              ${testState === "running" ? "bg-gray-200 text-gray-400 cursor-wait" : "bg-[#5E5CE6] text-white hover:bg-[#4338CA]"}`}>
                            {testState === "running" ? "Running…" : "Fire Test Decline"}
                          </button>
                        </div>
                      </div>

                      {/* Terminal */}
                      {testLogs.length > 0 && (
                        <div className="rounded-xl bg-[#0d1117] overflow-hidden mb-3">
                          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                            {["bg-red-400","bg-yellow-400","bg-green-400"].map(c => <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                            <span className="text-white/30 text-[10px] ml-2 font-mono">stakepay-test · deterministic mode</span>
                            {testState === "running" && (
                              <span className="ml-auto flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-green-400 text-[10px] font-mono">LIVE</span>
                              </span>
                            )}
                          </div>
                          <div ref={testLogRef} className="px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                            {testLogs.map((log, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-2">
                                <span className="text-emerald-400 text-[10px] font-mono shrink-0 mt-0.5">›</span>
                                <span className={`text-[11px] font-mono leading-snug ${log.startsWith("✓") ? "text-emerald-300 font-bold" : "text-white/70"}`}>{log}</span>
                              </motion.div>
                            ))}
                            {testState === "running" && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                <span className="text-white/40 text-[11px] font-mono animate-pulse">▋</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      )}

                      {testState === "done" && (
                        <div className="flex items-center gap-3">
                          <Link href="/agents/payments/stakepay"
                            className="text-xs font-bold text-[#5E5CE6] hover:text-[#4338CA] flex items-center gap-1">
                            Open Full Demo → <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={resetTest}
                            className="text-xs font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Run Again
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab bar */}
              <div className="flex border-b border-gray-100 px-2 pt-1 bg-white overflow-x-auto">
                {CONFIG_TABS.map(tab => (
                  <button key={tab.id}
                    onClick={() => selectedAgent === "stakepay" && setActiveTab(tab.id)}
                    disabled={selectedAgent !== "stakepay"}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap
                      ${selectedAgent !== "stakepay" ? "text-gray-300 border-transparent cursor-not-allowed"
                      : activeTab === tab.id ? "text-[#4338CA] border-[#5E5CE6]"
                      : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-200"}`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              <div className="p-6">
                {selectedAgent !== "stakepay" ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <Settings2 className="w-10 h-10 text-gray-200" />
                    <p className="text-sm font-bold text-gray-400">Configuration coming soon</p>
                    <p className="text-xs text-gray-300 max-w-xs">
                      This agent is on the roadmap. Join the waitlist to be notified when it is configurable.
                    </p>
                    <button className="text-xs font-bold text-[#5E5CE6] border border-[#5E5CE6] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors mt-1">
                      Join Waitlist
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">

                    {/* ── PARAMETERS TAB ── */}
                    {activeTab === "params" && (
                      <motion.div key="params" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                        {/* Nirvana Mode */}
                        <AnimatePresence mode="wait">
                          {autoCfg === "idle" && (
                            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
                              <button onClick={runAutoCfg}
                                className="w-full group relative overflow-hidden rounded-2xl border-2 border-dashed border-[#5E5CE6]/40 bg-gradient-to-br from-[#ECEBFF] to-blue-50 hover:border-[#5E5CE6] hover:from-blue-50 hover:to-indigo-50 transition-all px-5 py-4 text-left">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                <div className="flex items-center gap-4">
                                  <div className="p-2.5 bg-[#4338CA] rounded-xl shadow-md shrink-0">
                                    <Wand2 className="w-5 h-5 text-yellow-300" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className="text-sm font-extrabold text-[#4338CA]">Nirvana Mode</p>
                                      <span className="text-[9px] font-bold bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full uppercase tracking-wide">AI</span>
                                    </div>
                                    <p className="text-[10px] font-semibold text-[#5E5CE6] mb-0.5">One Click Auto Configuration</p>
                                    <p className="text-xs text-gray-500 leading-snug">
                                      Best Practices and Live Journey Crawling at Play — forums, decline patterns, cohort benchmarks and channel intelligence applied instantly.
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-[#5E5CE6] group-hover:translate-x-1 transition-transform shrink-0" />
                                </div>
                              </button>
                            </motion.div>
                          )}

                          {autoCfg === "crawling" && (
                            <motion.div key="crawling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="mb-6 rounded-2xl bg-[#0d1117] border border-white/10 overflow-hidden">
                              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5">
                                {["bg-red-400","bg-yellow-400","bg-green-400"].map(c => <div key={c} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                                <span className="text-white/30 text-[10px] ml-2 font-mono">xomjo-pano · nirvana-mode · crawling…</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                  <span className="text-green-400 text-[10px] font-mono">LIVE</span>
                                </div>
                              </div>
                              <div className="px-4 py-4 space-y-2 min-h-[120px]">
                                {CRAWL_STEPS.slice(0, crawlStep).map((step, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-2.5">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                                    <span className={`text-[11px] font-mono leading-snug ${step.color}`}>{step.label}</span>
                                  </motion.div>
                                ))}
                                {crawlStep < CRAWL_STEPS.length && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                                    <span className={CRAWL_STEPS[crawlStep]?.color ?? "text-white/40"}>{CRAWL_STEPS[crawlStep]?.icon}</span>
                                    <span className="text-[11px] font-mono text-white/40">{CRAWL_STEPS[crawlStep]?.label}<span className="animate-pulse">▋</span></span>
                                  </motion.div>
                                )}
                              </div>
                              <div className="px-4 py-2.5 border-t border-white/5">
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div className="h-full bg-[#5E5CE6] rounded-full"
                                    animate={{ width: `${(crawlStep / CRAWL_STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.4 }} />
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {autoCfg === "done" && (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
                              <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-200 bg-emerald-100/60">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-emerald-600" />
                                  <p className="text-sm font-extrabold text-emerald-800">Nirvana Mode Complete</p>
                                  <span className="text-[9px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase">7 sources crawled</span>
                                </div>
                                <button onClick={() => setAutoCfg("idle")}
                                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                                  <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                              </div>
                              <div className="divide-y divide-emerald-100">
                                {AUTO_CFG_RESULT.map((r, i) => (
                                  <motion.div key={r.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }} className="px-5 py-2.5 flex items-start gap-3">
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">{r.label}</span>
                                        <span className="text-xs font-extrabold text-[#4338CA]">{r.value}</span>
                                      </div>
                                      <p className="text-[11px] text-emerald-700/80 leading-snug">{r.reason}</p>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                              <div className="px-5 py-2.5 bg-emerald-100/40 border-t border-emerald-200">
                                <p className="text-[10px] text-emerald-700">All parameters pre-filled from this analysis. Review and adjust any value before saving.</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Core params */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          {AGENT_PARAMS.map((p, i) => (
                            <div key={i} className="flex flex-col gap-1">
                              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{p.label}</label>
                              {p.type === "select" ? (
                                <div className="relative">
                                  <select value={paramValues[p.label] ?? p.value}
                                    onChange={e => setParamValues(prev => ({ ...prev, [p.label]: e.target.value }))}
                                    className="w-full text-sm font-semibold text-[#4338CA] bg-[#ECEBFF] border border-blue-200 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]">
                                    {p.options.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                  <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 rotate-90 pointer-events-none" />
                                </div>
                              ) : (
                                <div className="text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                  {paramValues[p.label] ?? p.value}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Decline code table */}
                        <div className="border-t border-gray-100 pt-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Decline Code Configuration</p>
                            <span className="text-[10px] text-gray-400">{activeCodes.size} of {DECLINE_CODES.length} active</span>
                          </div>
                          <div className="rounded-xl overflow-hidden border border-gray-200">
                            <div className="grid grid-cols-[56px_1fr_130px_64px] bg-gray-50 border-b border-gray-200 px-3 py-2">
                              {["Code","Descriptor","Category","Active"].map(h => (
                                <p key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                              ))}
                            </div>
                            {DECLINE_CODES.map(d => {
                              const on = activeCodes.has(d.code);
                              return (
                                <div key={d.code}
                                  className={`grid grid-cols-[56px_1fr_130px_64px] items-center px-3 py-2.5 border-b border-gray-100 last:border-0 transition-colors ${on ? "bg-white" : "bg-gray-50/60"}`}>
                                  <span className={`text-sm font-black font-mono ${on ? "text-[#4338CA]" : "text-gray-400"}`}>{d.code}</span>
                                  <span className={`text-xs font-semibold ${on ? "text-gray-800" : "text-gray-400"}`}>{d.label}</span>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit ${on ? CATEGORY_COLORS[d.category] : "bg-gray-100 text-gray-400 border-gray-200"}`}>{d.category}</span>
                                  <button onClick={() => toggleCode(d.code)}>
                                    <div className={`w-8 h-4 rounded-full transition-all relative ${on ? "bg-[#5E5CE6]" : "bg-gray-300"}`}>
                                      <motion.div animate={{ x: on ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm" />
                                    </div>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                            StakePay will only initiate a recovery flow when the incoming decline code matches an active entry above.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* ── TEMPLATES TAB ── */}
                    {activeTab === "templates" && (
                      <motion.div key="templates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                          <div className="lg:col-span-3 flex flex-col gap-4">

                            {/* Reminder tabs + Edit/Preview toggle */}
                            <div className="flex gap-2 flex-wrap items-center">
                              {[
                                { id: "reminder_1" as const, label: "Reminder 1", badge: "36h", badgeColor: "bg-amber-100 text-amber-700", icon: <Clock className="w-4 h-4 text-amber-500" /> },
                                { id: "reminder_2" as const, label: "Reminder 2", badge: "65h · Urgent", badgeColor: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
                              ].map(t => (
                                <button key={t.id} onClick={() => { setActiveTmplId(t.id); setActiveTmplCh("email"); }}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
                                    ${activeTmplId === t.id ? "bg-[#4338CA] text-white border-[#4338CA] shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-[#5E5CE6]"}`}>
                                  {t.icon} {t.label}
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTmplId === t.id ? "bg-white/20 text-white" : t.badgeColor}`}>{t.badge}</span>
                                </button>
                              ))}
                              <div className="ml-auto flex items-center bg-gray-100 rounded-xl p-1">
                                {(["edit","preview"] as const).map(m => (
                                  <button key={m} onClick={() => setPreview(m)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${preview === m ? "bg-white text-[#4338CA] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                    {m === "edit" ? <><FileText className="w-3.5 h-3.5 inline mr-1" />Edit</> : <><Eye className="w-3.5 h-3.5 inline mr-1" />Preview</>}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Channel sub-tabs */}
                            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                              {(["email","sms","push","ivr"] as ChannelId[]).map(ch => {
                                const meta = CHANNEL_META[ch];
                                return (
                                  <button key={ch} onClick={() => setActiveTmplCh(ch)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold transition-all
                                      ${activeTmplCh === ch ? "bg-white text-[#4338CA] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                    {meta.icon} {meta.label}
                                    {ch === "ivr" && <span className="text-[9px] bg-violet-100 text-violet-600 px-1 py-0.5 rounded font-bold">TTS</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Hint */}
                            <p className="text-[11px] text-gray-400 -mt-2 leading-relaxed">{chMeta.hint}</p>

                            <AnimatePresence mode="wait">
                              {preview === "edit" ? (
                                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                  <div className="flex flex-col gap-3">
                                    {/* Subject (email only) */}
                                    {activeTmplCh === "email" && (
                                      <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Subject Line</label>
                                        <input value={currentVariant.subject ?? ""}
                                          onChange={e => updateVariantField("subject", e.target.value)}
                                          className="w-full text-sm font-semibold text-[#4338CA] bg-[#ECEBFF] border border-blue-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6]" />
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Body</label>
                                        <div className="flex items-center gap-3">
                                          {/* SMS char counter */}
                                          {activeTmplCh === "sms" && chMeta.maxChars && (
                                            <span className={`text-[10px] font-bold ${currentVariant.body.length > chMeta.maxChars ? "text-red-500" : "text-gray-400"}`}>
                                              {currentVariant.body.length} / {chMeta.maxChars}
                                            </span>
                                          )}
                                          <button onClick={resetTemplate} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600">
                                            <RefreshCw className="w-3 h-3" /> Reset
                                          </button>
                                          <button onClick={copyBody} className="flex items-center gap-1 text-[10px] text-[#5E5CE6] hover:text-[#4338CA] font-semibold">
                                            <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy"}
                                          </button>
                                        </div>
                                      </div>
                                      <textarea rows={activeTmplCh === "sms" || activeTmplCh === "push" ? 5 : activeTmplCh === "ivr" ? 8 : 14}
                                        value={currentVariant.body}
                                        onChange={e => updateVariantField("body", e.target.value)}
                                        className="w-full text-xs text-gray-700 font-mono leading-relaxed bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5E5CE6] resize-none" />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Insert Variable</p>
                                      <div className="flex flex-wrap gap-2">
                                        {MSG_VARS.map(v => (
                                          <button key={v.key} onClick={() => insertVar(v.key)} title={v.desc}
                                            className="text-[11px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 font-mono">
                                            {v.key}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview · Alex · $164.98 · ShopNow</p>
                                    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                                      {(["push","sms","email","ivr"] as const).map(ch => (
                                        <button key={ch} onClick={() => setPreviewCh(ch)}
                                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${previewCh === ch ? "bg-white text-[#4338CA] shadow-sm" : "text-gray-400"}`}>
                                          {ch}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  {previewCh === "push" && (
                                    <div className="bg-gray-900 rounded-2xl p-4 max-w-sm">
                                      <div className="bg-white/10 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-7 h-7 bg-[#5E5CE6] rounded-lg flex items-center justify-center"><Zap className="w-4 h-4 text-white" /></div>
                                          <p className="text-white text-[11px] font-bold">StakePay · Now</p>
                                        </div>
                                        <p className="text-white text-xs font-bold mb-1">{previewSubj || "Payment Recovery"}</p>
                                        <p className="text-white/70 text-[11px] leading-relaxed line-clamp-3">{substituteVars(channelTemplates[activeTmplId].push.body, previewHours).slice(0, 120)}…</p>
                                      </div>
                                    </div>
                                  )}
                                  {previewCh === "sms" && (
                                    <div className="bg-gray-100 rounded-2xl p-4 max-w-sm">
                                      <p className="text-[10px] text-gray-400 text-center mb-3 font-semibold">SMS · ShopNow StakePay</p>
                                      <div className="bg-[#34C759] rounded-2xl rounded-bl-sm px-4 py-3">
                                        <p className="text-white text-xs leading-relaxed">{substituteVars(channelTemplates[activeTmplId].sms.body, previewHours)}</p>
                                      </div>
                                    </div>
                                  )}
                                  {previewCh === "email" && (
                                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                      <div className="bg-[#4338CA] px-5 py-4">
                                        <p className="text-white/60 text-[10px] font-semibold mb-1">FROM · notifications@stakepay.xomjo.com</p>
                                        <p className="text-white text-sm font-bold">{previewSubj}</p>
                                      </div>
                                      <div className="bg-white px-5 py-4">
                                        <pre className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{substituteVars(channelTemplates[activeTmplId].email.body, previewHours)}</pre>
                                      </div>
                                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400">Sent via Xomjo StakePay · Unsubscribe · Privacy Policy</p>
                                      </div>
                                    </div>
                                  )}
                                  {previewCh === "ivr" && (
                                    <div className="bg-gray-100 rounded-2xl p-4 max-w-sm">
                                      <div className="flex items-center gap-2 mb-3">
                                        <PhoneCall className="w-4 h-4 text-orange-500" />
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">IVR TTS Script</p>
                                      </div>
                                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                                        <p className="text-xs text-gray-700 leading-relaxed font-mono">{substituteVars(channelTemplates[activeTmplId].ivr.body, previewHours)}</p>
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-2">Played via text-to-speech · Keypad options captured by IVR flow</p>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Right column */}
                          <div className="lg:col-span-2 flex flex-col gap-4">
                            <div className="rounded-xl border border-gray-200 p-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                                Send Rules · {activeTmplId === "reminder_1" ? "Reminder 1" : "Reminder 2"}
                              </p>
                              <div className="flex flex-col gap-2.5">
                                {[
                                  { label: "Send at",      value: activeTmplId === "reminder_1" ? "36 hours after hold" : "65 hours after hold", icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
                                  { label: "Channel",      value: "Push → SMS fallback",                                                           icon: <Smartphone className="w-3.5 h-3.5 text-blue-500" /> },
                                  { label: "Condition",    value: "Hold unresolved at send time",                                                  icon: <CheckCheck className="w-3.5 h-3.5 text-green-500" /> },
                                  { label: "On no action", value: "Asset dilution initiated at 72h",                                               icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
                                ].map((r, i) => (
                                  <div key={i} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                                    <div className="mt-0.5 shrink-0">{r.icon}</div>
                                    <div>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{r.label}</p>
                                      <p className="text-xs font-semibold text-gray-700">{r.value}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-xl border border-gray-200 p-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Variable Reference</p>
                              <div className="flex flex-col gap-2">
                                {MSG_VARS.map(v => (
                                  <div key={v.key} className="flex items-start gap-2">
                                    <code className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">{v.key}</code>
                                    <p className="text-[11px] text-gray-500 leading-tight">{v.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <p className="text-xs font-bold text-amber-700">Dilution Policy</p>
                              </div>
                              <p className="text-[11px] text-amber-700 leading-relaxed">
                                If the customer does not authorise payment within the 72-hour hold window, the staked asset
                                position is proportionally diluted. Both reminder templates communicate this professionally.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── CHANNELS TAB ── */}
                    {activeTab === "channels" && (
                      <motion.div key="channels" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Active Channels</p>
                            <div className="grid grid-cols-2 gap-3">
                              {CHANNELS.map((ch, i) => {
                                const on = activeChannels.has(ch.label);
                                return (
                                  <motion.button key={i} onClick={() => toggleChannel(ch.label)} whileTap={{ scale: 0.96 }}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all
                                      ${on ? `${ch.bg} border-current ${ch.color} shadow-sm` : "bg-white border-gray-100 text-gray-300 hover:border-gray-200"}`}>
                                    <div className={`${on ? ch.color : "text-gray-300"} transition-colors`}>{ch.icon}</div>
                                    <div className="flex-1">
                                      <p className={`text-sm font-bold transition-colors ${on ? ch.color : "text-gray-400"}`}>{ch.label}</p>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full transition-all relative ${on ? "bg-current" : "bg-gray-200"}`} style={{ opacity: on ? 1 : 0.5 }}>
                                      <motion.div animate={{ x: on ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm" />
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col gap-4">
                            <div className="rounded-xl border border-gray-200 p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                                Recommendation Flow · {activeChannels.size} active
                              </p>
                              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                                <Zap className="w-4 h-4 text-red-500 shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-red-600">Payment Declined · $164.98 · Code 51 — Insufficient Funds</p>
                                  <p className="text-[10px] text-red-400">StakePay agent triggered</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <AnimatePresence>
                                  {CHANNELS.filter(ch => activeChannels.has(ch.label)).map((ch, i) => (
                                    <motion.div key={ch.label}
                                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 12 }} transition={{ delay: i * 0.05 }}
                                      className={`flex items-center gap-3 ${ch.bg} rounded-xl px-3 py-2.5 border ${ch.bg.replace("bg-","border-").replace("50","100")}`}>
                                      <div className={ch.color}>{ch.icon}</div>
                                      <div className="flex-1">
                                        <p className={`text-xs font-bold ${ch.color}`}>{ch.label}</p>
                                        <p className="text-[10px] text-gray-500">
                                          {ch.label === "Push Notification" && "\"Your payment was declined. StakePay secured your order.\""}
                                          {ch.label === "Chatbot"           && "Stake offer presented inline with 72h resolution window"}
                                          {ch.label === "SMS"               && "\"Hi! Your $164.98 at ShopNow is secured. Reply PAY.\""}
                                          {ch.label === "IVR"               && "Voice prompt with keypad confirmation"}
                                          {ch.label === "In-App"            && "Modal overlay with one-tap resolution"}
                                          {ch.label === "Pega"              && "Next Best Action card in Pega desktop"}
                                          {ch.label === "Salesforce"        && "Case auto-created in Salesforce Service Cloud"}
                                          {ch.label === "Human Agent"       && "Full context pushed to agent workspace"}
                                        </p>
                                      </div>
                                      <CheckCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                                {activeChannels.size === 0 && (
                                  <p className="text-center py-4 text-sm text-gray-300">No channels active — toggle some above</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── A2A TAB ── */}
                    {activeTab === "a2a" && (
                      <motion.div key="a2a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Agent Network</p>
                            <div className="grid grid-cols-2 gap-2.5">
                              {A2A_AGENTS.map(a => (
                                <div key={a.id}
                                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all
                                    ${a.id === "stakepay" ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-white"}`}>
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${a.live ? a.dot : "bg-gray-300"}`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-700 truncate">{a.name}</p>
                                    <p className="text-[9px] text-gray-400">{a.cat}</p>
                                  </div>
                                  {a.id === "stakepay" && <Network className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-xl border border-gray-200 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Active Context Flows</p>
                            <div className="flex flex-col gap-3">
                              {A2A_FLOWS.map((f, i) => {
                                const from = A2A_AGENTS.find(a => a.id === f.from)!;
                                const to   = A2A_AGENTS.find(a => a.id === f.to)!;
                                return (
                                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                                      <div className={`w-2 h-2 rounded-full ${from.dot}`} />
                                      <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400" />
                                      <div className={`w-2 h-2 rounded-full ${to.dot}`} />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-gray-700">{from.name} → {to.name}</p>
                                      <p className="text-[11px] text-gray-400 leading-snug">{f.label}</p>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                A2A flows are carried in the shared{" "}
                                <span className="font-mono text-blue-500">JourneyToken</span> —
                                a living record every agent in the network can read and write to.
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* ── ANALYTICS TAB ── */}
                    {activeTab === "analytics" && (
                      <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                        {/* Loading / Error */}
                        {analyticsLoading && (
                          <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> Loading live metrics…
                          </div>
                        )}
                        {analyticsError && !analyticsLoading && (
                          <div className="mb-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {analyticsError}
                          </div>
                        )}

                        {(() => {
                          const s = analytics?.summary;
                          const hasRealData = (s?.total_runs ?? 0) > 0;

                          const kpiCards = hasRealData ? [
                            { label: "Recovery Rate",       value: `${s!.recovery_rate_pct}%`,
                              delta: `${s!.recovered} of ${s!.total_runs} runs`, deltaUp: true,  color: "emerald", border: "border-l-emerald-500" },
                            { label: "Revenue Recovered",   value: `$${s!.revenue_recovered.toLocaleString()}`,
                              delta: `$${s!.fees_collected.toFixed(2)} fees collected`, deltaUp: true, color: "blue", border: "border-l-blue-500" },
                            { label: "Avg Resolution Time", value: s!.avg_resolution_hours != null ? `${s!.avg_resolution_hours}h` : "—",
                              delta: "since first run", deltaUp: false, color: "violet", border: "border-l-violet-500" },
                            { label: "Active Holds",        value: `${s!.active_holds}`,
                              delta: "awaiting resolution", deltaUp: null, color: "amber", border: "border-l-amber-500" },
                          ] : [
                            { label: "Recovery Rate",       value: "—", delta: "No runs yet — trigger demo", deltaUp: null, color: "emerald", border: "border-l-emerald-500" },
                            { label: "Revenue Recovered",   value: "—", delta: "No runs yet",                 deltaUp: null, color: "blue",    border: "border-l-blue-500"    },
                            { label: "Avg Resolution Time", value: "—", delta: "No runs yet",                 deltaUp: null, color: "violet",  border: "border-l-violet-500"  },
                            { label: "Active Holds",        value: "0", delta: "No active holds",             deltaUp: null, color: "amber",   border: "border-l-amber-500"   },
                          ];

                          const trendData = (analytics?.weekly_trend ?? []).map(r => r.rate_pct);
                          const hasTrend  = trendData.length > 1;
                          const chartData = hasTrend ? trendData : [42,51,48,67,61,70,73];
                          const minV = Math.max(0, Math.min(...chartData) - 5);
                          const maxV = Math.max(...chartData) + 5;
                          const pts  = chartData.map((v, i) =>
                            `${(i / Math.max(chartData.length - 1, 1)) * 280},${60 - ((v - minV) / Math.max(maxV - minV, 1)) * 50}`
                          ).join(" ");

                          const channels = analytics?.channel_attribution ?? [];
                          const chColors = ["bg-blue-500","bg-green-500","bg-cyan-500","bg-violet-500","bg-amber-500","bg-gray-400"];
                          const fallbackCh = [
                            { channel: "push",   pct: 52 }, { channel: "sms",    pct: 28 },
                            { channel: "in_app", pct: 12 }, { channel: "other",  pct: 8  },
                          ] as any[];

                          const codes = analytics?.code_performance ?? [];
                          const CODE_LABELS: Record<string, string> = {
                            "51":"Insufficient Funds","54":"Subscription Decline","61":"Exceeds Withdrawal Limit",
                            "65":"Exceeds Frequency Limit","05":"Do Not Honour","14":"Invalid Card Number",
                            "41":"Lost Card","43":"Stolen Card","57":"Transaction Not Permitted","91":"Issuer Unavailable",
                          };
                          const fallbackCodes = [
                            { code: "51", total: 0, recovered: 0, rate_pct: 0 },
                            { code: "54", total: 0, recovered: 0, rate_pct: 0 },
                            { code: "61", total: 0, recovered: 0, rate_pct: 0 },
                            { code: "65", total: 0, recovered: 0, rate_pct: 0 },
                          ] as any[];

                          const activity = analytics?.recent_activity ?? [];

                          return (
                            <>
                              {/* KPI Cards */}
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                {kpiCards.map((kpi, i) => (
                                  <div key={i} className={`bg-white rounded-xl border border-gray-200 border-l-4 ${kpi.border} p-4`}>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                                    <p className={`text-2xl font-black text-${kpi.color}-600 mb-1`}>{kpi.value}</p>
                                    <div className="flex items-center gap-1">
                                      {kpi.deltaUp === true  && <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />}
                                      {kpi.deltaUp === false && <TrendingDown className="w-3 h-3 text-emerald-500 shrink-0" />}
                                      {kpi.deltaUp === null  && <Activity className="w-3 h-3 text-amber-500 shrink-0" />}
                                      <span className="text-[10px] text-gray-500 font-semibold">{kpi.delta}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Sparkline + Channel Attribution */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-700">Recovery Trend (7 weeks)</p>
                                    {!hasTrend && <span className="text-[9px] text-amber-500 font-semibold">illustrative</span>}
                                  </div>
                                  <svg viewBox="0 0 280 60" className="w-full" style={{ height: 60 }}>
                                    <polyline points={pts} fill="none" stroke="#5E5CE6" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                                    {chartData.map((v, i) => {
                                      const x = (i / Math.max(chartData.length - 1, 1)) * 280;
                                      const y = 60 - ((v - minV) / Math.max(maxV - minV, 1)) * 50;
                                      return <circle key={i} cx={x} cy={y} r={i === chartData.length - 1 ? 5 : 3}
                                        fill={i === chartData.length - 1 ? "#5E5CE6" : "#fff"} stroke="#5E5CE6" strokeWidth="2" />;
                                    })}
                                  </svg>
                                  <div className="flex justify-between mt-2">
                                    {chartData.map((_, i) => (
                                      <span key={i} className={`text-[9px] font-semibold ${i === chartData.length - 1 ? "text-[#5E5CE6] font-black" : "text-gray-400"}`}>
                                        W{i+1}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400">Latest:</span>
                                    <span className="text-sm font-black text-[#5E5CE6]">{chartData[chartData.length - 1]}%</span>
                                  </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-700">Channel Attribution</p>
                                    {channels.length === 0 && <span className="text-[9px] text-amber-500 font-semibold">no data yet</span>}
                                  </div>
                                  <div className="flex flex-col gap-2.5">
                                    {(channels.length > 0 ? channels : fallbackCh).map((bar: any, i: number) => (
                                      <div key={i}>
                                        <div className="flex justify-between mb-1">
                                          <span className="text-[11px] font-semibold text-gray-600 capitalize">{(bar.channel as string).replace("_"," ")}</span>
                                          <span className="text-[11px] font-bold text-gray-700">{bar.pct}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <motion.div initial={{ width: "0%" }} animate={{ width: `${bar.pct}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                                            className={`h-full rounded-full ${chColors[i % chColors.length]}`} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Decline Code Table + Activity Feed */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-700">Decline Code Performance</p>
                                    {codes.length === 0 && <span className="text-[9px] text-amber-500 font-semibold">no data yet</span>}
                                  </div>
                                  <div className="overflow-hidden rounded-lg border border-gray-100">
                                    <div className="grid grid-cols-[40px_1fr_48px_56px_72px] bg-gray-50 px-3 py-2 border-b border-gray-100">
                                      {["Code","Descriptor","Decl.","Recov.","Rate"].map(h => (
                                        <p key={h} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{h}</p>
                                      ))}
                                    </div>
                                    {(codes.length > 0 ? codes : fallbackCodes).map((row: any, i: number) => (
                                      <div key={i} className="grid grid-cols-[40px_1fr_48px_56px_72px] items-center px-3 py-2.5 border-b border-gray-50 last:border-0">
                                        <span className="text-xs font-black font-mono text-[#4338CA]">{row.code}</span>
                                        <span className="text-[11px] text-gray-600 pr-2 leading-tight">{CODE_LABELS[row.code] ?? row.code}</span>
                                        <span className="text-[11px] text-gray-500">{row.total}</span>
                                        <span className="text-[11px] text-gray-500">{row.recovered}</span>
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.rate_pct}%` }} />
                                          </div>
                                          <span className="text-[10px] font-bold text-emerald-700 shrink-0">{row.rate_pct}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-700">Recent Activity</p>
                                    <button onClick={() => {
                                      setAnalyticsLoading(true);
                                      fetch(`${API_BASE}/metrics/stakepay`).then(r => r.json())
                                        .then((d: AnalyticsData) => { setAnalytics(d); setAnalyticsLoading(false); })
                                        .catch(() => setAnalyticsLoading(false));
                                    }} className="text-[9px] text-[#5E5CE6] hover:underline flex items-center gap-1">
                                      <RefreshCw className="w-2.5 h-2.5" /> refresh
                                    </button>
                                  </div>
                                  {activity.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">No runs yet — trigger a demo to see live activity.</p>
                                  ) : (
                                    <div className="flex flex-col gap-2">
                                      {activity.map((item, i) => {
                                        const ok  = ["RESOLVED","EXECUTED"].includes(item.status);
                                        const dot = ok ? "bg-green-500" : item.status === "PENDING" ? "bg-amber-400" : "bg-red-500";
                                        const lbl = ok ? "✓ Recovered" : item.status === "PENDING" ? "⏳ Hold Active" : `✗ ${item.status}`;
                                        const txn = (item.transaction_id || item.agent_id || "—").slice(0, 10);
                                        return (
                                          <div key={i} className="flex items-center gap-2.5 py-1.5 border-b border-gray-50 last:border-0">
                                            <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                                            <span className="text-[11px] font-mono text-gray-500 w-20 shrink-0">{txn}</span>
                                            <span className="text-[11px] font-bold text-gray-700 w-16 shrink-0">${item.amount?.toFixed(2)}</span>
                                            <span className="text-[11px] text-gray-600 flex-1">{lbl}</span>
                                            <span className="text-[10px] text-gray-400 shrink-0 capitalize">{item.channel_used || "—"}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* ROI Strip */}
                              <div className="rounded-xl bg-[#0f1e30] px-6 py-4 flex flex-wrap gap-6 justify-around">
                                {(hasRealData ? [
                                  { label: "Revenue Protected",      value: `$${s!.revenue_recovered.toLocaleString(undefined,{maximumFractionDigits:0})}` },
                                  { label: "Transactions Recovered", value: `${s!.recovered}` },
                                  { label: "Return on StakePay Fee", value: s!.fees_collected > 0 ? `${(s!.revenue_recovered / s!.fees_collected).toFixed(0)}:1` : "—" },
                                ] : [
                                  { label: "Revenue Protected",      value: "—" },
                                  { label: "Transactions Recovered", value: "—" },
                                  { label: "Return on StakePay Fee", value: "—" },
                                ]).map((stat, i) => (
                                  <div key={i} className="text-center">
                                    <p className="text-xl font-black text-white">{stat.value}</p>
                                    <p className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">{stat.label}</p>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}

                      </motion.div>
                    )}

                  </AnimatePresence>
                )}
              </div>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════════════
          3. CTA
          ══════════════════════════════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5 }}
        className="rounded-3xl bg-[#4338CA] text-white p-10 text-center">
        <p className="text-sm uppercase tracking-widest text-blue-300 font-bold mb-3">Ready to configure?</p>
        <h2 className="text-3xl font-black mb-3">Build your first agent in Pano</h2>
        <p className="text-blue-200 max-w-xl mx-auto leading-relaxed mb-6 text-sm">
          Pano is in private beta. Connect your event stream, run Nirvana Mode,
          activate your channels, and go live. No infra required.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
          {["Kafka · CSV · Webhook ingestion","8 servicing channels","Nirvana Mode auto-config","A2A context sharing"].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-blue-100">
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={2.5} />{t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="https://github.com/Xomjo/finagents" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[#4338CA] font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm">
            <Workflow className="w-4 h-4" /> Request Pano Access
          </a>
          <Link href="/agents/payments/stakepay"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm">
            <Zap className="w-4 h-4 text-yellow-300" /> Watch StakePay Demo
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
