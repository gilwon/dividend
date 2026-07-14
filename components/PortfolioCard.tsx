// 포트폴리오에 담긴 종목 한 건을 보여주는 카드
"use client";

import type { PortfolioItem } from "@/lib/types";
import { dividendYield, monthlyDividendForShares, priceKrw } from "@/lib/calc";
import { formatKrw, formatNumber } from "@/lib/format";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export function PortfolioCard({
  item,
  usdkrw,
  onSharesChange,
  onRemove,
}: {
  item: PortfolioItem;
  usdkrw: number;
  onSharesChange: (shares: number) => void;
  onRemove: () => void;
}) {
  const { quote, shares } = item;
  const isUsd = quote.currency === "USD";
  const priceInKrw = priceKrw(quote, usdkrw);
  const monthly = monthlyDividendForShares(quote, shares, usdkrw);
  const yieldPct = dividendYield(quote) * 100;
  const latestDividend = quote.dividends[0]?.amount ?? 0;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-zinc-900">{quote.name}</p>
          <p className="text-sm text-zinc-400">{quote.symbol}</p>
        </div>
        <button
          onClick={onRemove}
          aria-label="삭제"
          className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-2xl font-bold text-zinc-900">
          {isUsd ? `$${quote.price.toFixed(2)}` : formatKrw(quote.price)}
        </span>
        {isUsd && (
          <span className="text-sm text-zinc-400">약 {formatKrw(priceInKrw)}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
        <span>
          주당 배당금 {isUsd ? `$${latestDividend.toFixed(2)}` : formatKrw(latestDividend)}
        </span>
        <span>배당수익률 {yieldPct.toFixed(2)}%</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {MONTHS.map((m) => {
          const active = quote.payoutMonths.includes(m);
          return (
            <span
              key={m}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                active
                  ? "bg-emerald-500 font-semibold text-white"
                  : "bg-zinc-100 text-zinc-300"
              }`}
            >
              {m}
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSharesChange(shares - 1)}
            aria-label="주수 감소"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-600 hover:bg-zinc-50"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={shares}
            onChange={(e) => onSharesChange(Number(e.target.value) || 0)}
            className="h-11 w-16 rounded-lg border border-zinc-300 text-center text-base focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={() => onSharesChange(shares + 1)}
            aria-label="주수 증가"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-lg text-zinc-600 hover:bg-zinc-50"
          >
            +
          </button>
          <span className="text-sm text-zinc-400">주</span>
        </div>
        <p className="text-right">
          <span className="block text-xs text-zinc-400">월평균</span>
          <span className="font-semibold text-emerald-600">{formatNumber(monthly)}원</span>
        </p>
      </div>
    </div>
  );
}
