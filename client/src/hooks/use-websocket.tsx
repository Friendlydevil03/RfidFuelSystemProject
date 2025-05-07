import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

export type WebSocketMessage = {
  type: string;
  payload: any;
};

export function useWebSocket(clientType: 'user' | 'station', clientId?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use the user ID as client ID if none is provided
  const actualClientId = clientId || user?.id;

  const connect = useCallback(() => {
    if (!actualClientId) return;
    
    // Close any existing connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    setStatus('connecting');
    
    // Create a new WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?clientType=${clientType}&clientId=${actualClientId}`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setStatus('connected');
      
      // Clear any reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        setLastMessage(data);
        
        // Handle connection established message
        if (data.type === 'connection_established') {
          console.log('WebSocket connection confirmed:', data.payload);
        }
        
        // Handle wallet updates
        if (data.type === 'wallet_updated') {
          toast({
            title: 'Wallet Updated',
            description: data.payload.message,
            variant: 'default',
          });
        }
        
        // Handle transaction notifications
        if (data.type === 'transaction_completed') {
          toast({
            title: 'Transaction Completed',
            description: data.payload.message,
            variant: 'default',
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setStatus('disconnected');
      
      // Set up reconnection
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('disconnected');
    };
    
    // Return cleanup function
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [clientType, actualClientId, toast]);

  // Connect to the WebSocket server when the component mounts
  useEffect(() => {
    if (actualClientId) {
      const cleanup = connect();
      return cleanup;
    }
  }, [connect, actualClientId]);

  // Function to send messages to the WebSocket server
  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    }
    return false;
  }, []);

  return {
    status,
    lastMessage,
    sendMessage,
    connect,
  };
}