import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { fetchAuthGet } from '../utils/authGetCache';

const AffiliateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('affiliate_token');
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  const [status, setStatus] = useState(() => (token ? 'checking' : 'unauthenticated'));

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setStatus('unauthenticated');
      return undefined;
    }

    const verifySession = async () => {
      try {
        const response = await fetchAuthGet('/auth/v1/affiliate-is-authenticated', token);

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
    };
  }, [token]);

  if (status === 'checking') {
    return null;
  }

  if (status !== 'authenticated') {
    return (
      <Navigate
        to={isDesktop ? '/' : '/login'}
        state={isDesktop ? undefined : { from: location }}
        replace
      />
    );
  }

  return children;
};

export default AffiliateRoute;
