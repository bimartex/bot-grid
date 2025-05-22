import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, SortDesc } from "lucide-react";
import { Bot } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const BotsList: React.FC = () => {
  // Fetch all bots
  const { data: bots, isLoading } = useQuery<Bot[]>({
    queryKey: ['/api/bots'],
  });

  // Get bot stats
  const getBotStats = (botId: number) => {
    const { data } = useQuery({
      queryKey: ['/api/bots', botId, 'stats'],
      enabled: !!botId,
    });
    return data;
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Bots</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-dark-card rounded-lg p-4 h-40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Get status color for border
  const getStatusColor = (status: string, isPaperTrading: boolean) => {
    if (isPaperTrading) return "border-primary";
    if (status === "active") return "border-secondary";
    return "border-gray-600";
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Bots</h2>
        <div className="flex space-x-2">
          <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-light" title="Filter bots">
            <Filter className="h-5 w-5 text-gray-300" />
          </Button>
          <Button size="icon" variant="outline" className="bg-dark-card hover:bg-dark-light" title="Sort bots">
            <SortDesc className="h-5 w-5 text-gray-300" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bots && bots.length > 0 ? (
          bots.map((bot) => {
            const stats = getBotStats(bot.id);
            const profit = stats?.totalProfit || 0;
            const returnPercentage = stats?.returnPercentage || 0;
            const isProfitable = profit >= 0;
            
            return (
              <Card 
                key={bot.id} 
                className={`bg-dark-card rounded-lg p-4 border-l-4 ${getStatusColor(bot.status, bot.isPaperTrading)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {bot.tradingPair} Grid
                      {bot.isPaperTrading && <span className="text-xs text-primary ml-1">(Paper)</span>}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {bot.status === "active" ? "Active" : "Paused"} • 
                      {bot.status === "active" 
                        ? ` ${formatDistanceToNow(new Date(bot.lastActiveAt))} running`
                        : ` Last ran ${formatDistanceToNow(new Date(bot.lastActiveAt))} ago`
                      }
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 ${
                    isProfitable
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-danger/10 text-danger'
                  } rounded`}>
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-3">
                  <div>
                    <div className="text-gray-400">Investment</div>
                    <div className="font-medium">{formatCurrency(bot.investment)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Trades</div>
                    <div className="font-medium">{stats?.completedTrades || 0}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Return</div>
                    <div className={`font-medium ${isProfitable ? 'text-secondary' : 'text-danger'}`}>
                      {formatPercentage(returnPercentage)}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-8 bg-dark-card rounded-lg">
            <p className="text-gray-400">You don't have any bots yet. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotsList;
