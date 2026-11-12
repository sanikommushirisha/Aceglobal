export default function StatsBento() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#e8f5f3] p-5 md:p-8 rounded-[32px]">
          {[
            {
              value: "Established in 2021",
              desc: "Built by CPAs, tax experts, and experienced accountants serving 10,000+ clients across bookkeeping, tax, payroll, and compliance.",
            },
            {
              value: "10,000+ Clients Served",
              desc: "Trusted by founders, small businesses, and high-income households.",
            },
            {
              value: "$1B+ Volume Processed",
              desc: "Across business transactions, filings, books, and tax workflows.",
            },
            {
              value: "$1M+ Tax Savings Identified",
              desc: "Helping clients plan smarter, stay compliant, and avoid surprises.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-2">{item.value}</h3>
              <p className="text-sm text-[#6b7280] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
