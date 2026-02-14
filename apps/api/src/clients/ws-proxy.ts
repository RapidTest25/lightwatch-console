import type { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { env } from "../config/env";

const VALID_CHANNELS = new Set(["logs", "alerts", "metrics", "security"]);

const INITIAL_RECONNECT_MS = 1000;
const MAX_RECONNECT_MS = 30000;
const RECONNECT_FACTOR = 2;

interface UpstreamState {
  ws: WebSocket | null;
  reconnectMs: number;
  timer: ReturnType<typeof setTimeout> | null;
  closed: boolean;
}

// ─── Per-client upstream connection ─────────────────────────────────

function connectUpstream(
  channel: string,
  client: WebSocket,
  state: UpstreamState,
): void {
  if (state.closed) return;

  const wsProtocol = env.lightwatchRealtimeUrl.startsWith("https")
    ? "wss"
    : "ws";
  const baseHost = env.lightwatchRealtimeUrl.replace(/^https?:\/\//, "");
  const upstreamUrl = `${wsProtocol}://${baseHost}/ws/${channel}`;

  const upstream = new WebSocket(upstreamUrl, {
    headers: { "X-API-Key": env.lightwatchApiKey },
  });

  state.ws = upstream;

  upstream.on("open", () => {
    state.reconnectMs = INITIAL_RECONNECT_MS;
  });

  // Forward upstream → client
  upstream.on("message", (data) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });

  upstream.on("close", () => {
    if (state.closed) return;
    scheduleReconnect(channel, client, state);
  });

  upstream.on("error", (err) => {
    console.error(`[ws-proxy] upstream error (${channel}):`, err.message);
    upstream.close();
  });
}

function scheduleReconnect(
  channel: string,
  client: WebSocket,
  state: UpstreamState,
): void {
  if (state.closed || client.readyState !== WebSocket.OPEN) return;

  state.timer = setTimeout(() => {
    connectUpstream(channel, client, state);
  }, state.reconnectMs);

  state.reconnectMs = Math.min(
    state.reconnectMs * RECONNECT_FACTOR,
    MAX_RECONNECT_MS,
  );
}

function cleanup(state: UpstreamState): void {
  state.closed = true;
  if (state.timer) clearTimeout(state.timer);
  if (state.ws && state.ws.readyState <= WebSocket.OPEN) {
    state.ws.close();
  }
  state.ws = null;
}

// ─── Public API ──────────────────────────────────────────────────────

export function attachWebSocketProxy(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const match = url.pathname.match(/^\/v1\/ws\/(\w+)$/);

    if (!match || !VALID_CHANNELS.has(match[1])) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req, match[1]);
    });
  });

  wss.on(
    "connection",
    (client: WebSocket, _req: IncomingMessage, channel: string) => {
      const state: UpstreamState = {
        ws: null,
        reconnectMs: INITIAL_RECONNECT_MS,
        timer: null,
        closed: false,
      };

      connectUpstream(channel, client, state);

      // Forward client → upstream
      client.on("message", (data) => {
        if (state.ws && state.ws.readyState === WebSocket.OPEN) {
          state.ws.send(data);
        }
      });

      client.on("close", () => cleanup(state));
      client.on("error", () => cleanup(state));
    },
  );

  return wss;
}
