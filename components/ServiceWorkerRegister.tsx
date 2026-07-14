"use client";

// 프로덕션 빌드에서만 서비스 워커를 등록하는 컴포넌트 (dev에서는 HMR 방해 방지)
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return null;
}
