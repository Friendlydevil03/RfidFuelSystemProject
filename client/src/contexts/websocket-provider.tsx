import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useWebSocket, WebSocketMessage } from '@/hooks/use-websocket';
import { useAuth } from '@/hooks/use-auth';

// Define WebSocketContextProps type
interface WebSocketContextProps {
  status: 'connecting' | 'connected' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  sendMessage: (type: string, payload: any) => boolean;
  notifications: WebSocketMessage[];
  clearNotifications: () => void;
}

// Create WebSocketContext with default values
const WebSocketContext = createContext<WebSocketContextProps>({
  status: 'disconnected',
  lastMessage: null,
  sendMessage: () => false,
  notifications: [],
  clearNotifications: () => {},
});

// WebSocketProvider component with user authentication integration
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const { status, lastMessage, sendMessage } = useWebSocket('user');

  // Store messages that should be displayed as notifications
  useEffect(() => {
    if (lastMessage && ['wallet_updated', 'transaction_completed', 'station_status_update'].includes(lastMessage.type)) {
      setNotifications(prev => [...prev, lastMessage]);
    }
  }, [lastMessage]);

  // Function to clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Create the context value
  const contextValue: WebSocketContextProps = {
    status,
    lastMessage,
    sendMessage,
    notifications,
    clearNotifications,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Custom hook to use WebSocket context
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}