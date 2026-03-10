// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../components/mortgagecyclecomponents/MortgageCyclepage.css';

import congoIcon from '../assets/images/congrats_icon.png';
import offerman from '../assets/images/offer_man.png';

// page components
import BankMortgage from '../components/mortgagecyclecomponents/BankMortgage';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import SavingsList from '../components/mortgagecyclecomponents/SavingsList';
import BarChartsavings from '../components/mortgagecyclecomponents/BarChartsavings';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import ScheduleMeetingsModal from "../components/schedulemeetingscomponents/ScheduleMeetingsModal";
import {
  buildBankMortgageData,
  getCalculatorResult,
  getLatestMortgageCycleResponse,
  loadMortgageCycleResult,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { useNavState } from "../context/NavStateContext";
import {
  fetchBankResponsesMeCached,
  fetchBankVisibilityMeCached,
} from "../utils/authGetCache";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";
import { loadUpcomingBookedMeeting } from "../utils/meetingBookingStorage";

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

const getComparisonScenarioName = (row) =>
  String(row?.["תרחיש"] ?? row?.Scenario ?? "").trim();

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

const formatPercent = (value) => {
  const num = toNumber(value);
  if (num === null) return "—";
  return `${Number(num).toLocaleString("he-IL", { maximumFractionDigits: 2 })}%`;
};


const MortgageCyclePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bankResponses: navBankResponses, isLoaded: navStateLoaded } = useNavState();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [bookedMeeting, setBookedMeeting] = useState(() => loadUpcomingBookedMeeting());
  const storedResult = useMemo(() => loadMortgageCycleResult(), []);
  const fallbackNavBankResponse = useMemo(
    () => getLatestMortgageCycleResponse(navBankResponses),
    [navBankResponses]
  );
  const bankResponse =
    location.state?.bankResponse ||
    storedResult ||
    fallbackNavBankResponse ||
    null;
  const calcResult = getCalculatorResult(bankResponse);

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

  useEffect(() => {
    if (!isScheduleModalOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    const closeOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsScheduleModalOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEsc);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [isScheduleModalOpen]);

  useEffect(() => {
    const syncBookedMeeting = () => {
      setBookedMeeting(loadUpcomingBookedMeeting());
    };

    syncBookedMeeting();
    window.addEventListener("focus", syncBookedMeeting);
    window.addEventListener("storage", syncBookedMeeting);

    return () => {
      window.removeEventListener("focus", syncBookedMeeting);
      window.removeEventListener("storage", syncBookedMeeting);
    };
  }, []);

  useEffect(() => {
    if (!bankResponse) return;
    if (location.state?.bankResponse || storedResult) return;
    saveMortgageCycleResult(bankResponse);
  }, [bankResponse, location.state?.bankResponse, storedResult]);

  const bankMortgageData = useMemo(
    () => buildBankMortgageData(bankResponse),
    [bankResponse]
  );

  const routesFromCurrentMortgage = useMemo(() => {
    const scenarios = bankResponse?.extracted_json?.calculator_result?.detailed_scenarios;
    const currentScenario =
      scenarios?.Current_Mortgage ||
      scenarios?.["משכנתא נוכחית"] ||
      null;
    const tracks = currentScenario?.tracks;
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
        track?.Amount ??
        track?.["סכום"] ??
        track?.amount ??
        track?.loan_value ??
        0
      );
      const months = Number(
        track?.Term_Months ??
        track?.["תקופה_חודשים"] ??
        track?.["תקופה (חודשים)"] ??
        track?.months
      );
      return {
        name:
          track?.Track ||
          track?.["מסלול"] ||
          track?.["סוג_מסלול"] ||
          track?.name ||
          `מסלול ${index + 1}`,
        interest: formatRate(track?.Interest ?? track?.["ריבית"] ?? track?.rate),
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
      scenarioNames.find((name) => name.toLowerCase().includes(keyword.toLowerCase())) || null;

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
      findScenarioByKeyword("Optimal_Refinance_Mortgage") ||
      findScenarioByKeyword("optimal") ||
      findScenarioByKeyword("מחזור אופטימלי") ||
      findScenarioByKeyword("אופטימ");
    if (
      optimalScenario &&
      optimalScenario !== "משכנתא נוכחית" &&
      optimalScenario !== "Current_Mortgage"
    ) {
      return optimalScenario;
    }

    return (
      scenarioNames.find(
        (name) => name !== "משכנתא נוכחית" && name !== "Current_Mortgage"
      ) || null
    );
  }, [bestNameRaw, calcResult]);

  const comparisonRow = useMemo(() => {
    const table = Array.isArray(calcResult?.comparison_table) ? calcResult.comparison_table : [];
    if (!table.length) return null;

    const findByScenarioName = (scenarioName) => {
      if (!scenarioName) return null;
      const exact = table.find((row) => getComparisonScenarioName(row) === scenarioName);
      if (exact) return exact;
      const normalizedTarget = normalizeScenarioName(scenarioName);
      return (
        table.find(
          (row) => normalizeScenarioName(getComparisonScenarioName(row)) === normalizedTarget
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
    () => formatCurrency(comparisonRow?.["חיסכון ₪"] ?? comparisonRow?.Savings_NIS),
    [comparisonRow]
  );

  const bookedMeetingButtonText = useMemo(() => {
    if (!bookedMeeting?.start_at) return "";
    const startAt = new Date(bookedMeeting.start_at);
    if (!Number.isFinite(startAt.getTime())) return "";

    const dateLabel = new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(startAt);
    const timeLabel = new Intl.DateTimeFormat("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(startAt);

    return `נקבעה פגישה בתאריך ${dateLabel} בשעה ${timeLabel}`;
  }, [bookedMeeting]);

  const savingsListData = useMemo(
    () => [
      {
        id: 1,
        label: "חיסכון חודשי",
        value: formatCurrency(
          comparisonRow?.["חיסכון חודשי ממוצע"] ?? comparisonRow?.Average_Monthly_Savings
        ),
      },
      {
        id: 2,
        label: "חיסכון באחוזים",
        value: formatPercent(comparisonRow?.internal_rate_of_return),
      },
      {
        id: 3,
        label: "החזר חודשי צפוי",
        value: formatCurrency(
          comparisonRow?.["החזר חודשי מקסימלי"] ??
          comparisonRow?.First_Monthly_Payment
        ),
      },
      {
        id: 4,
        label: "החזר לשקל:",
        value: formatDecimal(comparisonRow?.["החזר לשקל"] ?? comparisonRow?.Return_per_NIS),
      },
    ],
    [comparisonRow]
  );

  const savingsByYearsData = useMemo(() => {
    const savingsGraph =
      calcResult?.best_res?.Savings_Graph_By_Years ||
      calcResult?.best_res?.["גרף חיסכון בשנים"];
    const years = Array.isArray(savingsGraph?.Years)
      ? savingsGraph.Years
      : Array.isArray(savingsGraph?.["שנים"])
        ? savingsGraph["שנים"]
        : [];
    const savings = Array.isArray(savingsGraph?.Savings)
      ? savingsGraph.Savings
      : Array.isArray(savingsGraph?.["חיסכון"])
        ? savingsGraph["חיסכון"]
        : [];
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
    if (!scenarios || typeof scenarios !== "object") return null;

    const currentGraph =
      scenarios?.Current_Mortgage?.combined_graph ||
      scenarios?.["משכנתא נוכחית"]?.combined_graph ||
      null;
    const selectedGraph = selectedScenarioName
      ? scenarios[selectedScenarioName]?.combined_graph
      : null;

    const currentMonths = Array.isArray(currentGraph?.months) ? currentGraph.months : [];
    const currentPayments = Array.isArray(currentGraph?.payments) ? currentGraph.payments : [];
    const selectedMonths = Array.isArray(selectedGraph?.months) ? selectedGraph.months : [];
    const selectedPayments = Array.isArray(selectedGraph?.payments) ? selectedGraph.payments : [];

    const maxLen = Math.max(currentPayments.length, selectedPayments.length);
    if (!maxLen) return null;

    const chartByYear = {};
    for (let i = 0; i < maxLen; i += 1) {
      const monthValue =
        Number(selectedMonths[i]) ||
        Number(currentMonths[i]) ||
        i + 1;

      const yearIndex = Math.floor((monthValue - 1) / 12) + 1;
      const monthInYear = ((monthValue - 1) % 12) + 1;

      if (!chartByYear[yearIndex]) {
        chartByYear[yearIndex] = [];
      }

      chartByYear[yearIndex].push({
        name: String(monthInYear),
        rivit: Number(currentPayments[i]) || 0,
        keren: Number(selectedPayments[i]) || 0,
      });
    }

    return Object.keys(chartByYear).length ? chartByYear : null;
  }, [calcResult, selectedScenarioName]);

  if (!bankResponse && !navStateLoaded) {
    return null;
  }
	
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
              variant="stacked-bars"
              rivitColor={"#E27600"}
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
            <button
              type="button"
              className="btn"
              onClick={() => setIsScheduleModalOpen(true)}
            >
              {bookedMeetingButtonText ? (
                <>
                  <em className="desktop_img">
                    {bookedMeetingButtonText}
                    <br />
                    לחץ כדי לשנות
                  </em>
                  <em className="mobile_img">
                    {bookedMeetingButtonText}
                    <br />
                    לחץ כדי לשנות
                  </em>
                </>
              ) : (
                <>
                  <em className="desktop_img">למחזור משכנתא לחץ כאן</em>
                  <em className="mobile_img">לתיאום שיחת מחזור משכנתא לחץ כאן</em>
                </>
              )}
            </button>
            <span>השיחה ללא עלות וללא התחייבות</span>
          </div>
          <SavingsList data={savingsListData} />
          <div className="barchart_sec">
            <h3>חיסכון לפי שנים</h3>
            <BarChartsavings data={savingsByYearsData} />
          </div>
        </div>
      </div>
      <ScheduleMeetingsModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onBooked={() => setBookedMeeting(loadUpcomingBookedMeeting())}
        titleId="schedule-meetings-modal-title"
        contentVariant="refinance"
      />
    </div>  
  );
};

export default MortgageCyclePage;
