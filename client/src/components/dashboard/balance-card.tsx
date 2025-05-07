import { Button } from "@/components/ui/button";

interface BalanceCardProps {
  balance: number;
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="bg-primary rounded-xl shadow-lg p-6 text-white mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm opacity-75">RFID Balance</p>
          <h3 className="text-2xl font-medium">₹{balance.toFixed(2)}</h3>
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
