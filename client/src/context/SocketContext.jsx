import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const socketInstance = io('/', {
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
      
      // Join Private Rooms
      if (user?._id) {
        socketInstance.emit('join:user', user._id);
        console.log(`👤 Joining: user:${user._id}`);
      }
      
      if (user?.role) {
        socketInstance.emit('join:role', user.role);
        console.log(`🛠️ Joining: role:${user.role}`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    // Handle incoming notifications (universal handler)
    socketInstance.on('notification:user', (data) => {
      showNotification({
        type: 'status_change',
        message: data.message,
        shipmentId: data.shipmentId,
        trackingId: data.trackingId
      });
    });

    socketInstance.on('notification:operator', (data) => {
      showNotification({
        type: 'new_order',
        message: data.message,
        shipmentId: data.shipmentId,
        trackingId: data.trackingId
      });
    });

    socketInstance.on('shipment:updated', (shipment) => {
      // General broadast update for local state refreshes (if any)
      console.log('📦 Shipment updated:', shipment.trackingId);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('notification:user');
      socketInstance.off('notification:operator');
      socketInstance.off('shipment:updated');
      socketInstance.disconnect();
    };
  }, [showNotification, user?._id, user?.role]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
