import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid3X3, TrendingUp, Shield, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Bot } from '@shared/schema';
import { formatCurrency } from '@/lib/utils';

interface GridConfigurationProps {
  bot: Bot;
  onEdit: () => void;
}

const GridConfiguration: React.FC<GridConfigurationProps> = ({ bot, onEdit }) => {
  // Calculate grid price difference
  const gridPriceDifference = (bot.upperLimit - bot.lowerLimit) / bot.gridCount;
  
  // Calculate estimated monthly return (simplified)
  const estimatedMonthlyReturn = bot.profitPerGrid * 30 * 0.33; // Assuming 33% of grids trigger daily
  
  return (
    <Card className="bg-dark-card rounded-xl">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold mb-4">Grid Configuration</h2>
        
        <div className="mb-5">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Grid Range</span>
            <span>{formatCurrency(bot.lowerLimit)} - {formatCurrency(bot.upperLimit)}</span>
          </div>
          <div className="h-2 bg-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ 
                width: `${Math.min(100, Math.max(0, ((25000 - bot.lowerLimit) / (bot.upperLimit - bot.lowerLimit)) * 100))}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lower Limit</span>
            <span>Upper Limit</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Grid Count</label>
            <div className="flex items-center">
              <Grid3X3 className="text-primary h-5 w-5" />
              <span className="ml-2 text-lg font-medium">{bot.gridCount} grids</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ~{formatCurrency(gridPriceDifference)} price difference between grids
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Profit per Grid</label>
            <div className="flex items-center">
              <TrendingUp className="text-secondary h-5 w-5" />
              <span className="ml-2 text-lg font-medium">{(bot.profitPerGrid * 100).toFixed(2)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Est. ~{(estimatedMonthlyReturn * 100).toFixed(1)}% monthly if all grids trigger
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Risk Management</label>
            <div className="flex items-center">
              <Shield className="text-danger h-5 w-5" />
              <span className="ml-2 text-lg font-medium">
                {bot.stopLoss ? `Stop-Loss at ${formatCurrency(bot.stopLoss)}` : 'No Stop-Loss'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {bot.stopLoss 
                ? 'Bot will halt if price drops below this level' 
                : 'No automatic stop-loss protection'
              }
            </p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">API Connection</label>
            <div className="flex items-center">
              <CheckCircle className="text-secondary h-5 w-5" />
              <span className="ml-2 text-md font-medium">Connected to Bitget</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Using restricted API key (trade only)</p>
          </div>
        </div>
        
        <Separator className="my-6 bg-dark" />
        
        <Button onClick={onEdit} className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">
          Edit Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default GridConfiguration;
