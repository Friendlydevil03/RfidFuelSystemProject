import { Link, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Fuel, Bell, User, Home, Car, CreditCard, ReceiptText, Map } from "lucide-react";
import { WebSocketStatus } from "@/components/ui/websocket-status";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
  { name: "Vehicles", path: "/vehicles", icon: <Car className="h-5 w-5" /> },
  { name: "Payment", path: "/payment", icon: <CreditCard className="h-5 w-5" /> },
  { name: "History", path: "/transactions", icon: <ReceiptText className="h-5 w-5" /> },
  { name: "Stations", path: "/stations", icon: <Map className="h-5 w-5" /> },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Fuel className="text-primary h-7 w-7 mr-2" />
            <h1 className="text-xl font-medium">FuelTag</h1>
          </div>
          <div className="flex items-center">
            <WebSocketStatus />
            <Button variant="ghost" size="icon" className="ml-2">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="w-8 h-8 bg-neutral-300 rounded-full ml-4 flex items-center justify-center">
              <User className="h-5 w-5 text-neutral-600" />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-16">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="bg-white shadow-lg fixed bottom-0 left-0 right-0 h-16">
        <div className="flex h-full justify-around items-center">
          {navItems.map((item) => {
            const [isActive] = useRoute(item.path === "/" ? item.path : `${item.path}/*`);
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex flex-col items-center w-1/5 ${
                  isActive ? "text-primary border-t-2 border-primary" : "text-neutral-500 border-t-2 border-transparent"
                }`}
              >
                {item.icon}
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
