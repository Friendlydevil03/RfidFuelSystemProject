import { useState } from "react";
import StationLayout from "@/components/layout/station-layout";
import SummaryCards from "@/components/station-reports/summary-cards";
import Charts from "@/components/station-reports/charts";
import { StationInfo } from "@/components/layout/station-layout";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";

export default function StationReports() {
  const stationInfo: StationInfo = {
    id: 1,
    name: "HP Fuel Station",
    location: "Andheri East",
  };
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [`/api/station/${stationInfo.id}/transactions`],
  });
  
  // Filter transactions for the current month
  const currentMonthTransactions = transactions ? transactions.filter(transaction => {
    const date = new Date(transaction.timestamp);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }) : [];
  
  // Calculate metrics for summary cards
  const totalRevenue = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.totalAmount),
    0
  );
  
  const totalVolume = currentMonthTransactions.reduce(
    (sum, transaction) => sum + Number(transaction.quantity),
    0
  );
  
  const rfidTransactions = currentMonthTransactions.filter(
    transaction => transaction.paymentType === "rfid"
  );
  
  const rfidPercentage = currentMonthTransactions.length > 0
    ? Math.round((rfidTransactions.length / currentMonthTransactions.length) * 100)
    : 0;
  
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Get month name
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
  
  return (
    <StationLayout stationInfo={stationInfo}>
      <h2 className="text-2xl font-medium mb-6">Reports & Analytics</h2>
      
      {/* Date Range Selector */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="text-lg font-medium">{monthName} {currentYear}</div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Select Date Range
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards 
        totalRevenue={totalRevenue}
        transactionCount={currentMonthTransactions.length}
        totalVolume={totalVolume}
        rfidPercentage={rfidPercentage}
      />
      
      {/* Charts */}
      <Charts 
        transactions={currentMonthTransactions} 
        monthName={monthName}
        year={currentYear}
      />
    </StationLayout>
  );
}
