'use client';
import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const init = async () => {
      const gsap = (await import('gsap')).default;
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // Reveal all elements with data-reveal attribute
      gsap.utils.toArray('[data-reveal]').forEach((el: any) => {
        const dir = el.dataset.reveal || 'up';
        const delay = parseFloat(el.dataset.delay || '0');
        const from = dir === 'up' ? { y: 50, opacity: 0 }
          : dir === 'left' ? { x: -50, opacity: 0 }
          : dir === 'right' ? { x: 50, opacity: 0 }
          : dir === 'scale' ? { scale: 0.88, opacity: 0 }
          : { y: 30, opacity: 0 };

        gsap.fromTo(el, from, {
          ...Object.fromEntries(Object.keys(from).map(k => [k, k === 'opacity' ? 1 : 0])),
          opacity: 1,
          duration: 0.9, delay, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });

      // Auto-stagger children with data-stagger-parent
      gsap.utils.toArray('[data-stagger-parent]').forEach((parent: any) => {
        const children = parent.querySelectorAll(':scope > *');
        gsap.fromTo(children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: parent, start: 'top 88%', toggleActions: 'play none none none' }
          }
        );
      });
    };
    init();
  }, []);

  return null;
}
