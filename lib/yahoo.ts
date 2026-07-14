// 야후 파이낸스 비공식 API 공통 fetch 헬퍼
const USER_AGENT = "Mozilla/5.0";

// 야후 API를 호출하고 JSON으로 파싱해 반환 (실패 시 예외 발생)
export async function fetchYahoo<T>(
  url: string,
  revalidateSeconds: number
): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`야후 API 응답 오류 (status: ${res.status})`);
  }

  return res.json() as Promise<T>;
}
