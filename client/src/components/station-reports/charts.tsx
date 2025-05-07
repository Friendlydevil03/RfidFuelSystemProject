import { useState } from "react";
import { Transaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface ChartsProps {
  transactions: Transaction[];
  monthName: string;
  year: number;
}

export default function Charts({ transactions, monthName, year }: ChartsProps) {
  // Prepare data for daily revenue chart
  const dailyRevenue = getDailyRevenue(transactions);
  
  // Calculate payment method distribution
  const paymentDistribution = getPaymentDistribution(transactions);
  
  // Create fuel type distribution
  const fuelDistribution = getFuelDistribution(transactions);
  
  // Peak hours data (simplified for visualization)
  const peakHours = [
    { hour: "6 AM", traffic: 10 },
    { hour: "9 AM", traffic: 30 },
    { hour: "12 PM", traffic: 60 },
    { hour: "3 PM", traffic: 80 },
    { hour: "6 PM", traffic: 100 },
    { hour: "9 PM", traffic: 40 }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Daily Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Daily Revenue</h3>
          <div className="flex items-center">
            <Button variant="link" size="sm" className="text-primary mr-4">View Details</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Download CSV</DropdownMenuItem>
                <DropdownMenuItem>Print Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="h-64 flex items-end space-x-2">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-primary bg-opacity-80 rounded-t-sm"
                style={{ height: `${(day.amount / 10000) * 100}%` }}
              ></div>
              <span className="text-xs mt-2 text-neutral-500">{day.day}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment Methods Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <div className="flex items-center">
            <Button variant="link" size="sm" className="text-primary mr-4">View Details</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Download CSV</DropdownMenuItem>
                <DropdownMenuItem>Print Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Donut Chart Representation */}
        <div className="flex items-center">
          <div className="relative w-48 h-48">
            <DonutChart segments={paymentDistribution} />
          </div>
          
          <div className="ml-8">
            {paymentDistribution.map((segment, index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center mb-1">
                  <div 
                    className={`w-3 h-3 rounded-full mr-2 bg-${segment.color}`}
                    style={{ backgroundColor: getColorForIndex(index) }}
                  ></div>
                  <span className="font-medium">{segment.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">₹{formatCurrency(segment.value)}</span>
                  <span>{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fuel Types & Usage */}
      <div className="bg-white rounded-lg shadow p-6 col-span-1">
        <h3 className="text-lg font-medium mb-6">Fuel Distribution</h3>
        
        <div className="space-y-4">
          {fuelDistribution.map((fuel, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1 text-sm">
                <span>{fuel.type}</span>
                <span>{fuel.percentage}%</span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${fuel.percentage}%`,
                    backgroundColor: getColorForIndex(index)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Peak Hours */}
      <div className="bg-white rounded-lg shadow p-6 col-span-1">
        <h3 className="text-lg font-medium mb-6">Peak Hours</h3>
        
        {/* Simplified Heatmap */}
        <div className="grid grid-cols-12 gap-1">
          {/* Time Labels and heat cells */}
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <>
              <div className="text-right pr-2 text-xs text-neutral-500">
                {rowIndex === 0 ? "6 AM" : rowIndex === 1 ? "12 PM" : "6 PM"}
              </div>
              {Array.from({ length: 11 }).map((_, colIndex) => {
                // Calculate intensity based on time of day
                const hourIndex = rowIndex * 12 + colIndex;
                const intensity = getHourIntensity(hourIndex);
                
                return (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className="h-8 rounded"
                    style={{ 
                      backgroundColor: `rgba(14, 165, 233, ${intensity / 100})`
                    }}
                  ></div>
                );
              })}
            </>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>Low Traffic</span>
          <span>High Traffic</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to get a color for chart segments
function getColorForIndex(index: number): string {
  const colors = ["#0284c7", "#f59e0b", "#10b981", "#6366f1", "#ec4899"];
  return colors[index % colors.length];
}

// Helper function to format currency
function formatCurrency(value: number): string {
  if (value >= 100000) {
    return (value / 100000).toFixed(2) + " Lakh";
  } else {
    return value.toLocaleString('en-IN');
  }
}

// Generate mock daily revenue data
function getDailyRevenue(transactions: Transaction[]) {
  // For a simple demonstration, we'll create some sample data
  return [
    { day: "1", amount: 3500 },
    { day: "2", amount: 5200 },
    { day: "3", amount: 7800 },
    { day: "4", amount: 4900 },
    { day: "5", amount: 8400 },
    { day: "6", amount: 9500 },
    { day: "7", amount: 8100 },
    { day: "8", amount: 6200 },
    { day: "9", amount: 7100 },
    { day: "10", amount: 8500 },
  ];
}

// Generate payment method distribution
function getPaymentDistribution(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return [
      { name: "RFID Wallet", value: 525000, percentage: 55, color: "primary" },
      { name: "Credit/Debit Cards", value: 285000, percentage: 30, color: "secondary" },
      { name: "UPI/Cash", value: 145000, percentage: 15, color: "success" }
    ];
  }
  
  // Group by payment type and calculate totals
  const paymentGroups = transactions.reduce((acc, transaction) => {
    const type = transaction.paymentType;
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0 };
    }
    acc[type].total += Number(transaction.totalAmount);
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { total: number, count: number }>);
  
  // Calculate totals and percentages
  const total = Object.values(paymentGroups).reduce((sum, group) => sum + group.total, 0);
  
  const result = [
    {
      name: "RFID Wallet",
      value: paymentGroups.rfid?.total || 0,
      percentage: Math.round((paymentGroups.rfid?.total || 0) / (total || 1) * 100),
      color: "primary"
    },
    {
      name: "Credit/Debit Cards",
      value: paymentGroups.card?.total || 0,
      percentage: Math.round((paymentGroups.card?.total || 0) / (total || 1) * 100),
      color: "secondary"
    },
    {
      name: "UPI/Cash",
      value: (paymentGroups.upi?.total || 0) + (paymentGroups.cash?.total || 0),
      percentage: Math.round(((paymentGroups.upi?.total || 0) + (paymentGroups.cash?.total || 0)) / (total || 1) * 100),
      color: "success"
    }
  ];
  
  // Ensure percentages add up to 100%
  const sum = result.reduce((acc, item) => acc + item.percentage, 0);
  if (sum < 100 && sum > 0) {
    result[0].percentage += (100 - sum);
  }
  
  return result;
}

// Generate fuel type distribution
function getFuelDistribution(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return [
      { type: "Petrol", percentage: 65 },
      { type: "Diesel", percentage: 30 },
      { type: "CNG", percentage: 5 }
    ];
  }
  
  // Group by fuel type
  const fuelGroups = transactions.reduce((acc, transaction) => {
    if (transaction.fuelType === 'N/A') return acc;
    
    const type = transaction.fuelType;
    if (!acc[type]) {
      acc[type] = { quantity: 0 };
    }
    acc[type].quantity += Number(transaction.quantity);
    return acc;
  }, {} as Record<string, { quantity: number }>);
  
  // Calculate totals and percentages
  const total = Object.values(fuelGroups).reduce((sum, group) => sum + group.quantity, 0);
  
  const result = Object.entries(fuelGroups).map(([type, data]) => ({
    type,
    percentage: Math.round((data.quantity / (total || 1)) * 100)
  }));
  
  // Ensure we always have something to show
  if (result.length === 0) {
    return [
      { type: "Petrol", percentage: 65 },
      { type: "Diesel", percentage: 30 },
      { type: "CNG", percentage: 5 }
    ];
  }
  
  // Ensure percentages add up to 100%
  const sum = result.reduce((acc, item) => acc + item.percentage, 0);
  if (sum < 100 && result.length > 0) {
    result[0].percentage += (100 - sum);
  }
  
  return result;
}

// Get traffic intensity for a given hour (0-35)
function getHourIntensity(hourIndex: number): number {
  // Early morning (0-8)
  if (hourIndex < 8) {
    return 10 + (hourIndex * 5);
  }
  // Morning rush (8-12)
  else if (hourIndex < 12) {
    return 40 + ((hourIndex - 8) * 15);
  }
  // Afternoon (12-16)
  else if (hourIndex < 16) {
    return 70 + ((hourIndex - 12) * 5);
  }
  // Evening rush (16-20)
  else if (hourIndex < 20) {
    return 80 + ((hourIndex - 16) * 5);
  }
  // Night (20-33)
  else if (hourIndex < 24) {
    return 100 - ((hourIndex - 20) * 15);
  }
  // Late night
  else {
    return 10 + (Math.abs(33 - hourIndex) * 5);
  }
}

// Donut chart component for payment methods
function DonutChart({ segments }: { segments: Array<{ name: string; percentage: number }> }) {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  
  // Calculate segment angles and positions
  let startAngle = 0;
  
  const segmentPaths = segments.map((segment, index) => {
    const angle = (segment.percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    // Convert to radians for calculation
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate SVG arc path
    const x1 = 24 + 20 * Math.sin(startRad);
    const y1 = 24 - 20 * Math.cos(startRad);
    const x2 = 24 + 20 * Math.sin(endRad);
    const y2 = 24 - 20 * Math.cos(endRad);
    
    // Determine if the arc is greater than 180 degrees
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Generate path
    const pathData = `M 24 24 L ${x1} ${y1} A 20 20 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    
    // Store the end angle as the start angle for the next segment
    startAngle = endAngle;
    
    return (
      <path
        key={index}
        d={pathData}
        fill={getColorForIndex(index)}
        stroke="#fff"
        strokeWidth="1"
        onMouseOver={() => setSelectedSegment(index)}
        onMouseOut={() => setSelectedSegment(null)}
        className="cursor-pointer transition-opacity duration-200"
        style={{ 
          opacity: selectedSegment === null || selectedSegment === index ? 1 : 0.6 
        }}
      />
    );
  });
  
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full">
      {segmentPaths}
      <circle cx="24" cy="24" r="12" fill="white" />
    </svg>
  );
}
