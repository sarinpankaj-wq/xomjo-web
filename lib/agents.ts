export type AgentCategory = "fintech" | "customer-service";

export interface AgentEntry {
  icon: string;
  name: string;
  desc: string;
  live: boolean;
  category: AgentCategory;
  href?: string;
}

export const AGENTS: AgentEntry[] = [
  { icon: "💳", name: "StakePay Recovery",  desc: "Detects declined payments and recovers them autonomously, in real time.", live: true,  category: "fintech",          href: "/agents/payments/stakepay" },
  { icon: "🏦", name: "Issuer Declines",     desc: "Diagnoses issuer-side decline codes and retries with the optimal route.", live: false, category: "fintech" },
  { icon: "🔑", name: "Passkey Drop-off",    desc: "Catches passkey/login failures and recovers the session before churn.",  live: false, category: "fintech" },
  { icon: "📄", name: "Doc AI",              desc: "Extracts and verifies KYC/compliance documents automatically.",         live: false, category: "customer-service" },
  { icon: "📉", name: "Churn Detector",      desc: "Flags at-risk accounts from behavioral signals before they leave.",      live: false, category: "customer-service" },
  { icon: "📞", name: "Contact Concurrency", desc: "Resolves duplicate/overlapping support contacts into one thread.",       live: false, category: "customer-service" },
  { icon: "🛡️", name: "Fraudulent Contact",  desc: "Identifies and routes suspicious support contacts for review.",         live: false, category: "customer-service" },
];

export const CATEGORY_META: Record<AgentCategory, { title: string; tagline: string }> = {
  fintech: {
    title: "FinTech Agents",
    tagline: "Agents that detect and recover payment, onboarding, and identity breakdowns — autonomously.",
  },
  "customer-service": {
    title: "Customer Service Agents",
    tagline: "Agents that resolve support breakdowns and churn risk before a human ever sees the ticket.",
  },
};
