// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

import '../components/homecomponents/homepage.css';

import mortgageimg1 from '../assets/images/op1.svg';
import mortgageimg2 from '../assets/images/op2.svg';
import loginleftimg from '../assets/images/login_left_img.png';
import loginleftimgmobile from '../assets/images/homepage_figure_leaf.png';

import {
  getCalculatorResult,
  hasCalculatorOffer,
  isMortgageCycleCalculatorResultValid,
  loadMortgageCycleResult,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { getGatewayBase } from "../utils/apiBase";
import {
  clearAuthGetCache,
  fetchBankResponsesMeCached,
  fetchBankVisibilityMeCached,
  fetchCustomerFilesMeCached,
  fetchCustomerMeCached,
} from "../utils/authGetCache";
import {
  REFINANCE_MORTGAGE_TYPE,
  canRouteByBankVisibility,
  getDefaultAllowedBankIds,
  hasSupportedMortgageType,
  isNewMortgagePrincipalApproval,
  normalizeAllowedBankIds,
} from "../utils/customerFlowRouting";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";
import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";

const isRefinanceResult = (calcResult) =>
  Array.isArray(calcResult?.comparison_table) ||
  (calcResult?.detailed_scenarios && typeof calcResult.detailed_scenarios === "object");

const isApprovalOfferResult = (calcResult) => {
  if (!calcResult || typeof calcResult !== "object") return false;
  if (isRefinanceResult(calcResult)) return false;
  const proposedMix = calcResult?.proposed_mix;
  if (!proposedMix || typeof proposedMix !== "object") return false;
  return Boolean(
    proposedMix?.summary ||
    proposedMix?.metrics ||
    proposedMix?.graph_data ||
    (Array.isArray(proposedMix?.tracks_detail) && proposedMix.tracks_detail.length > 0)
  );
};

const parseSelectedDisplayChoice = (rawValue) => {
  if (rawValue === null || rawValue === undefined || rawValue === "") return null;
  if (rawValue === "selected_offer") return "selected_offer";
  const numericValue = Number(rawValue);
  if (Number.isInteger(numericValue)) return numericValue;
  return null;
};


const Homepage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const { userData } = useCustomerProfile();
  const displayName = getCustomerDisplayName(userData, "לרובין");
  const [checkingResults, setCheckingResults] = useState(true);
  const isAuthenticated = Boolean(
    getAuthToken() || localStorage.getItem("affiliate_token")
  );
  const isDesktop = window.innerWidth >= 1024;

  const openRegistrationPopup = () => {
    window.dispatchEvent(new CustomEvent('auth:open-registration'));
  };

  const handleProtectedClick = (event, mortgageType) => {
    if (!isAuthenticated) {
      if (isDesktop) {
        event.preventDefault();
        event.stopPropagation();
        openRegistrationPopup();
      }
      return;
    }
    void updateMortgageType(mortgageType);
  };

  const handleAuthFailure = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  }, [navigate]);

  const updateMortgageType = async (mortgageType) => {
    const token = getAuthToken();
    if (!token) return;
    const syncMortgageTypeInStorage = (nextMortgageType, nextCustomer = null) => {
      try {
        if (nextCustomer && typeof nextCustomer === "object") {
          localStorage.setItem("user_data", JSON.stringify(nextCustomer));
          return;
        }
        const stored = JSON.parse(localStorage.getItem("user_data") || "{}");
        const updated = {
          ...stored,
          mortgageType: nextMortgageType,
          mortgage_type: nextMortgageType,
        };
        localStorage.setItem("user_data", JSON.stringify(updated));
      } catch {
        // Ignore local storage failures.
      }
    };

    syncMortgageTypeInStorage(mortgageType);
    clearAuthGetCache(token);

    try {
      const response = await fetch(`${apiBase}/auth/v1/customers/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mortgage_type: mortgageType }),
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthFailure();
        return;
      }
      const payload = await response.json().catch(() => null);
      const customerPayload = payload?.data?.customer || payload?.customer || payload;
      if (response.ok && customerPayload && typeof customerPayload === "object") {
        syncMortgageTypeInStorage(mortgageType, customerPayload);
      }
      clearAuthGetCache(token);
    } catch {
      // Silently ignore; selection isn't critical for navigation.
    }
  };

  useEffect(() => {
    let isActive = true;
    let didRedirect = false;
    const NEW_MORTGAGE_KEY = "new_mortgage_submitted";

    const hasSignatureFile = (files) =>
      Array.isArray(files) &&
      files.some((file) => {
        const name = file?.original_name;
        return typeof name === "string" && name.startsWith("system_signature_");
      });

    const redirectWith = (payload) => {
      const calcResult = getCalculatorResult(payload);
      if (!isMortgageCycleCalculatorResultValid(calcResult)) {
        return false;
      }
      saveMortgageCycleResult(payload);
      didRedirect = true;
      navigate(hasCalculatorOffer(calcResult) ? "/mortgagecyclepage" : "/noofferfound", {
        state: { bankResponse: payload },
        replace: true,
      });
      return true;
    };

    const loadLatestResult = async () => {
      const token = getAuthToken();
      if (!token) {
        if (isActive) {
          setCheckingResults(false);
        }
        return;
      }

      try {
        const customerResponse = await fetchCustomerMeCached(token, { force: true });
        if (customerResponse.status === 401 || customerResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!customerResponse.ok) {
          throw new Error("Failed to load customer profile");
        }
        const customerPayload = customerResponse.data;
        const customerStatus = customerPayload?.status;
        const customerMortgageType = String(
          customerPayload?.mortgage_type || customerPayload?.mortgageType || ""
        ).trim();
        const hasDefinedMortgageType = hasSupportedMortgageType(customerMortgageType);
        const shouldRouteByVisibility = canRouteByBankVisibility({
          mortgageType: customerMortgageType,
          status: customerStatus,
        });
        const isRefinanceFlow = customerMortgageType === REFINANCE_MORTGAGE_TYPE;
        const defaultAllowedBankIds = hasDefinedMortgageType
          ? getDefaultAllowedBankIds(customerMortgageType)
          : [];

        const visibilityResponse = await fetchBankVisibilityMeCached(token, { force: true });
        if (visibilityResponse.status === 401 || visibilityResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        const allowedBankIds = visibilityResponse.ok
          ? normalizeAllowedBankIds(visibilityResponse.data?.allowed_bank_ids, defaultAllowedBankIds)
          : [...defaultAllowedBankIds];
        const selectedDisplayChoice = parseSelectedDisplayChoice(
          visibilityResponse.data?.selected_display_choice
        );
        const hasSelectedBankChoice =
          Number.isInteger(selectedDisplayChoice) && allowedBankIds.includes(selectedDisplayChoice);
        const hasSelectedOfferChoice = selectedDisplayChoice === "selected_offer";
        const canOpenSelectedBankPage =
          isNewMortgagePrincipalApproval({
            mortgageType: customerMortgageType,
            status: customerStatus,
          }) ||
          (customerMortgageType === REFINANCE_MORTGAGE_TYPE && shouldRouteByVisibility);

        const bankResponsesResponse = await fetchBankResponsesMeCached(token, { force: true });
        if (bankResponsesResponse.status === 401 || bankResponsesResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!bankResponsesResponse.ok) {
          throw new Error("Failed to load mortgage cycle results");
        }
        const allBankResponses = Array.isArray(bankResponsesResponse.data) ? bankResponsesResponse.data : [];
        const allowedBankSet = new Set(allowedBankIds);
        const approvalResponses = allBankResponses.filter((response) => {
          const bankId = Number(response?.bank_id);
          if (!Number.isFinite(bankId) || !allowedBankSet.has(bankId)) {
            return false;
          }
          const calcResult = getCalculatorResult(response);
          return isApprovalOfferResult(calcResult);
        });

        if ((hasSelectedBankChoice || hasSelectedOfferChoice) && canOpenSelectedBankPage) {
          const selectedOfferBankId = Number(approvalResponses[0]?.bank_id);
          const fallbackBankId = Number.isInteger(allowedBankIds[0]) ? allowedBankIds[0] : null;
          const targetBankId = hasSelectedBankChoice
            ? selectedDisplayChoice
            : (Number.isInteger(selectedOfferBankId) ? selectedOfferBankId : fallbackBankId);
          didRedirect = true;
          navigate(
            Number.isInteger(targetBankId) ? `/new-loan?bankId=${targetBankId}` : "/new-loan",
            { replace: true }
          );
          return;
        }

        // Bank visibility is the primary switch for both flows.
        if (allowedBankIds.length > 0 && shouldRouteByVisibility) {
          didRedirect = true;
          navigate(approvalResponses.length > 0 ? "/viewoffer" : "/homebeforeapproval2", { replace: true });
          return;
        }

        if (customerStatus === "נרשם") {
          localStorage.removeItem("mortgage_cycle_result");
          localStorage.removeItem(NEW_MORTGAGE_KEY);
          return;
        }
        if (
          customerStatus === "מחזור - יש הצעה" ||
          customerStatus === "מיחזור - נקבעה פגישה" ||
          customerStatus === "מחזור - נקבעה פגישה"
        ) {
          const storedResult = loadMortgageCycleResult();
          didRedirect = true;
          navigate("/mortgagecyclepage", {
            state: storedResult ? { bankResponse: storedResult } : undefined,
            replace: true,
          });
          return;
        }

        if (!isRefinanceFlow && localStorage.getItem(NEW_MORTGAGE_KEY) === "true") {
          // Prevent stale client flag from causing redirect loops with ProtectedRoute.
          localStorage.removeItem(NEW_MORTGAGE_KEY);
        }

        const approvalResponse = await fetchCustomerFilesMeCached(token, { force: true });
        if (approvalResponse.status === 401 || approvalResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        if (approvalResponse.ok) {
          const approvalPayload = approvalResponse.data;
          if (hasSignatureFile(approvalPayload)) {
            if (!isRefinanceFlow) {
              localStorage.setItem(NEW_MORTGAGE_KEY, "true");
              // Do not force redirect here; route decisions are handled above by
              // visibility/status checks to avoid navigation loops.
            }
          }
        }

        const payload = allBankResponses;
        if (Array.isArray(payload)) {
          const latest = payload[0] || null;
          if (latest) {
            const latestCalcResult = getCalculatorResult(latest);
            if (isRefinanceResult(latestCalcResult)) {
              if (isRefinanceFlow && redirectWith(latest)) {
                return;
              }
              return;
            }
            if (redirectWith(latest)) {
              return;
            }
            throw new Error("Latest mortgage cycle result is invalid");
          }
        }
      } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === "Latest mortgage cycle result is invalid") {
          alert("התוצאה העדכנית ביותר לא תקינה. יש להעלות קבצים מחדש.");
        }
      } finally {
        if (isActive && !didRedirect) {
          setCheckingResults(false);
        }
      }
    };

    loadLatestResult();

    return () => {
      isActive = false;
    };
  }, [handleAuthFailure, navigate]);

  if (checkingResults) {
    return null;
  }

  return (
    <div className="homepage d_flex">
      <div className="right_col">
        <h1>ברוכים הבאים <span>{displayName}</span>.</h1>
        <p>המקום שיוציא עבורכם את המשכנתא
          המשתלמת ביותר עם שירותי השוואה, ניתוח, ליווי
          אישי, ניטור משכנתא מתקדם וצ’אט חדשני שפשוט
          יעבדו בשבילכם</p>
        <label>בחלק התחתון ניתן לבחור באחת משתי האפשרויות...
          <br /> אז שנתחיל?</label>
        <h3>מה נרצה לעשות היום?</h3>
        <ul className="d_flex">
          <li>
            <Link
              to="/aichat"
              onClick={(event) => handleProtectedClick(event, "משכנתא חדשה")}
            >
              <img src={mortgageimg1} alt="" />
              <span>לקיחת <br /> משכנתא חדשה</span>
            </Link>
          </li>
          <li>
            <Link
              to="/recycle-loan"
              onClick={(event) => handleProtectedClick(event, "מחזור משכנתא")}
            >
              <img src={mortgageimg2} alt="" />
              <span>בדיקת מחזור <br />משכנתא</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="left_col">
        <img src={loginleftimg} className="desktop_img" alt="" />
        <img src={loginleftimgmobile} className="mobile_img" alt="" />
      </div>
    </div>
  );
};

export default Homepage;
