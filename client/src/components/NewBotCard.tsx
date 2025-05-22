import React from 'react';
import { Button } from "@/components/ui/button";

interface NewBotCardProps {
  onCreateBot: () => void;
}

const NewBotCard: React.FC<NewBotCardProps> = ({ onCreateBot }) => {
  return (
    <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold mb-2">Start with just $10</h2>
          <p className="text-gray-300">Create a new infinity grid bot with minimal investment</p>
        </div>
        <Button 
          onClick={onCreateBot}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Create New Bot
        </Button>
      </div>
    </div>
  );
};

export default NewBotCard;
