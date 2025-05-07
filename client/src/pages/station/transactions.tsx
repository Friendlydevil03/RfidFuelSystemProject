import { useState } from "react";
import StationLayout from "@/components/layout/station-layout";
import TransactionsTable from "@/components/station-transactions/transactions-table";
import { useQuery } from "@tanstack/react-query";
import { StationInfo } from "@/components/layout/station-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDownIcon, SearchIcon } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function StationTransactions() {
  const stationInfo: StationInfo = {
    id: 1,
    name: "HP Fuel Station",
    location: "Andheri East",
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/station/${stationInfo.id}/transactions`],
  });
  
  // Apply filters
  const filteredTransactions = transactions
    ? transactions.filter(transaction => {
        // Apply search filter
        if (searchTerm && !transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Apply payment filter
        if (paymentFilter !== "all" && transaction.paymentType !== paymentFilter) {
          return false;
        }
        
        // Apply status filter
        if (statusFilter !== "all" && transaction.status !== statusFilter) {
          return false;
        }
        
        // Apply date filter
        const now = new Date();
        const transactionDate = new Date(transaction.timestamp);
        const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "today" && daysDiff > 0) {
          return false;
        } else if (dateFilter === "yesterday" && (daysDiff < 1 || daysDiff > 1)) {
          return false;
        } else if (dateFilter === "7d" && daysDiff > 7) {
          return false;
        } else if (dateFilter === "30d" && daysDiff > 30) {
          return false;
        }
        
        return true;
      })
    : [];
  
  return (
    <StationLayout stationInfo={stationInfo}>
      <div className="mb-6">
        <h2 className="text-2xl font-medium mb-6">Transaction History</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="relative w-full md:w-64 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Search transactions"
              className="w-full pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Payment Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="rfid">RFID Wallet</SelectItem>
                <SelectItem value="card">Credit/Debit Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <FileDownIcon className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Transactions Table */}
        <TransactionsTable 
          transactions={filteredTransactions}
          isLoading={isLoading}
        />
      </div>
    </StationLayout>
  );
}
