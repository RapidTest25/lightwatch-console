import "dotenv/config";
import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { attachWebSocketProxy } from "./clients/ws-proxy";

const app = createApp();
const server = createServer(app);

// Attach WebSocket proxy (handles /v1/ws/:channel upgrades)
const wss = attachWebSocketProxy(server);

server.listen(env.port, () => {
  console.log(
    `[lightwatch-bff] listening on port ${env.port} (${env.nodeEnv})`,
  );
});

// Graceful shutdown
function shutdown() {
  console.log("[lightwatch-bff] shutting down...");
  wss.clients.forEach((client) => client.close());
  wss.close();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
