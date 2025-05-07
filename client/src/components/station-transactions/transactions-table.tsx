import { Transaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Eye, Printer, RefreshCw, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  // Function to get payment icon based on payment type
  const getPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case 'rfid':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-primary">
            <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"></path>
            <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"></path>
            <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"></path>
            <path d="M16.37 2a20.16 20.16 0 0 1 0 20"></path>
          </svg>
        );
      case 'card':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-primary">
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" x2="22" y1="10" y2="10"></line>
          </svg>
        );
      case 'upi':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-primary">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect>
            <line x1="12" x2="12.01" y1="18" y2="18"></line>
          </svg>
        );
      case 'cash':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-primary">
            <rect width="20" height="12" x="2" y="6" rx="2"></rect>
            <circle cx="12" cy="12" r="2"></circle>
            <path d="M6 12h.01M18 12h.01"></path>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-error">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" x2="12" y1="9" y2="13"></line>
            <line x1="12" x2="12.01" y1="17" y2="17"></line>
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
        <p className="text-neutral-600 mb-4">
          There are no transactions matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead>
          <tr className="bg-neutral-50 border-b border-neutral-200">
            <th className="text-left py-3 px-4 font-medium text-neutral-700">ID</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Date & Time</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Vehicle</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Fuel</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Quantity</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Amount</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Payment</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Status</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-neutral-100 hover:bg-neutral-50">
              <td className="py-3 px-4 text-sm">{transaction.transactionId}</td>
              <td className="py-3 px-4 text-sm">{formatDate(new Date(transaction.timestamp))}</td>
              <td className="py-3 px-4 text-sm">
                {transaction.vehicleId ? (
                  <>
                    Vehicle #{transaction.vehicleId}
                    <br />
                    <span className="text-xs text-neutral-500">User #{transaction.userId}</span>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
              <td className="py-3 px-4 text-sm">{transaction.fuelType}</td>
              <td className="py-3 px-4 text-sm">{Number(transaction.quantity).toFixed(1)} L</td>
              <td className="py-3 px-4 text-sm font-medium">₹{Number(transaction.totalAmount).toFixed(2)}</td>
              <td className="py-3 px-4 text-sm">
                <div className="flex items-center">
                  {getPaymentIcon(transaction.paymentType)}
                  {getPaymentTypeLabel(transaction.paymentType)}
                </div>
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={transaction.status} />
              </td>
              <td className="py-3 px-4">
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" className="text-primary hover:text-primary-dark">
                    <Eye className="h-5 w-5" />
                  </Button>
                  {transaction.status === "failed" ? (
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-700">
                      <Printer className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex justify-between items-center px-6 py-4 bg-neutral-50 border-t border-neutral-200">
        <div className="text-sm text-neutral-500">
          Showing 1-{Math.min(transactions.length, 10)} of {transactions.length} transactions
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="px-3 py-1 rounded hover:bg-neutral-200 mr-1" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
          </Button>
          <Button variant="default" size="sm" className="px-3 py-1 rounded">1</Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 rounded hover:bg-neutral-200">2</Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 rounded hover:bg-neutral-200">3</Button>
          <Button variant="ghost" size="sm" className="px-3 py-1 rounded hover:bg-neutral-200 ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </Button>
        </div>
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
