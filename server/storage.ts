import { 
  User, InsertUser, 
  Bot, InsertBot, 
  Transaction, InsertTransaction, 
  ApiConfig, InsertApiConfig,
  BotStats, InsertBotStats 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bot methods
  createBot(bot: InsertBot): Promise<Bot>;
  getBot(id: number): Promise<Bot | undefined>;
  getBotsByUserId(userId: number): Promise<Bot[]>;
  updateBot(id: number, updates: Partial<Omit<Bot, "id">>): Promise<Bot | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByBotId(botId: number): Promise<Transaction[]>;
  getRecentTransactionsByBotId(botId: number, limit: number): Promise<Transaction[]>;
  
  // API Config methods
  getApiConfig(userId: number): Promise<ApiConfig | undefined>;
  createApiConfig(config: InsertApiConfig): Promise<ApiConfig>;
  updateApiConfig(id: number, updates: Partial<Omit<ApiConfig, "id" | "userId" | "createdAt">>): Promise<ApiConfig | undefined>;
  
  // Bot Stats methods
  getBotStats(botId: number): Promise<BotStats | undefined>;
  createBotStats(stats: InsertBotStats): Promise<BotStats>;
  updateBotStats(botId: number, updates: Partial<Omit<BotStats, "id" | "botId" | "lastUpdated">>): Promise<BotStats | undefined>;
  getTotalStats(userId: number): Promise<{
    totalBots: number;
    activeBots: number;
    totalInvestment: number;
    totalProfit: number;
    completedTrades: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bots: Map<number, Bot>;
  private transactions: Map<number, Transaction>;
  private apiConfigs: Map<number, ApiConfig>;
  private botStats: Map<number, BotStats>;
  
  private userId: number = 1;
  private botId: number = 1;
  private transactionId: number = 1;
  private apiConfigId: number = 1;
  private botStatsId: number = 1;

  constructor() {
    this.users = new Map();
    this.bots = new Map();
    this.transactions = new Map();
    this.apiConfigs = new Map();
    this.botStats = new Map();
    
    // Create a default user for quick testing
    const defaultUser: User = {
      id: this.userId++,
      username: 'demo',
      password: 'password123',
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Bot methods
  async createBot(bot: InsertBot): Promise<Bot> {
    const id = this.botId++;
    const now = new Date();
    const newBot: Bot = { 
      ...bot, 
      id,
      createdAt: now,
      lastActiveAt: now
    };
    this.bots.set(id, newBot);
    
    // Create initial bot stats
    await this.createBotStats({
      botId: id,
      totalProfit: 0,
      completedTrades: 0,
      returnPercentage: 0
    });
    
    return newBot;
  }

  async getBot(id: number): Promise<Bot | undefined> {
    return this.bots.get(id);
  }

  async getBotsByUserId(userId: number): Promise<Bot[]> {
    return Array.from(this.bots.values()).filter(
      (bot) => bot.userId === userId
    );
  }

  async updateBot(id: number, updates: Partial<Omit<Bot, "id">>): Promise<Bot | undefined> {
    const bot = this.bots.get(id);
    if (!bot) return undefined;
    
    const updatedBot = { ...bot, ...updates };
    if (updates.status) {
      updatedBot.lastActiveAt = new Date();
    }
    
    this.bots.set(id, updatedBot);
    return updatedBot;
  }

  // Transaction methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      timestamp: new Date()
    };
    this.transactions.set(id, newTransaction);
    
    // Update bot stats
    const stats = await this.getBotStats(transaction.botId);
    if (stats) {
      const completedTrades = stats.completedTrades + 1;
      let totalProfit = stats.totalProfit;
      
      // In real app, calculate actual profit based on transaction details
      // This is simplified for the demo
      if (transaction.type === "SELL") {
        // Simulate small profit on sell transactions
        const profit = transaction.value * 0.005; // 0.5% profit example
        totalProfit += profit;
      }
      
      // Get bot to calculate return percentage
      const bot = await this.getBot(transaction.botId);
      const returnPercentage = bot ? (totalProfit / bot.investment) * 100 : 0;
      
      await this.updateBotStats(transaction.botId, {
        totalProfit,
        completedTrades,
        returnPercentage
      });
    }
    
    return newTransaction;
  }

  async getTransactionsByBotId(botId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.botId === botId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getRecentTransactionsByBotId(botId: number, limit: number): Promise<Transaction[]> {
    return (await this.getTransactionsByBotId(botId)).slice(0, limit);
  }

  // API Config methods
  async getApiConfig(userId: number): Promise<ApiConfig | undefined> {
    return Array.from(this.apiConfigs.values()).find(
      (config) => config.userId === userId
    );
  }

  async createApiConfig(config: InsertApiConfig): Promise<ApiConfig> {
    const id = this.apiConfigId++;
    const newConfig: ApiConfig = {
      ...config,
      id,
      createdAt: new Date()
    };
    this.apiConfigs.set(id, newConfig);
    return newConfig;
  }

  async updateApiConfig(id: number, updates: Partial<Omit<ApiConfig, "id" | "userId" | "createdAt">>): Promise<ApiConfig | undefined> {
    const config = this.apiConfigs.get(id);
    if (!config) return undefined;
    
    const updatedConfig = { ...config, ...updates };
    this.apiConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  // Bot Stats methods
  async getBotStats(botId: number): Promise<BotStats | undefined> {
    return Array.from(this.botStats.values()).find(
      (stats) => stats.botId === botId
    );
  }

  async createBotStats(stats: InsertBotStats): Promise<BotStats> {
    const id = this.botStatsId++;
    const newStats: BotStats = {
      ...stats,
      id,
      lastUpdated: new Date()
    };
    this.botStats.set(id, newStats);
    return newStats;
  }

  async updateBotStats(botId: number, updates: Partial<Omit<BotStats, "id" | "botId" | "lastUpdated">>): Promise<BotStats | undefined> {
    const stats = Array.from(this.botStats.values()).find(s => s.botId === botId);
    if (!stats) return undefined;
    
    const updatedStats: BotStats = {
      ...stats,
      ...updates,
      lastUpdated: new Date()
    };
    
    this.botStats.set(stats.id, updatedStats);
    return updatedStats;
  }

  async getTotalStats(userId: number): Promise<{
    totalBots: number;
    activeBots: number;
    totalInvestment: number;
    totalProfit: number;
    completedTrades: number;
  }> {
    const bots = await this.getBotsByUserId(userId);
    const activeBots = bots.filter(bot => bot.status === "active");
    const totalInvestment = bots.reduce((sum, bot) => sum + bot.investment, 0);
    
    let totalProfit = 0;
    let completedTrades = 0;
    
    for (const bot of bots) {
      const stats = await this.getBotStats(bot.id);
      if (stats) {
        totalProfit += stats.totalProfit;
        completedTrades += stats.completedTrades;
      }
    }
    
    return {
      totalBots: bots.length,
      activeBots: activeBots.length,
      totalInvestment,
      totalProfit,
      completedTrades
    };
  }
}

export const storage = new MemStorage();
