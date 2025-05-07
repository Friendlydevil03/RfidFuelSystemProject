import { Transaction } from "@shared/schema";
import { useMemo } from "react";

interface FuelConsumptionProps {
  transactions: Transaction[];
}

export default function FuelConsumption({ transactions }: FuelConsumptionProps) {
  // Calculate consumption stats for the last 30 days
  const stats = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTransactions = transactions.filter(
      t => new Date(t.timestamp) >= thirtyDaysAgo && t.paymentType !== "topup"
    );
    
    const totalLiters = recentTransactions.reduce(
      (sum, t) => sum + Number(t.quantity), 
      0
    );
    
    const totalSpent = recentTransactions.reduce(
      (sum, t) => sum + Number(t.totalAmount), 
      0
    );
    
    const transactionCount = recentTransactions.length;
    
    const avgPricePerLiter = totalLiters > 0 
      ? totalSpent / totalLiters 
      : 0;
    
    return {
      totalLiters,
      totalSpent,
      transactionCount,
      avgPricePerLiter,
    };
  }, [transactions]);
  
  // Calculate percentage filled for the progress bar
  const progressPercentage = Math.min(Math.round((stats.totalLiters / 100) * 100), 100);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Fuel Consumption</h3>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between text-sm text-neutral-500 mb-2">
          <span>Last 30 Days</span>
          <span>{stats.totalLiters.toFixed(1)} Liters</span>
        </div>
        <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-6">
          <div className="text-center">
            <p className="text-2xl font-medium">₹{stats.totalSpent.toFixed(0)}</p>
            <p className="text-sm text-neutral-500">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-medium">{stats.transactionCount}</p>
            <p className="text-sm text-neutral-500">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-medium">₹{stats.avgPricePerLiter.toFixed(1)}</p>
            <p className="text-sm text-neutral-500">Avg. per liter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
