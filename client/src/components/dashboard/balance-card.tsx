import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  balance: string | number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  // Format the balance properly regardless of whether it's a string or number
  const formatBalance = () => {
    if (typeof balance === 'string') {
      return parseFloat(balance).toFixed(2);
    } else if (typeof balance === 'number') {
      return balance.toFixed(2);
    }
    return '0.00'; // Fallback value
  };

  return (
    <div className="bg-primary rounded-xl shadow-lg p-6 text-white mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm opacity-75">RFID Balance</p>
          <h3 className="text-2xl font-medium">₹{formatBalance()}</h3>
        </div>
        <Button 
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
          variant="ghost"
          asChild
        >
          <a href="/payment">Top Up</a>
        </Button>
      </div>
      <div className="flex">
        <div className="mr-8">
          <p className="text-sm opacity-75">Card Number</p>
          <p>**** **** **** 4528</p>
        </div>
        <div>
          <p className="text-sm opacity-75">Valid Thru</p>
          <p>09/25</p>
        </div>
      </div>
    </div>
  );
}
