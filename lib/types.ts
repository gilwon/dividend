// 배당 계산기 전역 공용 타입 정의 (API 라우트 ↔ UI 계약)

// 종목 검색 결과 한 건
export interface SearchResult {
  symbol: string; // 야후 심볼 (예: 005930.KS, O, SCHD)
  name: string; // 종목명
  exchange: string; // 거래소 표시명 (예: KSC, NYQ)
}

// 배당 지급 이벤트 한 건
export interface DividendEvent {
  date: string; // 배당락일 ISO 형식 (예: 2026-03-31)
  amount: number; // 주당 배당금 (해당 종목 통화 기준)
}

// 종목 시세 + 배당 정보
export interface StockQuote {
  symbol: string;
  name: string;
  currency: "KRW" | "USD";
  price: number; // 현재가 (해당 통화)
  annualDividend: number; // 최근 1년 주당 배당 합계 (해당 통화)
  dividends: DividendEvent[]; // 최근 1년 배당 내역 (최신순)
  payoutMonths: number[]; // 배당 지급월 (1~12, 오름차순, 중복 제거)
}

// 포트폴리오에 담긴 종목 한 건 (localStorage 저장 단위)
export interface PortfolioItem {
  quote: StockQuote;
  shares: number; // 보유(예정) 주수
}

// 환율 응답
export interface FxRate {
  usdkrw: number; // 1달러당 원화
}
