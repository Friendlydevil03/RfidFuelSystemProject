import { ArrowUp, ArrowDown, Wallet, Receipt, BarChart, CreditCard } from "lucide-react";

interface SummaryCardsProps {
  totalRevenue: number;
  transactionCount: number;
  totalVolume: number;
  rfidPercentage: number;
}

export default function SummaryCards({
  totalRevenue,
  transactionCount,
  totalVolume,
  rfidPercentage
}: SummaryCardsProps) {
  // Fixed values for comparison with previous month
  const revenueChange = 12;
  const transactionChange = 8;
  const volumeChange = 5;
  const rfidChange = 15;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <SummaryCard
        title="Total Revenue"
        value={`₹${formatCurrency(totalRevenue)}`}
        change={revenueChange}
        icon={<Wallet className="h-6 w-6 text-success" />}
      />
      
      <SummaryCard
        title="Transactions"
        value={transactionCount.toString()}
        change={transactionChange}
        icon={<Receipt className="h-6 w-6 text-primary" />}
      />
      
      <SummaryCard
        title="Fuel Volume"
        value={`${totalVolume.toFixed(0)} L`}
        change={volumeChange}
        icon={<BarChart className="h-6 w-6 text-primary" />}
      />
      
      <SummaryCard
        title="RFID Usage"
        value={`${rfidPercentage}%`}
        change={rfidChange}
        icon={<CreditCard className="h-6 w-6 text-primary" />}
      />
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

function SummaryCard({ title, value, change, icon }: SummaryCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-medium">{value}</p>
      <div className="flex items-center mt-2 text-sm">
        <span className={`flex items-center mr-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {Math.abs(change)}%
        </span>
        <span className="text-neutral-500">vs. last month</span>
      </div>
    </div>
  );
}

// Helper function to format currency
function formatCurrency(value: number): string {
  if (value >= 100000) {
    return (value / 100000).toFixed(2) + " Lakh";
  } else {
    return value.toLocaleString('en-IN');
  }
}
