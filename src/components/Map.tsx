'use client';
import { useEffect, useRef } from 'react';

interface MapProps {
  readonly center: [number, number];
  readonly zoom: number;
  readonly markerPosition: [number, number];
  readonly onMarkerDragEnd: (lat: number, lng: number) => void;
  readonly mapRef?: any;
}

export default function LeafletMap({ center, zoom, markerPosition, onMarkerDragEnd, mapRef }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initedRef = useRef(false);

  useEffect(() => {
    // Initialize map once
    if (initedRef.current || !containerRef.current) return;
    
    let mounted = true;

    const initMap = async () => {
      try {
        const leaflet = await import('leaflet');
        const L = leaflet.default || leaflet;

        if (!mounted || !containerRef.current) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const map = L.map(containerRef.current, {
          center,
          zoom,
          scrollWheelZoom: false,
          dragging: true,
          tap: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker(markerPosition, { draggable: true }).addTo(map);
        marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          onMarkerDragEnd(position.lat, position.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        if (mapRef) mapRef.current = map;
        
        // Trigger a resize to ensure the map renders properly
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      } catch (err) {
        console.error('Failed to initialize Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      mounted = false;
    };
  }, []);

  // Mark as initialized after component mounts
  useEffect(() => {
    initedRef.current = true;
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(markerPosition);
    }
  }, [markerPosition]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%', flex: 1 }} />;
}
