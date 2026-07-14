// 배당 계산기 메인 페이지: 검색, 포트폴리오, 합산 요약, 계산기를 한 화면에 구성
"use client";

import { useEffect, useState } from "react";
import { StockSearch } from "@/components/StockSearch";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SummaryBar } from "@/components/SummaryBar";
import { Calculators } from "@/components/Calculators";
import { usePortfolio } from "@/hooks/usePortfolio";

const DEFAULT_USDKRW = 1400;

export default function Home() {
  const { items, addQuote, removeItem, setShares } = usePortfolio();
  const [usdkrw, setUsdkrw] = useState(DEFAULT_USDKRW);
  const [fxFailed, setFxFailed] = useState(false);

  // 마운트 시 환율 1회 조회, 실패하면 기본값 유지
  useEffect(() => {
    fetch("/api/fx")
      .then((res) => {
        if (!res.ok) throw new Error("fx fetch failed");
        return res.json();
      })
      .then((data) => setUsdkrw(data.usdkrw))
      .catch(() => setFxFailed(true));
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
        <header>
          <h1 className="text-2xl font-bold text-zinc-900">배당 계산기</h1>
          <p className="mt-1 text-zinc-500">몇 주 사면 매달 얼마 받을까?</p>
          {fxFailed && (
            <p className="mt-2 text-xs text-amber-600">
              환율 정보를 불러오지 못해 1달러 = 1,400원 기준으로 계산해요
            </p>
          )}
        </header>

        <StockSearch onSelect={addQuote} />

        {items.length > 0 && (
          <section className="flex flex-col gap-3">
            {items.map((item) => (
              <PortfolioCard
                key={item.quote.symbol}
                item={item}
                usdkrw={usdkrw}
                onSharesChange={(shares) => setShares(item.quote.symbol, shares)}
                onRemove={() => removeItem(item.quote.symbol)}
              />
            ))}
          </section>
        )}

        <Calculators items={items} usdkrw={usdkrw} />

        <footer className="mt-auto pt-4 text-center text-xs text-zinc-400">
          배당금은 세전 기준이며 최근 1년 실적으로 계산한 참고용 수치입니다.
        </footer>
      </main>

      <SummaryBar items={items} usdkrw={usdkrw} />
    </div>
  );
}
