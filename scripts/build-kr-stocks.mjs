// KRX KIND 상장법인목록에서 코스피/코스닥 전체 종목(이름+코드)을 받아 lib/kr-listed-stocks.json 생성
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const MARKETS = [
  { marketType: "stockMkt", suffix: "KS", label: "코스피" },
  { marketType: "kosdaqMkt", suffix: "KQ", label: "코스닥" },
];

async function fetchMarket({ marketType, suffix, label }) {
  const res = await fetch(
    `https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&marketType=${marketType}`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  if (!res.ok) {
    throw new Error(`KIND 응답 오류 (status: ${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const html = new TextDecoder("euc-kr").decode(buf);

  const rowRegex = /<tr>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<td[^>]*>([^<]*)<\/td>/g;
  const stocks = [];
  let match;
  while ((match = rowRegex.exec(html))) {
    const [, name, , code] = match;
    if (!/^\d{6}$/.test(code)) continue;
    stocks.push({ symbol: `${code}.${suffix}`, name: name.trim(), exchange: label });
  }
  return stocks;
}

// KIND 상장법인목록은 법인당 대표종목(보통주) 1개만 나와 우선주가 빠진다
// 네이버 시가총액 목록은 개별 종목 단위라 우선주도 별도 행으로 나오므로 여기서 걸러낸다
const PREFERRED_NAME_REGEX = /\d?우[AB]?(\(전환\))?$/;
const ROW_REGEX = /item\/main\.naver\?code=(\d{6})" class="tltle">([^<]*)/g;

async function fetchLastPage(sosok) {
  const res = await fetch(
    `https://finance.naver.com/sise/sise_market_sum.naver?sosok=${sosok}&page=1`,
    { headers: { "User-Agent": "Mozilla/5.0" } }
  );
  const html = new TextDecoder("euc-kr").decode(await res.arrayBuffer());
  const match = html.match(/page=(\d+)"\s*>맨뒤/);
  return match ? Number(match[1]) : 1;
}

async function fetchPreferredStocks({ sosok, suffix, label }) {
  const lastPage = await fetchLastPage(sosok);
  const preferred = [];

  for (let start = 1; start <= lastPage; start += 8) {
    const pageNums = Array.from(
      { length: Math.min(8, lastPage - start + 1) },
      (_, i) => start + i
    );
    const htmls = await Promise.all(
      pageNums.map(async (page) => {
        const res = await fetch(
          `https://finance.naver.com/sise/sise_market_sum.naver?sosok=${sosok}&page=${page}`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );
        return new TextDecoder("euc-kr").decode(await res.arrayBuffer());
      })
    );
    for (const html of htmls) {
      let match;
      while ((match = ROW_REGEX.exec(html))) {
        const [, code, name] = match;
        // 종목명이 "우"로 끝나도 보통주 코드는 항상 0으로 끝남 (예: 성우, 에코글로우) — 우선주 코드는 5/7/9 등 비0
        if (PREFERRED_NAME_REGEX.test(name) && !code.endsWith("0")) {
          preferred.push({ symbol: `${code}.${suffix}`, name, exchange: label });
        }
      }
    }
  }
  return preferred;
}

async function main() {
  const results = await Promise.all(MARKETS.map(fetchMarket));
  const preferredResults = await Promise.all([
    fetchPreferredStocks({ sosok: 0, suffix: "KS", label: "코스피" }),
    fetchPreferredStocks({ sosok: 1, suffix: "KQ", label: "코스닥" }),
  ]);

  const seen = new Set();
  const stocks = [...results.flat(), ...preferredResults.flat()].filter(
    (s) => !seen.has(s.symbol) && seen.add(s.symbol)
  );
  stocks.sort((a, b) => a.name.localeCompare(b.name, "ko"));

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "lib",
    "kr-listed-stocks.json"
  );
  writeFileSync(outPath, JSON.stringify(stocks, null, 2) + "\n");
  console.log(`${stocks.length}개 종목 저장 완료: ${outPath}`);
}

main();
