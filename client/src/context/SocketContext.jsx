import React, { createContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    let newSocket;

    if (token && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
      newSocket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        // Socket successfully connected
      });

      newSocket.on('connect_error', () => {
        // Fallback gracefully without breaking UI
      });

      setSocket(newSocket);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token, user?.id]);

  const joinComplaint = (complaintId) => {
    if (socket && complaintId) {
      socket.emit('join:complaint', complaintId);
    }
  };

  const leaveComplaint = (complaintId) => {
    if (socket && complaintId) {
      socket.emit('leave:complaint', complaintId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinComplaint, leaveComplaint }}>
      {children}
    </SocketContext.Provider>
  );
};
