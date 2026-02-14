import { useEffect, useRef, useState, useCallback } from "react";
import type { WsChannel } from "@lightwatch/shared";

const INITIAL_DELAY = 1000;
const MAX_DELAY = 30000;

interface UseLiveStreamOptions {
  enabled?: boolean;
}

interface UseLiveStreamResult<T> {
  messages: T[];
  connected: boolean;
  error: string | null;
  clear: () => void;
}

export function useLiveStream<T = unknown>(
  channel: WsChannel,
  options: UseLiveStreamOptions = {},
): UseLiveStreamResult<T> {
  const { enabled = true } = options;
  const [messages, setMessages] = useState<T[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const delayRef = useRef(INITIAL_DELAY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const clear = useCallback(() => setMessages([]), []);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      return;
    }

    function connect() {
      if (!mountedRef.current) return;

      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = import.meta.env.VITE_API_BASE_URL
        ? new URL(import.meta.env.VITE_API_BASE_URL).host
        : window.location.host;
      const url = `${protocol}://${host}/v1/ws/${channel}`;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);
        setError(null);
        delayRef.current = INITIAL_DELAY;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const parsed = JSON.parse(event.data as string) as T;
          setMessages((prev) => [...prev.slice(-499), parsed]);
        } catch {
          // non-JSON message — ignore
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);
        // Reconnect with exponential backoff
        timerRef.current = setTimeout(() => {
          connect();
        }, delayRef.current);
        delayRef.current = Math.min(delayRef.current * 2, MAX_DELAY);
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [channel, enabled]);

  return { messages, connected, error, clear };
}
