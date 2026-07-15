// 포트폴리오 전체 월평균 배당·총 투자금을 보여주는 하단 고정 요약 바
"use client";

import type { PortfolioItem } from "@/lib/types";
import { monthlyDividendForShares, priceKrw } from "@/lib/calc";
import { formatNumber } from "@/lib/format";

export function SummaryBar({
  items,
  usdkrw,
}: {
  items: PortfolioItem[];
  usdkrw: number;
}) {
  const totalMonthly = items.reduce(
    (sum, item) => sum + monthlyDividendForShares(item.quote, item.shares, usdkrw),
    0
  );
  const totalInvestment = items.reduce(
    (sum, item) => sum + priceKrw(item.quote, usdkrw) * item.shares,
    0
  );

  if (items.length === 0) return null;

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 pt-3 backdrop-blur"
      style={{ paddingBottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.5rem))" }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <div>
          <p className="text-xs text-zinc-400">월평균 배당</p>
          <p className="text-xl font-bold text-emerald-600">{formatNumber(totalMonthly)}원</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">총 투자금</p>
          <p className="text-lg font-semibold text-zinc-700">{formatNumber(totalInvestment)}원</p>
        </div>
      </div>
    </div>
  );
}
