import { useEffect } from 'react';
import { useWebSocketContext } from '@/contexts/websocket-provider';
import { useToast } from '@/hooks/use-toast';

export function WebSocketNotifications() {
  const { lastMessage } = useWebSocketContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!lastMessage) return;

    // Process different message types
    switch (lastMessage.type) {
      case 'wallet_updated':
        toast({
          title: "Wallet Updated",
          description: lastMessage.payload.message,
          variant: "default",
        });
        break;

      case 'transaction_completed':
        toast({
          title: "Transaction Completed",
          description: lastMessage.payload.message,
          variant: "default",
        });
        break;

      case 'station_status_update':
        toast({
          title: "Station Update",
          description: lastMessage.payload.message,
          variant: "default",
        });
        break;

      case 'notification':
        toast({
          title: lastMessage.payload.title || "Notification",
          description: lastMessage.payload.message,
          variant: "default",
        });
        break;
    }
  }, [lastMessage, toast]);

  return null; // This component doesn't render anything visible
}