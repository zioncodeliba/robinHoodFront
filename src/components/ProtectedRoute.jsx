import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
  fetchBankVisibilityMeCached,
  fetchCustomerMeCached,
  fetchIsAuthenticatedCached,
} from '../utils/authGetCache';
import {
  canRouteByBankVisibility,
  getDefaultAllowedBankIds,
  normalizeAllowedBankIds,
} from '../utils/customerFlowRouting';
import { clearAuthToken, getAuthToken } from '../utils/authStorage';

const BANK_VISIBILITY_PAGES = new Set([
  '/homebeforeapproval',
  '/homebeforeapproval2',
  '/viewoffer',
  '/suggestionspage',
]);

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = getAuthToken();
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  const [status, setStatus] = React.useState(() => (token ? 'checking' : 'unauthenticated'));
  const [redirectPath, setRedirectPath] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;
    if (!token) {
      setStatus('unauthenticated');
      setRedirectPath('');
      return undefined;
    }

    const currentPath = (location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';

    setStatus('checking');
    setRedirectPath('');

    const verifySession = async () => {
      try {
        const response = await fetchIsAuthenticatedCached(token);

        if (!isMounted) return;

        if (response.status === 401 || response.status === 403) {
          clearAuthToken();
          localStorage.removeItem('user_data');
          setStatus('unauthenticated');
          setRedirectPath('');
          return;
        }

        if (BANK_VISIBILITY_PAGES.has(currentPath)) {
          // Always revalidate this flow-critical routing data.
          const customerResponse = await fetchCustomerMeCached(token);
          if (customerResponse.status === 401 || customerResponse.status === 403) {
            clearAuthToken();
            localStorage.removeItem('user_data');
            if (!isMounted) return;
            setStatus('unauthenticated');
            setRedirectPath('');
            return;
          }

          if (customerResponse.ok) {
            const customerMortgageType = String(
              customerResponse.data?.mortgage_type || customerResponse.data?.mortgageType || '',
            ).trim();
            const customerStatus = customerResponse.data?.status || '';

            const visibilityResponse = await fetchBankVisibilityMeCached(token);
            if (visibilityResponse.status === 401 || visibilityResponse.status === 403) {
              clearAuthToken();
              localStorage.removeItem('user_data');
              if (!isMounted) return;
              setStatus('unauthenticated');
              setRedirectPath('');
              return;
            }

            const defaultAllowedBankIds = getDefaultAllowedBankIds(customerMortgageType);
            const allowedBankIds = visibilityResponse.ok
              ? normalizeAllowedBankIds(visibilityResponse.data?.allowed_bank_ids, defaultAllowedBankIds)
              : [...defaultAllowedBankIds];

            const shouldRouteByVisibility = canRouteByBankVisibility({
              mortgageType: customerMortgageType,
              status: customerStatus,
            });

            if (!shouldRouteByVisibility || allowedBankIds.length === 0) {
              if (!isMounted) return;
              setStatus('redirect');
              setRedirectPath('/');
              return;
            }
          }
        }

        setStatus('authenticated');
        setRedirectPath('');
      } catch {
        if (!isMounted) return;
        // On network errors, keep the user on the page.
        setStatus('authenticated');
        setRedirectPath('');
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, location.pathname]);

  if (status === 'checking') {
    return null;
  }

  if (status === 'redirect' && redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (status !== 'authenticated') {
    // Desktop: return to landing/home. Mobile: keep explicit login flow.
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

export default ProtectedRoute;
