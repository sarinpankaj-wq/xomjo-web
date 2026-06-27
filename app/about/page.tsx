export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-[#1B4F72] mb-4">About Xomjo</h1>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
        Xomjo is the world&apos;s first live showcase for open-source AI agents built for fintech
        and customer success. Every agent on this platform is real, running, and observable — 
        no smoke and mirrors.
      </p>

      <div className="bg-white rounded-2xl border p-6 mb-8">
        <h2 className="font-bold text-[#1B4F72] text-lg mb-4">Founder</h2>
        <div className="flex flex-col gap-2 text-sm">
          {[
            ["Name", "Pankaj Sarin"],
            ["Background", "Sr. Manager, Product Management — PayPal (12.5 years)"],
            ["Key Work", "Built Issuer Decline Remediation at PayPal — $500M+ TPV"],
            ["Patents", "70+ granted global patents in AI/ML and fintech"],
            ["Startup", "StakePay — pre-seed, seeking $2–4M"],
            ["Contact", "sarin.pankaj@gmail.com"],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-3">
              <span className="font-semibold text-gray-500 w-28 shrink-0">{k}</span>
              <span className="text-gray-700">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1B4F72] text-white rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-3">Open Source</h2>
        <p className="text-blue-200 text-sm mb-4">
          All agent code lives on GitHub. Fork it, extend it, deploy it on your own data.
          The engine is free. The showcase is Xomjo.
        </p>
        <a href="https://github.com/Xomjo/finagents" target="_blank"
          className="bg-white text-[#1B4F72] font-bold px-5 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors inline-block">
          View on GitHub →
        </a>
      </div>
    </div>
  );
}
