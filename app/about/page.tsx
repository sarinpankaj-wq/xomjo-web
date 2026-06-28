export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-extrabold text-[#1B4F72] mb-4">About Xomjo</h1>
      <p className="text-gray-600 mb-8 text-lg leading-relaxed">
        Xomjo is the world&apos;s first live showcase for open-source AI agents built for fintech
        and customer success. Every agent on this platform is real, running, and observable — 
        no smoke and mirrors.
      </p>

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
