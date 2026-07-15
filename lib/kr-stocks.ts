// 야후 검색이 한글 쿼리를 거부하므로 대체용으로 쓰는 한글명→심볼 테이블
// 국내 종목은 scripts/build-kr-stocks.mjs로 KRX KIND 상장법인목록에서 생성 (코스피+코스닥 전체)
import type { SearchResult } from "./types";
import krListedStocks from "./kr-listed-stocks.json";

export const KR_STOCKS: SearchResult[] = [
  ...(krListedStocks as SearchResult[]),

  // 미국 인기 배당주/ETF 한글 별칭
  { symbol: "O", name: "리얼티인컴", exchange: "NYQ" },
  { symbol: "SCHD", name: "슈드", exchange: "PCX" },
  { symbol: "JEPI", name: "제피", exchange: "PCX" },
  { symbol: "JEPQ", name: "젭큐", exchange: "PCX" },
  { symbol: "KO", name: "코카콜라", exchange: "NYQ" },
  { symbol: "JNJ", name: "존슨앤존슨", exchange: "NYQ" },
  { symbol: "PG", name: "피앤지", exchange: "NYQ" },
  { symbol: "MO", name: "알트리아", exchange: "NYQ" },
  { symbol: "T", name: "AT&T", exchange: "NYQ" },
  { symbol: "VZ", name: "버라이즌", exchange: "NYQ" },
  { symbol: "ABBV", name: "애브비", exchange: "NYQ" },
  { symbol: "PEP", name: "펩시코", exchange: "NMS" },
  { symbol: "MCD", name: "맥도날드", exchange: "NYQ" },
  { symbol: "SBUX", name: "스타벅스", exchange: "NMS" },
  { symbol: "XOM", name: "엑슨모빌", exchange: "NYQ" },
  { symbol: "VYM", name: "VYM", exchange: "PCX" },
  { symbol: "DGRO", name: "DGRO", exchange: "PCX" },
];
