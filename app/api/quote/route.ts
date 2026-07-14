// 야후 파이낸스 종목 시세 + 배당 이력 프록시 API
import { NextRequest, NextResponse } from "next/server";
import { fetchYahoo } from "@/lib/yahoo";
import type { DividendEvent, StockQuote } from "@/lib/types";

// 야후 차트 응답 중 필요한 필드만 정의
interface YahooDividendEntry {
  amount: number;
  date: number; // unix seconds
}

interface YahooChartResult {
  meta: {
    currency?: string;
    regularMarketPrice?: number;
    shortName?: string;
    longName?: string;
    symbol: string;
  };
  events?: {
    dividends?: Record<string, YahooDividendEntry>;
  };
}

interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error?: { description: string } | null;
  };
}

// unix 초를 yyyy-mm-dd 문자열로 변환
function toDateString(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "종목 심볼(symbol)이 필요합니다" },
      { status: 400 }
    );
  }

  try {
    // range=1y는 경계에 걸린 달의 배당 이벤트가 잘려 지급월이 누락될 수 있어
    // 2년치를 받아 최근 370일(경계 여유 5일)만 사용한다
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=2y&interval=1mo&events=div`;
    const data = await fetchYahoo<YahooChartResponse>(url, 60);

    const result = data.chart.result?.[0];
    if (!result) {
      throw new Error(data.chart.error?.description ?? "종목 정보를 찾을 수 없습니다");
    }

    const { meta } = result;
    if (meta.currency !== "KRW" && meta.currency !== "USD") {
      return NextResponse.json(
        { error: "지원하지 않는 통화입니다" },
        { status: 400 }
      );
    }

    // 배당금 합계용: 최근 370일 이벤트만 (분기배당주가 5회 합산되는 것 방지)
    const allEntries = Object.values(result.events?.dividends ?? {});
    const cutoff = Date.now() / 1000 - 370 * 24 * 60 * 60;
    const dividendEntries = allEntries
      .filter((entry) => entry.date >= cutoff)
      .sort((a, b) => b.date - a.date);

    // 지급월 판정용: 400일 창 — 아직 안 온 이번 달 배당을 작년 이벤트로 보완
    // (예: 월배당주의 7월 배당락일이 370일 창 직전에 걸려 누락되는 문제)
    const monthsCutoff = Date.now() / 1000 - 400 * 24 * 60 * 60;
    const monthEntries = allEntries.filter((entry) => entry.date >= monthsCutoff);

    const dividends: DividendEvent[] = dividendEntries.map((entry) => ({
      date: toDateString(entry.date),
      amount: entry.amount,
    }));

    const annualDividend = dividendEntries.reduce(
      (sum, entry) => sum + entry.amount,
      0
    );

    const payoutMonths = Array.from(
      new Set(monthEntries.map((entry) => new Date(entry.date * 1000).getUTCMonth() + 1))
    ).sort((a, b) => a - b);

    const quote: StockQuote = {
      symbol: meta.symbol,
      name: meta.shortName ?? meta.longName ?? meta.symbol,
      currency: meta.currency,
      price: meta.regularMarketPrice ?? 0,
      annualDividend,
      dividends,
      payoutMonths,
    };

    return NextResponse.json(quote);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "시세 조회에 실패했습니다" },
      { status: 502 }
    );
  }
}
