"use client";

// PWA 설치 가능 여부를 감지해 미설치 상태면 설치 유도 토스트를 띄우는 컴포넌트
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 이미 설치되어 standalone으로 실행 중이면 토스트 노출 안 함
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-white shadow-lg">
      <p className="flex-1 text-sm">앱으로 설치해서 더 빠르게 사용해보세요.</p>
      <button
        onClick={handleInstall}
        className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium hover:bg-emerald-600"
      >
        설치
      </button>
      <button
        onClick={() => setVisible(false)}
        aria-label="닫기"
        className="shrink-0 text-neutral-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
