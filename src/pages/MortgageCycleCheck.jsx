import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import '../components/mortgagecyclecheckcomponents/mortgagecyclecheck.css';

import previcon from '../assets/images/prev_icon.svg';
import schedulemeetings_man from '../assets/images/schedulemeetings_man.png';
import MortgageUploadfiles from '../components/mortgagecyclecheckcomponents/MortgageUploadfiles';
import MortgageFinaldetails from '../components/mortgagecyclecheckcomponents/MortgageFinaldetails';
import SavingsLoaderOverlay from '../components/commoncomponents/SavingsLoaderOverlay';

import {
  getCalculatorResult,
  hasCalculatorOffer,
  isMortgageCycleCalculatorResultValid,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { getGatewayBase } from "../utils/apiBase";
import { clearAuthGetCache } from "../utils/authGetCache";
import { useNavState } from "../context/NavStateContext";
import { getAuthToken } from "../utils/authStorage";

const DEFAULT_BANK_IDS = [3, 2, 1, 4, 8, 12];

const normalizeAllowedBankIds = (ids, fallback = DEFAULT_BANK_IDS) => {
  if (!Array.isArray(ids)) return [...fallback];
  const allowed = new Set(ids.map((value) => Number(value)));
  return DEFAULT_BANK_IDS.filter((id) => allowed.has(id));
};

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

const MortgageCycleCheck = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiComplete, setApiComplete] = useState(false);
  const navigate = useNavigate();
  const { refreshNavState } = useNavState();

  const apiBase = useMemo(() => getGatewayBase(), []);

  const handleContinue = async () => {
    if (selectedFiles.length === 0) {
      alert("נא לבחור קובץ לפני המשך");
      return;
    }
    if (selectedFiles.length > 1) {
      alert("יש לבחור קובץ אחד בלבד לבדיקה");
      return;
    }
    if (!bankId) {
      alert("נא לבחור בנק");
      return;
    }
    const numericAmount = Number((amount || "").replace(/[^\d]/g, ""));
    if (!numericAmount) {
      alert("נא להזין סכום תקין");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      alert("יש להתחבר מחדש");
      return;
    }

    try {
      setSubmitting(true);
      setApiComplete(false);

      const formData = new FormData();
      formData.append("bank_id", bankId);
      formData.append("amount", String(numericAmount));
      formData.append("file", selectedFiles[0]);
      formData.append("scan_type", "recycle");

      const response = await fetch(`${apiBase}/auth/v1/bank-responses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage =
          payload?.detail || "שגיאה בשליחת הקובץ לבדיקה";
        throw new Error(errorMessage);
      }

      const calculatorResult = getCalculatorResult(payload);
      if (!isMortgageCycleCalculatorResultValid(calculatorResult)) {
        throw new Error("לא התקבלה תשובת מחשבון");
      }
      if (calculatorResult?.error || calculatorResult?.status_code) {
        throw new Error(calculatorResult.error || "שגיאה בחישוב המשכנתא");
      }
      const hasOffer = hasCalculatorOffer(calculatorResult);

      saveMortgageCycleResult(payload);
      clearAuthGetCache(token);
      try {
        const storedUserData = JSON.parse(localStorage.getItem("user_data") || "{}");
        localStorage.setItem("user_data", JSON.stringify({
          ...storedUserData,
          mortgageType: "מחזור משכנתא",
          mortgage_type: "מחזור משכנתא",
        }));
      } catch {
        // Ignore storage failures.
      }

      try {
        const statusResponse = await fetch(`${apiBase}/auth/v1/customers/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mortgage_type: "מחזור משכנתא",
            status: hasOffer ? "מחזור - יש הצעה" : "מחזור - אין הצעה",
          }),
        });
        if (statusResponse.status === 401 || statusResponse.status === 403) {
          throw new Error("יש להתחבר מחדש");
        }
      } catch (statusError) {
        if (statusError instanceof Error && statusError.message === "יש להתחבר מחדש") {
          throw statusError;
        }
        console.warn("Failed to sync refinance status", statusError);
      } finally {
        clearAuthGetCache(token);
      }

      const navSnapshot = await refreshNavState({ force: true });
      const statusCodes = [
        navSnapshot?.customerStatusCode,
        navSnapshot?.visibilityStatus,
        navSnapshot?.bankResponsesStatus,
      ];
      if (statusCodes.some((code) => code === 401 || code === 403)) {
        throw new Error("יש להתחבר מחדש");
      }
      const allowedBankIds = Array.isArray(navSnapshot?.bankVisibility)
        ? normalizeAllowedBankIds(navSnapshot.bankVisibility, [])
        : [];

      if (allowedBankIds.length > 0) {
        const responsesPayload = Array.isArray(navSnapshot?.bankResponses)
          ? navSnapshot.bankResponses
          : [];
        const allowedBankSet = new Set(allowedBankIds);
        const approvalResponses = responsesPayload.filter((item) => {
            const bankIdNumeric = Number(item?.bank_id);
            if (!Number.isFinite(bankIdNumeric) || !allowedBankSet.has(bankIdNumeric)) {
              return false;
            }
            const responseCalcResult = item?.extracted_json?.calculator_result;
            return isApprovalOfferResult(responseCalcResult);
          });
        setApiComplete(true);
        return;
      }

      setApiComplete(true);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "שגיאה בשליחת הקובץ");
      setSubmitting(false);
    }
  };

  const onLoaderComplete = () => {
    setSubmitting(false);
    navigate('/', { replace: true });
  };

  return (
    <>
    <div className="mortgagecyclecheck_page">
      <Link to="/" className="prev_page_link"><img src={previcon} alt="" /></Link>
      <h1>בדיקת מחזור משכנתא</h1>
      <MortgageUploadfiles files={selectedFiles} setFiles={setSelectedFiles} />
      <MortgageFinaldetails
        bankId={bankId}
        amount={amount}
        onBankIdChange={setBankId}
        onAmountChange={setAmount}
      />
      <div className="next_prev_btnk d_flex d_flex_ac d_flex_jb">
        <a href="/"> &lt; הקודם</a>
        <button
          type="button"
          className="btn"
          onClick={handleContinue}
          disabled={submitting}
        >
          {submitting ? "שולח..." : "המשך"}
        </button>
      </div>
    </div>
      <img src={schedulemeetings_man} className="schedulemeetings_man_recycle" alt="" />
      {submitting && <SavingsLoaderOverlay onComplete={onLoaderComplete} apiComplete={apiComplete} />}
    </>
  );
};

export default MortgageCycleCheck;
