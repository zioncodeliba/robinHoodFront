import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getGatewayBase } from '../utils/apiBase';

const AffiliateRoute = ({ children }) => {
  const location = useLocation();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const token = localStorage.getItem('affiliate_token');
  const [status, setStatus] = useState(() => (token ? 'checking' : 'unauthenticated'));

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setStatus('unauthenticated');
      return undefined;
    }

    const controller = new AbortController();

    const verifySession = async () => {
      try {
        const response = await fetch(`${apiBase}/auth/v1/affiliate-is-authenticated`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!isMounted) return;

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('affiliate_token');
          localStorage.removeItem('affiliate_data');
          setStatus('unauthenticated');
          return;
        }

        setStatus('authenticated');
      } catch {
        if (!isMounted) return;
        // On network errors, keep the affiliate on the page.
        setStatus('authenticated');
      }
    };

    verifySession();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [apiBase, token, location.pathname]);

  if (status === 'checking') {
    return null;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/affiliate-login" state={{ from: location }} replace />;
  }

  return children;
};

export default AffiliateRoute;
