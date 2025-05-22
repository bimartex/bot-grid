import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Pause, Settings as SettingsIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Bot, Transaction } from "@shared/schema";
import PriceChart from './PriceChart';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface ActiveBotCardProps {
  bot: Bot;
}

const ActiveBotCard: React.FC<ActiveBotCardProps> = ({ bot }) => {
  const [timeframe, setTimeframe] = useState<string>("1D");

  // Fetch bot stats
  const { data: stats } = useQuery({
    queryKey: ['/api/bots', bot.id, 'stats'],
    enabled: !!bot.id,
  });

  // Fetch recent transactions
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/bots', bot.id, 'transactions'],
    queryFn: async () => {
      // Custom queryFn to add limit parameter
      const response = await fetch(`/api/bots/${bot.id}/transactions?limit=3`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
    enabled: !!bot.id,
  });

  // Format running time
  const getRunningTime = (lastActiveAt: Date) => {
    return formatDistanceToNow(new Date(lastActiveAt), { addSuffix: false });
  };

  // Format creation time
  const getCreationDate = (createdAt: Date) => {
    return new Date(createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="col-span-1 lg:col-span-2 bg-dark-card rounded-xl">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold">{bot.tradingPair} Grid</h2>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-secondary text-white rounded">
                {bot.status.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Created: {getCreationDate(bot.createdAt)} • Running: {getRunningTime(bot.lastActiveAt)}
            </p>
          </div>
          <div className="flex space-x-2 mt-3 md:mt-0">
            <Button size="icon" variant="outline" className="bg-dark-light hover:bg-dark" title="Edit bot">
              <Edit className="h-5 w-5 text-gray-300" />
            </Button>
            <Button size="icon" variant="outline" className="bg-dark-light hover:bg-dark" title="Stop bot">
              <Pause className="h-5 w-5 text-gray-300" />
            </Button>
            <Button size="icon" variant="outline" className="bg-dark-light hover:bg-dark" title="Bot settings">
              <SettingsIcon className="h-5 w-5 text-gray-300" />
            </Button>
          </div>
        </div>
        
        {/* Chart */}
        <div className="chart-container relative mb-4 rounded-lg bg-dark p-4 overflow-hidden">
          <PriceChart 
            symbol={bot.tradingPair}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            lowerLimit={bot.lowerLimit}
            upperLimit={bot.upperLimit}
          />
        </div>
        
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-dark rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Total Profit</h3>
            <p className="text-xl font-bold text-secondary">
              {formatCurrency(stats?.totalProfit || 0)}
            </p>
            <span className="text-sm text-gray-400">
              {formatPercentage(stats?.returnPercentage || 0)} return
            </span>
          </div>
          <div className="bg-dark rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Completed Trades</h3>
            <p className="text-xl font-bold">{stats?.completedTrades || 0}</p>
            <span className="text-sm text-gray-400">
              ~{((stats?.completedTrades || 0) / Math.max(1, Math.ceil((Date.now() - new Date(bot.createdAt).getTime()) / (24 * 60 * 60 * 1000)))).toFixed(1)} trades per day
            </span>
          </div>
          <div className="bg-dark rounded-lg p-4">
            <h3 className="text-sm text-gray-400 mb-1">Investment</h3>
            <p className="text-xl font-bold">{formatCurrency(bot.investment)}</p>
            <span className="text-sm text-gray-400">{bot.quoteAsset} + {bot.baseAsset} Value</span>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div>
          <h3 className="font-medium mb-3">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-dark text-xs text-gray-400 uppercase">
                <tr>
                  <th className="py-3 px-4 text-left rounded-l-lg">Time</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Amount</th>
                  <th className="py-3 px-4 text-left rounded-r-lg">Value</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions && transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-dark hover:bg-dark-light">
                      <td className="py-3 px-4">
                        {new Date(tx.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium ${
                          tx.type === 'BUY' 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-danger/10 text-danger'
                        } rounded`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatCurrency(tx.price)}</td>
                      <td className="py-3 px-4">{tx.amount.toFixed(5)} {bot.baseAsset}</td>
                      <td className="py-3 px-4">{formatCurrency(tx.value)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-400">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveBotCard;
