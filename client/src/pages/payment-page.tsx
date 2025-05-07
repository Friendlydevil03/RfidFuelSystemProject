import { useState } from "react";
import CustomerLayout from "@/components/layout/customer-layout";
import WalletCard from "@/components/payment/wallet-card";
import PaymentMethodCard from "@/components/payment/payment-method-card";
import AutoReloadSettings from "@/components/payment/auto-reload-settings";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { Wallet, PaymentMethod } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addPaymentMethodSchema = z.object({
  type: z.enum(["card", "upi"]),
  details: z.object({
    cardNumber: z.string().optional(),
    cardHolder: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(),
    upiId: z.string().optional(),
  }).refine((data) => {
    if (data.cardNumber || data.cardHolder || data.expiryDate || data.cvv) {
      return !!data.cardNumber && !!data.cardHolder && !!data.expiryDate && !!data.cvv;
    }
    if (data.upiId) {
      return true;
    }
    return false;
  }, "Required payment details are missing"),
  isDefault: z.boolean().default(false),
});

type AddPaymentMethodFormValues = z.infer<typeof addPaymentMethodSchema>;

const topUpWalletSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  paymentMethodId: z.string(),
});

type TopUpWalletFormValues = z.infer<typeof topUpWalletSchema>;

export default function PaymentPage() {
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [isTopUpWalletOpen, setIsTopUpWalletOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: wallet, isLoading: isWalletLoading } = useQuery<Wallet>({
    queryKey: ['/api/wallet'],
  });
  
  const { data: paymentMethods, isLoading: isPaymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods'],
  });
  
  const addPaymentMethodForm = useForm<AddPaymentMethodFormValues>({
    resolver: zodResolver(addPaymentMethodSchema),
    defaultValues: {
      type: "card",
      details: {
        cardNumber: "",
        cardHolder: "",
        expiryDate: "",
        cvv: "",
        upiId: "",
      },
      isDefault: false,
    },
  });
  
  const topUpWalletForm = useForm<TopUpWalletFormValues>({
    resolver: zodResolver(topUpWalletSchema),
    defaultValues: {
      amount: "",
      paymentMethodId: "",
    },
  });
  
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (data: AddPaymentMethodFormValues) => {
      const res = await apiRequest("POST", "/api/payment-methods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setIsAddPaymentMethodOpen(false);
      addPaymentMethodForm.reset();
      toast({
        title: "Payment Method Added",
        description: "Your payment method has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add payment method",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const topUpWalletMutation = useMutation({
    mutationFn: async (data: TopUpWalletFormValues) => {
      const res = await apiRequest("POST", "/api/wallet/topup", {
        amount: parseFloat(data.amount),
        paymentMethodId: parseInt(data.paymentMethodId),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setIsTopUpWalletOpen(false);
      topUpWalletForm.reset();
      toast({
        title: "Wallet Topped Up",
        description: "Your wallet has been successfully topped up.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to top up wallet",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onAddPaymentMethodSubmit = (data: AddPaymentMethodFormValues) => {
    // Clean up the data based on the selected type
    const formattedData = {
      ...data,
      details: data.type === "card" 
        ? {
            cardNumber: data.details.cardNumber,
            cardHolder: data.details.cardHolder,
            expiryDate: data.details.expiryDate,
            cvv: data.details.cvv,
          }
        : { upiId: data.details.upiId },
    };
    
    addPaymentMethodMutation.mutate(formattedData);
  };
  
  const onTopUpWalletSubmit = (data: TopUpWalletFormValues) => {
    topUpWalletMutation.mutate(data);
  };
  
  const paymentMethodType = addPaymentMethodForm.watch("type");
  
  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">Payment Methods</h2>
          <Button onClick={() => setIsAddPaymentMethodOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Method
          </Button>
        </div>
        
        {isWalletLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <WalletCard 
            balance={wallet?.balance || 0}
            onTopUp={() => setIsTopUpWalletOpen(true)}
          />
        )}
        
        <h3 className="text-lg font-medium mb-4 mt-8">Saved Payment Methods</h3>
        
        {isPaymentMethodsLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-4 mb-8">
            {paymentMethods.map((method) => (
              <PaymentMethodCard key={method.id} method={method} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <h3 className="text-lg font-medium mb-2">No Payment Methods Added</h3>
            <p className="text-neutral-600 mb-4">Add a payment method to enable wallet top-ups and RFID payments.</p>
            <Button onClick={() => setIsAddPaymentMethodOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </div>
        )}
        
        <AutoReloadSettings wallet={wallet} paymentMethods={paymentMethods || []} />
        
        {/* Add Payment Method Dialog */}
        <Dialog open={isAddPaymentMethodOpen} onOpenChange={setIsAddPaymentMethodOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
            </DialogHeader>
            
            <Form {...addPaymentMethodForm}>
              <form onSubmit={addPaymentMethodForm.handleSubmit(onAddPaymentMethodSubmit)} className="space-y-4">
                <FormField
                  control={addPaymentMethodForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {paymentMethodType === "card" && (
                  <>
                    <FormField
                      control={addPaymentMethodForm.control}
                      name="details.cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addPaymentMethodForm.control}
                      name="details.cardHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Holder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addPaymentMethodForm.control}
                        name="details.expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={addPaymentMethodForm.control}
                        name="details.cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
                
                {paymentMethodType === "upi" && (
                  <FormField
                    control={addPaymentMethodForm.control}
                    name="details.upiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input placeholder="yourname@upi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={addPaymentMethodForm.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default payment method</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPaymentMethodOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addPaymentMethodMutation.isPending}
                  >
                    {addPaymentMethodMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Add Payment Method
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Top Up Wallet Dialog */}
        <Dialog open={isTopUpWalletOpen} onOpenChange={setIsTopUpWalletOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Top Up Wallet</DialogTitle>
            </DialogHeader>
            
            <Form {...topUpWalletForm}>
              <form onSubmit={topUpWalletForm.handleSubmit(onTopUpWalletSubmit)} className="space-y-4">
                <FormField
                  control={topUpWalletForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={topUpWalletForm.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods?.map((method) => (
                            <SelectItem key={method.id} value={method.id.toString()}>
                              {method.type === "card" 
                                ? `Card - ${method.details.cardNumber}` 
                                : `UPI - ${method.details.upiId}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTopUpWalletOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={topUpWalletMutation.isPending}
                  >
                    {topUpWalletMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Top Up
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}
