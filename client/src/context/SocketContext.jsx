import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Synthesize industrial safety alert sound via Web Audio API
  const playSafetyAlertBeep = () => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio playback prevented or unsupported:', e);
    }
  };

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const s = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500
    });

    s.on('connect', () => {
      console.log('⚡ Connected to VisionOps WebSocket Gateway');
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      console.log('⚠️ Disconnected from VisionOps WebSocket');
      setIsConnected(false);
    });

    s.on('new_violation', (violation) => {
      console.log('🚨 Incoming Real-Time Violation Alert:', violation);
      setLatestAlert(violation);
      setToastAlert(violation);
      playSafetyAlertBeep();

      // Auto dismiss toast after 6s
      setTimeout(() => {
        setToastAlert((curr) => (curr && curr._id === violation._id ? null : curr));
      }, 6000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [audioEnabled]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      latestAlert,
      toastAlert,
      dismissToast: () => setToastAlert(null),
      audioEnabled,
      setAudioEnabled
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
