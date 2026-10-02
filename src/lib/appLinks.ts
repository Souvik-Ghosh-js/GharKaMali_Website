export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=in.gobt.gharkamali';
export const APP_STORE_URL = 'https://apps.apple.com/in/app/gharkamali/id6809860716';

/** The store that matches the visitor's device (App Store on iOS, Play Store otherwise). */
export function storeUrlForDevice(): string {
  if (typeof navigator === 'undefined') return PLAY_STORE_URL;
  const ua = navigator.userAgent || '';
  const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return iOS ? APP_STORE_URL : PLAY_STORE_URL;
}
