"use client";

import { useState } from "react";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number; // effective per-month price when billed annually
  popular?: boolean;
  highlight: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    tagline: "For new and small businesses getting their books in order.",
    monthly: 299,
    annual: 249,
    highlight: "Up to $25k monthly expenses",
    features: [
      "Monthly bookkeeping & reconciliation",
      "Dedicated bookkeeper",
      "P&L, balance sheet & cash flow",
      "Year-end tax-ready financials",
      "WhatsApp & iMessage support",
    ],
  },
  {
    name: "Growth",
    tagline: "For growing teams that need payroll and tax handled too.",
    monthly: 599,
    annual: 499,
    popular: true,
    highlight: "Up to $75k monthly expenses",
    features: [
      "Everything in Starter",
      "Payroll & compliance",
      "Quarterly tax estimates",
      "CPA review on every close",
      "Historical cleanup included",
      "Priority response times",
    ],
  },
  {
    name: "Scale",
    tagline: "For established businesses with complex, multi-entity needs.",
    monthly: 999,
    annual: 849,
    highlight: "Unlimited expenses",
    features: [
      "Everything in Growth",
      "Corporate tax filing included",
      "Dedicated CPA + finance lead",
      "Multi-entity & consolidations",
      "Sales tax & franchise tax",
      "Investor-ready reporting",
    ],
  },
];

function Check() {
  return (
    <svg
      className="w-5 h-5 text-[#034f46] shrink-0 mt-0.5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function PricingTables() {
  const [annual, setAnnual] = useState(true);

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <span
          className={`text-sm font-medium ${annual ? "text-[#6b7280]" : "text-[#1a1a1a]"}`}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual(!annual)}
          className="relative w-14 h-8 rounded-full bg-[#034f46] transition-colors"
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
              annual ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium ${annual ? "text-[#1a1a1a]" : "text-[#6b7280]"}`}
        >
          Annual
          <span className="ml-2 inline-block bg-[#D6F5E3] text-[#1A7A44] text-xs px-2 py-0.5 rounded-full font-medium">
            Save ~17%
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[32px] p-8 flex flex-col border backdrop-blur-md ${
              plan.popular
                ? "bg-[#023d35]/80 text-white border-white/15 shadow-2xl shadow-[#023d35]/30 md:-mt-4 md:mb-0"
                : "bg-white/55 text-[#1a1a1a] border-white/60 shadow-xl shadow-[#034f46]/5"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              {plan.popular && (
                <span className="text-xs bg-[#8fc7b8] text-[#023d35] px-3 py-1 rounded-full font-medium">
                  Most popular
                </span>
              )}
            </div>
            <p
              className={`text-sm leading-relaxed mb-6 ${
                plan.popular ? "text-[#e0e8e5]/70" : "text-[#6b7280]"
              }`}
            >
              {plan.tagline}
            </p>

            <div className="mb-1 flex items-end gap-1">
              <span className="text-5xl font-semibold tabular-nums">
                ${annual ? plan.annual : plan.monthly}
              </span>
              <span
                className={`text-sm mb-2 ${plan.popular ? "text-[#e0e8e5]/70" : "text-[#6b7280]"}`}
              >
                /mo
              </span>
            </div>
            <p
              className={`text-xs mb-6 ${plan.popular ? "text-[#e0e8e5]/60" : "text-[#6b7280]"}`}
            >
              {annual ? "billed annually" : "billed monthly"} · {plan.highlight}
            </p>

            <a
              href="https://app.aceglobal.ai/"
              className={`block text-center w-full py-3.5 rounded-full font-medium text-sm transition-all mb-8 ${
                plan.popular
                  ? "bg-white text-[#023d35] hover:bg-[#eef3f1]"
                  : "bg-[#034f46] text-white hover:bg-[#034f46]/90 shadow-lg shadow-[#034f46]/20"
              }`}
            >
              Get started
            </a>

            <ul className="space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <Check />
                  <span
                    className={`text-sm ${plan.popular ? "text-[#e0e8e5]" : "text-[#374151]"}`}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Enterprise strip */}
      <div className="mt-6 bg-white/45 backdrop-blur-md border border-white/60 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-[#034f46]/5">
        <div>
          <h3 className="text-xl font-semibold text-[#1a1a1a] mb-1">Need something custom?</h3>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xl">
            Multiple entities, international filings, or high transaction volume? We&apos;ll build a
            plan around your business.
          </p>
        </div>
        <button className="shrink-0 bg-white border border-[#e0e0e0]/40 text-[#034f46] px-8 py-3.5 rounded-full font-medium text-sm hover:bg-white/60 transition-colors">
          Talk to sales
        </button>
      </div>
    </div>
  );
}
