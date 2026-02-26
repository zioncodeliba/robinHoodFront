import { useCallback, useEffect, useState } from "react";
import { useNavState } from "../context/NavStateContext";
import { getAuthToken } from "../utils/authStorage";

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
  const { customerProfile, isLoaded, refreshCustomerProfile } = useNavState();
  const [userData, setUserData] = useState(readStoredUserData);
  const token = getAuthToken();

  const syncCustomerProfile = useCallback(async ({ force = false } = {}) => {
    if (!token) {
      setUserData(readStoredUserData());
      return { ok: false, status: 401, data: null };
    }
    try {
      const response = await refreshCustomerProfile({ force });
      if (!response.ok || !response.data || typeof response.data !== "object") {
        return response;
      }
      setUserData(response.data);
      persistUserData(response.data);
      return response;
    } catch {
      // Keep last known profile on transient errors.
      return { ok: false, status: 500, data: null };
    }
  }, [refreshCustomerProfile, token]);

  useEffect(() => {
    if (customerProfile && typeof customerProfile === "object") {
      setUserData(customerProfile);
      persistUserData(customerProfile);
      return;
    }
    if (!token || isLoaded) {
      setUserData(readStoredUserData());
    }
  }, [customerProfile, isLoaded, token]);

  return {
    userData,
    syncCustomerProfile,
  };
};

export default useCustomerProfile;
