import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";
import ActiveBotCard from "@/components/ActiveBotCard";
import GridConfiguration from "@/components/GridConfiguration";
import BotsList from "@/components/BotsList";
import NewBotCard from "@/components/NewBotCard";
import QuickStats from "@/components/QuickStats";
import CreateBotModal from "@/components/CreateBotModal";
import { useQuery } from '@tanstack/react-query';
import { Bot } from '@shared/schema';

const Dashboard: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Fetch bots to display in the dashboard
  const { data: bots, isLoading } = useQuery<Bot[]>({
    queryKey: ['/api/bots'],
  });

  // Get the first active bot to display in the main card
  const activeBot = bots?.find(bot => bot.status === 'active');
  
  const handleCreateBot = () => {
    setShowCreateModal(true);
  };
  
  const handleEditBot = () => {
    // For demo purposes, just open the create modal
    // In a real app, this would pre-fill the form with current bot values
    setShowCreateModal(true);
  };
  
  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Infinity Grid Bot</h1>
          <p className="text-gray-400">Automated grid trading strategy with minimum $10 investment</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="outline" className="bg-dark-card text-white hover:bg-dark-light">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help
          </Button>
          <Button className="bg-primary text-white hover:bg-blue-700" onClick={handleCreateBot}>
            <Plus className="mr-2 h-4 w-4" />
            New Bot
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="col-span-1 lg:col-span-2 h-96 bg-dark-card rounded-xl animate-pulse" />
          <div className="h-96 bg-dark-card rounded-xl animate-pulse" />
        </div>
      ) : activeBot ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ActiveBotCard bot={activeBot} />
          <GridConfiguration bot={activeBot} onEdit={handleEditBot} />
        </div>
      ) : (
        <div className="mb-8 p-8 text-center bg-dark-card rounded-xl">
          <p className="text-gray-400 mb-4">You don't have any active bots. Create one to start trading!</p>
          <Button onClick={handleCreateBot} className="bg-primary text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Bot
          </Button>
        </div>
      )}
      
      <BotsList />
      
      <NewBotCard onCreateBot={handleCreateBot} />
      
      <QuickStats />
      
      <CreateBotModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </>
  );
};

export default Dashboard;
