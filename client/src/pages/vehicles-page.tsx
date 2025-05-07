import { useState } from "react";
import CustomerLayout from "@/components/layout/customer-layout";
import VehicleCard from "@/components/vehicles/vehicle-card";
import AddVehicleDialog from "@/components/vehicles/add-vehicle-dialog";
import PartnerStations from "@/components/vehicles/partner-stations";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusIcon, Loader2 } from "lucide-react";
import { Vehicle } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function VehiclesPage() {
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });
  
  const { data: stations, isLoading: isStationsLoading } = useQuery({
    queryKey: ['/api/stations'],
  });
  
  const addRfidMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      const res = await apiRequest("POST", `/api/vehicles/${vehicleId}/rfid-tag`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: "RFID Tag Added",
        description: "RFID tag has been successfully paired with your vehicle.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add RFID tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddRfidTag = (vehicleId: number) => {
    addRfidMutation.mutate(vehicleId);
  };
  
  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-medium">My Vehicles</h2>
          <Button onClick={() => setIsAddVehicleOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="space-y-4 mb-8">
            {vehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onAddRfidTag={handleAddRfidTag}
                isAddingRfid={addRfidMutation.isPending} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <h3 className="text-lg font-medium mb-2">No Vehicles Added</h3>
            <p className="text-neutral-600 mb-4">Add your first vehicle to get started with RFID fuel payments.</p>
            <Button onClick={() => setIsAddVehicleOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Button>
          </div>
        )}
        
        <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="text-primary mr-2 h-5 w-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            About RFID Tags
          </h3>
          <p className="text-sm text-neutral-700 mb-4">
            RFID tags enable contactless payments at fuel stations. Visit any partner fuel station to get your vehicle's RFID tag installed and activated.
          </p>
          <Button variant="link" className="text-primary p-0 h-auto">
            Learn More
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Button>
        </div>
        
        <PartnerStations stations={stations || []} isLoading={isStationsLoading} />
        
        <AddVehicleDialog 
          open={isAddVehicleOpen} 
          onOpenChange={setIsAddVehicleOpen} 
        />
      </div>
    </CustomerLayout>
  );
}
