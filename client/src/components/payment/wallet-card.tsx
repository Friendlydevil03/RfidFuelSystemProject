import { Button } from "@/components/ui/button";
import { History, ArrowUpCircle, Gift, Wifi } from "lucide-react";
import { useWebSocketContext } from "@/contexts/websocket-provider";

interface WalletCardProps {
  balance: string | number;
  onTopUp: () => void;
}

export default function WalletCard({ balance, onTopUp }: WalletCardProps) {
  const { sendMessage, status } = useWebSocketContext();
  
  // Format the balance properly regardless of whether it's a string or number
  const formatBalance = () => {
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(2);
    } else if (typeof balance === 'number') {
      return balance.toFixed(2);
    }
    return '0.00'; // Fallback value
  };
  
  // Test real-time communication by sending a ping to the server
  const testRealTime = () => {
    sendMessage('ping', { timestamp: Date.now() });
  };
  
  return (
    <div className="bg-gradient-to-r from-secondary to-primary rounded-xl shadow-lg p-6 text-white mb-8">
      <h3 className="text-lg font-medium mb-4">FuelTag Wallet</h3>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm opacity-80">Available Balance</p>
          <h3 className="text-3xl font-medium">₹{formatBalance()}</h3>
        </div>
        <Button 
          onClick={onTopUp}
          className="bg-white text-primary hover:bg-neutral-100"
        >
          <span>Top Up</span>
        </Button>
      </div>
      <div className="flex text-sm">
        <div className="flex flex-col items-center mr-6">
          <History className="mb-1 h-5 w-5" />
          <span>History</span>
        </div>
        <div className="flex flex-col items-center mr-6">
          <ArrowUpCircle className="mb-1 h-5 w-5" />
          <span>Auto Reload</span>
        </div>
        <div className="flex flex-col items-center mr-6">
          <Gift className="mb-1 h-5 w-5" />
          <span>Rewards</span>
        </div>
        <div 
          className="flex flex-col items-center cursor-pointer" 
          onClick={testRealTime}
        >
          <Wifi className={`mb-1 h-5 w-5 ${status === 'connected' ? 'text-green-300' : status === 'connecting' ? 'text-yellow-300 animate-pulse' : 'text-red-300'}`} />
          <span>Real-time</span>
        </div>
      </div>
    </div>
  );
}
