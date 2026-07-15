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

async function main() {
  const results = await Promise.all(MARKETS.map(fetchMarket));
  const stocks = results.flat();
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
