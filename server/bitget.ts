import crypto from 'crypto';
import axios from 'axios';

interface BitgetConfig {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
  isPaperTrading?: boolean;
}

interface GridParams {
  symbol: string;
  upperPrice: number;
  lowerPrice: number;
  gridNum: number;
  size: number;
}

class BitgetClient {
  private apiKey: string;
  private apiSecret: string;
  private passphrase: string;
  private baseUrl: string;
  private isPaperTrading: boolean;

  constructor(config: BitgetConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.passphrase = config.passphrase;
    this.baseUrl = 'https://api.bitget.com';
    this.isPaperTrading = config.isPaperTrading || false;
  }

  // Generate Bitget signature
  private generateSignature(timestamp: string, method: string, path: string, body: string = ''): string {
    const message = timestamp + method + path + body;
    return crypto.createHmac('sha256', this.apiSecret).update(message).digest('base64');
  }
  
  // Get common headers required for authentication
  private getHeaders(method: string, path: string, body: string = ''): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(timestamp, method, path, body);
    
    return {
      'ACCESS-KEY': this.apiKey,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': this.passphrase,
      'Content-Type': 'application/json',
      'X-SIMULATED-TRADING': this.isPaperTrading ? '1' : '0'
    };
  }

  // Make HTTP request to Bitget API
  private async request(method: string, path: string, data?: any): Promise<any> {
    const fullUrl = `${this.baseUrl}${path}`;
    const body = data ? JSON.stringify(data) : '';
    const headers = this.getHeaders(method, path, body);
    
    try {
      const response = await axios({
        method,
        url: fullUrl,
        headers,
        data: data || undefined
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Bitget API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  // Get account balance
  async getAccountBalance(): Promise<any> {
    return this.request('GET', '/api/mix/v1/account/accounts');
  }
  
  // Get ticker price for a symbol
  async getTickerPrice(symbol: string): Promise<any> {
    return this.request('GET', `/api/mix/v1/market/ticker?symbol=${symbol}`);
  }
  
  // Place a market order
  async placeMarketOrder(symbol: string, side: 'buy' | 'sell', size: number): Promise<any> {
    const data = {
      symbol,
      marginCoin: symbol.split('_')[1],
      side,
      orderType: 'market',
      size: size.toString()
    };
    
    return this.request('POST', '/api/mix/v1/order/placeOrder', data);
  }
  
  // Create an infinity grid bot (simplified for demo)
  // In a real implementation, this would interact with Bitget's grid trading API
  async createGridBot(params: GridParams): Promise<any> {
    // For this demo, we're simulating this functionality
    // In a real application, this would call Bitget's grid trading API endpoints
    
    const data = {
      symbol: params.symbol,
      upperPrice: params.upperPrice.toString(),
      lowerPrice: params.lowerPrice.toString(),
      gridNum: params.gridNum,
      size: params.size.toString()
    };
    
    // This is a placeholder as Bitget's exact API for grid bots may differ
    // return this.request('POST', '/api/mix/v1/plan/grid/place-order', data);
    
    // For the demo, return a simulated success response
    return {
      code: '00000',
      data: {
        clientOid: 'grid_' + Date.now(),
        orderId: 'mock_grid_' + Math.random().toString(36).substring(7),
        state: 'active'
      },
      msg: 'success',
      requestTime: Date.now()
    };
  }
  
  // Get available trading pairs
  async getTradingPairs(): Promise<any> {
    return this.request('GET', '/api/mix/v1/market/contracts');
  }
  
  // Get historical trades
  async getHistoricalTrades(symbol: string, limit: number = 20): Promise<any> {
    return this.request('GET', `/api/mix/v1/market/fills?symbol=${symbol}&limit=${limit}`);
  }
  
  // Get minimum order sizes and precision requirements
  async getSymbolRules(symbol: string): Promise<any> {
    const allSymbols = await this.request('GET', '/api/mix/v1/market/contracts');
    return allSymbols.data.find((s: any) => s.symbol === symbol);
  }
}

export default BitgetClient;
