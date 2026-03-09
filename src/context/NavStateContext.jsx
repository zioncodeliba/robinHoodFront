import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchBankResponsesMeCached,
  fetchBankVisibilityMeCached,
  fetchCustomerMeCached,
  fetchNotificationsMeCached,
} from '../utils/authGetCache';
import { getAuthToken } from '../utils/authStorage';
import { hasTreatmentStatusAccess } from '../utils/treatmentStatus';

const NavStateContext = createContext({
  isLoaded: false,
  unreadCount: 0,
  hasSuggestions: false,
  hasPrincipalApproval: false,
  customerProfile: null,
  bankVisibility: [],
  bankResponses: [],
  notifications: [],
  refreshNavState: async () => ({
    ok: false,
    status: 401,
    notificationsStatus: 401,
    bankResponsesStatus: 401,
    customerStatusCode: 401,
    visibilityStatus: 401,
    notifications: [],
    bankResponses: [],
    customerProfile: null,
    bankVisibility: [],
  }),
  refreshCustomerProfile: async () => ({ ok: false, status: 401, data: null }),
});

const AUTO_REFRESH_INTERVAL_MS = 45000;

const hasVisibleSuggestions = (responses) => {
  if (!Array.isArray(responses) || !responses.length) {
    return false;
  }
  const latestByBank = new Map();
  responses.forEach((response) => {
    const bankId = Number(response?.bank_id);
    if (!Number.isFinite(bankId)) {
      return;
    }
    const previous = latestByBank.get(bankId);
    if (!previous) {
      latestByBank.set(bankId, response);
      return;
    }
    const prevDate = new Date(previous?.uploaded_at || 0).getTime();
    const nextDate = new Date(response?.uploaded_at || 0).getTime();
    if (nextDate >= prevDate) {
      latestByBank.set(bankId, response);
    }
  });

  return Array.from(latestByBank.values()).some((response) => {
    const calcResult = response?.extracted_json?.calculator_result || null;
    const isRefinance =
      Array.isArray(calcResult?.comparison_table) ||
      (calcResult?.detailed_scenarios &&
        typeof calcResult.detailed_scenarios === 'object');
    if (isRefinance) return false;
    return true;
  });
};

export const NavStateProvider = ({ children }) => {
  const lastAutoRefreshRef = useRef(0);
  const lastTokenRef = useRef(
    typeof window !== 'undefined' ? (getAuthToken() || '') : '',
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [hasPrincipalApproval, setHasPrincipalApproval] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [bankVisibility, setBankVisibility] = useState([]);
  const [bankResponses, setBankResponses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const resetState = useCallback(() => {
    setUnreadCount(0);
    setHasSuggestions(false);
    setHasPrincipalApproval(false);
    setCustomerProfile(null);
    setBankVisibility([]);
    setBankResponses([]);
    setNotifications([]);
  }, []);

  const refreshCustomerProfile = useCallback(async ({ force = false } = {}) => {
    const token = getAuthToken();
    if (!token) {
      setCustomerProfile(null);
      setHasPrincipalApproval(false);
      return { ok: false, status: 401, data: null };
    }
    try {
      const customerResult = await fetchCustomerMeCached(token, { force });
      if (customerResult.ok) {
        setCustomerProfile(customerResult.data || null);
        setHasPrincipalApproval(hasTreatmentStatusAccess(customerResult.data?.status));
      }
      return customerResult;
    } catch {
      return { ok: false, status: 500, data: null };
    }
  }, []);

  const refreshNavState = useCallback(async ({ force = false, forceNotifications = false } = {}) => {
    const token = getAuthToken();
    if (!token) {
      resetState();
      setIsLoaded(true);
      return {
        ok: false,
        status: 401,
        notificationsStatus: 401,
        bankResponsesStatus: 401,
        customerStatusCode: 401,
        visibilityStatus: 401,
        notifications: [],
        bankResponses: [],
        customerProfile: null,
        bankVisibility: [],
      };
    }

    try {
      const [notificationsResult, suggestionsResult, customerResult, visibilityResult] = await Promise.all([
        fetchNotificationsMeCached(token, { force: force || forceNotifications }),
        fetchBankResponsesMeCached(token, { force }),
        fetchCustomerMeCached(token, { force }),
        fetchBankVisibilityMeCached(token, { force }),
      ]);

      const notificationsData = notificationsResult.ok
        ? (Array.isArray(notificationsResult.data) ? notificationsResult.data : [])
        : [];
      const responsesData = suggestionsResult.ok
        ? (Array.isArray(suggestionsResult.data) ? suggestionsResult.data : [])
        : [];
      const customerData = customerResult.ok ? (customerResult.data || null) : null;
      const allowedBankIds = visibilityResult.ok
        ? (Array.isArray(visibilityResult.data?.allowed_bank_ids) ? visibilityResult.data.allowed_bank_ids : [])
        : [];

      if (notificationsResult.ok) {
        setNotifications(notificationsData);
        const unread = Array.isArray(notificationsResult.data)
          ? notificationsResult.data.filter((item) => !item.read_at).length
          : 0;
        setUnreadCount(unread);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }

      if (suggestionsResult.ok) {
        setBankResponses(responsesData);
        setHasSuggestions(hasVisibleSuggestions(responsesData));
      } else {
        setBankResponses([]);
        setHasSuggestions(false);
      }

      if (customerResult.ok) {
        setCustomerProfile(customerData);
        setHasPrincipalApproval(hasTreatmentStatusAccess(customerData?.status));
      } else {
        setCustomerProfile(null);
        setHasPrincipalApproval(false);
      }

      if (visibilityResult.ok) {
        setBankVisibility(allowedBankIds);
      } else {
        setBankVisibility([]);
      }

      const ok = notificationsResult.ok
        || suggestionsResult.ok
        || customerResult.ok
        || visibilityResult.ok;
      const status = customerResult.status
        || visibilityResult.status
        || suggestionsResult.status
        || notificationsResult.status
        || 500;

      return {
        ok,
        status,
        notificationsStatus: notificationsResult.status,
        bankResponsesStatus: suggestionsResult.status,
        customerStatusCode: customerResult.status,
        visibilityStatus: visibilityResult.status,
        notifications: notificationsData,
        bankResponses: responsesData,
        customerProfile: customerData,
        bankVisibility: allowedBankIds,
      };
    } catch {
      resetState();
      return {
        ok: false,
        status: 500,
        notificationsStatus: 500,
        bankResponsesStatus: 500,
        customerStatusCode: 500,
        visibilityStatus: 500,
        notifications: [],
        bankResponses: [],
        customerProfile: null,
        bankVisibility: [],
      };
    } finally {
      setIsLoaded(true);
    }
  }, [resetState]);

  const refreshIfNeeded = useCallback((options = {}) => {
    const now = Date.now();
    if (now - lastAutoRefreshRef.current < AUTO_REFRESH_INTERVAL_MS) {
      return;
    }
    lastAutoRefreshRef.current = now;
    void refreshNavState(options);
  }, [refreshNavState]);

  useEffect(() => {
    refreshIfNeeded({ force: true });
  }, [refreshIfNeeded]);

  useEffect(() => {
    const notificationsHandler = () => {
      refreshNavState({ forceNotifications: true });
    };
    const authChangedHandler = () => {
      lastAutoRefreshRef.current = 0;
      setIsLoaded(false);
      refreshIfNeeded({ force: true });
    };
    const focusHandler = () => {
      refreshIfNeeded();
    };
    const visibilityHandler = () => {
      if (document.visibilityState === 'visible') {
        refreshIfNeeded();
      }
    };
    window.addEventListener('notifications:updated', notificationsHandler);
    window.addEventListener('auth:state-changed', authChangedHandler);
    window.addEventListener('focus', focusHandler);
    document.addEventListener('visibilitychange', visibilityHandler);
    return () => {
      window.removeEventListener('notifications:updated', notificationsHandler);
      window.removeEventListener('auth:state-changed', authChangedHandler);
      window.removeEventListener('focus', focusHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, [refreshIfNeeded, refreshNavState]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const nextToken = getAuthToken() || '';
      if (nextToken === lastTokenRef.current) return;
      lastTokenRef.current = nextToken;
      lastAutoRefreshRef.current = 0;
      if (!nextToken) {
        resetState();
        setIsLoaded(true);
        return;
      }
      setIsLoaded(false);
      refreshIfNeeded({ force: true });
    }, 1500);

    return () => {
      window.clearInterval(interval);
    };
  }, [refreshIfNeeded, resetState]);

  const value = useMemo(
    () => ({
      isLoaded,
      unreadCount,
      hasSuggestions,
      hasPrincipalApproval,
      customerProfile,
      bankVisibility,
      bankResponses,
      notifications,
      refreshNavState,
      refreshCustomerProfile,
    }),
    [
      isLoaded,
      unreadCount,
      hasSuggestions,
      hasPrincipalApproval,
      customerProfile,
      bankVisibility,
      bankResponses,
      notifications,
      refreshNavState,
      refreshCustomerProfile,
    ],
  );

  return (
    <NavStateContext.Provider value={value}>
      {children}
    </NavStateContext.Provider>
  );
};

export const useNavState = () => useContext(NavStateContext);
