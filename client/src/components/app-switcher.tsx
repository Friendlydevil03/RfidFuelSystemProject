import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SquareSplitHorizontal } from "lucide-react";

interface AppSwitcherProps {
  appType: "customer" | "station";
}

export default function AppSwitcher({ appType }: AppSwitcherProps) {
  const targetPath = appType === "customer" ? "/station" : "/";
  const targetLabel = appType === "customer" ? "Switch to Station Terminal" : "Switch to Customer App";
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        asChild
        className="bg-secondary hover:bg-secondary-dark text-white font-medium px-4 py-2 rounded-full shadow-lg flex items-center"
      >
        <Link href={targetPath}>
          <span>{targetLabel}</span>
          <SquareSplitHorizontal className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
}
