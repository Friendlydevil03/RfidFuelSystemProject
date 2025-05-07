import { Vehicle, RfidTag } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MoreVertical, Nfc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface VehicleCardProps {
  vehicle: Vehicle & { rfidTag?: RfidTag | null };
  onAddRfidTag: (vehicleId: number) => void;
  isAddingRfid: boolean;
}

export default function VehicleCard({ vehicle, onAddRfidTag, isAddingRfid }: VehicleCardProps) {
  const hasRfidTag = vehicle.rfidTag && vehicle.rfidTag.status === "active";
  
  const getVehicleImageUrl = (make: string, model: string) => {
    // Create a vehicle image URL based on make and model
    // In a real app, we would use actual vehicle images, but here we'll use a placeholder
    return `https://via.placeholder.com/120x80?text=${make}+${model}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between">
        <div className="flex">
          <div className="w-20 h-16 bg-neutral-200 rounded-lg mr-4 overflow-hidden">
            <img 
              src={getVehicleImageUrl(vehicle.make, vehicle.model)}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h3 className="font-medium">{vehicle.make} {vehicle.model}</h3>
              <span className={`ml-2 ${hasRfidTag ? "bg-success text-white" : "bg-neutral-300 text-neutral-700"} text-xs px-2 py-0.5 rounded-full`}>
                {hasRfidTag ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{vehicle.registrationNumber}</p>
            <div className="flex items-center mt-1">
              <Nfc className={`h-4 w-4 ${hasRfidTag ? "text-primary" : "text-neutral-400"} mr-1`} />
              {hasRfidTag ? (
                <p className="text-xs text-neutral-600">RFID Tag: {vehicle.rfidTag?.tagNumber}</p>
              ) : (
                <p className="text-xs text-neutral-600">No RFID Tag</p>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-700">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!hasRfidTag && (
              <DropdownMenuItem 
                onClick={() => onAddRfidTag(vehicle.id)} 
                disabled={isAddingRfid}
              >
                Add RFID Tag
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Remove Vehicle</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
