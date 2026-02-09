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
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { getGatewayBase } from "../utils/apiBase";



const Homepage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const [checkingResults, setCheckingResults] = useState(true);

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

    const isValidCalculatorResult = (calcResult) => {
      if (!calcResult || typeof calcResult !== "object") {
        return false;
      }
      if (calcResult.error || calcResult.status_code) {
        return false;
      }
      return Object.prototype.hasOwnProperty.call(calcResult, "frontend_data");
    };

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
      if (!isValidCalculatorResult(calcResult)) {
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
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (isActive) {
          setCheckingResults(false);
        }
        return;
      }

      try {
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
          for (const item of payload) {
            if (redirectWith(item)) {
              return;
            }
          }
        }
      } catch (error) {
        // Ignore and fall back to the default homepage.
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
            <Link to="/aichat" onClick={() => void updateMortgageType("משכנתא חדשה")}>
              <img src={mortgageimg1} alt="" />
              <span>לקיחת <br /> משכנתא חדשה</span>
            </Link>
          </li>
          <li>
            <Link to="/recycle-loan" onClick={() => void updateMortgageType("מחזור משכנתא")}>
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
