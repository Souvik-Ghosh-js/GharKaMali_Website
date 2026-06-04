'use client';
// Lightweight Google Maps JS API loader + geocoding helpers (no extra npm dep).
// Reads the key from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.

let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google Maps unavailable on server'));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (loadPromise) return loadPromise;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error('Google Maps API key missing (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)'));

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('gmaps-sdk') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).google.maps));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps')));
      return;
    }
    const s = document.createElement('script');
    s.id = 'gmaps-sdk';
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve((window as any).google.maps);
    s.onerror = () => { loadPromise = null; reject(new Error('Failed to load Google Maps')); };
    document.head.appendChild(s);
  });
  return loadPromise;
}

export type GeoResult = { display: string; pincode?: string; city?: string; state?: string };

function parse(result: any): GeoResult {
  const comps = result?.address_components || [];
  const get = (type: string) => comps.find((c: any) => c.types?.includes(type))?.long_name;
  return {
    display: result?.formatted_address || '',
    pincode: get('postal_code'),
    city: get('locality') || get('administrative_area_level_2') || get('sublocality') || get('administrative_area_level_3'),
    state: get('administrative_area_level_1'),
  };
}

// Reverse-geocode a coordinate to a readable address.
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    const { results } = await geocoder.geocode({ location: { lat, lng } });
    if (results && results[0]) return parse(results[0]);
    return { display: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
  } catch {
    return { display: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
  }
}

// Search an address/area/landmark → coordinate suggestions (India-restricted).
export async function searchGeocode(query: string): Promise<{ lat: number; lng: number; display: string }[]> {
  try {
    const maps = await loadGoogleMaps();
    const geocoder = new maps.Geocoder();
    const { results } = await geocoder.geocode({ address: query, componentRestrictions: { country: 'in' } });
    return (results || []).slice(0, 6).map((r: any) => ({
      lat: r.geometry.location.lat(),
      lng: r.geometry.location.lng(),
      display: r.formatted_address,
    }));
  } catch {
    return [];
  }
}
