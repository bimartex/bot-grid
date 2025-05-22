import { useState } from "react";
import { useLocation } from "wouter";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GridIcon, Wallet, History as HistoryIcon, Settings as SettingsIcon, School } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

// Navigation item data structure
const navigationItems = [
  { path: "/", label: "Dashboard", icon: GridIcon },
  { path: "/assets", label: "Assets", icon: Wallet },
  { path: "/history", label: "History", icon: HistoryIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon }
];

// Navigation item component
const NavItem = ({ path, label, icon: Icon, isActive }: { 
  path: string; 
  label: string; 
  icon: React.ElementType; 
  isActive: boolean 
}) => {
  return (
    <a 
      href={path}
      className={`flex items-center p-3 rounded-lg ${
        isActive ? 'bg-primary text-white' : 'hover:bg-dark-light text-gray-300'
      } font-medium cursor-pointer`}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </a>
  );
};

const Sidebar = () => {
  const [location] = useLocation();
  const [isPaperTrading, setIsPaperTrading] = useState<boolean>(false);

  // Paper trading toggle mutation
  const togglePaperTradingMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return await apiRequest('POST', '/api/settings/paper-trading', { enabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bots'] });
    },
  });

  const handlePaperTradingToggle = (checked: boolean) => {
    setIsPaperTrading(checked);
    togglePaperTradingMutation.mutate(checked);
  };

  return (
    <aside className="w-full md:w-64 bg-dark-card md:min-h-screen p-4 md:p-6">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <GridIcon className="text-white" />
        </div>
        <h1 className="ml-3 text-xl font-bold text-white">Infinity Grid</h1>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavItem 
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            isActive={location === item.path}
          />
        ))}
      </nav>
      
      <div className="mt-auto pt-8">
        <div className="p-4 bg-dark rounded-lg">
          <div className="flex items-center mb-3">
            <School className="text-primary mr-2 h-5 w-5" />
            <h3 className="font-medium">Paper Trading</h3>
          </div>
          <p className="text-sm text-gray-400 mb-3">Practice without risk using virtual funds.</p>
          <div className="flex items-center">
            <Switch
              checked={isPaperTrading}
              onCheckedChange={handlePaperTradingToggle}
              id="paperTrading"
            />
            <Label htmlFor="paperTrading" className="ml-2 text-sm font-medium text-secondary">
              {isPaperTrading ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
