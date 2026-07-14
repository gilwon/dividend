// 숫자 표기 공용 포맷 함수 (한국어 로케일)
const won = new Intl.NumberFormat("ko-KR");

// 원화 반올림 정수 표기 (예: 12,345원)
export function formatKrw(amount: number): string {
  return `${won.format(Math.round(amount))}원`;
}

// 콤마 구분 정수 표기 (단위 없이)
export function formatNumber(amount: number): string {
  return won.format(Math.round(amount));
}
