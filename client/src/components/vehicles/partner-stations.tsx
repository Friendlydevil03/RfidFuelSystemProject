import { FuelStation } from "@shared/schema";
import { Navigation, Star } from "lucide-react";
import { Loader2 } from "lucide-react";

interface PartnerStationsProps {
  stations: FuelStation[];
  isLoading: boolean;
}

export default function PartnerStations({ stations, isLoading }: PartnerStationsProps) {
  // Filter stations to show only those with RFID support
  const rfidEnabledStations = stations.filter(station => station.hasRfid);
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Partner Stations for RFID Installation</h3>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : rfidEnabledStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfidEnabledStations.slice(0, 4).map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-neutral-600">No partner stations found in your area.</p>
        </div>
      )}
    </div>
  );
}

function StationCard({ station }: { station: FuelStation }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between">
        <div>
          <h4 className="font-medium">{station.name}</h4>
          <p className="text-sm text-neutral-500">{station.address}, {station.city}</p>
          <div className="flex items-center mt-2">
            <Star className="h-4 w-4 text-warning fill-current" />
            <span className="text-sm ml-1">{station.rating}</span>
            <span className="mx-2 text-neutral-300">|</span>
            <span className="text-sm text-neutral-500">3.2 km away</span>
          </div>
        </div>
        <button className="text-primary hover:text-primary-dark self-start">
          <Navigation className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
