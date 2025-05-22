import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Bot status enum
export const BotStatus = {
  ACTIVE: "active",
  PAUSED: "paused",
  STOPPED: "stopped",
} as const;

export const bots = pgTable("bots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  tradingPair: text("trading_pair").notNull(), // e.g. BTC/USDT
  baseAsset: text("base_asset").notNull(), // e.g. BTC
  quoteAsset: text("quote_asset").notNull(), // e.g. USDT
  investment: doublePrecision("investment").notNull(), // Total investment amount
  status: text("status").notNull().$type<keyof typeof BotStatus>(), // active, paused, stopped
  upperLimit: doublePrecision("upper_limit").notNull(), // Upper price range
  lowerLimit: doublePrecision("lower_limit").notNull(), // Lower price range
  gridCount: integer("grid_count").notNull(), // Number of grid lines
  profitPerGrid: doublePrecision("profit_per_grid").notNull(), // Profit percentage per grid
  stopLoss: doublePrecision("stop_loss"), // Optional stop loss price
  isPaperTrading: boolean("is_paper_trading").notNull().default(false), // Paper trading mode
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true
});

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().references(() => bots.id),
  type: text("type").notNull().$type<"BUY" | "SELL">(), // BUY or SELL
  price: doublePrecision("price").notNull(), // Price at execution
  amount: doublePrecision("amount").notNull(), // Amount of base asset
  value: doublePrecision("value").notNull(), // Value in quote asset
  fee: doublePrecision("fee").notNull(), // Fee amount
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// API Configuration for Bitget
export const apiConfigs = pgTable("api_configs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  apiKey: text("api_key").notNull(),
  apiSecret: text("api_secret").notNull(),
  passphrase: text("passphrase").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertApiConfigSchema = createInsertSchema(apiConfigs).omit({
  id: true,
  createdAt: true,
});

export type InsertApiConfig = z.infer<typeof insertApiConfigSchema>;
export type ApiConfig = typeof apiConfigs.$inferSelect;

// Bot stats
export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  botId: integer("bot_id").notNull().references(() => bots.id),
  totalProfit: doublePrecision("total_profit").notNull().default(0),
  completedTrades: integer("completed_trades").notNull().default(0),
  returnPercentage: doublePrecision("return_percentage").notNull().default(0),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertBotStatsSchema = createInsertSchema(botStats).omit({
  id: true,
  lastUpdated: true,
});

export type InsertBotStats = z.infer<typeof insertBotStatsSchema>;
export type BotStats = typeof botStats.$inferSelect;
