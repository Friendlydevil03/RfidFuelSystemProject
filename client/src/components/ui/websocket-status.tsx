import { useWebSocketContext } from "@/contexts/websocket-provider";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { status } = useWebSocketContext();

  return (
    <div className="inline-flex items-center">
      {status === 'connected' ? (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
          <Wifi className="h-3 w-3" />
          <span className="text-xs">Live</span>
        </Badge>
      ) : status === 'connecting' ? (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 gap-1">
          <Wifi className="h-3 w-3 animate-pulse" />
          <span className="text-xs">Connecting</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
          <WifiOff className="h-3 w-3" />
          <span className="text-xs">Offline</span>
        </Badge>
      )}
    </div>
  );
}