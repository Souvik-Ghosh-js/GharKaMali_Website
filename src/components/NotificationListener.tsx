'use client';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from '@/store/auth';
import { useLocation } from '@/store/location';
import { API_BASE } from '@/lib/api';

let socket: Socket | null = null;

export default function NotificationListener() {
  const { user, isAuthenticated } = useAuth();
  const { zone } = useLocation();

  useEffect(() => {
    // Determine socket URL from API_BASE
    const socketUrl = API_BASE.replace('/api', '');
    
    if (!socket) {
      socket = io(socketUrl, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Connected to notification server');
      });

      socket.on('notification', (notif: any) => {
        // Show as a beautiful toast
        toast.custom((t) => (
          <div className={`notification-toast ${t.visible ? 'animate-enter' : 'animate-leave'} ${notif.type || 'info'}`}>
            <div className="notif-icon">
              {notif.type === 'success' ? '✅' : notif.type === 'error' ? '❌' : notif.type === 'warning' ? '⚠️' : '🔔'}
            </div>
            <div className="notif-content">
              <div className="notif-title">{notif.title}</div>
              <div className="notif-body">{notif.body}</div>
            </div>
            <button className="notif-close" onClick={() => toast.dismiss(t.id)}>×</button>
          </div>
        ), { duration: 6000 });
      });
    }

    // Join Auth Room
    if (isAuthenticated && user?.id) {
      socket.emit('join', { userId: user.id });
    }

    // Join Geofence Room
    if (zone?.id) {
      socket.emit('join-geofence', { geofenceId: zone.id });
    }

    return () => {
      // We don't necessarily want to disconnect on unmount if it's a layout component,
      // but we should leave rooms if the user/zone changes.
      // For simplicity in this layout-persistent component, we keep it connected.
    };
  }, [user?.id, isAuthenticated, zone?.id]);

  return null; // This component doesn't render anything itself
}
