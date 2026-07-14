// 배당 계산 순수 함수 모음 (모든 결과는 원화 기준)

import type { StockQuote } from "./types";

// 해당 통화 금액을 원화로 환산
export function toKrw(
  amount: number,
  currency: "KRW" | "USD",
  usdkrw: number
): number {
  return currency === "USD" ? amount * usdkrw : amount;
}

// 종목의 원화 환산 현재가
export function priceKrw(quote: StockQuote, usdkrw: number): number {
  return toKrw(quote.price, quote.currency, usdkrw);
}

// 종목의 원화 환산 연간 주당 배당금
export function annualDividendKrw(quote: StockQuote, usdkrw: number): number {
  return toKrw(quote.annualDividend, quote.currency, usdkrw);
}

// 배당수익률 (연 배당 ÷ 현재가, 0~1)
export function dividendYield(quote: StockQuote): number {
  return quote.price > 0 ? quote.annualDividend / quote.price : 0;
}

// 계산기 1: N주 보유 시 월평균 배당 (원)
export function monthlyDividendForShares(
  quote: StockQuote,
  shares: number,
  usdkrw: number
): number {
  return (annualDividendKrw(quote, usdkrw) * shares) / 12;
}

// 투자금으로 살 수 있는 주수 (내림)
export function sharesForInvestment(
  quote: StockQuote,
  investmentKrw: number,
  usdkrw: number
): number {
  const p = priceKrw(quote, usdkrw);
  return p > 0 ? Math.floor(investmentKrw / p) : 0;
}

// 계산기 2: 투자금 입력 → 예상 월평균 배당 (원)
export function monthlyDividendForInvestment(
  quote: StockQuote,
  investmentKrw: number,
  usdkrw: number
): number {
  const shares = sharesForInvestment(quote, investmentKrw, usdkrw);
  return monthlyDividendForShares(quote, shares, usdkrw);
}

// 계산기 3: 목표 월배당 → 필요 주수와 필요 투자금 (원)
export function investmentForTargetMonthly(
  quote: StockQuote,
  targetMonthlyKrw: number,
  usdkrw: number
): { shares: number; investmentKrw: number } {
  const annualPerShare = annualDividendKrw(quote, usdkrw);
  if (annualPerShare <= 0) return { shares: 0, investmentKrw: 0 };
  const shares = Math.ceil((targetMonthlyKrw * 12) / annualPerShare);
  return { shares, investmentKrw: shares * priceKrw(quote, usdkrw) };
}
