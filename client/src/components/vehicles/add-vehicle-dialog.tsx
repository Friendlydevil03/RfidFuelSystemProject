import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, X, Info, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  make: z.string().min(1, "Vehicle make is required"),
  model: z.string().min(1, "Vehicle model is required"),
  registrationNumber: z.string()
    .min(1, "Registration number is required")
    .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/, "Must be in format: MH 01 AB 1234"),
  fuelType: z.string().min(1, "Fuel type is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddVehicleDialog({ open, onOpenChange }: AddVehicleDialogProps) {
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      registrationNumber: "",
      fuelType: "Petrol",
    },
  });
  
  const addVehicleMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/vehicles", data);
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      
      // Reset form and close dialog after delay
      setTimeout(() => {
        form.reset();
        setSuccess(false);
        onOpenChange(false);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add vehicle",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: FormValues) => {
    addVehicleMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Make</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Honda, Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Civic, Corolla" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MH 01 AB 1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-neutral-100 p-4 rounded-lg">
              <div className="flex items-start">
                <Info className="text-primary mr-2 mt-1 h-5 w-5" />
                <p className="text-sm text-neutral-700">
                  Visit any partner fuel station to get your RFID tag installed and activated after adding your vehicle.
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={addVehicleMutation.isPending}
              >
                {addVehicleMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Vehicle
              </Button>
            </div>
          </form>
        </Form>
        
        {/* Success Message */}
        {success && (
          <div className="mt-4 bg-success bg-opacity-10 text-success p-4 rounded-lg flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Vehicle added successfully!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
