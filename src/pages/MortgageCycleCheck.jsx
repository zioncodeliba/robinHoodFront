import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import '../components/mortgagecyclecheckcomponents/mortgagecyclecheck.css';

import MortgageUploadfiles from '../components/mortgagecyclecheckcomponents/MortgageUploadfiles';
import MortgageFinaldetails from '../components/mortgagecyclecheckcomponents/MortgageFinaldetails';

import prevIcon from '../assets/images/prev_icon.svg';

import {
  getCalculatorResult,
  hasCalculatorOffer,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { getGatewayBase } from "../utils/apiBase";

const MortgageCycleCheck = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bankId, setBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("יש להתחבר מחדש");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("bank_id", bankId);
      formData.append("amount", String(numericAmount));
      formData.append("file", selectedFiles[0]);

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
      if (
        !calculatorResult ||
        typeof calculatorResult !== "object" ||
        !("frontend_data" in calculatorResult)
      ) {
        throw new Error("לא התקבלה תשובת מחשבון");
      }
      if (calculatorResult?.error || calculatorResult?.status_code) {
        throw new Error(calculatorResult.error || "שגיאה בחישוב המשכנתא");
      }

      saveMortgageCycleResult(payload);
      const hasOffer = hasCalculatorOffer(calculatorResult);
      navigate(hasOffer ? "/mortgagecyclepage" : "/noofferfound", {
        state: { bankResponse: payload },
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "שגיאה בשליחת הקובץ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mortgagecyclecheck_page">
      <a href="/" className="prev_page_link"><img src={prevIcon} alt="" /></a>
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
  );
};

export default MortgageCycleCheck;
