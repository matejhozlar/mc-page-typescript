import cron from "node-cron";
import { MemecoinPriceService } from "@/services/crypto/memecoin-price.service";
import type { Client } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";

/**
 * Schedules periodic price updates for crypto tokens
 */
export function scheduleCryptoJobs(mainBot: Client, io: SocketIOServer) {
  const memecoinPriceService = new MemecoinPriceService(mainBot, io);
  // Every 30 seconds — Memecoin price update
  cron.schedule("*/30 * * * * *", () => {
    memecoinPriceService.updateMemecoinPrices();
  });
}
