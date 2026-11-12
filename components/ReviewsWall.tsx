const rowOne = [
  {
    name: "James Wilson",
    role: "Owner, Wilson Auto Repair",
    text: "Ace Global's TaxPass is a lifesaver. They handled our books, payroll, and state filings without me having to chase anything.",
    initials: "JW",
    color: "bg-[#034f46]",
  },
  {
    name: "Leo Richards",
    role: "COO, TerraForm Services",
    text: "Incredible support. My dedicated accountant responds fast and actually understands how a small business operates. Best investment we've made.",
    initials: "LR",
    color: "bg-[#464a55]",
  },
  {
    name: "Tom Rivera",
    role: "Founder, Gridcraft Construction",
    text: "We switched from an expensive local firm and saved thousands on accounting costs. The quality is better, and the communication is much faster.",
    initials: "TR",
    color: "bg-[#034f46]",
  },
  {
    name: "Sophie Lin",
    role: "Owner, Brightwave Salon",
    text: "Onboarding was effortless. Within a week, our books were cleaned up, reconciled, and ready for tax season.",
    initials: "SL",
    color: "bg-[#023d35]",
  },
  {
    name: "Aria Song",
    role: "CEO, Horizon Lab",
    text: "The only accounting team that actually understands small business compliance. They keep us ahead on taxes, filings, and deadlines.",
    initials: "AS",
    color: "bg-[#034f46]",
  },
  {
    name: "Priya Kapoor",
    role: "Owner, Kapoor Dental Group",
    text: "We finally have clean financials every month. Ace Global helped us understand cash flow, expenses, and what we should be setting aside for taxes.",
    initials: "PK",
    color: "bg-[#023d35]",
  },
];

const rowTwo = [
  {
    name: "Nina Park",
    role: "CFO, Loopify Retail",
    text: "The monthly reports are clear and easy to understand. I know exactly where the business stands without digging through spreadsheets.",
    initials: "NP",
    color: "bg-[#034f46]",
  },
  {
    name: "Marcus Hale",
    role: "Founder, Stackline Logistics",
    text: "Finally an accounting team that speaks business owner language. They flag issues before they become expensive problems.",
    initials: "MH",
    color: "bg-[#034f46]",
  },
  {
    name: "Rachel Chen",
    role: "Owner, Bay Area Café",
    text: "They helped us get payroll, sales tax, and monthly bookkeeping under control. I can focus on customers instead of paperwork.",
    initials: "RC",
    color: "bg-[#023d35]",
  },
  {
    name: "David Kim",
    role: "Founder, Kim Home Services",
    text: "Before Ace Global, tax season was always stressful. Now our books stay updated every month, and we know what to expect before filing.",
    initials: "DK",
    color: "bg-[#464a55]",
  },
  {
    name: "Anita Mehta",
    role: "Owner, Mehta Consulting Group",
    text: "The real-time dashboard helps me see revenue, expenses, and cash flow without waiting until month-end. It feels like having a finance team without hiring one.",
    initials: "AM",
    color: "bg-[#034f46]",
  },
];

type Review = (typeof rowOne)[number];

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e0e0e0]/20 w-[360px] flex-shrink-0">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
        >
          {r.initials}
        </div>
        <div>
          <p className="text-sm font-medium text-[#1a1a1a]">{r.name}</p>
          <p className="text-xs text-[#6b7280]">{r.role}</p>
        </div>
      </div>
      <p className="text-sm text-[#374151] leading-relaxed">&ldquo;{r.text}&rdquo;</p>
    </div>
  );
}

function MarqueeRow({ items, reverse }: { items: Review[]; reverse?: boolean }) {
  // Duplicate the items so the loop is seamless when it wraps at -50%.
  const doubled = [...items, ...items];
  return (
    <div className="group relative overflow-hidden">
      <div
        className="flex gap-6 w-max"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} 32s linear infinite`,
        }}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={`${r.name}-${i}`} r={r} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewsWall() {
  return (
    <section className="py-16 md:py-[120px] bg-[#eef3f1] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 md:px-6 mb-16">
        {/* Pull quote */}
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-[40px] md:text-[60px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#1a1a1a]">
            &ldquo;This took a huge weight off my shoulders.&rdquo;
          </blockquote>
        </div>
      </div>

      {/* Two opposing marquee rows */}
      <div className="flex flex-col gap-6">
        <MarqueeRow items={rowOne} />
        <MarqueeRow items={rowTwo} reverse />
      </div>
    </section>
  );
}
