// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';

import '../components/homecomponents/homepage.css';

import mortgageimg1 from '../assets/images/op1.png';
import mortgageimg2 from '../assets/images/op2.png';
import loginleftimg from '../assets/images/login_left_img.png';
import loginleftimgmobile from '../assets/images/login_left_img_m.png';
import {
  getCalculatorResult,
  hasCalculatorOffer,
  isMortgageCycleCalculatorResultValid,
  loadMortgageCycleResult,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { getGatewayBase } from "../utils/apiBase";



const Homepage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const [checkingResults, setCheckingResults] = useState(true);
  const isAuthenticated = Boolean(
    localStorage.getItem("auth_token") || localStorage.getItem("affiliate_token")
  );
  const isDesktop = window.innerWidth >= 1024;

  const openLoginPopup = () => {
    window.dispatchEvent(new CustomEvent('auth:open-login'));
  };

  const handleProtectedClick = (event, mortgageType) => {
    if (!isAuthenticated) {
      if (isDesktop) {
        event.preventDefault();
        event.stopPropagation();
        openLoginPopup();
      }
      return;
    }
    void updateMortgageType(mortgageType);
  };

  const handleAuthFailure = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  };

  const updateMortgageType = async (mortgageType) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
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
      }
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

    const redirectToApprovalHome = () => {
      didRedirect = true;
      navigate("/homebeforeapproval2", { replace: true });
    };

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

    const isRefinanceResult = (calcResult) =>
      Array.isArray(calcResult?.comparison_table) ||
      (calcResult?.detailed_scenarios &&
        typeof calcResult.detailed_scenarios === "object");

    const loadLatestResult = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (isActive) {
          setCheckingResults(false);
        }
        return;
      }

      try {
        const customerResponse = await fetch(`${apiBase}/auth/v1/customers/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (customerResponse.status === 401 || customerResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!customerResponse.ok) {
          throw new Error("Failed to load customer profile");
        }
        const customerPayload = await customerResponse.json().catch(() => null);
        const customerStatus = customerPayload?.status;
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

        if (localStorage.getItem(NEW_MORTGAGE_KEY) === "true") {
          redirectToApprovalHome();
          return;
        }

        const approvalResponse = await fetch(`${apiBase}/auth/v1/customer-files/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (approvalResponse.status === 401 || approvalResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        if (approvalResponse.ok) {
          const approvalPayload = await approvalResponse.json().catch(() => null);
          if (hasSignatureFile(approvalPayload)) {
            localStorage.setItem(NEW_MORTGAGE_KEY, "true");
            redirectToApprovalHome();
            return;
          }
        }

        const response = await fetch(`${apiBase}/auth/v1/bank-responses/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401 || response.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load mortgage cycle results");
        }
        const payload = await response.json().catch(() => null);
        if (Array.isArray(payload)) {
          const latest = payload[0] || null;
          if (latest) {
            const latestCalcResult = getCalculatorResult(latest);
            // Refinance results are reviewed/admin-managed and should not force homepage redirects.
            if (isRefinanceResult(latestCalcResult)) {
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
  }, [apiBase, navigate]);

  if (checkingResults) {
    return null;
  }

  return (
    <div className="homepage d_flex">
      <div className="right_col">
        <h1>ברוכים הבאים <span>לרובין</span>.</h1>
        <p>המקום שיוציא עבורכם את המשכנתא וההלוואה
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
