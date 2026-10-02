'use client';
import { RefObject, useEffect, useState } from 'react';

/** True while the element is on screen and the tab is visible. Used to stop
 *  auto-advancing sliders and timers when nobody can see them (CPU / heat). */
export function useInView(ref: RefObject<Element>, rootMargin = '100px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let onScreen = false;
    const sync = () => setInView(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { rootMargin });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, [ref, rootMargin]);
  return inView;
}
