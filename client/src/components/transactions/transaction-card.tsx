import { Transaction } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Receipt, CreditCard, Fuel, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TransactionCardProps {
  transaction: Transaction;
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isTopUp = transaction.paymentType === "topup";
  
  const { data: stations } = useQuery({
    queryKey: ['/api/stations'],
  });
  
  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });
  
  const getStationName = () => {
    if (!transaction.stationId || !stations) return "Unknown Station";
    const station = stations.find(s => s.id === transaction.stationId);
    return station ? station.name : "Unknown Station";
  };
  
  const getVehicleInfo = () => {
    if (!transaction.vehicleId || !vehicles) return null;
    const vehicle = vehicles.find(v => v.id === transaction.vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})` : null;
  };
  
  const getPaymentTypeLabel = () => {
    switch (transaction.paymentType) {
      case "rfid": return "RFID Wallet";
      case "card": return "Credit/Debit Card";
      case "upi": return "UPI";
      case "cash": return "Cash";
      case "topup": return "Wallet Top-up";
      default: return transaction.paymentType;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
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
              <p className="font-medium">{isTopUp ? "Wallet Top-up" : getStationName()}</p>
              <p className="text-sm text-neutral-500">
                {formatDate(new Date(transaction.timestamp))}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {isTopUp ? "+ " : ""} 
              ₹{Number(transaction.totalAmount).toFixed(2)}
            </p>
            <p className={`text-sm ${
              transaction.status === "completed" ? "text-success" : 
              transaction.status === "failed" ? "text-destructive" : 
              "text-warning"
            }`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </p>
          </div>
        </div>
        
        {!isTopUp && (
          <div className="flex flex-wrap mt-4 text-sm text-neutral-600">
            {getVehicleInfo() && (
              <div className="mr-6">
                <span className="text-neutral-500">Vehicle:</span> {getVehicleInfo()}
              </div>
            )}
            <div className="mr-6">
              <span className="text-neutral-500">Fuel Type:</span> {transaction.fuelType}
            </div>
            <div className="mr-6">
              <span className="text-neutral-500">Quantity:</span> {Number(transaction.quantity).toFixed(1)} L
            </div>
            <div>
              <span className="text-neutral-500">Price:</span> ₹{Number(transaction.pricePerUnit).toFixed(1)}/L
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-neutral-50 p-3 flex justify-between items-center border-t border-neutral-200">
        <div className="flex items-center text-sm">
          <CreditCard className="text-neutral-500 mr-1 h-4 w-4" />
          <span>
            {isTopUp 
              ? "Via " + getPaymentTypeLabel() 
              : "Paid via " + getPaymentTypeLabel()}
          </span>
        </div>
        <Button variant="link" className="p-0 h-auto text-primary text-sm">
          View Receipt
        </Button>
      </div>
    </div>
  );
}
