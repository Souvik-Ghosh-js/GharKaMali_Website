'use client';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { checkServiceability, getGeofences } from '@/lib/api';
import { useLocation } from '@/store/location';
import MapPicker from './Map';
import { reverseGeocode, searchPlaces, placeDetails } from '@/lib/googleMaps';

type Picked = {
  lat: number;
  lng: number;
  address: string;
  pincode?: string;
  city?: string;
  state?: string;
  zone?: any;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (p: Picked) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  title?: string;
}

const DEFAULT_CENTER: [number, number] = [28.5355, 77.3910]; // Noida fallback

// Parse a geofence polygon ("[[lat,lng],…]" string or array) into points.
function parsePolygon(raw: any): [number, number][] {
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(arr)) {
      return arr
        .map((p: any) => [Number(p[0]), Number(p[1])] as [number, number])
        .filter((p) => !Number.isNaN(p[0]) && !Number.isNaN(p[1]));
    }
  } catch { /* ignore */ }
  return [];
}
function polyCentroid(pts: [number, number][]): [number, number] | null {
  if (!pts.length) return null;
  const sum = pts.reduce((a, p) => [a[0] + p[0], a[1] + p[1]], [0, 0]);
  return [sum[0] / pts.length, sum[1] / pts.length];
}

export default function AddressPicker({ open, onClose, onConfirm, initialLat, initialLng, title = 'Pick your location' }: Props) {
  const { lat: storeLat, lng: storeLng } = useLocation();

  const startLat = initialLat ?? storeLat ?? DEFAULT_CENTER[0];
  const startLng = initialLng ?? storeLng ?? DEFAULT_CENTER[1];

  const [lat, setLat] = useState(startLat);
  const [lng, setLng] = useState(startLng);
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const [searching, setSearching] = useState(false);

  const [serviceableState, setServiceableState] = useState<'unknown' | 'yes' | 'no' | 'checking'>('unknown');
  const [zone, setZone] = useState<any>(null);
  const [loadingAddr, setLoadingAddr] = useState(false);

  const [geofences, setGeofences] = useState<any[]>([]);
  const [selectedGf, setSelectedGf] = useState('');

  const mapRef = useRef<any>(null);

  const updateFromCoords = async (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setLoadingAddr(true);
    const r = await reverseGeocode(newLat, newLng);
    setAddress(r.display);
    setPincode(r.pincode);
    setCity(r.city);
    setState(r.state);
    setLoadingAddr(false);

    setServiceableState('checking');
    try {
      const res: any = await checkServiceability(newLat, newLng);
      if (res?.serviceable) {
        setServiceableState('yes');
        setZone(res.zone || res.zones?.[0]);
      } else {
        setServiceableState('no');
        setZone(null);
      }
    } catch {
      setServiceableState('unknown');
    }
  };

  useEffect(() => {
    if (open) {
      updateFromCoords(startLat, startLng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Load serviceable areas for the dropdown when the picker opens.
  useEffect(() => {
    if (!open) return;
    getGeofences().then((d: any) => setGeofences(Array.isArray(d) ? d : [])).catch(() => {});
  }, [open]);

  // Pick an area from the dropdown → fit the map to that geofence and drop the
  // pin at its centre; the user then fine-tunes within it.
  const pickGeofence = (id: string) => {
    setSelectedGf(id);
    setQuery('');
    setSuggestions([]);
    const g = geofences.find((x) => String(x.id) === String(id));
    if (!g) return;
    const pts = parsePolygon(g.polygon_coords);
    const c = polyCentroid(pts);
    if (!c) return;
    updateFromCoords(c[0], c[1]);
    if (pts.length && mapRef.current?.fitBounds) mapRef.current.fitBounds(pts);
    else if (mapRef.current?.setView) mapRef.current.setView(c, 13);
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await searchPlaces(query);
      setSuggestions(res);
      setSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not available');
      return;
    }
    toast.loading('Getting location…', { id: 'geo' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('geo');
        const { latitude, longitude } = pos.coords;
        updateFromCoords(latitude, longitude);
        if (mapRef.current?.setView) mapRef.current.setView([latitude, longitude], 16);
      },
      () => {
        toast.dismiss('geo');
        toast.error('Location permission denied');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Saved address (already has coords)
  const pickSuggestion = (s: { lat: number; lng: number; display: string }) => {
    setQuery('');
    setSuggestions([]);
    updateFromCoords(s.lat, s.lng);
    if (mapRef.current?.setView) mapRef.current.setView([s.lat, s.lng], 16);
  };

  // Places Autocomplete prediction → resolve placeId to coords, then move the map
  const pickPrediction = async (s: { description: string; placeId: string }) => {
    setQuery('');
    setSuggestions([]);
    const loc = await placeDetails(s.placeId);
    if (loc) {
      updateFromCoords(loc.lat, loc.lng);
      if (mapRef.current?.setView) mapRef.current.setView([loc.lat, loc.lng], 16);
    }
  };

  const handleConfirm = () => {
    if (serviceableState === 'no') {
      toast.error('Sorry, we\'re not serviceable at this pin yet.');
      return;
    }
    if (!address) {
      toast.error('Please pick a location');
      return;
    }
    onConfirm({ lat, lng, address, pincode, city, state, zone });
    onClose();
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 'clamp(0px, 2vw, 24px) clamp(0px, 2vw, 24px) 0 0',
          width: '100%', maxWidth: 720,
          height: '92dvh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 -8px 80px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--forest)' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
        </div>

        {/* Search + Use My Location */}
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          {geofences.length > 0 && (
            <select
              value={selectedGf}
              onChange={(e) => pickGeofence(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', marginBottom: 10, borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--forest)', background: '#fff', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">📍 Choose your area…</option>
              {geofences.map((g) => (
                <option key={g.id} value={g.id}>{g.name}{g.city ? ` — ${g.city}` : ''}</option>
              ))}
            </select>
          )}
          <div className="addr-picker-search-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search address, area, or landmark…"
              style={{ flex: '1 1 180px', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500, outline: 'none', minWidth: 0 }}
            />
            <button
              onClick={useMyLocation}
              style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--forest)', background: '#fff', color: 'var(--forest)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              📍 Use My Location
            </button>
          </div>
          {(suggestions.length > 0 || searching) && (
            <div style={{ position: 'absolute', top: '100%', left: 22, right: 22, background: '#fff', border: '1px solid var(--border)', borderRadius: 12, marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 240, overflowY: 'auto' }}>
              {searching && <div style={{ padding: 12, fontSize: '0.85rem', color: 'var(--sage)' }}>Searching…</div>}
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => pickPrediction(s)}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--forest)', borderBottom: '1px solid var(--border)' }}
                >
                  {s.description}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Saved Addresses Section */}
        <SavedAddressesSection onPick={pickSuggestion} />

        <div className="addr-picker-map" style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', width: '100%' }}>
          <MapPicker
            center={[startLat, startLng]}
            zoom={15}
            markerPosition={[lat, lng]}
            onMarkerDragEnd={(newLat, newLng) => updateFromCoords(newLat, newLng)}
            mapRef={mapRef}
          />
        </div>

        {/* Address preview + confirm */}
        <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.08em' }}>Selected Address</div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.5, marginBottom: 10, minHeight: 40 }}>
            {loadingAddr ? 'Loading address…' : (address || 'Drag the pin to choose a location')}
          </div>

          {/* Serviceability banner */}
          {serviceableState !== 'unknown' && (
            <div style={{
              padding: '8px 12px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, marginBottom: 12,
              background: serviceableState === 'yes' ? 'rgba(22,163,74,0.1)' : serviceableState === 'no' ? 'rgba(220,38,38,0.1)' : 'rgba(3,65,26,0.05)',
              color: serviceableState === 'yes' ? '#16A34A' : serviceableState === 'no' ? '#DC2626' : 'var(--sage)',
            }}>
              {serviceableState === 'checking' && '⏳ Checking serviceability…'}
              {serviceableState === 'yes' && `✓ Serviceable${zone?.name ? ` — ${zone.name}` : ''}`}
              {serviceableState === 'no' && '✗ We\'re not available at this location yet'}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid var(--border)', background: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-2)' }}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={serviceableState === 'no' || !address || loadingAddr}
              style={{
                flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--forest)',
                color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                opacity: (serviceableState === 'no' || !address || loadingAddr) ? 0.5 : 1,
              }}
            >
              Confirm this location
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet CSS (via CDN to avoid bundler config) */}
    </div>
  );
}

function SavedAddressesSection({ onPick }: { onPick: (s: any) => void }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = require('@/lib/api');

  useEffect(() => {
    const t = getToken();
    if (!t) return;
    (async () => {
      setLoading(true);
      try {
        const { getMyAddresses } = require('@/lib/api');
        const res = await getMyAddresses();
        setAddresses(res || []);
      } catch (e) {
        console.error('Failed to fetch addresses', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || addresses.length === 0) return null;

  return (
    <div style={{ padding: '12px 22px', background: '#f9fafb', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0, alignItems: 'center' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sage)', flexShrink: 0 }}>SAVED:</div>
      {addresses.map((a: any) => (
        <button
          key={a.id}
          onClick={() => onPick({
            lat: parseFloat(a.latitude),
            lng: parseFloat(a.longitude),
            display: [a.flat_no, a.building, a.area, a.city].filter(Boolean).join(', ')
          })}
          style={{
            padding: '7px 14px', borderRadius: 20, border: '1px solid var(--border)',
            background: '#fff', fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest)',
            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, lineHeight: 1.2
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--forest)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          📍 {a.label || 'Home'}
        </button>
      ))}
    </div>
  );
}
