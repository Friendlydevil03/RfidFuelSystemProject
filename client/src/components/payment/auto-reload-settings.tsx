import { useState } from "react";
import { Wallet, PaymentMethod } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AutoReloadSettingsProps {
  wallet: Wallet | undefined;
  paymentMethods: PaymentMethod[];
}

export default function AutoReloadSettings({ wallet, paymentMethods }: AutoReloadSettingsProps) {
  const { toast } = useToast();
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(wallet?.autoReloadEnabled || false);
  const [threshold, setThreshold] = useState(wallet?.autoReloadThreshold?.toString() || "500");
  const [amount, setAmount] = useState(wallet?.autoReloadAmount?.toString() || "1000");
  const [paymentMethodId, setPaymentMethodId] = useState(
    wallet?.autoReloadPaymentMethodId?.toString() || 
    (paymentMethods[0]?.id.toString() || "")
  );
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: {
      autoReloadEnabled: boolean;
      autoReloadThreshold: number | null;
      autoReloadAmount: number | null;
      autoReloadPaymentMethodId: number | null;
    }) => {
      const res = await apiRequest("PUT", "/api/wallet/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      toast({
        title: "Settings Updated",
        description: "Auto-reload settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      autoReloadEnabled,
      autoReloadThreshold: autoReloadEnabled ? Number(threshold) : null,
      autoReloadAmount: autoReloadEnabled ? Number(amount) : null,
      autoReloadPaymentMethodId: autoReloadEnabled ? Number(paymentMethodId) : null,
    });
  };
  
  // Get a display name for the payment method
  const getPaymentMethodName = (id: string) => {
    const method = paymentMethods.find(m => m.id.toString() === id);
    if (!method) return "Select payment method";
    
    if (method.type === "card") {
      return `Card - ${method.details.cardNumber.slice(-4)}`;
    } else {
      return `UPI - ${method.details.upiId}`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium mb-4">Auto-Reload Settings</h3>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">Enable Auto-Reload</p>
          <p className="text-sm text-neutral-500">Automatically recharge your wallet when balance is low</p>
        </div>
        <Switch 
          checked={autoReloadEnabled} 
          onCheckedChange={setAutoReloadEnabled} 
          disabled={paymentMethods.length === 0}
        />
      </div>
      
      {paymentMethods.length === 0 && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm mb-4">
          Please add a payment method before enabling auto-reload.
        </div>
      )}
      
      {autoReloadEnabled && paymentMethods.length > 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Reload when balance falls below</label>
            <Select value={threshold} onValueChange={setThreshold}>
              <SelectTrigger>
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">₹500</SelectItem>
                <SelectItem value="1000">₹1,000</SelectItem>
                <SelectItem value="1500">₹1,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Amount to reload</label>
            <Select value={amount} onValueChange={setAmount}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">₹1,000</SelectItem>
                <SelectItem value="2000">₹2,000</SelectItem>
                <SelectItem value="3000">₹3,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Payment method for auto-reload</label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method">
                  {getPaymentMethodName(paymentMethodId)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.type === "card" 
                      ? `Card - ${method.details.cardNumber.slice(-4)}` 
                      : `UPI - ${method.details.upiId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="mt-2"
          >
            {updateSettingsMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </div>
      )}
    </div>
  );
}
