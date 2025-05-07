import { FuelStation, FuelPrice } from "@shared/schema";
import { Loader2, Star, Navigation } from "lucide-react";

interface StationListProps {
  stations: FuelStation[];
  isLoading: boolean;
}

export default function StationList({ stations, isLoading }: StationListProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Nearby Stations</h3>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stations.length > 0 ? (
        <div className="space-y-4">
          {stations.map((station) => (
            <StationListItem key={station.id} station={station} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-neutral-600">No stations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

interface StationListItemProps {
  station: FuelStation;
}

function StationListItem({ station }: StationListItemProps) {
  // Get fuel prices if available
  const fuelPrices = station.fuelPrices || [];
  
  // Get petrol and diesel prices
  const getPetrolPrice = () => {
    const petrol = fuelPrices.find(p => p.fuelType.toLowerCase() === 'petrol');
    return petrol ? `₹${petrol.price}/L` : 'N/A';
  };
  
  const getDieselPrice = () => {
    const diesel = fuelPrices.find(p => p.fuelType.toLowerCase() === 'diesel');
    return diesel ? `₹${diesel.price}/L` : 'N/A';
  };
  
  return (
    <div className="flex justify-between p-3 border-b border-neutral-200">
      <div>
        <div className="flex items-center">
          <h4 className="font-medium">{station.name}</h4>
          {station.hasRfid && (
            <span className="ml-2 bg-success text-white text-xs px-2 py-0.5 rounded-full">RFID Enabled</span>
          )}
        </div>
        <p className="text-sm text-neutral-500">{station.address}, {station.city}</p>
        <div className="flex items-center mt-1">
          <Star className="h-4 w-4 text-warning fill-current" />
          <span className="text-sm ml-1">{station.rating}</span>
          <span className="mx-2 text-neutral-300">|</span>
          <span className="text-sm text-neutral-500">3.2 km away</span>
        </div>
        <div className="flex items-center mt-1 text-sm">
          <span className="mr-3">Petrol: {getPetrolPrice()}</span>
          <span>Diesel: {getDieselPrice()}</span>
        </div>
      </div>
      <div className="flex flex-col justify-between">
        <span className="text-sm text-success">Open</span>
        <button className="text-primary hover:text-primary-dark">
          <Navigation className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
