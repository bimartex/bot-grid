import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotSchema, insertTransactionSchema, insertApiConfigSchema } from "@shared/schema";
import BitgetClient from "./bitget";
import { z } from "zod";

// Helper function to validate request body with zod
function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      next(error);
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Bots endpoints
  apiRouter.get("/bots", async (req, res) => {
    try {
      // In a real app, this would use authentication to get user ID
      // For demo, we use demo user (id=1)
      const userId = 1;
      const bots = await storage.getBotsByUserId(userId);
      res.json(bots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  apiRouter.get("/bots/:id", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      if (isNaN(botId)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }
      
      const bot = await storage.getBot(botId);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      res.json(bot);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  apiRouter.post("/bots", validateBody(insertBotSchema), async (req, res) => {
    try {
      const bot = await storage.createBot(req.body);
      res.status(201).json(bot);
    } catch (error) {
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  apiRouter.patch("/bots/:id", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      if (isNaN(botId)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }
      
      const bot = await storage.getBot(botId);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      const updatedBot = await storage.updateBot(botId, req.body);
      res.json(updatedBot);
    } catch (error) {
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  // Transactions endpoints
  apiRouter.get("/bots/:id/transactions", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      if (isNaN(botId)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      let transactions;
      if (limit) {
        transactions = await storage.getRecentTransactionsByBotId(botId, limit);
      } else {
        transactions = await storage.getTransactionsByBotId(botId);
      }
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  apiRouter.post("/transactions", validateBody(insertTransactionSchema), async (req, res) => {
    try {
      const transaction = await storage.createTransaction(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // API configuration endpoints
  apiRouter.get("/api-config", async (req, res) => {
    try {
      // In a real app, this would use authentication to get user ID
      // For demo, we use demo user (id=1)
      const userId = 1;
      const config = await storage.getApiConfig(userId);
      
      if (!config) {
        return res.status(404).json({ message: "API configuration not found" });
      }
      
      // Hide sensitive data in response
      const safeConfig = {
        ...config,
        apiKey: `${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`,
        apiSecret: '••••••••',
        passphrase: '••••••••'
      };
      
      res.json(safeConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API configuration" });
    }
  });

  apiRouter.post("/api-config", validateBody(insertApiConfigSchema), async (req, res) => {
    try {
      const config = await storage.createApiConfig(req.body);
      
      // Hide sensitive data in response
      const safeConfig = {
        ...config,
        apiKey: `${config.apiKey.substring(0, 4)}...${config.apiKey.substring(config.apiKey.length - 4)}`,
        apiSecret: '••••••••',
        passphrase: '••••••••'
      };
      
      res.status(201).json(safeConfig);
    } catch (error) {
      res.status(500).json({ message: "Failed to create API configuration" });
    }
  });

  // Bot stats endpoints
  apiRouter.get("/bots/:id/stats", async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      if (isNaN(botId)) {
        return res.status(400).json({ message: "Invalid bot ID" });
      }
      
      const stats = await storage.getBotStats(botId);
      if (!stats) {
        return res.status(404).json({ message: "Bot stats not found" });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bot stats" });
    }
  });

  // Overall stats
  apiRouter.get("/stats", async (req, res) => {
    try {
      // In a real app, this would use authentication to get user ID
      // For demo, we use demo user (id=1)
      const userId = 1;
      const stats = await storage.getTotalStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overall stats" });
    }
  });

  // Bitget endpoints
  apiRouter.get("/market/pairs", async (req, res) => {
    try {
      // In a real app, API key would be retrieved from storage based on authenticated user
      // For demo purposes, we'll use environment variables or fallback to demo keys
      const apiKey = process.env.BITGET_API_KEY || "demo_api_key";
      const apiSecret = process.env.BITGET_API_SECRET || "demo_api_secret";
      const passphrase = process.env.BITGET_PASSPHRASE || "demo_passphrase";
      const isPaperTrading = req.query.paper === "true";
      
      const bitget = new BitgetClient({
        apiKey,
        apiSecret,
        passphrase,
        isPaperTrading
      });
      
      const pairs = await bitget.getTradingPairs();
      res.json(pairs);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch trading pairs", error: error.message });
    }
  });

  apiRouter.get("/market/price/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      if (!symbol) {
        return res.status(400).json({ message: "Symbol is required" });
      }
      
      const apiKey = process.env.BITGET_API_KEY || "demo_api_key";
      const apiSecret = process.env.BITGET_API_SECRET || "demo_api_secret";
      const passphrase = process.env.BITGET_PASSPHRASE || "demo_passphrase";
      const isPaperTrading = req.query.paper === "true";
      
      const bitget = new BitgetClient({
        apiKey,
        apiSecret,
        passphrase,
        isPaperTrading
      });
      
      const ticker = await bitget.getTickerPrice(symbol);
      res.json(ticker);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch price", error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
