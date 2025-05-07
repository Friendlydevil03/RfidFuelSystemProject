import { useEffect } from "react";
import CustomerLayout from "@/components/layout/customer-layout";
import BalanceCard from "@/components/dashboard/balance-card";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import FuelConsumption from "@/components/dashboard/fuel-consumption";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Wallet } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: wallet, isLoading: isWalletLoading, error: walletError } = useQuery<Wallet>({
    queryKey: ['/api/wallet'],
    enabled: !!user,
  });
  
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (walletError) {
      toast({
        title: "Error loading wallet",
        description: "Could not load wallet information. Please try again later.",
        variant: "destructive",
      });
    }
  }, [walletError, toast]);
  
  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Welcome, {user?.name || "User"}</h2>
          <span className="bg-success text-white px-3 py-1 rounded-full text-sm">Active</span>
        </div>
        
        {isWalletLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <BalanceCard balance={wallet?.balance || 0} />
        )}
        
        <QuickActions />
        
        <RecentTransactions 
          transactions={transactions || []} 
          isLoading={isTransactionsLoading} 
        />
        
        <FuelConsumption transactions={transactions || []} />
      </div>
    </CustomerLayout>
  );
}
