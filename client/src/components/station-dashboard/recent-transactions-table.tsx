import { Transaction } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Receipt, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

interface RecentTransactionsTableProps {
  transactions: Transaction[];
}

export default function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  // Sort transactions by timestamp (newest first)
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Take only the most recent 10
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Recent Transactions</h3>
        <Link href="/station/transactions">
          <a className="text-primary hover:text-primary-dark flex items-center">
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedTransactions.length > 0 ? (
          <table className="min-w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Transaction ID</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Time</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Payment</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map(transaction => {
                const time = new Date(transaction.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={transaction.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">{transaction.transactionId}</td>
                    <td className="py-3 px-4">{transaction.vehicleId ? `Vehicle #${transaction.vehicleId}` : 'N/A'}</td>
                    <td className="py-3 px-4">{time}</td>
                    <td className="py-3 px-4">₹{Number(transaction.totalAmount).toFixed(2)}</td>
                    <td className="py-3 px-4">{getPaymentTypeLabel(transaction.paymentType)}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark">
                        <Receipt className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center">
            <p className="text-neutral-500">No recent transactions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getPaymentTypeLabel(paymentType: string): string {
  switch (paymentType) {
    case 'rfid': return 'RFID Wallet';
    case 'card': return 'Credit Card';
    case 'upi': return 'UPI';
    case 'cash': return 'Cash';
    case 'topup': return 'Top-up';
    default: return paymentType;
  }
}

function StatusBadge({ status }: { status: string }) {
  let variant: "default" | "destructive" | "outline" | "secondary" | "success" = "default";
  
  switch (status) {
    case 'completed':
      variant = "success";
      break;
    case 'failed':
      variant = "destructive";
      break;
    case 'pending':
      variant = "secondary";
      break;
    default:
      variant = "default";
  }
  
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <Badge variant={variant}>
      {statusLabel}
    </Badge>
  );
}
