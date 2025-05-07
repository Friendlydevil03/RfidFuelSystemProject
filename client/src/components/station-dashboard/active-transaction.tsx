import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Car, Receipt, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ActiveTransactionProps {
  activeTransaction: {
    tag: any;
    vehicle: any;
    user: any;
  } | null;
  stationId: number;
}

export default function ActiveTransaction({ activeTransaction, stationId }: ActiveTransactionProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    fuelQuantity: 8.5,
    fuelPrice: 90.5,
    currentAmount: 769.25,
  });
  const { toast } = useToast();
  
  const completeTransactionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/station/complete-transaction", {
        userId: activeTransaction?.user.id,
        vehicleId: activeTransaction?.vehicle.id,
        stationId,
        fuelType: activeTransaction?.vehicle.fuelType,
        quantity: transactionDetails.fuelQuantity,
        pricePerUnit: transactionDetails.fuelPrice,
        paymentType: "rfid",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/station/${stationId}/transactions`] });
      setIsAuthorized(true);
      toast({
        title: "Transaction Authorized",
        description: "Transaction has been successfully authorized.",
      });
      
      // Reset after delay
      setTimeout(() => {
        setIsAuthorized(false);
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (!activeTransaction) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-primary">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Current RFID Transaction</h3>
        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">Active</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vehicle Info */}
        <div>
          <h4 className="text-lg mb-4 flex items-center">
            <Car className="mr-2 h-5 w-5 text-primary" />
            Vehicle Information
          </h4>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex mb-4">
              <div className="w-24 h-20 bg-neutral-300 rounded-lg mr-4 overflow-hidden">
                {/* Placeholder for vehicle image */}
                <div className="w-full h-full flex items-center justify-center">
                  <Car className="h-10 w-10 text-neutral-500" />
                </div>
              </div>
              <div>
                <h5 className="font-medium">{activeTransaction.vehicle.make} {activeTransaction.vehicle.model}</h5>
                <p className="text-neutral-500">{activeTransaction.vehicle.registrationNumber}</p>
                <div className="flex items-center mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mr-1">
                    <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"></path>
                    <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"></path>
                    <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"></path>
                    <path d="M16.37 2a20.16 20.16 0 0 1 0 20"></path>
                  </svg>
                  <span className="text-sm">RFID: {activeTransaction.tag.tagNumber}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Owner</p>
                  <p className="font-medium">{activeTransaction.user.name}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Fuel Type</p>
                  <p className="font-medium">{activeTransaction.vehicle.fuelType}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Last Fueling</p>
                  <p className="font-medium">5 days ago</p>
                </div>
                <div>
                  <p className="text-neutral-500">Status</p>
                  <p className="font-medium text-success">Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Transaction Details */}
        <div>
          <h4 className="text-lg mb-4 flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-primary" />
            Transaction Details
          </h4>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-neutral-500 text-sm">Transaction ID</p>
                <p className="font-medium">FT-{Date.now().toString().slice(-10)}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Date & Time</p>
                <p className="font-medium">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Fuel Dispenser</p>
                <p className="font-medium">Pump #3</p>
              </div>
              <div>
                <p className="text-neutral-500 text-sm">Status</p>
                <p className="font-medium text-warning">In Progress</p>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 py-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-neutral-500 text-sm">Fuel Quantity</p>
                  <p className="font-medium">{transactionDetails.fuelQuantity} L (so far)</p>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${(transactionDetails.fuelQuantity / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-neutral-500 text-sm">Fuel Price</p>
                <p className="font-medium">₹{transactionDetails.fuelPrice}/L</p>
              </div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-neutral-500 text-sm">Current Amount</p>
                <p className="font-medium">₹{transactionDetails.currentAmount}</p>
              </div>
              
              <Button 
                className="w-full bg-success hover:bg-success-dark text-white flex items-center justify-center"
                onClick={() => completeTransactionMutation.mutate()}
                disabled={completeTransactionMutation.isPending || isAuthorized}
              >
                {completeTransactionMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-5 w-5" />
                )}
                {completeTransactionMutation.isPending 
                  ? "Processing..." 
                  : isAuthorized 
                    ? "Transaction Authorized" 
                    : "Authorize Transaction"
                }
              </Button>
              
              {/* Success Message */}
              {isAuthorized && (
                <div className="mt-4 bg-success bg-opacity-10 text-success p-3 rounded-lg flex items-center justify-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Transaction Authorized Successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
