import type { Client } from "discord.js";
import type { Server as SocketIOServer } from "socket.io";
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { crypto } from "@/db";
import { sendCrashNotification } from "@/discord/notifiers/crypto/crash-notifier";
import config from "@/config";
import logger from "@/logger";
import { CryptoTokenHistoryTable } from "@/db/queries/crypto/token/history";

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
   * Executes the main price update cycle for all active memecoins, including price simulation,
   * crash detection, alert triggering, snapshot creation, and history maintenance
   *
   * @returns Promise resolving when all price updates are complete
   */
  async updateMemecoinPrices(): Promise<void> {
    try {
      // Finds all active memecoins
      const tokens = await crypto.token.findAll({
        isMemecoin: true,
        crashed: undefined,
      });

      for (const token of tokens) {
        const price = parseFloat(token.price_per_unit);
        if (!Number.isFinite(price)) continue;

        if (price < CRASH_PRICE_THRESHOLD) {
          await this.handleTokenCrash(token);
          continue;
        }

        const newPrice = this.calculateNewPrice(price);
        const newPriceFormatted = newPrice.toFixed(PRICE_DECIMALS);

        await crypto.token.update(
          { id: token.id },
          { pricePerUnit: newPriceFormatted }
        );

        if (newPriceFormatted !== price.toFixed(PRICE_DECIMALS)) {
          const updatedToken = await crypto.token.get({ id: token.id });
          if (updatedToken) {
            this.io.emit("token:update", updatedToken);
          }
        }

        await crypto.token.history.createInTable(
          CryptoTokenHistoryTable.MINUTELY,
          { token_id: token.id, price: newPriceFormatted }
        );
        await this.checkAndTriggerAlerts(token.id, token.symbol, newPrice);
        await this.handleHourlySnapshot(token.id, newPriceFormatted);
        await this.trimOldHistoryEntries(token.id);
      }
    } catch (error) {
      logger.error("Failed to update memecoin prices:", error);
    }
  }

  /**
   * Handles the crash sequence for a memecoin, including database updates, user notification,
   * and alert cleanup
   *
   * @param token - Object containing the token's ID and symbol
   * @returns Promise resolving when crash handling is complete
   */
  private async handleTokenCrash(token: {
    id: number;
    symbol: string;
  }): Promise<void> {
    await crypto.token.crash({ id: token.id });

    const crashedToken = await crypto.token.find({ id: token.id });
    if (!crashedToken) return;

    const alerts = await crypto.token.alert.findAll({
      tokenSymbol: token.symbol,
    });

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

    await crypto.token.alert.deleteAll({ tokenSymbol: token.symbol });
    await sendCrashNotification(crashedToken);
  }

  /**
   * Calculates the next price for a token based on volatility tiers and upward bias,
   * with change percentage scaled according to current price thresholds
   *
   * @param currentPrice - The current price of the token
   * @returns The newly calculated price (never below 0)
   */
  private calculateNewPrice(currentPrice: number): number {
    const direction = Math.random() < UPWARD_BIAS ? 1 : -1;
    let changePercent: number;

    if (currentPrice < LOW.priceThreshold) {
      changePercent = Math.random() * (LOW.max - LOW.min) + LOW.min;
    } else if (currentPrice < MID.priceThreshold) {
      changePercent = Math.random() * MID.max;
    } else if (currentPrice < HIGH.priceThreshold) {
      const scale =
        (currentPrice - MID.priceThreshold) /
        (HIGH.priceThreshold - MID.priceThreshold);
      const maxPercent = MID.max - scale * (MID.max - HIGH.max);
      changePercent = Math.random() * maxPercent;
    } else {
      changePercent = Math.random() * HIGH.max;
    }

    const delta = currentPrice * changePercent * direction;
    return Math.max(0, currentPrice + delta);
  }

  /**
   * Evaluates price alerts for a token and sends Discord DM notifications to users
   * whose target prices have been triggered, then removes those alerts
   *
   * @param tokenId - The unique identifier of the token
   * @param symbol - The unique symbol of the token for display in notifications
   * @param newPrice - The newly calculated price to check against alert thresholds
   * @returns Promise resolving when all triggered alerts are processed
   */
  private async checkAndTriggerAlerts(
    tokenId: number,
    symbol: string,
    newPrice: number
  ): Promise<void> {
    const token = await crypto.token.find({ id: tokenId });
    const alerts = await crypto.token.alert.findAll({
      tokenSymbol: token?.symbol,
    });

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
        await crypto.token.alert.delete({ id: alert.id });

        logger.info(`Sent alert to ${alert.discord_id} for ${symbol}`);

        await new Promise((resolve) => setTimeout(resolve, ALERT_DM_DELAY_MS));
      } catch (error) {
        logger.warn(`Failed to send alert DM to ${alert.discord_id}:`, error);
      }
    }
  }

  /**
   * Sends a formatted Discord DM to a user notifying them that their price alert has been triggered
   *
   * @param alert - Object containing the user's Discord ID, token symbol, and alert direction
   * @param symbol - The unique token symbol for displaying purposes
   * @param newPrice - The current price that triggered the alert
   * @returns Promise resolving when the notification is sent
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
   * Creates an hourly price snapshot if no snapshot exists within the last 55 minutes
   *
   * @param tokenId - The unique identifier of the token
   * @param price - The current price to snapshot
   * @returns Promise resolving when the snapshot check/creation is complete
   */
  private async handleHourlySnapshot(
    tokenId: number,
    price: string
  ): Promise<void> {
    const hasRecent = await crypto.token.history.hasRecent(
      CryptoTokenHistoryTable.HOURLY,
      tokenId
    );

    if (!hasRecent) {
      await crypto.token.history.createInTable(CryptoTokenHistoryTable.HOURLY, {
        token_id: tokenId,
        price: price,
      });
    }
  }

  /**
   * Removes the oldest minute-level price history entries to prevent unbounded growth
   *
   * @param tokenId - The unique identifier of the token
   * @returns Promise resolving when old entries are trimmed
   */
  private async trimOldHistoryEntries(tokenId: number): Promise<void> {
    const oldEntry = await crypto.token.history.getOldestMinuteEntry(tokenId);

    if (oldEntry) {
      await crypto.token.history.deleteOldestMinutesEntries(tokenId, 20);
    }
  }
}
