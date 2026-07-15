// 네이버 금융 실시간 시세 비공식 API 공통 fetch 헬퍼 (국내 종목 현재가 전용)
const USER_AGENT = "Mozilla/5.0";

interface NaverRealtimeResponse {
  datas: { closePrice: string }[];
}

// 6자리 종목코드로 네이버 실시간 현재가를 조회한다 (실패 시 예외 발생)
export async function fetchNaverPrice(code: string): Promise<number> {
  const res = await fetch(
    `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`,
    { headers: { "User-Agent": USER_AGENT }, next: { revalidate: 30 } }
  );

  if (!res.ok) {
    throw new Error(`네이버 API 응답 오류 (status: ${res.status})`);
  }

  const data: NaverRealtimeResponse = await res.json();
  const closePrice = data.datas[0]?.closePrice;
  if (!closePrice) {
    throw new Error("네이버 시세 데이터가 비어있습니다");
  }

  return Number(closePrice.replace(/,/g, ""));
}
