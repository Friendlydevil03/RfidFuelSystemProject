import { useState } from "react";
import CustomerLayout from "@/components/layout/customer-layout";
import StationMap from "@/components/stations/station-map";
import StationList from "@/components/stations/station-list";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, MapPinIcon, ZoomInIcon, ZoomOutIcon, FilterIcon, X } from "lucide-react";
import { FuelStation } from "@shared/schema";

export default function StationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rfidEnabled: true,
    petrol: false,
    diesel: false,
    cng: false,
    openNow: false,
  });
  
  const { data: stations, isLoading } = useQuery<FuelStation[]>({
    queryKey: ['/api/stations'],
  });
  
  // Apply filters
  const filteredStations = stations
    ? stations.filter(station => {
        // Check RFID filter
        if (filters.rfidEnabled && !station.hasRfid) {
          return false;
        }
        
        // Apply search term
        if (searchTerm && !station.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !station.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !station.city.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // In a real app, would also check fuel types and open now status
        return true;
      })
    : [];
  
  const toggleFilter = (filter: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };
  
  const resetFilters = () => {
    setFilters({
      rfidEnabled: false,
      petrol: false,
      diesel: false,
      cng: false,
      openNow: false,
    });
    setSearchTerm("");
  };
  
  return (
    <CustomerLayout>
      <div className="h-full flex flex-col">
        {/* Map Container */}
        <div className="h-2/3 relative">
          <StationMap stations={filteredStations} isLoading={isLoading} />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow p-2 flex">
            <Button variant="ghost" size="sm" className="p-2 hover:bg-neutral-100 rounded">
              <MapPinIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-neutral-100 rounded">
              <ZoomInIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 hover:bg-neutral-100 rounded">
              <ZoomOutIcon className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="absolute top-4 left-4 right-16 bg-white rounded-lg shadow">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for fuel stations"
                className="w-full pl-10 pr-4 py-3 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
            </div>
          </div>
          
          {/* Filters */}
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-3">
              <h3 className="font-medium">Filters</h3>
              <Button 
                variant="link" 
                className="ml-auto text-primary text-sm p-0 h-auto"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={filters.rfidEnabled ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter("rfidEnabled")}
              >
                RFID Enabled
                {filters.rfidEnabled && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("rfidEnabled");
                  }} />
                )}
              </Badge>
              <Badge 
                variant={filters.petrol ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter("petrol")}
              >
                Petrol
                {filters.petrol && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("petrol");
                  }} />
                )}
              </Badge>
              <Badge 
                variant={filters.diesel ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter("diesel")}
              >
                Diesel
                {filters.diesel && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("diesel");
                  }} />
                )}
              </Badge>
              <Badge 
                variant={filters.cng ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter("cng")}
              >
                CNG
                {filters.cng && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("cng");
                  }} />
                )}
              </Badge>
              <Badge 
                variant={filters.openNow ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter("openNow")}
              >
                Open Now
                {filters.openNow && (
                  <X className="ml-1 h-3 w-3" onClick={(e) => {
                    e.stopPropagation();
                    toggleFilter("openNow");
                  }} />
                )}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Station List */}
        <div className="h-1/3 bg-white overflow-auto">
          <StationList stations={filteredStations} isLoading={isLoading} />
        </div>
      </div>
    </CustomerLayout>
  );
}
