// Homepage.jsx
import React, { useCallback, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import '../components/mortgagecyclecomponents/MortgageCyclepage.css';

import prevIcon from '../assets/images/prev_icon.png';
import congoIcon from '../assets/images/congo_icon.png';
import offerman from '../assets/images/offer_man.png';

// page components
import BankMortgage from '../components/mortgagecyclecomponents/BankMortgage';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import SavingsList from '../components/mortgagecyclecomponents/SavingsList';
import BarChartsavings from '../components/mortgagecyclecomponents/BarChartsavings';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import {
  buildBankMortgageData,
  loadMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import {
  fetchBankResponsesMeCached,
  fetchBankVisibilityMeCached,
} from "../utils/authGetCache";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";

const SUPPORTED_BANK_IDS = [3, 2, 1, 4, 8, 12];

const normalizeAllowedBankIds = (ids, fallback = SUPPORTED_BANK_IDS) => {
  if (!Array.isArray(ids)) return [...fallback];
  const allowed = new Set(ids.map((value) => Number(value)));
  return SUPPORTED_BANK_IDS.filter((id) => allowed.has(id));
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

const normalizeScenarioName = (value) =>
  String(value || "")
    .replaceAll("מיחזור", "מחזור")
    .replace(/\s+/g, " ")
    .trim();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value) => {
  const num = toNumber(value);
  if (num === null) return "—";
  return `₪${Math.round(num).toLocaleString("he-IL")}`;
};

const formatDecimal = (value) => {
  const num = toNumber(value);
  if (num === null) return "—";
  return Number(num).toLocaleString("he-IL", { maximumFractionDigits: 2 });
};


const MortgageCyclePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedResult = useMemo(() => loadMortgageCycleResult(), []);
  const bankResponse = location.state?.bankResponse || storedResult;
  const calcResult = bankResponse?.extracted_json?.calculator_result;

  const handleAuthFailure = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    let isMounted = true;

    const syncPrimaryBankFlow = async (force = true) => {
      try {
        const visibilityResponse = await fetchBankVisibilityMeCached(token, { force });
        if (visibilityResponse.status === 401 || visibilityResponse.status === 403) {
          handleAuthFailure();
          return;
        }
        const allowedBankIds = visibilityResponse.ok
          ? normalizeAllowedBankIds(visibilityResponse.data?.allowed_bank_ids, [])
          : [];
        if (!allowedBankIds.length) return;

        const allowedBankSet = new Set(allowedBankIds);
        let hasApprovalOffers = false;
        try {
          const bankResponsesResponse = await fetchBankResponsesMeCached(token, { force });
          if (bankResponsesResponse.status === 401 || bankResponsesResponse.status === 403) {
            handleAuthFailure();
            return;
          }
          if (bankResponsesResponse.ok) {
            const relevantResponses = (Array.isArray(bankResponsesResponse.data) ? bankResponsesResponse.data : [])
              .filter((response) => {
                const bankId = Number(response?.bank_id);
                if (!Number.isFinite(bankId) || !allowedBankSet.has(bankId)) {
                  return false;
                }
                return true;
              });
            hasApprovalOffers = relevantResponses
              .some((response) => {
                const responseCalcResult = response?.extracted_json?.calculator_result;
                return isApprovalOfferResult(responseCalcResult);
              });
          }
        } catch {
          // If responses fail to load, keep waiting-page fallback.
        }

        if (!isMounted) return;
        navigate(hasApprovalOffers ? "/viewoffer" : "/homebeforeapproval2", { replace: true });
      } catch {
        // Keep the current page as fallback.
      }
    };

    void syncPrimaryBankFlow(true);

    const handleWindowFocus = () => {
      void syncPrimaryBankFlow(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void syncPrimaryBankFlow(true);
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleAuthFailure, navigate]);

  const bankMortgageData = useMemo(
    () => buildBankMortgageData(bankResponse),
    [bankResponse]
  );

  const routesFromCurrentMortgage = useMemo(() => {
    const tracks =
      bankResponse?.extracted_json?.calculator_result?.detailed_scenarios?.["משכנתא נוכחית"]?.tracks;
    if (!Array.isArray(tracks) || tracks.length === 0) return [];

    const formatCurrency = (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return '—';
      return `₪${Math.round(num).toLocaleString('he-IL')}`;
    };

    const formatRate = (value) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return '—';
      return `${num.toFixed(2).replace(/\.00$/, '')}%`;
    };

    return tracks.map((track, index) => {
      const amount = Number(
        track?.["סכום"] ??
        track?.amount ??
        track?.loan_value ??
        0
      );
      const months = Number(
        track?.["תקופה_חודשים"] ??
        track?.["תקופה (חודשים)"] ??
        track?.months
      );
      return {
        name:
          track?.["מסלול"] ||
          track?.["סוג_מסלול"] ||
          track?.name ||
          `מסלול ${index + 1}`,
        interest: formatRate(track?.["ריבית"] ?? track?.rate),
        balance: formatCurrency(amount),
        amount: Number.isFinite(amount) ? amount : 0,
        months: Number.isFinite(months) ? months : null,
      };
    });
  }, [bankResponse]);

  const bestNameRaw = useMemo(
    () => String(calcResult?.best_res?.name || "").trim(),
    [calcResult]
  );

  const selectedScenarioName = useMemo(() => {
    const scenarios = calcResult?.detailed_scenarios;
    if (!scenarios || typeof scenarios !== "object") return null;
    const scenarioNames = Object.keys(scenarios);
    if (!scenarioNames.length) return null;

    if (bestNameRaw && scenarios[bestNameRaw]) {
      return bestNameRaw;
    }

    const normalized = normalizeScenarioName(bestNameRaw);
    if (normalized && scenarios[normalized]) {
      return normalized;
    }

    const findScenarioByKeyword = (keyword) =>
      scenarioNames.find((name) => name.includes(keyword)) || null;

    const mappedFromBest =
      (normalized.includes("אופטימ") && findScenarioByKeyword("אופטימ")) ||
      (normalized.includes("מעודכ") && findScenarioByKeyword("מעודכ")) ||
      ((normalized.includes("לא צמוד") || normalized.includes("לא-צמוד")) &&
        findScenarioByKeyword("לא צמוד")) ||
      ((normalized.includes("מחזור") || normalized.includes("מיחזור")) &&
        findScenarioByKeyword("מחזור")) ||
      null;

    if (mappedFromBest && mappedFromBest !== "משכנתא נוכחית") {
      return mappedFromBest;
    }

    const optimalScenario =
      findScenarioByKeyword("מחזור אופטימלי") ||
      findScenarioByKeyword("אופטימ");
    if (optimalScenario && optimalScenario !== "משכנתא נוכחית") {
      return optimalScenario;
    }

    return scenarioNames.find((name) => name !== "משכנתא נוכחית") || null;
  }, [bestNameRaw, calcResult]);

  const comparisonRow = useMemo(() => {
    const table = Array.isArray(calcResult?.comparison_table) ? calcResult.comparison_table : [];
    if (!table.length) return null;

    const findByScenarioName = (scenarioName) => {
      if (!scenarioName) return null;
      const exact = table.find((row) => String(row?.["תרחיש"] || "").trim() === scenarioName);
      if (exact) return exact;
      const normalizedTarget = normalizeScenarioName(scenarioName);
      return (
        table.find(
          (row) => normalizeScenarioName(row?.["תרחיש"]) === normalizedTarget
        ) || null
      );
    };

    return (
      findByScenarioName(bestNameRaw) ||
      findByScenarioName(selectedScenarioName) ||
      table[3] ||
      null
    );
  }, [bestNameRaw, calcResult, selectedScenarioName]);

  const totalSavingsDisplay = useMemo(
    () => formatCurrency(comparisonRow?.["חיסכון ₪"]),
    [comparisonRow]
  );

  const savingsListData = useMemo(
    () => [
      {
        id: 1,
        label: "חיסכון חודשי",
        value: formatCurrency(comparisonRow?.["חיסכון חודשי ממוצע"]),
      },
      {
        id: 2,
        label: "חיסכון באחוזים",
        value: "—",
      },
      {
        id: 3,
        label: "החזר חודשי צפוי",
        value: formatCurrency(comparisonRow?.["החזר חודשי מקסימלי"]),
      },
      {
        id: 4,
        label: "החזר לשקל:",
        value: formatDecimal(comparisonRow?.["החזר לשקל"]),
      },
    ],
    [comparisonRow]
  );

  const savingsByYearsData = useMemo(() => {
    const savingsGraph = calcResult?.best_res?.["גרף חיסכון בשנים"];
    const years = Array.isArray(savingsGraph?.["שנים"]) ? savingsGraph["שנים"] : [];
    const savings = Array.isArray(savingsGraph?.["חיסכון"]) ? savingsGraph["חיסכון"] : [];
    const len = Math.max(years.length, savings.length);
    if (!len) return [];

    const result = [];
    for (let i = 0; i < len; i += 1) {
      const yearValue = years[i] ?? i + 1;
      const savingValue = Number(savings[i]);
      result.push({
        year: String(yearValue),
        value: Number.isFinite(savingValue) ? savingValue : 0,
      });
    }
    return result;
  }, [calcResult]);

  const mortgageCycleData = useMemo(() => {
    const scenarios = calcResult?.detailed_scenarios;
    if (!scenarios || typeof scenarios !== "object") return [];

    const currentGraph = scenarios["משכנתא נוכחית"]?.combined_graph;
    const selectedGraph = selectedScenarioName
      ? scenarios[selectedScenarioName]?.combined_graph
      : null;

    const currentMonths = Array.isArray(currentGraph?.months) ? currentGraph.months : [];
    const currentPayments = Array.isArray(currentGraph?.payments) ? currentGraph.payments : [];
    const selectedMonths = Array.isArray(selectedGraph?.months) ? selectedGraph.months : [];
    const selectedPayments = Array.isArray(selectedGraph?.payments) ? selectedGraph.payments : [];

    const maxLen = Math.max(currentPayments.length, selectedPayments.length);
    if (!maxLen) return [];

    const chart = [];
    for (let i = 0; i < maxLen; i += 1) {
      const monthValue =
        Number(selectedMonths[i]) ||
        Number(currentMonths[i]) ||
        i + 1;
      chart.push({
        name: String(monthValue),
        rivit: Number(currentPayments[i]) || 0,
        keren: Number(selectedPayments[i]) || 0,
      });
    }
    return chart;
  }, [calcResult, selectedScenarioName]);
	
  return (
    <div className="mortgage_cycle_page">
      {/* <a href="/recycle-loan" className="prev_page_link"><img src={prevIcon} alt="" /></a> */}
      <h1>בדיקת מחזור משכנתא</h1>
      <div className="check_nav d_flex d_flex_ac d_flex_jc">
        <span className="number">1</span>
        <span className="title">תוצאות</span>
      </div>
      <div className="wrapper d_flex d_flex_jb d_flex_as">
        <div className="congratulation d_flex d_flex_ac">
          <div className="img"><img src={congoIcon} alt="" /></div>
          <div className="text">
            <h3>ברכות</h3>
            <p>מצאנו בשבילך חיסכון <br/> משמעותי במשכנתא</p>
          </div>
        </div>
        <div className="right_col">
          <BankMortgage data={bankMortgageData} />
          <RoutesBankMortgage
            color={bankMortgageData?.color || "#4E8FF7"}
            routes={routesFromCurrentMortgage}
            maxVisibleRoutes={5}
            expandLabel="לצפיה בכל המסלולים"
            collapseLabel="הסתר מסלולים"
          />
          <div className="comparison_graph">
            {/* <ReturnsChart charttitle={'גרף השוואה'} interest={'משכנתא נוכחית'} fund={'משכנתא לאחר מחזור'} /> */}
            <ReturnsChart 
              charttitle={'גרף השוואה'} 
              interest={'משכנתא נוכחית'} 
              fund={selectedScenarioName || 'משכנתא לאחר מחזור'} 
              dataSets={mortgageCycleData}
            />
          </div>
        </div>
        <div className="left_col">
          <div className="total_savings_box">
            <div className="box">
              <h4>חיסכון כולל:</h4>
              <h2>{totalSavingsDisplay}</h2>
              <img src={offerman} className="mobile_img" alt="" />
            </div>
            <p>זה הסכום שתחסכו עד סוף תקופת המשכנתא.</p>
            <Link to="/schedulemeetings" className="btn"> 
              <em className="desktop_img">למחזור משכנתא לחץ כאן</em>
              <em className="mobile_img">לתיאום שיחת מחזור משכנתא לחץ כאן</em>
            </Link>
            <span>השיחה ללא עלות וללא התחייבות</span>
          </div>
          <SavingsList data={savingsListData} />
          <div className="barchart_sec">
            <h3>חיסכון לפי שנים</h3>
            <BarChartsavings data={savingsByYearsData} />
          </div>
        </div>
      </div>
    </div>  
  );
};

export default MortgageCyclePage;
