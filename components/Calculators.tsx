// 투자금/목표 배당 기준 계산기 (탭 2개)
"use client";

import { useState } from "react";
import type { PortfolioItem } from "@/lib/types";
import {
  investmentForTargetMonthly,
  monthlyDividendForInvestment,
  sharesForInvestment,
} from "@/lib/calc";
import { formatNumber } from "@/lib/format";

// 콤마 포함 문자열 → 숫자
function parseAmount(text: string): number {
  return Number(text.replace(/[^0-9]/g, "")) || 0;
}

export function Calculators({
  items,
  usdkrw,
}: {
  items: PortfolioItem[];
  usdkrw: number;
}) {
  const [tab, setTab] = useState<"investment" | "target">("investment");
  const [symbol, setSymbol] = useState(items[0]?.quote.symbol ?? "");
  const [investmentText, setInvestmentText] = useState("");
  const [targetText, setTargetText] = useState("");

  const selected = items.find((item) => item.quote.symbol === symbol) ?? items[0];

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-400">
        종목을 검색해서 추가하면 계산기를 사용할 수 있어요
      </div>
    );
  }

  const investment = parseAmount(investmentText);
  const target = parseAmount(targetText);
  const buyableShares = selected ? sharesForInvestment(selected.quote, investment, usdkrw) : 0;
  const expectedMonthly = selected
    ? monthlyDividendForInvestment(selected.quote, investment, usdkrw)
    : 0;
  const targetResult = selected
    ? investmentForTargetMonthly(selected.quote, target, usdkrw)
    : { shares: 0, investmentKrw: 0 };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("investment")}
          className={`h-11 flex-1 rounded-xl text-sm font-medium ${
            tab === "investment" ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          투자금으로 계산
        </button>
        <button
          onClick={() => setTab("target")}
          className={`h-11 flex-1 rounded-xl text-sm font-medium ${
            tab === "target" ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-500"
          }`}
        >
          목표로 계산
        </button>
      </div>

      <select
        value={selected?.quote.symbol ?? ""}
        onChange={(e) => setSymbol(e.target.value)}
        className="mt-4 h-11 w-full rounded-xl border border-zinc-300 px-3 text-sm focus:border-emerald-500 focus:outline-none"
      >
        {items.map((item) => (
          <option key={item.quote.symbol} value={item.quote.symbol}>
            {item.quote.name}
          </option>
        ))}
      </select>

      {tab === "investment" ? (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={investmentText}
            onChange={(e) => setInvestmentText(formatNumber(parseAmount(e.target.value)))}
            placeholder="3,000만원이면?"
            className="h-12 w-full rounded-xl border border-zinc-300 px-4 text-base focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex justify-between rounded-xl bg-zinc-50 p-4">
            <div>
              <p className="text-xs text-zinc-400">살 수 있는 주수</p>
              <p className="text-lg font-bold text-zinc-900">{formatNumber(buyableShares)}주</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">예상 월평균 배당</p>
              <p className="text-lg font-bold text-emerald-600">{formatNumber(expectedMonthly)}원</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            type="text"
            inputMode="numeric"
            value={targetText}
            onChange={(e) => setTargetText(formatNumber(parseAmount(e.target.value)))}
            placeholder="월 50만원 받으려면?"
            className="h-12 w-full rounded-xl border border-zinc-300 px-4 text-base focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex justify-between rounded-xl bg-zinc-50 p-4">
            <div>
              <p className="text-xs text-zinc-400">필요 주수</p>
              <p className="text-lg font-bold text-zinc-900">{formatNumber(targetResult.shares)}주</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-400">필요 투자금</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatNumber(targetResult.investmentKrw)}원
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
