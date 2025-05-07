import { useState } from "react";
import StationLayout from "@/components/layout/station-layout";
import StatsCard from "@/components/station-dashboard/stats-card";
import ActiveTransaction from "@/components/station-dashboard/active-transaction";
import RecentTransactionsTable from "@/components/station-dashboard/recent-transactions-table";
import { useQuery } from "@tanstack/react-query";
import { StationInfo } from "@/components/layout/station-layout";
import { Transaction } from "@shared/schema";

export default function StationDashboard() {
  const stationInfo: StationInfo = {
    id: 1,
    name: "HP Fuel Station",
    location: "Andheri East",
  };
  
  const [activeRfidTag, setActiveRfidTag] = useState<{
    tag: any;
    vehicle: any;
    user: any;
  } | null>(null);
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [`/api/station/${stationInfo.id}/transactions`],
  });
  
  // Simulate an active RFID transaction
  const mockActiveTransaction = {
    tag: {
      id: 1,
      tagNumber: "FT8765432",
      status: "active",
    },
    vehicle: {
      id: 1,
      make: "Honda",
      model: "City",
      registrationNumber: "MH 01 AB 1234",
      fuelType: "Petrol",
    },
    user: {
      id: 1,
      name: "John Doe",
      walletBalance: 2450,
    },
  };
  
  return (
    <StationLayout stationInfo={stationInfo}>
      <div className="mb-8">
        <h2 className="text-2xl font-medium mb-6">Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            title="Today's Transactions"
            value="42"
            percentChange={12}
            icon="receipt"
          />
          <StatsCard 
            title="Today's Revenue"
            value="₹38,250"
            percentChange={8}
            icon="payments"
            iconColor="success"
          />
          <StatsCard 
            title="RFID Transactions"
            value="28"
            percentChange={15}
            icon="nfc"
          />
        </div>
      </div>
      
      {/* Active Transaction */}
      <ActiveTransaction 
        activeTransaction={activeRfidTag || mockActiveTransaction} 
        stationId={stationInfo.id}
      />
      
      {/* Recent Transactions */}
      <RecentTransactionsTable transactions={transactions || []} />
    </StationLayout>
  );
}
