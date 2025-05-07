import { PaymentMethod } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { MoreVertical, CreditCard, Landmark, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface PaymentMethodCardProps {
  method: PaymentMethod;
}

export default function PaymentMethodCard({ method }: PaymentMethodCardProps) {
  const isCard = method.type === "card";
  
  // Get masked card number or UPI ID
  const getDisplayInfo = () => {
    if (isCard) {
      const cardNumber = method.details.cardNumber;
      const last4 = cardNumber.slice(-4);
      const issuer = getCardIssuer(cardNumber);
      return `${issuer} **** ${last4}`;
    } else {
      return method.details.upiId;
    }
  };
  
  // Simple logic to determine card issuer (would be more complex in a real app)
  const getCardIssuer = (cardNumber: string) => {
    const firstDigit = cardNumber.charAt(0);
    if (firstDigit === "4") return "Visa";
    if (firstDigit === "5") return "Mastercard";
    if (firstDigit === "3") return "Amex";
    return "Card";
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-neutral-200 rounded p-2 mr-4">
            {isCard ? (
              <CreditCard className="h-5 w-5" />
            ) : (
              <Landmark className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="font-medium">
              {isCard ? getCardIssuer(method.details.cardNumber) : "UPI"}
            </h4>
            <p className="text-sm text-neutral-500">{getDisplayInfo()}</p>
          </div>
        </div>
        <div className="flex items-center">
          {method.isDefault && (
            <span className="bg-success text-white text-xs px-2 py-0.5 rounded-full mr-3 flex items-center">
              <Check className="h-3 w-3 mr-1" />
              Default
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-700">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!method.isDefault && (
                <DropdownMenuItem>Set as Default</DropdownMenuItem>
              )}
              <DropdownMenuItem>Edit Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
