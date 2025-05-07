import { useState } from "react";
import CustomerLayout from "@/components/layout/customer-layout";
import MonthlySummary from "@/components/transactions/monthly-summary";
import TransactionCard from "@/components/transactions/transaction-card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FilterIcon, DownloadIcon, SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Transaction } from "@shared/schema";

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  // Filter transactions based on search term
  const filteredTransactions = transactions
    ? transactions.filter(
        transaction => 
          transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.fuelType.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  // Calculate totals for the month for MonthlySummary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = transactions
    ? transactions.filter(transaction => {
        const transactionDate = new Date(transaction.timestamp);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
    : [];
  
  const totalSpent = monthlyTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.totalAmount),
    0
  );
  
  const totalVolume = monthlyTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.quantity),
    0
  );
  
  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Transaction History</h2>
          <div className="flex">
            <Button variant="outline" className="mr-2">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <MonthlySummary 
          monthYear={`${new Date().toLocaleString('default', { month: 'long' })} ${currentYear}`} 
          totalSpent={totalSpent} 
          transactionCount={monthlyTransactions.length} 
          totalVolume={totalVolume}
        />
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Transactions</h3>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search transactions"
                className="pl-10 pr-4 py-2 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
              <p className="text-neutral-600">
                {searchTerm
                  ? "No transactions match your search criteria."
                  : "You haven't made any transactions yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
