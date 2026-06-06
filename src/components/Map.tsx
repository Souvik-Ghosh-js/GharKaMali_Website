'use client';
import { useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/googleMaps';

interface MapProps {
  readonly center: [number, number];
  readonly zoom: number;
  readonly markerPosition: [number, number];
  readonly onMarkerDragEnd: (lat: number, lng: number) => void;
  readonly mapRef?: any;
}

// Google Maps location picker — draggable marker + tap-to-move.
// Keeps the same props as the old Leaflet component so callers don't change.
export default function GoogleMapPicker({ center, zoom, markerPosition, onMarkerDragEnd, mapRef }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapObjRef = useRef<any>(null);
  const markerObjRef = useRef<any>(null);

  // Initialise once.
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps()
      .then((maps) => {
        if (!mounted || !containerRef.current || mapObjRef.current) return;
        const map = new maps.Map(containerRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });
        const marker = new maps.Marker({
          position: { lat: markerPosition[0], lng: markerPosition[1] },
          map, draggable: true, animation: maps.Animation?.DROP,
        });
        marker.addListener('dragend', (e: any) => onMarkerDragEnd(e.latLng.lat(), e.latLng.lng()));
        map.addListener('click', (e: any) => {
          marker.setPosition(e.latLng);
          onMarkerDragEnd(e.latLng.lat(), e.latLng.lng());
        });

        mapObjRef.current = map;
        markerObjRef.current = marker;
        // Expose a Leaflet-compatible setView so existing callers keep working.
        if (mapRef) mapRef.current = {
          setView: ([la, ln]: [number, number], z?: number) => { map.setCenter({ lat: la, lng: ln }); if (z) map.setZoom(z); },
          // Fit the viewport to a polygon's points (used by the area dropdown).
          fitBounds: (pts: [number, number][]) => {
            if (!pts || pts.length === 0) return;
            const b = new maps.LatLngBounds();
            pts.forEach(([la, ln]) => b.extend({ lat: la, lng: ln }));
            map.fitBounds(b, 28);
          },
          map,
        };
      })
      .catch((err) => console.error('Google Maps failed to load:', err));
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the marker in sync when the position prop changes.
  useEffect(() => {
    if (markerObjRef.current) markerObjRef.current.setPosition({ lat: markerPosition[0], lng: markerPosition[1] });
    if (mapObjRef.current) mapObjRef.current.panTo({ lat: markerPosition[0], lng: markerPosition[1] });
  }, [markerPosition]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%', flex: 1 }} />;
}
