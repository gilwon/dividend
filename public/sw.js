// 오프라인 최소 지원용 서비스 워커 — API/외부 요청은 캐시하지 않고 앱 셸만 network-first로 캐싱
const CACHE_NAME = "dividend-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GET이 아니거나, API 요청이거나, 외부 origin(야후 시세 등) 요청은 그냥 통과 — 캐시 금지
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // 앱 셸(네비게이션, same-origin 정적자산)은 network-first, 실패 시 캐시로 폴백
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw error;
      }
    })()
  );
});
