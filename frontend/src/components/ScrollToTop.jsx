import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Always return to Landing Page '/' when user refreshes the page
  useEffect(() => {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
      if (pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, []);

  return null;
};

export default ScrollToTop;
