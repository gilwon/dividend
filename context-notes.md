# 배당 계산기 컨텍스트 노트

## 결정 사항

- **데이터 소스**: 실시간 API (사용자 선택). Yahoo Finance 비공식 API를 Next.js API 라우트로 프록시해서 CORS 우회.
  - 검색: `https://query1.finance.yahoo.com/v1/finance/search?q=...`
  - 시세+배당: `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=1y&interval=1mo&events=div`
  - 환율: 심볼 `KRW=X` (USDKRW)
- **스택**: Next.js App Router + TypeScript + Tailwind. 백엔드 DB 없음, 포트폴리오는 localStorage.
- **통화 처리**: 국내주(.KS/.KQ)는 KRW 그대로, 미국주는 USDKRW 환율로 원화 환산해 표시. 계산은 전부 원화 기준.
- **배당 지급월**: 최근 1년 배당 이벤트의 지급일(ex-date 기준)에서 월 추출.
- **월평균 배당**: 최근 1년 배당 합계 ÷ 12 (연 배당을 월로 평탄화). 초보자 대상이라 "월 평균" 개념으로 단순화.
- **세금**: 1차 범위에선 세전 기준 + 안내 문구만.
- **앱 아이콘**: 기존 에메랄드 색을 유지하고, 작은 크기에서도 식별되는 동전과 상승 막대 심볼을 사용. 한 장의 고해상도 원본에서 favicon, PWA, Apple 규격을 파생해 시각 일관성을 유지.
- **아이콘 검증**: `npm run build` 통과. 프로덕션 서버에서 favicon, PWA, Apple 아이콘 모두 HTTP 200과 올바른 Content-Type 확인. `npm run lint`는 기존 `StockSearch.tsx`, `usePortfolio.ts`의 `react-hooks/set-state-in-effect` 오류로 실패했으며 아이콘 변경과 무관해 수정하지 않음.

## 함정

- Yahoo 비공식 API는 User-Agent 헤더 없으면 429/403 나올 수 있음 → 서버 라우트에서 UA 지정.
- 국내 종목 야후 심볼: 삼성전자 = `005930.KS`, 코스닥은 `.KQ`.
- 배당 이벤트가 없는 종목(성장주) → "배당 없음" 처리 필요.
