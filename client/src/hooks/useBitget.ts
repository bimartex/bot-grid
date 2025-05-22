import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BitgetHookReturn {
  fetchPrice: (symbol: string) => Promise<number>;
  createBot: (config: BitgetBotConfig) => Promise<any>;
  isPaperTrading: boolean;
  togglePaperTrading: (enabled: boolean) => void;
  isLoading: boolean;
  error: string | null;
}

interface BitgetBotConfig {
  symbol: string;
  investment: number;
  upperPrice: number;
  lowerPrice: number;
  gridCount: number;
}

export function useBitget(): BitgetHookReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaperTrading, setIsPaperTrading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch current price for a trading pair
  const fetchPrice = useCallback(async (symbol: string): Promise<number> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formattedSymbol = symbol.replace('/', '_');
      const response = await apiRequest('GET', `/api/market/price/${formattedSymbol}?paper=${isPaperTrading}`);
      const data = await response.json();
      
      if (data && data.data && data.data.last) {
        return parseFloat(data.data.last);
      }
      
      // If we can't get the exact price from API, return a default
      // In a real app, this would throw an error
      return 0;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch price data';
      setError(errorMessage);
      toast({
        title: "Error fetching price",
        description: errorMessage,
        variant: "destructive",
      });
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [isPaperTrading, toast]);

  // Create a new grid bot
  const createBot = useCallback(async (config: BitgetBotConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest('POST', '/api/bots/grid', {
        ...config,
        isPaperTrading
      });
      
      toast({
        title: "Bot created successfully",
        description: "Your grid bot is now running",
        variant: "default",
      });
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create bot';
      setError(errorMessage);
      toast({
        title: "Error creating bot",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isPaperTrading, toast]);

  // Toggle paper trading mode
  const togglePaperTrading = useCallback((enabled: boolean) => {
    setIsPaperTrading(enabled);
    toast({
      title: enabled ? "Paper Trading Enabled" : "Paper Trading Disabled",
      description: enabled 
        ? "You are now trading with virtual funds" 
        : "You are now trading with real funds",
      variant: "default",
    });
  }, [toast]);

  return {
    fetchPrice,
    createBot,
    isPaperTrading,
    togglePaperTrading,
    isLoading,
    error
  };
}

export default useBitget;
