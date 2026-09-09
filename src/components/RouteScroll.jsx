import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function RouteScroll() {
  const { pathname, hash, key } = useLocation();
  const previousPath = useRef(null);

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => { window.history.scrollRestoration = previous; };
  }, []);

  useLayoutEffect(() => {
    const changedPage = previousPath.current !== pathname;
    previousPath.current = pathname;
    const positionPage = () => {
      if (!changedPage && hash) {
        let id;
        try { id = decodeURIComponent(hash.slice(1)); } catch { id = hash.slice(1); }
        const target = document.getElementById(id);
        if (target) { target.scrollIntoView({ behavior: 'instant', block: 'start' }); return; }
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    positionPage();
    const frame = requestAnimationFrame(positionPage);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
}
