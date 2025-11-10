import type { Pool } from "pg";
import type { Client } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import {
  cryptoTokenQueries,
  tokenPriceHistoryQueries,
  tokenPriceAlertQueries,
} from "@/db";
import { sendCrashNotification } from "@/discord/notifiers/crypto/crash-notifier";
import config from "@/config";
import logger from "@/logger";

const UPWARD_BIAS = config.crypto.memecoins.upwardBias;
const CRASH_PRICE_THRESHOLD = config.crypto.memecoins.crashPriceThreshold;
const VOLATILITY = config.crypto.memecoins.volatility;
const LIME_GREEN = config.colors.LIME_GREEN;
const PRICE_DECIMALS = 4;
const ALERT_DM_DELAY_MS = 300;
const LOW = VOLATILITY.low;
const MID = VOLATILITY.mid;
const HIGH = VOLATILITY.high;

export class MemecoinPriceService {
  constructor(private mainBot: Client, private io: SocketIOServer) {}

  /**
   * Simulates price updates for memecoins and handles crashing logic, price alerts,
   * hourly snapshots, and history trimming.
   */
  async updateMemecoinPrices(): Promise<void> {
    try {
      const tokens = await cryptoTokenQueries.getActiveMemecoins();

      for (const token of tokens) {
        const price = parseFloat(token.price_per_unit);
        if (!Number.isFinite(price)) continue;

        if (price < CRASH_PRICE_THRESHOLD) {
          await this.handleTokenCrash(token);
          continue;
        }

        const newPrice = this.calculateNewPrice(price);
        const newPriceFormatted = newPrice.toFixed(PRICE_DECIMALS);

        await cryptoTokenQueries.updatePrice(token.id, newPriceFormatted);

        if (newPriceFormatted !== price.toFixed(PRICE_DECIMALS)) {
          const updatedToken = await cryptoTokenQueries.findById(token.id);
          if (updatedToken) {
            this.io.emit("token:update", updatedToken);
          }
        }

        await tokenPriceHistoryQueries.addMinuteEntry(
          token.id,
          newPriceFormatted
        );
        await this.checkAndTriggerAlerts(token.id, token.symbol, newPrice);
        await this.handleHourlySnapshot(token.id, newPriceFormatted);
        await this.trimOldHistoryEntires(token.id);
      }
    } catch (error) {}
  }

  /**
   * Handles token crash: updates DB, sends notification, deletes alerts
   *
   * @param token - Token with ID, symbol
   */
  private async handleTokenCrash(token: {
    id: number;
    symbol: string;
  }): Promise<void> {
    await cryptoTokenQueries.crashMemecoin(token.id);

    const crashedToken = await cryptoTokenQueries.findById(token.id);
    if (!crashedToken) return;

    const alerts = await tokenPriceAlertQueries.findBySymbol(token.symbol);

    for (const alert of alerts) {
      try {
        const user = await this.mainBot.users.fetch(alert.discord_id);
        await user.send(
          `Your alert for **${token.symbol}** has been cancelled — the token has **auto-crashed to $0**.`
        );
      } catch (error) {
        logger.warn(
          `Failed to send crash alert DM to ${alert.discord_id}:`,
          error
        );
      }
    }

    await tokenPriceAlertQueries.deleteBySymbol(token.symbol);
    await sendCrashNotification(crashedToken);
  }

  /**
   * Calculates new price based on volatility tiers
   *
   * @param currentPrice - Current price of the token
   */
  private calculateNewPrice(currentPrice: number): number {
    const direction = Math.random() < UPWARD_BIAS ? 1 : -1;
    let changePercent: number;

    if (currentPrice < LOW.priceThreshold) {
      changePercent = Math.random() * (LOW.max - LOW.min) + LOW.min;
    } else if (currentPrice < MID.priceThreshold) {
      changePercent = Math.random() * MID.max;
    } else if (currentPrice < HIGH.pricethreshold) {
      const scale =
        (currentPrice - MID.priceThreshold) /
        (HIGH.pricethreshold - MID.priceThreshold);
      const maxPercent = MID.max - scale * (MID.max - HIGH.max);
      changePercent = Math.random() * maxPercent;
    } else {
      changePercent = Math.random() * HIGH.max;
    }

    const delta = currentPrice * changePercent * direction;
    return Math.max(0, currentPrice + delta);
  }

  /**
   * Checks alerts and sends notifications to users when triggered
   *
   * @param tokenId - The ID to notify about
   * @param symbol - Symbol of the token
   * @param newPrice - New price of the token
   */
  private async checkAndTriggerAlerts(
    tokenId: number,
    symbol: string,
    newPrice: number
  ): Promise<void> {
    const alerts = await tokenPriceAlertQueries.findByTokenId(tokenId);

    const triggeredAlerts = alerts.filter((alert) => {
      const targetPrice = parseFloat(alert.target_price);
      if (alert.direction === "above") {
        return newPrice >= targetPrice;
      } else {
        return newPrice <= targetPrice;
      }
    });

    for (const alert of triggeredAlerts) {
      try {
        await this.sendAlertNotification(alert, symbol, newPrice);
        await tokenPriceAlertQueries.delete(alert.id);

        logger.info(`Sent alert to ${alert.discord_id} for ${symbol}`);

        await new Promise((resolve) => setTimeout(resolve, ALERT_DM_DELAY_MS));
      } catch (error) {
        logger.warn(`Failed to send alert DM to ${alert.discord_id}:`, error);
      }
    }
  }

  /**
   * Sends a Discord DM notification for a triggered price alert
   *
   * @param discord_id - The user ID to send the message to
   * @param token_symbol - Symbol of the token
   * @param direction Above/Under
   */
  private async sendAlertNotification(
    alert: {
      discord_id: string;
      token_symbol: string;
      direction: string | null;
    },
    symbol: string,
    newPrice: number
  ): Promise<void> {
    const user = await this.mainBot.users.fetch(alert.discord_id);
    const triggerDirectionText =
      alert.direction === "below" ? "dropped below" : "reached";

    const embed = new EmbedBuilder()
      .setTitle(`📈 ${symbol} Price Alert`)
      .setDescription(
        `**${symbol}** has ${triggerDirectionText} your target of **$${newPrice.toFixed(
          PRICE_DECIMALS
        )}**!\n\nYou have been automatically unsubscribed from this alert.`
      )
      .setColor(LIME_GREEN)
      .setFooter({ text: "Createrington Market Alert System" })
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("View Market")
        .setStyle(ButtonStyle.Link)
        .setURL("https://create-rington.com/market")
    );

    await user.send({
      embeds: [embed],
      components: [row],
    });
  }

  /**
   * Adds hourly snapshot if one doesn't exist in the last 55 minutes
   *
   * @param tokenId - The token ID to add snapshot for
   * @param price - The price to snapshot
   */
  private async handleHourlySnapshot(
    tokenId: number,
    price: string
  ): Promise<void> {
    const hasRecent = tokenPriceHistoryQueries.hasRecentHourlySnapshot(tokenId);

    if (!hasRecent) {
      await tokenPriceHistoryQueries.addHourlyEntry(tokenId, price);
    }
  }

  /**
   * Trims old minute-level history entries
   *
   * @param tokenId - The token ID to look for
   */
  private async trimOldHistoryEntires(tokenId: number): Promise<void> {
    const oldEntry = await tokenPriceHistoryQueries.getOldestMinuteEntry(
      tokenId
    );

    if (oldEntry) {
      await tokenPriceHistoryQueries.deleteOldestMinutesEntries(tokenId, 20);
    }
  }
}
