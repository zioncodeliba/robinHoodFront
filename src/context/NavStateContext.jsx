import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  fetchBankResponsesMeCached,
  fetchCustomerMeCached,
  fetchNotificationsMeCached,
} from '../utils/authGetCache';

const NavStateContext = createContext({
  unreadCount: 0,
  hasSuggestions: false,
  hasPrincipalApproval: false,
  refreshNavState: async () => {},
});

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

const hasApprovalStepUnlocked = (statusText) => {
  const normalizedStatus = typeof statusText === 'string' ? statusText.trim() : '';
  if (!normalizedStatus) {
    return false;
  }
  if (normalizedStatus.includes('אישור עקרוני')) return true;
  if (normalizedStatus.includes('תמהיל')) return true;
  if (normalizedStatus.includes('משא ומתן')) return true;
  if (normalizedStatus.includes('חתימ')) return true;
  if (normalizedStatus.includes('קבלת הכסף')) return true;
  return false;
};

export const NavStateProvider = ({ children }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  const [hasPrincipalApproval, setHasPrincipalApproval] = useState(false);

  const refreshNavState = useCallback(async ({ force = false, forceNotifications = false } = {}) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUnreadCount(0);
      setHasSuggestions(false);
      setHasPrincipalApproval(false);
      return;
    }

    try {
      const [notificationsResult, suggestionsResult, customerResult] = await Promise.all([
        fetchNotificationsMeCached(token, { force: force || forceNotifications }),
        fetchBankResponsesMeCached(token, { force }),
        fetchCustomerMeCached(token, { force }),
      ]);

      if (notificationsResult.ok) {
        const unread = Array.isArray(notificationsResult.data)
          ? notificationsResult.data.filter((item) => !item.read_at).length
          : 0;
        setUnreadCount(unread);
      } else {
        setUnreadCount(0);
      }

      if (suggestionsResult.ok) {
        setHasSuggestions(hasVisibleSuggestions(Array.isArray(suggestionsResult.data) ? suggestionsResult.data : []));
      } else {
        setHasSuggestions(false);
      }

      if (customerResult.ok) {
        setHasPrincipalApproval(hasApprovalStepUnlocked(customerResult.data?.status));
      } else {
        setHasPrincipalApproval(false);
      }
    } catch {
      setUnreadCount(0);
      setHasSuggestions(false);
      setHasPrincipalApproval(false);
    }
  }, []);

  useEffect(() => {
    refreshNavState();
  }, [refreshNavState, location.pathname]);

  useEffect(() => {
    const notificationsHandler = () => {
      refreshNavState({ forceNotifications: true });
    };
    window.addEventListener('notifications:updated', notificationsHandler);
    return () => {
      window.removeEventListener('notifications:updated', notificationsHandler);
    };
  }, [refreshNavState]);

  const value = useMemo(
    () => ({
      unreadCount,
      hasSuggestions,
      hasPrincipalApproval,
      refreshNavState,
    }),
    [unreadCount, hasSuggestions, hasPrincipalApproval, refreshNavState],
  );

  return (
    <NavStateContext.Provider value={value}>
      {children}
    </NavStateContext.Provider>
  );
};

export const useNavState = () => useContext(NavStateContext);
