import { useAuth } from "@/hooks/use-auth";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Fuel, BarChart3Icon, ReceiptIcon, CogIcon, HelpCircleIcon, UserIcon, LogOutIcon } from "lucide-react";

export type StationInfo = {
  id: number;
  name: string;
  location: string;
};

export default function StationLayout({ 
  children, 
  stationInfo 
}: { 
  children: React.ReactNode;
  stationInfo: StationInfo;
}) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Fuel className="h-8 w-8 mr-2" />
            <div>
              <h1 className="text-xl font-medium">FuelTag Station Terminal</h1>
              <p className="text-sm text-white text-opacity-80">{stationInfo.name} - {stationInfo.location}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex flex-col items-end mr-4">
              <span className="font-medium">{user?.name || 'Station Manager'}</span>
              <span className="text-sm text-white text-opacity-80">Station Manager</span>
            </div>
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-md">
          <div className="p-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success rounded-full mr-2"></div>
              <span className="text-sm">System Status: Online</span>
            </div>
          </div>
          <div className="mt-4">
            <NavItem path="/station" icon={<BarChart3Icon className="mr-3 h-5 w-5" />} label="Dashboard" />
            <NavItem path="/station/transactions" icon={<ReceiptIcon className="mr-3 h-5 w-5" />} label="Transactions" />
            <NavItem path="/station/reports" icon={<BarChart3Icon className="mr-3 h-5 w-5" />} label="Reports" />
            
            <div className="border-t border-neutral-200 my-4"></div>
            
            <NavItem path="/station/settings" icon={<CogIcon className="mr-3 h-5 w-5" />} label="Settings" />
            <NavItem path="/station/help" icon={<HelpCircleIcon className="mr-3 h-5 w-5" />} label="Help" />
            
            <button 
              onClick={handleLogout}
              className="w-full py-3 px-6 flex items-center text-neutral-700 bg-white hover:bg-neutral-100"
            >
              <LogOutIcon className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
        
        {/* Content Area */}
        <main className="flex-1 bg-neutral-100 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ path, icon, label }: { path: string; icon: React.ReactNode; label: string }) {
  const exactMatch = path === "/station";
  const [isActive] = useRoute(exactMatch ? path : `${path}/*`);
  
  return (
    <Link href={path}>
      <a className={`w-full py-3 px-6 flex items-center ${
        isActive 
          ? "bg-primary text-white hover:bg-primary-dark" 
          : "text-neutral-700 bg-white hover:bg-neutral-100"
      }`}>
        {icon}
        {label}
      </a>
    </Link>
  );
}
