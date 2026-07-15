// 종목 검색 입력창과 자동완성 드롭다운
"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchResult, StockQuote } from "@/lib/types";

export function StockSearch({
  onSelect,
}: {
  onSelect: (quote: StockQuote) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  // 검색어 300ms 디바운스 후 /api/search 조회
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(res.ok ? data : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
        setSearched(true);
        setOpen(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 결과 클릭 시 시세를 조회해 포트폴리오에 추가
  async function handlePick(result: SearchResult) {
    setLoadingSymbol(result.symbol);
    try {
      const res = await fetch(`/api/quote?symbol=${encodeURIComponent(result.symbol)}`);
      const data = await res.json();
      if (res.ok) {
        // 사용자가 클릭한 검색 결과의 이름(한글명 포함)을 야후 영문명보다 우선 사용
        onSelect({ ...data, name: result.name || data.name });
        setQuery("");
        setResults([]);
        setOpen(false);
      }
    } finally {
      setLoadingSymbol(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        inputMode="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim() && setOpen(true)}
        placeholder="종목명이나 심볼을 검색해보세요 (예: 삼성전자, SCHD)"
        className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-base placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />

      {open && query.trim() && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          {searching && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
              검색 중...
            </div>
          )}
          {!searching && searched && results.length === 0 && (
            <div className="px-4 py-3 text-sm text-zinc-500">검색 결과가 없어요</div>
          )}
          {!searching &&
            results.map((r) => (
              <button
                key={r.symbol}
                onClick={() => handlePick(r)}
                disabled={loadingSymbol !== null}
                className="flex w-full min-h-[44px] items-center justify-between gap-2 px-4 py-3 text-left hover:bg-emerald-50 disabled:opacity-50"
              >
                <span>
                  <span className="font-medium text-zinc-900">{r.name}</span>
                  <span className="ml-2 text-sm text-zinc-400">{r.symbol}</span>
                </span>
                {loadingSymbol === r.symbol ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-emerald-500" />
                ) : (
                  <span className="text-xs text-zinc-400">{r.exchange}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
