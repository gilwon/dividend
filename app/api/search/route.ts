// 야후 파이낸스 종목 검색 프록시 API
import { NextRequest, NextResponse } from "next/server";
import { fetchYahoo } from "@/lib/yahoo";
import { KR_STOCKS } from "@/lib/kr-stocks";
import type { SearchResult } from "@/lib/types";

// 야후 검색 응답 중 필요한 필드만 정의
interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

interface YahooSearchResponse {
  quotes: YahooSearchQuote[];
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("q");

  if (!raw) {
    return NextResponse.json(
      { error: "검색어(q)가 필요합니다" },
      { status: 400 }
    );
  }

  // 검색어 정규화 (공백 제거)
  const query = raw.replace(/\s+/g, "");
  if (!query) {
    return NextResponse.json(
      { error: "검색어(q)가 필요합니다" },
      { status: 400 }
    );
  }

  // 로컬 큐레이션 테이블에서 이름/심볼에 검색어가 포함되는 종목 매칭
  const lowerQuery = query.toLowerCase();
  const localResults: SearchResult[] = KR_STOCKS.filter(
    (stock) =>
      stock.name.includes(query) || stock.symbol.toLowerCase().includes(lowerQuery)
  );

  // 야후 검색 API는 한글 검색어를 거부하므로, 한글이 섞인 검색어는 야후 호출을 생략
  const hasKorean = /[ㄱ-힣]/.test(query);

  let yahooResults: SearchResult[] = [];
  if (!hasKorean) {
    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        query
      )}&quotesCount=10&newsCount=0`;
      const data = await fetchYahoo<YahooSearchResponse>(url, 60);

      yahooResults = data.quotes
        .filter((quote) => quote.quoteType === "EQUITY" || quote.quoteType === "ETF")
        .map((quote) => ({
          symbol: quote.symbol,
          name: quote.shortname ?? quote.longname ?? quote.symbol,
          exchange: quote.exchange ?? "",
        }));
    } catch {
      // 야후 검색 실패 시 로컬 매칭 결과만 사용
    }
  }

  // 로컬 결과 우선, symbol 기준 중복 제거하며 야후 결과 병합
  const seen = new Set(localResults.map((r) => r.symbol));
  const merged = [
    ...localResults,
    ...yahooResults.filter((r) => !seen.has(r.symbol)),
  ];

  return NextResponse.json(merged);
}
