import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import { Eye, EyeOff } from 'lucide-react';

// Form schemas
const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  passphrase: z.string().min(1, "Passphrase is required"),
  userId: z.number().default(1), // Default user for demo
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  tradeAlerts: z.boolean().default(true),
  profitAlerts: z.boolean().default(true),
  riskAlerts: z.boolean().default(true),
});

const Settings: React.FC = () => {
  const [showSecret, setShowSecret] = React.useState(false);
  const [showPassphrase, setShowPassphrase] = React.useState(false);

  // API key form
  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: "",
      apiSecret: "",
      passphrase: "",
      userId: 1,
    }
  });

  // Notification settings form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      tradeAlerts: true,
      profitAlerts: true,
      riskAlerts: true,
    }
  });

  // Fetch existing API key if any
  const { data: apiConfig } = useQuery({
    queryKey: ['/api/api-config'],
    onSuccess: (data) => {
      if (data) {
        apiKeyForm.setValue('apiKey', data.apiKey);
        // Don't set secret fields for security reasons
      }
    }
  });

  // Save API key mutation
  const saveApiKeyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof apiKeySchema>) => {
      return await apiRequest('POST', '/api/api-config', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-config'] });
    },
  });

  // Save notification settings mutation
  const saveNotificationSettingsMutation = useMutation({
    mutationFn: async (values: z.infer<typeof notificationSettingsSchema>) => {
      return await apiRequest('POST', '/api/settings/notifications', values);
    },
  });

  const onSubmitApiKey = (values: z.infer<typeof apiKeySchema>) => {
    saveApiKeyMutation.mutate(values);
  };

  const onSubmitNotificationSettings = (values: z.infer<typeof notificationSettingsSchema>) => {
    saveNotificationSettingsMutation.mutate(values);
  };

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-gray-400">Manage your account and trading preferences</p>
      </header>

      <Tabs defaultValue="api" className="mb-6">
        <TabsList className="bg-dark-card mb-4">
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Trading Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api">
          <Card className="bg-dark-card">
            <CardHeader>
              <CardTitle>Bitget API Keys</CardTitle>
              <CardDescription className="text-gray-400">
                Connect your Bitget account to enable automated trading. Create API keys with trade-only permissions for security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiKeyForm}>
                <form onSubmit={apiKeyForm.handleSubmit(onSubmitApiKey)} className="space-y-4">
                  <FormField
                    control={apiKeyForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Bitget API key" {...field} className="bg-dark border-dark-light" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiKeyForm.control}
                    name="apiSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showSecret ? "text" : "password"} 
                              placeholder="Enter your Bitget API secret" 
                              {...field} 
                              className="bg-dark border-dark-light"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5 text-gray-400"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          We encrypt your API secret and never share it with third parties.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiKeyForm.control}
                    name="passphrase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passphrase</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassphrase ? "text" : "password"} 
                              placeholder="Enter your Bitget passphrase" 
                              {...field} 
                              className="bg-dark border-dark-light"
                            />
                            <button
                              type="button"
                              className="absolute right-2 top-2.5 text-gray-400"
                              onClick={() => setShowPassphrase(!showPassphrase)}
                            >
                              {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-blue-700"
                    disabled={saveApiKeyMutation.isPending}
                  >
                    {saveApiKeyMutation.isPending ? "Saving..." : "Save API Keys"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card className="bg-dark-card">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription className="text-gray-400">
                Configure how and when you want to be notified about your trading activity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription className="text-gray-500">
                              Receive trade updates and alerts via email
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
                    
                    <FormField
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                          <div className="space-y-0.5">
                            <FormLabel>Push Notifications</FormLabel>
                            <FormDescription className="text-gray-500">
                              Receive real-time alerts on your device
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
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-3">Alert Types</h3>
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="tradeAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                            <FormLabel>Trade Execution Alerts</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="profitAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                            <FormLabel>Profit Target Alerts</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="riskAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 border-dark-light">
                            <FormLabel>Risk Management Alerts</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-blue-700 mt-4"
                    disabled={saveNotificationSettingsMutation.isPending}
                  >
                    {saveNotificationSettingsMutation.isPending ? "Saving..." : "Save Notification Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card className="bg-dark-card">
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription className="text-gray-400">
                Configure default settings for your trading bots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-investment">Default Investment (USDT)</Label>
                  <Input
                    id="default-investment"
                    type="number"
                    placeholder="10"
                    defaultValue="10"
                    className="bg-dark border-dark-light"
                  />
                  <p className="text-xs text-gray-500">Minimum investment amount for new bots</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-grids">Default Grid Count</Label>
                  <Input
                    id="default-grids"
                    type="number"
                    placeholder="50"
                    defaultValue="50"
                    className="bg-dark border-dark-light"
                  />
                </div>
                
                <div className="flex items-center justify-between border p-3 rounded-lg border-dark-light">
                  <div>
                    <Label htmlFor="always-paper-trading">Default to Paper Trading</Label>
                    <p className="text-xs text-gray-500">Always use paper trading for new bots</p>
                  </div>
                  <Switch id="always-paper-trading" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between border p-3 rounded-lg border-dark-light">
                  <div>
                    <Label htmlFor="auto-start">Auto-start Bots</Label>
                    <p className="text-xs text-gray-500">Automatically start bots after creation</p>
                  </div>
                  <Switch id="auto-start" defaultChecked />
                </div>
                
                <Button className="bg-primary hover:bg-blue-700 mt-4">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Settings;
