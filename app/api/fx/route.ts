// 야후 파이낸스 USD/KRW 환율 프록시 API
import { NextResponse } from "next/server";
import { fetchYahoo } from "@/lib/yahoo";
import type { FxRate } from "@/lib/types";

// 야후 차트 응답 중 필요한 필드만 정의
interface YahooChartResponse {
  chart: {
    result: { meta: { regularMarketPrice?: number } }[] | null;
    error?: { description: string } | null;
  };
}

export async function GET() {
  try {
    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?range=1d&interval=1d";
    const data = await fetchYahoo<YahooChartResponse>(url, 3600);

    const result = data.chart.result?.[0];
    const usdkrw = result?.meta.regularMarketPrice;
    if (!usdkrw) {
      throw new Error(data.chart.error?.description ?? "환율 정보를 찾을 수 없습니다");
    }

    const fx: FxRate = { usdkrw };
    return NextResponse.json(fx);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "환율 조회에 실패했습니다" },
      { status: 502 }
    );
  }
}
