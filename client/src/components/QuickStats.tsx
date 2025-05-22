import React from 'react';
import { Card } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';

interface StatsResponse {
  totalBots: number;
  activeBots: number;
  totalInvestment: number;
  totalProfit: number;
  completedTrades: number;
}

const QuickStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery<StatsResponse>({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-dark-card rounded-lg p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Default values if stats is undefined
  const {
    totalBots = 0,
    activeBots = 0,
    totalInvestment = 0,
    totalProfit = 0,
    completedTrades = 0
  } = stats || {};

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-card rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Active Bots</h3>
          <p className="text-2xl font-bold">{activeBots}</p>
          <div className="flex items-center text-xs text-secondary mt-1">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>+{Math.max(0, activeBots - (totalBots - activeBots))} from last week</span>
          </div>
        </Card>
        <Card className="bg-dark-card rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Investment</h3>
          <p className="text-2xl font-bold">{formatCurrency(totalInvestment)}</p>
          <div className="flex items-center text-xs text-secondary mt-1">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>+$10 from new bot</span>
          </div>
        </Card>
        <Card className="bg-dark-card rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Profit (30d)</h3>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-secondary' : 'text-danger'}`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </p>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <span>{((totalProfit / Math.max(1, totalInvestment)) * 100).toFixed(2)}% average return</span>
          </div>
        </Card>
        <Card className="bg-dark-card rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Completed Trades</h3>
          <p className="text-2xl font-bold">{completedTrades}</p>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <span>Across all bots</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuickStats;
