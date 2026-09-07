import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Anonymous page-view beacon for resume/portfolio traffic — no login, no
// third-party script, no cookies. Fires once per route change via
// sendBeacon (fire-and-forget, never blocks or errors the page).
export function usePageView() {
  const location = useLocation();
  useEffect(() => {
    try {
      const body = JSON.stringify({ path: location.pathname, referrer: document.referrer || '' });
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/track/pageview', blob);
    } catch {
      // Beacon is best-effort — never let tracking break navigation.
    }
  }, [location.pathname]);
}
