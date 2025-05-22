import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { Bot } from '@shared/schema';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const Assets: React.FC = () => {
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

  // Calculate real trading vs paper trading amounts
  const realTradingAmount = bots?.filter(b => !b.isPaperTrading).reduce((sum, bot) => sum + bot.investment, 0) || 0;
  const paperTradingAmount = bots?.filter(b => b.isPaperTrading).reduce((sum, bot) => sum + bot.investment, 0) || 0;
  
  // Prepare data for pie charts
  const assetAllocationData = bots?.map(bot => ({
    name: bot.tradingPair,
    value: bot.investment,
    isPaper: bot.isPaperTrading,
  })) || [];

  const botTypeData = [
    { name: 'Real Trading', value: realTradingAmount },
    { name: 'Paper Trading', value: paperTradingAmount },
  ].filter(item => item.value > 0);

  const COLORS = ['#3861FB', '#0ECB81', '#F6465D', '#FFD700', '#9370DB'];

  // Calculate total balance and profit
  const totalInvestment = (realTradingAmount + paperTradingAmount) || 0;
  let totalProfit = 0;
  let totalValueNow = totalInvestment;

  if (bots) {
    bots.forEach(bot => {
      const stats = getBotStats(bot.id);
      if (stats) {
        totalProfit += stats.totalProfit;
        totalValueNow += stats.totalProfit;
      }
    });
  }

  const isProfitable = totalProfit >= 0;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Assets Overview</h1>
        <p className="text-gray-400">Track your investments and portfolio allocation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-dark-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalValueNow)}</div>
            <div className={`flex items-center text-sm mt-1 ${isProfitable ? 'text-secondary' : 'text-danger'}`}>
              <span className="mr-1">{isProfitable ? '↑' : '↓'}</span>
              <span>{formatCurrency(Math.abs(totalProfit))}</span>
              <span className="ml-1">({formatPercentage((totalProfit / (totalInvestment || 1)) * 100)})</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Real Trading Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(realTradingAmount)}</div>
            <div className="text-sm text-gray-400 mt-1">
              {bots?.filter(b => !b.isPaperTrading).length || 0} active bots
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-dark-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paper Trading Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(paperTradingAmount)}</div>
            <div className="text-sm text-gray-400 mt-1">
              {bots?.filter(b => b.isPaperTrading).length || 0} paper bots
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="allocation" className="mb-6">
        <TabsList className="bg-dark-card mb-4">
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="allocation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-dark-card">
              <CardHeader>
                <CardTitle>Asset Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading asset data...</p>
                  </div>
                ) : assetAllocationData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetAllocationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {assetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-400">No assets found</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-dark-card">
              <CardHeader>
                <CardTitle>Trading Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 flex items-center justify-center">
                    <p>Loading trading data...</p>
                  </div>
                ) : botTypeData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={botTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#3861FB" />
                          <Cell fill="#0ECB81" />
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-400">No trading data found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance">
          <Card className="bg-dark-card">
            <CardHeader>
              <CardTitle>Bot Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-dark-light rounded" />
                  ))}
                </div>
              ) : bots && bots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark text-xs text-gray-400 uppercase">
                      <tr>
                        <th className="py-3 px-4 text-left">Bot</th>
                        <th className="py-3 px-4 text-left">Trading Pair</th>
                        <th className="py-3 px-4 text-right">Investment</th>
                        <th className="py-3 px-4 text-right">Current Value</th>
                        <th className="py-3 px-4 text-right">Profit/Loss</th>
                        <th className="py-3 px-4 text-right">Return %</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {bots.map((bot) => {
                        const stats = getBotStats(bot.id);
                        const profit = stats?.totalProfit || 0;
                        const returnPercentage = stats?.returnPercentage || 0;
                        const currentValue = bot.investment + profit;
                        const isProfitable = profit >= 0;
                        
                        return (
                          <tr key={bot.id} className="border-b border-dark hover:bg-dark-light">
                            <td className="py-3 px-4">
                              {bot.name || `${bot.tradingPair} Grid`}
                              {bot.isPaperTrading && (
                                <span className="ml-2 text-xs text-primary">(Paper)</span>
                              )}
                            </td>
                            <td className="py-3 px-4">{bot.tradingPair}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(bot.investment)}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(currentValue)}</td>
                            <td className={`py-3 px-4 text-right ${isProfitable ? 'text-secondary' : 'text-danger'}`}>
                              {isProfitable ? '+' : ''}{formatCurrency(profit)}
                            </td>
                            <td className={`py-3 px-4 text-right ${isProfitable ? 'text-secondary' : 'text-danger'}`}>
                              {formatPercentage(returnPercentage)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No bots found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Assets;
