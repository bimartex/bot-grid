import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bot, Transaction } from '@shared/schema';
import { CalendarIcon, Download, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

const History: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState<string>("all");
  const [transactionType, setTransactionType] = useState<string>("all");

  // Fetch all bots
  const { data: bots, isLoading: isLoadingBots } = useQuery<Bot[]>({
    queryKey: ['/api/bots'],
  });

  // Fetch all transactions for all bots
  const { data: allTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!bots,
    queryFn: async () => {
      if (!bots || bots.length === 0) return [];
      
      // Fetch transactions for each bot and combine them
      const transactionPromises = bots.map(bot => 
        fetch(`/api/bots/${bot.id}/transactions`, { credentials: 'include' })
          .then(res => res.json())
      );
      
      const allBotTransactions = await Promise.all(transactionPromises);
      return allBotTransactions.flat();
    }
  });

  // Filter transactions based on selections
  const filteredTransactions = allTransactions?.filter(tx => {
    if (selectedBot !== "all" && tx.botId !== parseInt(selectedBot)) return false;
    if (transactionType !== "all" && tx.type !== transactionType) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get bot name by ID
  const getBotName = (botId: number): string => {
    const bot = bots?.find(b => b.id === botId);
    return bot ? `${bot.tradingPair} Grid` : `Bot #${botId}`;
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Transaction History</h1>
          <p className="text-gray-400">View and export your bot trading history</p>
        </div>
        <Button className="mt-4 md:mt-0 bg-primary text-white hover:bg-blue-700">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <Card className="bg-dark-card mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bot-select">Filter by Bot</Label>
              <Select 
                value={selectedBot} 
                onValueChange={setSelectedBot}
                disabled={isLoadingBots}
              >
                <SelectTrigger className="bg-dark border-dark-light">
                  <SelectValue placeholder="Select a bot" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-light">
                  <SelectItem value="all">All Bots</SelectItem>
                  {bots?.map(bot => (
                    <SelectItem key={bot.id} value={bot.id.toString()}>
                      {bot.tradingPair} Grid {bot.isPaperTrading && '(Paper)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={setTransactionType}
              >
                <SelectTrigger className="bg-dark border-dark-light">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-dark-light">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BUY">Buy Orders</SelectItem>
                  <SelectItem value="SELL">Sell Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search transactions..."
                  className="pl-8 bg-dark border-dark-light"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-dark-card">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-dark-light rounded" />
              ))}
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark text-xs text-gray-400 uppercase">
                  <tr>
                    <th className="py-3 px-4 text-left rounded-l-lg">Date & Time</th>
                    <th className="py-3 px-4 text-left">Bot</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Price</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Value</th>
                    <th className="py-3 px-4 text-left rounded-r-lg">Fee</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredTransactions.map((tx) => {
                    const bot = bots?.find(b => b.id === tx.botId);
                    return (
                      <tr key={tx.id} className="border-b border-dark hover:bg-dark-light">
                        <td className="py-3 px-4">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">{getBotName(tx.botId)}</td>
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
                        <td className="py-3 px-4">
                          {tx.amount.toFixed(5)} {bot?.baseAsset}
                        </td>
                        <td className="py-3 px-4">{formatCurrency(tx.value)}</td>
                        <td className="py-3 px-4">{formatCurrency(tx.fee)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No transactions match your filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default History;
