
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import '../components/newmortgagecomponents/newmortgagepage.css';
import HomeImage from '../assets/images/h_img1.png';
import offer_i from '../assets/images/offer_i.png';
import robin_man from '../assets/images/robin_man.png';


import RoutesExplanation from '../components/newmortgagecomponents/RoutesExplanation';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import StatusSummary from '../components/commoncomponents/StatusSummary';
import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";
import { useNavState } from "../context/NavStateContext";

const BANK_LOGOS = {
  hapoalim: "/banks/hapoalim.png",
  leumi: "/banks/leumi.png",
  mizrahi: "/banks/mizrahi.png",
  discount: "/banks/discount.png",
  international: "/banks/international.png",
  mercantile: "/banks/mercantile.png",
};

const BANK_LIST = [
  { id: 3, bankLogo: BANK_LOGOS.hapoalim, bankName: "בנק הפועלים" },
  { id: 2, bankLogo: BANK_LOGOS.leumi, bankName: "בנק לאומי" },
  { id: 1, bankLogo: BANK_LOGOS.mizrahi, bankName: "בנק מזרחי טפחות" },
  { id: 4, bankLogo: BANK_LOGOS.discount, bankName: "בנק דיסקונט" },
  { id: 8, bankLogo: BANK_LOGOS.international, bankName: "בנק הבינלאומי" },
  { id: 12, bankLogo: BANK_LOGOS.mercantile, bankName: "בנק מרכנתיל" },
];
const DEFAULT_BANK_IDS = BANK_LIST.map((bank) => bank.id);

const BANK_META_BY_ID = {
  1: { name: "בנק מזרחי טפחות", logo: "/banks/mizrahi.png", color: "#F5821F" },
  2: { name: "בנק לאומי", logo: "/banks/leumi.png", color: "#007BFF" },
  3: { name: "בנק הפועלים", logo: "/banks/hapoalim.png", color: "#D92D20" },
  4: { name: "בנק דיסקונט", logo: "/banks/discount.png", color: "#27450E" },
  8: { name: "בנק הבינלאומי", logo: "/banks/international.png", color: "#FDB726" },
  12: { name: "בנק מרכנתיל", logo: "/banks/mercantile.png", color: "#27450E" },
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
};

const formatCurrency = (value) => {
  const num = toNumber(value);
  if (!Number.isFinite(num)) return '—';
  return `₪${num.toLocaleString('he-IL')}`;
};

const formatPercent = (value) => {
  const num = toNumber(value);
  if (!Number.isFinite(num)) return null;
  const normalized = Math.round(num * 10) / 10;
  return `${normalized.toString().replace(/\.0$/, '')}%`;
};

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

const mapRoutesFromResponse = (response) => {
  const calc = response?.extracted_json?.calculator_result || null;
  const tracksDetail =
    calc?.proposed_mix?.tracks_detail ||
    calc?.optimal_mix?.tracks_detail ||
    null;

  if (!Array.isArray(tracksDetail) || tracksDetail.length === 0) return [];

  const mappedTracks = tracksDetail.map((track) => {
    const amount = toNumber(
      track?.['סכום'] ??
      track?.amount ??
      track?.loan_value ??
      track?.balance
    ) || 0;
    const rawPercent = toNumber(
      track?.['אחוז'] ??
      track?.['אחוז מסכום ההלוואה'] ??
      track?.percentage ??
      track?.['שיעור']
    );
    const rawInterest = toNumber(
      track?.['ריבית'] ??
      track?.['שיעור_ריבית'] ??
      track?.['ריבית שנתית'] ??
      track?.interest ??
      track?.rate
    );
    const rawMonthlyPayment = toNumber(
      track?.['החזר_חודשי'] ??
      track?.monthly_payment ??
      track?.payment
    );
    const months = toNumber(
      track?.['תקופה_חודשים'] ??
      track?.['תקופה (חודשים)'] ??
      track?.months
    );
    const name =
      track?.['סוג_מסלול'] ||
      track?.['שם'] ||
      track?.['מסלול'] ||
      track?.loan_type_name ||
      'מסלול';
    return {
      name,
      amount,
      rawPercent,
      rawInterest,
      rawMonthlyPayment,
      months,
    };
  });

  const total = mappedTracks.reduce((sum, item) => sum + item.amount, 0);
  return mappedTracks.map((item) => ({
    name: item.name,
    amount: item.amount,
    months: item.months,
    percentage: formatPercent(
      item.rawPercent !== null
        ? item.rawPercent
        : total
          ? (item.amount / total) * 100
          : 0
    ) || '0%',
    interest: formatPercent(item.rawInterest) || '—',
    balance: formatCurrency(item.rawMonthlyPayment ?? item.amount),
  }));
};

const getSummaryTotalPayments = (response) => {
  const calc = response?.extracted_json?.calculator_result || null;
  return toNumber(
    calc?.proposed_mix?.summary?.['סהכ_החזר_משוער'] ??
    calc?.proposed_mix?.metrics?.['סהכ_החזר_משוער'] ??
    calc?.optimal_mix?.metrics?.['סהכ_החזר_משוער'] ??
    calc?.proposed_mix?.summary?.['סך הכל החזר משוער'] ??
    calc?.proposed_mix?.summary?.total_repayment ??
    calc?.proposed_mix?.metrics?.total_repayment
  );
};

const getTotalSavings = (response) => {
  const calc = response?.extracted_json?.calculator_result || null;
  return toNumber(
    calc?.savings?.total_savings ??
    calc?.savings?.['total_savings']
  );
};

const buildChartDataFromGraph = (graph) => {
  if (!graph || typeof graph !== 'object') return null;
  const months = Array.isArray(graph.months) ? graph.months : [];
  const interest = Array.isArray(graph.interest_payment) ? graph.interest_payment : [];
  const principal = Array.isArray(graph.principal_repayment) ? graph.principal_repayment : [];
  const length = Math.min(months.length || 0, interest.length || 0, principal.length || 0);
  if (length === 0) return null;

  const byYear = {};
  for (let i = 0; i < length; i += 1) {
    const monthValue = Number(months[i]) || i + 1;
    const yearIndex = Math.floor((monthValue - 1) / 12) + 1;
    const monthInYear = ((monthValue - 1) % 12) + 1;
    if (!byYear[yearIndex]) {
      byYear[yearIndex] = [];
    }
    byYear[yearIndex].push({
      name: String(monthInYear),
      rivit: Number(interest[i]) || 0,
      keren: Number(principal[i]) || 0,
    });
  }
  return byYear;
};

const getChartDataFromResponse = (response) => {
  const graphData = response?.extracted_json?.calculator_result?.proposed_mix?.graph_data || null;
  return buildChartDataFromGraph(graphData);
};

const MortgagePage = () => {
  const location = useLocation();
  const { userData } = useCustomerProfile();
  const { bankResponses, bankVisibility, isLoaded: navStateLoaded } = useNavState();
  const displayName = getCustomerDisplayName(userData, "לרובין");
  const selectedBankId = useMemo(() => {
    const params = new URLSearchParams(location.search || "");
    const bankId = Number(params.get("bankId"));
    if (Number.isInteger(bankId) && BANK_META_BY_ID[bankId]) {
      return bankId;
    }
    return 3;
  }, [location.search]);
  const selectedBank = useMemo(() => {
    return BANK_META_BY_ID[selectedBankId] || BANK_META_BY_ID[3];
  }, [selectedBankId]);
  const allowedBankIds = useMemo(
    () => normalizeAllowedBankIds(bankVisibility, DEFAULT_BANK_IDS),
    [bankVisibility]
  );
  const approvedBanks = useMemo(() => {
    if (!navStateLoaded || allowedBankIds.length === 0) return [];
    const known = BANK_LIST.filter((bank) => allowedBankIds.includes(bank.id));
    const knownIds = new Set(known.map((bank) => bank.id));
    const extras = allowedBankIds
      .filter((id) => !knownIds.has(id))
      .map((id) => ({
        id,
        bankLogo: '',
        bankName: `בנק ${id}`,
      }));
    return [...known, ...extras];
  }, [allowedBankIds, navStateLoaded]);
  const allowedBankIdsSet = useMemo(() => new Set(allowedBankIds), [allowedBankIds]);
  const approvalBankResponses = useMemo(() => {
    const safeResponses = Array.isArray(bankResponses) ? bankResponses : [];
    return safeResponses.filter((response) => {
      const calcResult = response?.extracted_json?.calculator_result;
      return isApprovalOfferResult(calcResult);
    });
  }, [bankResponses]);
  const visibleBankResponses = useMemo(() => {
    if (!allowedBankIds.length || !approvalBankResponses.length) return [];
    return approvalBankResponses.filter((response) => {
      const bankId = Number(response?.bank_id);
      return Number.isFinite(bankId) && allowedBankIdsSet.has(bankId);
    });
  }, [allowedBankIds.length, allowedBankIdsSet, approvalBankResponses]);
  const offerBankIdsSet = useMemo(() => {
    const ids = visibleBankResponses
      .map((item) => Number(item?.bank_id))
      .filter((id) => Number.isFinite(id));
    return new Set(ids);
  }, [visibleBankResponses]);
  const bestOffer = useMemo(() => {
    if (!visibleBankResponses.length) return null;
    const latestByBank = new Map();
    visibleBankResponses.forEach((response) => {
      const bankId = Number(response?.bank_id);
      if (!Number.isFinite(bankId)) return;
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

    let best = null;
    latestByBank.forEach((response, bankId) => {
      const savings = getTotalSavings(response);
      if (savings === null) return;
      if (!best || savings > best.savings) {
        const bankMeta = approvedBanks.find((bank) => bank.id === bankId);
        best = {
          bankId,
          savings,
          bankName: bankMeta?.bankName || `בנק ${bankId}`,
        };
      }
    });
    return best;
  }, [approvedBanks, visibleBankResponses]);
  const statusData = useMemo(() => ({
    title: "ריכוז הסטטוסים שלי",
    offertext: bestOffer?.bankName ? `ההצעה המשתלמת ביותר: ${bestOffer.bankName}` : '',
    list: approvedBanks.map((bank) => {
      const hasOffer = offerBankIdsSet.has(bank.id);
      return {
        bankLogo: bank.bankLogo,
        bankName: bank.bankName,
        statusText: hasOffer ? "אישור עקרוני" : "ממתין לאישור עקרוני",
        statusClass: hasOffer ? "final_approval" : "awaiting_approval",
        link: hasOffer
          ? `/suggestionspage?bankId=${bank.id}`
          : `/homebeforeapproval?bankId=${bank.id}&status=sent`,
      };
    }),
  }), [approvedBanks, offerBankIdsSet, bestOffer?.bankName]);
  const selectedBankResponse = useMemo(() => {
    const safeResponses = visibleBankResponses.length > 0
      ? visibleBankResponses
      : approvalBankResponses;
    const byBank = safeResponses.filter(
      (item) => Number(item?.bank_id) === selectedBankId
    );
    if (byBank.length === 0) return null;
    return byBank.reduce((latest, current) => {
      if (!latest) return current;
      const prevDate = new Date(latest?.uploaded_at || 0).getTime();
      const nextDate = new Date(current?.uploaded_at || 0).getTime();
      return nextDate >= prevDate ? current : latest;
    }, null);
  }, [approvalBankResponses, selectedBankId, visibleBankResponses]);
  const selectedBankRoutes = useMemo(
    () => mapRoutesFromResponse(selectedBankResponse),
    [selectedBankResponse]
  );
  const selectedBankTotalPayments = useMemo(
    () => getSummaryTotalPayments(selectedBankResponse),
    [selectedBankResponse]
  );
  const selectedBankTotalSavings = useMemo(
    () => getTotalSavings(selectedBankResponse),
    [selectedBankResponse]
  );
  const selectedBankChartData = useMemo(
    () => getChartDataFromResponse(selectedBankResponse),
    [selectedBankResponse]
  );

  return (
    <div className="mortgagepage">
      <div className="das_top_title">
        <h1>ברוכים הבאים, {displayName}</h1>
        <h2>הבנק שנבחר לצורך המשכנתא</h2>
        <div className="bank_title">
          <span className="bank_logo_icon">
            <img src={selectedBank.logo} alt={selectedBank.name} />
          </span>
          <h3>{selectedBank.name}</h3>
        </div>
      </div>
      <div className="wrapper d_flex">
        <img src={HomeImage} className="homeimage" alt="" />
          <div className="right_col">
            <RoutesExplanation
              color={selectedBank.color}
              routes={selectedBankRoutes}
              totalPayments={selectedBankTotalPayments}
            />
            {/* <ReturnsChart charttitle={'החזרים'} interest={'ריבית'} fund={'קרן'} /> */}
            {selectedBankChartData ? (
              <ReturnsChart
                charttitle={'החזרים'}
                interest={'ריבית'}
                fund={'קרן'}
                dataSets={selectedBankChartData}
                kerenColor={"#27450E"}
                rivitColor={"#E4061F"}
              />
            ) : null}
          </div>
          <div className="left_col">
              <div className="offer_box">
                <img src={robin_man} className="robin_man" alt="" />
                <div className="offer_col">
                  <img src={offer_i} alt="" />
                  <h4>ההצעה זו חסכה לך:</h4>
                  <h5>
                    {Number.isFinite(selectedBankTotalSavings)
                      ? (
                        <>
                          <em>₪</em>
                          {Math.round(selectedBankTotalSavings).toLocaleString('he-IL')}
                        </>
                      )
                      : '—'}
                  </h5>
                </div>
              </div>
              <StatusSummary statusData={statusData} />
          </div>
      </div>
    </div>
  );
};

export default MortgagePage;
