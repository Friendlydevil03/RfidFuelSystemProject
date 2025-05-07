import { Link } from "wouter";
import { Transaction } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Receipt, Fuel, Wallet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const recentTransactions = transactions.slice(0, 3);
  
  const { data: stations } = useQuery({
    queryKey: ['/api/stations'],
  });
  
  const getStationName = (stationId: number | null) => {
    if (!stationId || !stations) return "Unknown Station";
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : "Unknown Station";
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <Link href="/transactions">
          <a className="text-primary text-sm">View All</a>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recentTransactions.length > 0 ? (
        <div className="space-y-4">
          {recentTransactions.map((transaction) => {
            const isTopUp = transaction.paymentType === "topup";
            const time = formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true });
            
            return (
              <div key={transaction.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {isTopUp ? (
                      <div className="text-success bg-success bg-opacity-10 p-2 rounded-full mr-4">
                        <Wallet className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="text-primary bg-primary bg-opacity-10 p-2 rounded-full mr-4">
                        <Fuel className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {isTopUp ? "Wallet Top-up" : getStationName(transaction.stationId)}
                      </p>
                      <p className="text-sm text-neutral-500">{time}</p>
                    </div>
                  </div>
                  <p className={`font-medium ${isTopUp ? "text-success" : ""}`}>
                    {isTopUp ? "+ " : "- "}₹{Number(transaction.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <Receipt className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
          <h4 className="font-medium mb-2">No Transactions Yet</h4>
          <p className="text-neutral-500 text-sm">
            Your transaction history will appear here once you start using your RFID tag for fuel payments.
          </p>
        </div>
      )}
    </div>
  );
}
