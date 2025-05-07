interface MonthlySummaryProps {
  monthYear: string;
  totalSpent: number;
  transactionCount: number;
  totalVolume: number;
}

export default function MonthlySummary({ 
  monthYear, 
  totalSpent, 
  transactionCount, 
  totalVolume 
}: MonthlySummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-medium mb-4">{monthYear} Summary</h3>
      <div className="flex justify-between">
        <div className="text-center">
          <p className="text-2xl font-medium">₹{totalSpent.toFixed(0)}</p>
          <p className="text-sm text-neutral-500">Total Spent</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-medium">{transactionCount}</p>
          <p className="text-sm text-neutral-500">Transactions</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-medium">{totalVolume.toFixed(1)} L</p>
          <p className="text-sm text-neutral-500">Fuel Volume</p>
        </div>
      </div>
    </div>
  );
}
