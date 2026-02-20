import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getGatewayBase } from '../utils/apiBase';
import {
  fetchBankVisibilityMeCached,
  fetchCustomerMeCached,
} from '../utils/authGetCache';
import {
  canRouteByBankVisibility,
  getDefaultAllowedBankIds,
  normalizeAllowedBankIds,
} from '../utils/customerFlowRouting';

const BANK_VISIBILITY_PAGES = new Set([
  '/homebeforeapproval',
  '/homebeforeapproval2',
  '/viewoffer',
  '/suggestionspage',
]);

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const apiBase = React.useMemo(() => getGatewayBase(), []);
  const token = localStorage.getItem('auth_token');
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

    const controller = new AbortController();
    const currentPath = (location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';

    setStatus('checking');
    setRedirectPath('');

    const verifySession = async () => {
      try {
        const response = await fetch(`${apiBase}/auth/v1/is-authenticated`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!isMounted) return;

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setStatus('unauthenticated');
          setRedirectPath('');
          return;
        }

        if (BANK_VISIBILITY_PAGES.has(currentPath)) {
          // Always revalidate this flow-critical routing data.
          const customerResponse = await fetchCustomerMeCached(token, { force: true });
          if (customerResponse.status === 401 || customerResponse.status === 403) {
            localStorage.removeItem('auth_token');
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

            const visibilityResponse = await fetchBankVisibilityMeCached(token, { force: true });
            if (visibilityResponse.status === 401 || visibilityResponse.status === 403) {
              localStorage.removeItem('auth_token');
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
      controller.abort();
    };
  }, [apiBase, token, location.pathname]);

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
