"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { listPosts } from "@/lib/api";

const POLL_MS = 30_000;

interface QueueCountContextValue {
  count: number | null;
  refresh: () => void;
}

const QueueCountContext = createContext<QueueCountContextValue | null>(null);

export function QueueCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState<number | null>(null);
  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const fetchCount = useCallback(async () => {
    try {
      const data = await listPosts("pending_review");
      if (cancelledRef.current) return;
      setCount(data.total);
    } catch {
      // Hold the last known count on transient errors.
    }
  }, []);

  const refresh = useCallback(() => {
    void fetchCount();
  }, [fetchCount]);

  useEffect(() => {
    cancelledRef.current = false;
    const tick = async () => {
      await fetchCount();
      if (cancelledRef.current) return;
      timeoutRef.current = setTimeout(tick, POLL_MS);
    };
    void tick();

    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fetchCount]);

  return (
    <QueueCountContext.Provider value={{ count, refresh }}>
      {children}
    </QueueCountContext.Provider>
  );
}

export function useQueueCount(): QueueCountContextValue {
  const ctx = useContext(QueueCountContext);
  if (!ctx) {
    throw new Error("useQueueCount must be used inside <QueueCountProvider>");
  }
  return ctx;
}
