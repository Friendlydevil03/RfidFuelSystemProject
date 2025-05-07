import { FuelStation } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface StationMapProps {
  stations: FuelStation[];
  isLoading: boolean;
}

export default function StationMap({ stations, isLoading }: StationMapProps) {
  return (
    <div className="w-full h-full relative bg-neutral-200">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        // Since we can't use actual map services here, we'll show a placeholder with markers
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="p-4 text-center">
            {/* Simple map representation */}
            <div className="w-full h-full absolute inset-0 bg-blue-50 overflow-hidden">
              {/* Grid lines for map */}
              <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  Array.from({ length: 10 }).map((_, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="border border-blue-100"
                    ></div>
                  ))
                ))}
              </div>
              
              {/* Roads */}
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-2 bg-gray-300"></div>
              
              {/* Station Markers */}
              {stations.map((station, index) => {
                // Create "random" but consistent positions for demo
                const positionHash = station.id * 17 % 80;
                const left = ((positionHash % 10) * 10) + 5;
                const top = (Math.floor(positionHash / 10) * 10) + 5;
                
                return (
                  <div
                    key={station.id}
                    className={`absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center ${
                      station.hasRfid ? 'text-primary' : 'text-neutral-500'
                    }`}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    <div className="relative group">
                      <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 11h.01"></path>
                          <path d="M18 9.23a2 2 0 0 0-1-1.75l-7-4.2a2 2 0 0 0-2 0l-7 4.2A2 2 0 0 0 0 9.23v5.54a2 2 0 0 0 1 1.75l7 4.2a2 2 0 0 0 2 0l7-4.2a2 2 0 0 0 1-1.75V9.23z"></path>
                          <path d="M13 14.91V11a2 2 0 0 0-2-2H4"></path>
                        </svg>
                      </div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-white p-1 rounded shadow-md text-xs whitespace-nowrap mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                        {station.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
