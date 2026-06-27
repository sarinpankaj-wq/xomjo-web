"use client";
/**
 * /resolve — StakePay Hold Resolution Landing Page
 *
 * Linked from the resolve_url sent to the user in the notification.
 * URL format: /resolve?hold=HOLD_ID&txn=TXN_ID
 *
 * Fetches hold status from backend, allows user to resolve with one click.
 */
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertTriangle, Loader2, ShieldCheck, Banknote, ArrowRight } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type HoldStatus = "loading" | "active" | "resolved" | "expired" | "not_found" | "error";

interface HoldData {
  hold_id: string;
  amount: number;
  asset_name: string;
  merchant_name: string;
  service_fee: number;
  hold_hours: number;
  deadline: string;
  status: string;
  resolved_by?: string;
  resolved_at?: string;
}

function ResolveContent() {
  const params  = useSearchParams();
  const holdId  = params.get("hold") || "";
  const txnId   = params.get("txn")  || "";

  const [holdData,    setHoldData]    = useState<HoldData | null>(null);
  const [pageStatus,  setPageStatus]  = useState<HoldStatus>("loading");
  const [resolving,   setResolving]   = useState(false);
  const [resolveMsg,  setResolveMsg]  = useState("");

  // Fetch hold status on mount
  useEffect(() => {
    if (!holdId) { setPageStatus("not_found"); return; }
    fetch(`${API_BASE}/resolve/${holdId}`)
      .then(r => {
        if (r.status === 404) { setPageStatus("not_found"); return null; }
        if (!r.ok) { setPageStatus("error"); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setHoldData(data);
        if      (data.status === "active")   setPageStatus("active");
        else if (data.status === "resolved") setPageStatus("resolved");
        else if (data.status === "expired")  setPageStatus("expired");
        else                                 setPageStatus("active");
      })
      .catch(() => setPageStatus("error"));
  }, [holdId]);

  async function handleResolve() {
    if (resolving || !holdId) return;
    setResolving(true);
    try {
      const res = await fetch(`${API_BASE}/resolve/${holdId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved_by: "user" }),
      });
      const data = await res.json();
      if (res.ok && data.resolved) {
        setPageStatus("resolved");
        setResolveMsg(data.message || "Hold resolved successfully.");
      } else {
        setResolveMsg(data.error || "Could not resolve — please contact support.");
      }
    } catch {
      setResolveMsg("Could not reach server. Please try again or contact support.");
    } finally {
      setResolving(false);
    }
  }

  const fmtDeadline = holdData?.deadline
    ? new Date(holdData.deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";

  const fmtAmount = holdData?.amount
    ? `$${holdData.amount.toFixed(2)}`
    : "—";

  const fmtFee = holdData?.service_fee
    ? `$${holdData.service_fee.toFixed(2)}`
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1e30] via-[#1B4F72] to-[#2E86C1] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#1B4F72] px-8 pt-8 pb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-blue-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-300">StakePay · Xomjo</span>
          </div>
          <h1 className="text-2xl font-black leading-tight">Payment Recovery</h1>
          <p className="text-sm text-blue-200 mt-1">Secure one-click hold resolution</p>
        </div>

        <div className="px-8 py-7">
          <AnimatePresence mode="wait">

            {/* Loading */}
            {pageStatus === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8 gap-3">
                <Loader2 className="w-8 h-8 text-[#2E86C1] animate-spin" />
                <p className="text-sm text-gray-400">Fetching hold details…</p>
              </motion.div>
            )}

            {/* Active hold — resolve CTA */}
            {pageStatus === "active" && holdData && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-0.5">Hold Active</p>
                      <p className="text-xs text-amber-600 leading-relaxed">
                        A StakePay hold is active on your linked asset. Authorise below to release it and complete your payment.
                        If no action is taken before the deadline, your staked position may be subject to proportional dilution.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hold summary */}
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Merchant",       value: holdData.merchant_name },
                    { label: "Amount",         value: fmtAmount              },
                    { label: "Staked Asset",   value: holdData.asset_name    },
                    { label: "StakePay Fee",   value: fmtFee                 },
                    { label: "Deadline",       value: fmtDeadline            },
                    { label: "Transaction",    value: txnId || holdId        },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-medium">{row.label}</span>
                      <span className="font-bold text-gray-800">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-5">
                  <div className="flex items-center justify-between text-base font-black text-[#1B4F72]">
                    <span>Total to authorise</span>
                    <span>${((holdData.amount || 0) + (holdData.service_fee || 0)).toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{fmtAmount} payment + {fmtFee} StakePay service fee</p>
                </div>

                {resolveMsg && (
                  <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {resolveMsg}
                  </div>
                )}

                <button onClick={handleResolve} disabled={resolving}
                  className="w-full flex items-center justify-center gap-2 bg-[#1B4F72] hover:bg-[#154060] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                  {resolving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    : <><Banknote className="w-4 h-4" /> Authorise & Release Hold <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
                <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                  By authorising, you agree to release the hold on your staked asset and pay the StakePay service fee.
                  Your linked institution will not be debited — only the hold is released.
                </p>
              </motion.div>
            )}

            {/* Already resolved */}
            {pageStatus === "resolved" && (
              <motion.div key="resolved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Hold Released</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-1">
                  Your payment has been authorised and the hold on your asset is released.
                </p>
                {resolveMsg && <p className="text-xs text-gray-400 mt-2">{resolveMsg}</p>}
                {holdData?.resolved_by && (
                  <p className="text-[10px] text-gray-300 mt-3">Resolved by: {holdData.resolved_by}</p>
                )}
              </motion.div>
            )}

            {/* Expired */}
            {pageStatus === "expired" && (
              <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-9 h-9 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Hold Expired</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  The recovery window for this hold has passed. Please contact support if you believe this is an error.
                </p>
              </motion.div>
            )}

            {/* Not found */}
            {(pageStatus === "not_found" || pageStatus === "error") && (
              <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-9 h-9 text-gray-400" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">
                  {pageStatus === "not_found" ? "Hold Not Found" : "Something Went Wrong"}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {pageStatus === "not_found"
                    ? `No active hold found for ID: ${holdId || "unknown"}. It may have already been resolved or the link has expired.`
                    : "Could not reach the StakePay server. Please try again or contact support."
                  }
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[10px] text-gray-300">
            Powered by{" "}
            <Link href="/" className="text-[#2E86C1] hover:underline font-semibold">Xomjo.com</Link>
            {" "}· StakePay Recovery Platform · Secure · Encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResolvePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1B4F72] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    }>
      <ResolveContent />
    </Suspense>
  );
}
