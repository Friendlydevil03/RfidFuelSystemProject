import { ArrowDown, ArrowUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  percentChange: number;
  icon: string;
  iconColor?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  percentChange, 
  icon,
  iconColor = "primary" 
}: StatsCardProps) {
  const isPositive = percentChange >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`text-${iconColor}`}>
          <StatsIcon icon={icon} />
        </div>
      </div>
      <p className="text-3xl font-medium">{value}</p>
      <div className="flex items-center mt-2 text-sm">
        <span className={`flex items-center mr-2 ${isPositive ? 'text-success' : 'text-destructive'}`}>
          {isPositive ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
          {Math.abs(percentChange)}%
        </span>
        <span className="text-neutral-500">vs. yesterday</span>
      </div>
    </div>
  );
}

function StatsIcon({ icon }: { icon: string }) {
  // Based on the icon string, render the appropriate icon
  switch (icon) {
    case 'receipt':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path>
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
          <path d="M12 17.5v-11"></path>
        </svg>
      );
    case 'payments':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      );
    case 'nfc':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"></path>
          <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"></path>
          <path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"></path>
          <path d="M16.37 2a20.16 20.16 0 0 1 0 20"></path>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 6h.01"></path>
          <path d="M8 6h.01"></path>
          <path d="M12 2v1"></path>
          <path d="M12 21v-1"></path>
          <path d="M16 16h.01"></path>
          <path d="M8 16h.01"></path>
          <path d="m3 9 1 1"></path>
          <path d="m20 9-1 1"></path>
          <path d="m3 14 1-1"></path>
          <path d="m20 14-1-1"></path>
          <rect width="20" height="14" x="2" y="5" rx="7"></rect>
        </svg>
      );
  }
}
