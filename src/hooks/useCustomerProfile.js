import { useCallback, useEffect, useState } from "react";
import { fetchCustomerMeCached } from "../utils/authGetCache";

const readStoredUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("user_data")) || {};
  } catch {
    return {};
  }
};

const persistUserData = (data) => {
  try {
    localStorage.setItem("user_data", JSON.stringify(data || {}));
  } catch {
    // Ignore storage failures.
  }
};

export const getCustomerDisplayName = (userData, fallback = "שם") =>
  userData?.firstName || userData?.first_name || userData?.name || fallback;

const useCustomerProfile = () => {
  const [userData, setUserData] = useState(readStoredUserData);
  const token = localStorage.getItem("auth_token");

  const syncCustomerProfile = useCallback(async (force = true) => {
    if (!token) {
      setUserData(readStoredUserData());
      return;
    }
    try {
      const response = await fetchCustomerMeCached(token, { force });
      if (!response.ok || !response.data || typeof response.data !== "object") {
        return;
      }
      setUserData(response.data);
      persistUserData(response.data);
    } catch {
      // Keep last known profile on transient errors.
    }
  }, [token]);

  useEffect(() => {
    setUserData(readStoredUserData());
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void syncCustomerProfile(true);

    const handleFocus = () => {
      void syncCustomerProfile(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncCustomerProfile(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [syncCustomerProfile, token]);

  return {
    userData,
    syncCustomerProfile,
  };
};

export default useCustomerProfile;
