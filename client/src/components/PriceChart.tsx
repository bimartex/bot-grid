import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/utils';

interface PriceChartProps {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  lowerLimit: number;
  upperLimit: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ 
  symbol, 
  timeframe, 
  onTimeframeChange,
  lowerLimit,
  upperLimit
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    // In a real app, this would fetch real price data from the API
    // and potentially use a WebSocket for live updates
    const fetchPrice = async () => {
      try {
        // Mock price for demo
        const mockPrice = (lowerLimit + upperLimit) / 2;
        setCurrentPrice(mockPrice);
        setPriceChange(1.24); // Mock price change percentage
      } catch (error) {
        console.error("Failed to fetch price:", error);
      }
    };

    fetchPrice();
    
    // Set up an interval to periodically update the price
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [symbol, lowerLimit, upperLimit]);

  // Calculate grid price levels
  const calculateGridLevels = () => {
    const range = upperLimit - lowerLimit;
    const step = range / 4;
    return [
      upperLimit,
      lowerLimit + 3 * step,
      lowerLimit + 2 * step,
      lowerLimit + step,
      lowerLimit
    ];
  };

  const gridLevels = calculateGridLevels();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-2xl font-bold">{formatCurrency(currentPrice)}</span>
          <span className={`ml-2 text-sm font-medium ${priceChange >= 0 ? 'text-secondary' : 'text-danger'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={timeframe === "1H" ? "default" : "outline"}
            size="sm"
            className={timeframe === "1H" ? "bg-primary" : "bg-dark-light hover:bg-dark-card"}
            onClick={() => onTimeframeChange("1H")}
          >
            1H
          </Button>
          <Button
            variant={timeframe === "1D" ? "default" : "outline"}
            size="sm"
            className={timeframe === "1D" ? "bg-primary" : "bg-dark-light hover:bg-dark-card"}
            onClick={() => onTimeframeChange("1D")}
          >
            1D
          </Button>
          <Button
            variant={timeframe === "1W" ? "default" : "outline"}
            size="sm"
            className={timeframe === "1W" ? "bg-primary" : "bg-dark-light hover:bg-dark-card"}
            onClick={() => onTimeframeChange("1W")}
          >
            1W
          </Button>
          <Button
            variant={timeframe === "1M" ? "default" : "outline"}
            size="sm"
            className={timeframe === "1M" ? "bg-primary" : "bg-dark-light hover:bg-dark-card"}
            onClick={() => onTimeframeChange("1M")}
          >
            1M
          </Button>
        </div>
      </div>
      
      {/* Chart visualization */}
      <div className="h-48 w-full relative flex items-end">
        {/* Grid lines */}
        {gridLevels.map((level, index) => (
          <React.Fragment key={index}>
            <div 
              className={`absolute left-0 w-full h-px ${
                Math.abs(level - currentPrice) < (upperLimit - lowerLimit) / 10
                  ? 'bg-green-500/20'
                  : 'bg-dark-light'
              }`} 
              style={{ top: `${index * 20 + 10}%` }}
            />
            <div 
              className={`absolute right-2 text-xs ${
                Math.abs(level - currentPrice) < (upperLimit - lowerLimit) / 10
                  ? 'text-secondary'
                  : 'text-gray-400'
              }`} 
              style={{ top: `${index * 20 + 9}%` }}
            >
              {formatCurrency(level)}
            </div>
          </React.Fragment>
        ))}
        
        {/* Price chart line (simplified SVG path) */}
        <svg viewBox="0 0 500 100" className="h-full w-full overflow-visible">
          <path 
            d="M0,70 C50,65 100,20 150,40 C200,60 250,80 300,50 C350,30 400,45 450,35 L500,45" 
            stroke="#3861FB" 
            strokeWidth="2" 
            fill="none"
          />
        </svg>
      </div>
    </>
  );
};

export default PriceChart;
