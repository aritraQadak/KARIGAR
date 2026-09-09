import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function isReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Custom hook to trigger staggered scroll-reveal on elements within a container ref.
 */
export function useScrollReveal(containerRef, selector = '.gsap-reveal', options = {}) {
  useEffect(() => {
    if (isReducedMotion() || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current.querySelectorAll(selector);
      if (!elements || elements.length === 0) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: options.y || 24,
          scale: options.scale || 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration || 0.6,
          stagger: options.stagger !== undefined ? options.stagger : 0.08,
          ease: options.ease || 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: options.start || 'top 85%',
            toggleActions: options.toggleActions || 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, JSON.stringify(options)]);
}

/**
 * Entrance timeline animation helper for Hero or main page elements.
 */
export function createEntranceTimeline(targets, options = {}) {
  if (isReducedMotion()) return null;

  const tl = gsap.timeline({
    delay: options.delay || 0.1,
  });

  targets.forEach((target) => {
    if (!target.el) return;
    tl.fromTo(
      target.el,
      {
        opacity: 0,
        y: target.y !== undefined ? target.y : 20,
        scale: target.scale !== undefined ? target.scale : 1,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: target.duration || 0.5,
        ease: target.ease || 'power2.out',
      },
      target.position || '-=0.35'
    );
  });

  return tl;
}
