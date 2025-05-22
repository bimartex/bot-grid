import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import { Switch } from '@/components/ui/switch';
import { insertBotSchema } from '@shared/schema';
import { Slider } from '@/components/ui/slider';

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertBotSchema.extend({
  // Add additional validation for the form
  investment: z.number().min(10, { message: "Minimum investment is $10" }),
  gridCount: z.number().min(5, { message: "Minimum 5 grids required" }).max(100, { message: "Maximum 100 grids allowed" }),
  profitPerGrid: z.number().min(0.001, { message: "Profit per grid must be at least 0.1%" }).max(0.1, { message: "Profit per grid cannot exceed 10%" }),
});

const CreateBotModal: React.FC<CreateBotModalProps> = ({ open, onOpenChange }) => {
  // Sample trading pairs
  const tradingPairs = [
    { value: "BTC/USDT", label: "Bitcoin (BTC/USDT)" },
    { value: "ETH/USDT", label: "Ethereum (ETH/USDT)" },
    { value: "SOL/USDT", label: "Solana (SOL/USDT)" },
    { value: "ADA/USDT", label: "Cardano (ADA/USDT)" },
    { value: "BNB/USDT", label: "Binance Coin (BNB/USDT)" },
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1, // Default user ID for demo
      name: "",
      tradingPair: "BTC/USDT",
      baseAsset: "BTC",
      quoteAsset: "USDT",
      investment: 10,
      status: "active",
      upperLimit: 28000,
      lowerLimit: 25500,
      gridCount: 50,
      profitPerGrid: 0.0055, // 0.55%
      isPaperTrading: true,
    },
  });

  const createBotMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return await apiRequest('POST', '/api/bots', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      form.reset();
      onOpenChange(false);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createBotMutation.mutate(values);
  };

  const handleTradingPairChange = (value: string) => {
    const [base, quote] = value.split('/');
    form.setValue('tradingPair', value);
    form.setValue('baseAsset', base);
    form.setValue('quoteAsset', quote);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-dark-card text-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Grid Bot</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your infinity grid trading bot parameters
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Grid Bot" {...field} className="bg-dark border-dark-light" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tradingPair"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trading Pair</FormLabel>
                  <Select
                    onValueChange={(value) => handleTradingPairChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-dark border-dark-light">
                        <SelectValue placeholder="Select a trading pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-card border-dark-light">
                      {tradingPairs.map((pair) => (
                        <SelectItem key={pair.value} value={pair.value}>
                          {pair.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="investment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount (USDT)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={10}
                      step={5}
                      placeholder="10"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="bg-dark border-dark-light"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Minimum investment: $10
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lowerLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lower Price Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25500"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="bg-dark border-dark-light"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="upperLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upper Price Limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="28000"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        className="bg-dark border-dark-light"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="gridCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Count: {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={5}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Number of grid lines (5-100)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="profitPerGrid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profit per Grid: {(field.value * 100).toFixed(2)}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0.001}
                      max={0.05}
                      step={0.001}
                      defaultValue={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Profit percentage per completed grid (0.1% - 5%)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stopLoss"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stop Loss (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="bg-dark border-dark-light"
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Price at which the bot will automatically stop
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isPaperTrading"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                  <div className="space-y-0.5">
                    <FormLabel>Paper Trading Mode</FormLabel>
                    <FormDescription className="text-gray-500">
                      Practice without risking real funds
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-dark-light hover:bg-dark-light"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-blue-700"
                disabled={createBotMutation.isPending}
              >
                {createBotMutation.isPending ? "Creating..." : "Create Bot"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBotModal;
