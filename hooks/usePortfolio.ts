// localStorage에 배당 포트폴리오를 저장/로드하는 훅
"use client";

import { useEffect, useState } from "react";
import type { PortfolioItem, StockQuote } from "@/lib/types";

const STORAGE_KEY = "dividend-portfolio-v1";

export function usePortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  // SSR 하이드레이션 불일치 방지를 위해 마운트 후에만 localStorage 로드
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let stored: PortfolioItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // 저장된 값이 손상된 경우 빈 포트폴리오로 시작
    }
    setItems(stored);
    setLoaded(true);

    // 저장된 시세는 낡았을 수 있으므로 마운트 시 최신 시세로 갱신
    // (이름은 사용자가 검색으로 고른 한글명을 유지)
    stored.forEach(async (item) => {
      try {
        const res = await fetch(
          `/api/quote?symbol=${encodeURIComponent(item.quote.symbol)}`
        );
        if (!res.ok) return;
        const fresh: StockQuote = await res.json();
        setItems((prev) =>
          prev.map((p) =>
            p.quote.symbol === item.quote.symbol
              ? { ...p, quote: { ...fresh, name: p.quote.name } }
              : p
          )
        );
      } catch {
        // 갱신 실패 시 저장된 값 그대로 사용
      }
    });
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  // 종목 추가 (이미 있으면 무시), 기본 0주
  function addQuote(quote: StockQuote) {
    setItems((prev) =>
      prev.some((item) => item.quote.symbol === quote.symbol)
        ? prev
        : [...prev, { quote, shares: 0 }]
    );
  }

  function removeItem(symbol: string) {
    setItems((prev) => prev.filter((item) => item.quote.symbol !== symbol));
  }

  function setShares(symbol: string, shares: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.quote.symbol === symbol
          ? { ...item, shares: Math.max(0, shares) }
          : item
      )
    );
  }

  return { items, loaded, addQuote, removeItem, setShares };
}
