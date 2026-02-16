const STORAGE_KEY = "mortgage_cycle_result";

const BANK_LABELS = {
  1: "מזרחי",
  2: "לאומי",
  3: "הפועלים",
  4: "דיסקונט",
  8: "הבינלאומי",
  12: "מרכנתיל",
};

const LOAN_TYPE_LABELS = {
  1: "פריים",
  2: 'קל"צ',
  3: 'ק"צ',
  4: 'מ"לצ',
  5: 'מ"צ',
  6: "מטח דולר",
  7: "מטח יורו",
  8: 'מק"מ',
  9: "זכאות",
  11: "מענק",
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toOptionalNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const formatCurrency = (value) => {
  const num = toOptionalNumber(value);
  if (num === null) {
    return "—";
  }
  return `₪${new Intl.NumberFormat("he-IL").format(Math.round(num))}`;
};

const formatPercent = (value) => {
  const num = toOptionalNumber(value);
  if (num === null) {
    return "—";
  }
  const formatted = num.toFixed(1).replace(/\.0$/, "");
  return `${formatted}%`;
};

const formatRate = (value) => {
  const num = toOptionalNumber(value);
  if (num === null) {
    return "—";
  }
  const formatted = num.toFixed(2).replace(/\.00$/, "");
  return `${formatted}%`;
};

const formatYears = (months) => {
  const num = toOptionalNumber(months);
  if (!num) {
    return "—";
  }
  return `${Math.round(num / 12)}`;
};

const sumBy = (items, getValue) =>
  items.reduce((sum, item) => sum + toNumber(getValue(item)), 0);

const getBankMeta = (payload) => {
  const bankId =
    payload?.bank_id ?? payload?.extracted_json?.data?.bank_id ?? null;
  const bankTitle = payload?.extracted_json?.data?.bank_title;
  const bankName =
    bankTitle ||
    BANK_LABELS[bankId] ||
    (bankId ? `בנק ${bankId}` : "—");
  return { bankId, bankName };
};

const getTracks = (payload) => {
  const tracks = payload?.extracted_json?.data?.tracks;
  return Array.isArray(tracks) ? tracks : [];
};

const getLoanTypeLabel = (loanType) =>
  LOAN_TYPE_LABELS[loanType] || `מסלול ${loanType ?? ""}`.trim();

export const saveMortgageCycleResult = (payload) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures (private mode, quota, etc.)
  }
};

export const loadMortgageCycleResult = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const getCalculatorResult = (payload) =>
  payload?.extracted_json?.calculator_result ?? null;

const SCENARIO_CURRENT = "משכנתא נוכחית";
const SCENARIO_OPTIMAL = "משכנתא מחזור אופטימלי";

const getComparisonTable = (calcResult) =>
  Array.isArray(calcResult?.comparison_table) ? calcResult.comparison_table : [];

const getDetailedScenarios = (calcResult) => {
  const scenarios = calcResult?.detailed_scenarios;
  if (scenarios && typeof scenarios === "object") {
    return scenarios;
  }
  return {};
};

const getComparisonRow = (calcResult, preferredNames) => {
  const table = getComparisonTable(calcResult);
  if (!table.length) {
    return null;
  }
  for (const name of preferredNames) {
    const row = table.find((item) => item?.["תרחיש"] === name);
    if (row) {
      return row;
    }
  }
  return null;
};

const getScenario = (calcResult, preferredNames) => {
  const scenarios = getDetailedScenarios(calcResult);
  for (const name of preferredNames) {
    const scenario = scenarios[name];
    if (scenario && typeof scenario === "object") {
      return scenario;
    }
  }
  return null;
};

const getRefinanceCurrentScenario = (calcResult) =>
  getScenario(calcResult, [SCENARIO_CURRENT]);

const getRefinanceOptimalScenario = (calcResult) =>
  getScenario(calcResult, [SCENARIO_OPTIMAL, "משכנתא אופטימלית"]);

const getRefinanceCurrentComparison = (calcResult) =>
  getComparisonRow(calcResult, [SCENARIO_CURRENT]);

const getRefinanceOptimalComparison = (calcResult) =>
  getComparisonRow(calcResult, [SCENARIO_OPTIMAL, "משכנתא אופטימלית"]);

const hasLegacyOffer = (calcResult) =>
  Array.isArray(calcResult?.optimal_mortgage_mix) &&
  calcResult.optimal_mortgage_mix.length > 0 &&
  Array.isArray(calcResult.optimal_mortgage_mix[0]);

export const isMortgageCycleCalculatorResultValid = (calcResult) => {
  if (!calcResult || typeof calcResult !== "object") {
    return false;
  }
  if (calcResult.error || calcResult.status_code) {
    return false;
  }
  const hasLegacyRefinance =
    Object.prototype.hasOwnProperty.call(calcResult, "frontend_data") ||
    hasLegacyOffer(calcResult);
  const hasRefinanceScenarios =
    getComparisonTable(calcResult).length > 0 ||
    Object.keys(getDetailedScenarios(calcResult)).length > 0;
  return hasLegacyRefinance || hasRefinanceScenarios;
};

export const hasCalculatorOffer = (calcResult) => {
  if (!isMortgageCycleCalculatorResultValid(calcResult)) {
    return false;
  }
  if (hasLegacyOffer(calcResult)) {
    return true;
  }
  const optimalComparison = getRefinanceOptimalComparison(calcResult);
  const savings = toOptionalNumber(optimalComparison?.["חיסכון ₪"]);
  if (savings !== null) {
    return savings > 0;
  }
  const optimalScenario = getRefinanceOptimalScenario(calcResult);
  return Array.isArray(optimalScenario?.tracks) && optimalScenario.tracks.length > 0;
};

const mapScenarioTrackToRoute = (track, totalAmount) => {
  const amount = toNumber(track?.["סכום"]);
  const percent = totalAmount ? (amount / totalAmount) * 100 : 0;
  return {
    name: track?.["מסלול"] || "—",
    percentage: formatPercent(percent),
    interest: formatRate(track?.["ריבית"]),
    balance: formatCurrency(amount),
  };
};

const getTrackOriginalAmount = (track) => {
  const original = toOptionalNumber(track?.original_loan_value);
  if (original !== null && original > 0) {
    return original;
  }
  return toNumber(track?.loan_value);
};

const getWeightedRateFromSnpvOriginalTracks = (tracks) => {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    return null;
  }
  const totalOriginal = tracks.reduce(
    (sum, track) => sum + getTrackOriginalAmount(track),
    0
  );
  if (!totalOriginal) {
    return null;
  }
  const weightedSum = tracks.reduce(
    (sum, track) => sum + toNumber(track?.loan_interest) * getTrackOriginalAmount(track),
    0
  );
  if (!weightedSum) {
    return null;
  }
  return weightedSum / totalOriginal;
};

const getWeightedRateFromScenarioTracks = (tracks, totalAmount) => {
  if (!Array.isArray(tracks) || tracks.length === 0 || !totalAmount) {
    return null;
  }
  const weightedSum = tracks.reduce(
    (sum, track) =>
      sum + toNumber(track?.["ריבית"]) * toNumber(track?.["סכום"]),
    0
  );
  if (!weightedSum) {
    return null;
  }
  return weightedSum / totalAmount;
};

export const buildMortgageDataFromOptimal = (payload) => {
  if (!payload) {
    return { mortgageData: null, hasData: false };
  }
  const calcResult = getCalculatorResult(payload);
  if (!hasCalculatorOffer(calcResult)) {
    return { mortgageData: null, hasData: false };
  }

  let totalAmount = 0;
  let maxMonths = 0;
  let totalPayments = 0;
  let firstPayment = 0;
  let maxPayment = 0;
  let totalInterestIndex = 0;
  let routesList = [];

  if (hasLegacyOffer(calcResult)) {
    const optimalMix = calcResult.optimal_mortgage_mix;
    const candidate = Array.isArray(optimalMix?.[0]) ? optimalMix[0] : [];
    totalAmount = sumBy(candidate, ([route]) => route?.["סכום"]);
    maxMonths = Math.max(
      0,
      ...candidate.map(([route]) => toNumber(route?.["תקופה (חודשים)"]))
    );
    totalPayments = toNumber(optimalMix?.[1]);
    firstPayment = toNumber(optimalMix?.[2]);
    maxPayment = toNumber(optimalMix?.[3]) || firstPayment;
    totalInterestIndex = sumBy(
      candidate,
      ([route]) => route?.['סה״כ ריבית והצמדה']
    );

    routesList = candidate.map(([route]) => {
      const amount = toNumber(route?.["סכום"]);
      const percent = totalAmount ? (amount / totalAmount) * 100 : 0;
      return {
        name: route?.["מסלול"] || "—",
        percentage: formatPercent(percent),
        interest: formatRate(route?.["ריבית"]),
        balance: formatCurrency(amount),
      };
    });
  } else {
    const optimalScenario = getRefinanceOptimalScenario(calcResult);
    const optimalComparison = getRefinanceOptimalComparison(calcResult);
    const optimalTracks = Array.isArray(optimalScenario?.tracks)
      ? optimalScenario.tracks
      : [];

    totalAmount =
      toNumber(optimalScenario?.summary?.total_principal) ||
      sumBy(optimalTracks, (track) => track?.["סכום"]) ||
      toNumber(payload?.amount);
    maxMonths = Math.max(
      0,
      ...optimalTracks.map((track) => toNumber(track?.["תקופה_חודשים"]))
    );
    totalPayments =
      toNumber(optimalScenario?.summary?.total_repayment) ||
      toNumber(optimalComparison?.["סך הכל תשלומים"]);
    firstPayment =
      toNumber(optimalScenario?.summary?.first_payment) ||
      toNumber(optimalComparison?.["החזר חודשי ראשון"]);
    maxPayment =
      toNumber(optimalScenario?.summary?.max_payment) ||
      toNumber(optimalComparison?.["החזר חודשי מקסימלי"]) ||
      firstPayment;
    totalInterestIndex = sumBy(
      optimalTracks,
      (track) => track?.["סהכ_ריבית_והצמדה"]
    );
    routesList = optimalTracks.map((track) =>
      mapScenarioTrackToRoute(track, totalAmount)
    );
  }

  const { bankName } = getBankMeta(payload);
  const mortgageData = {
    title: "המשכנתא החדשה שלך:",
    details: {
      bank: bankName,
      amount: formatCurrency(totalAmount),
      years: formatYears(maxMonths),
      firstMonthlyPayment: formatCurrency(firstPayment),
      maxMonthlyPayment: formatCurrency(maxPayment),
    },
    totalPayments: formatCurrency(totalPayments || totalAmount),
    note: {
      text: "הסבר על המסלולים",
    },
    routes: {
      headers: ["מסלולים", "ריבית", "יתרה"],
      list: routesList,
      totals: {
        indexLinked: formatCurrency(totalInterestIndex),
        overall: formatCurrency(totalAmount),
      },
    },
  };

  return { mortgageData, hasData: routesList.length > 0 };
};

export const buildMortgageDataFromTracks = (payload) => {
  if (!payload) {
    return { mortgageData: null, hasData: false };
  }
  const tracks = getTracks(payload);
  const calcResult = getCalculatorResult(payload);
  const frontendData = calcResult?.frontend_data || {};
  const currentScenario = getRefinanceCurrentScenario(calcResult);
  const currentComparison = getRefinanceCurrentComparison(calcResult);
  const currentScenarioTracks = Array.isArray(currentScenario?.tracks)
    ? currentScenario.tracks
    : [];

  if (tracks.length === 0 && currentScenarioTracks.length === 0) {
    return { mortgageData: null, hasData: false };
  }

  const hasSnpvTracks = tracks.length > 0;
  const totalAmount = hasSnpvTracks
    ? sumBy(tracks, (track) => track?.loan_value)
    : sumBy(currentScenarioTracks, (track) => track?.["סכום"]);
  const totalInflation = hasSnpvTracks
    ? sumBy(tracks, (track) => track?.loan_value_inflation)
    : sumBy(currentScenarioTracks, (track) => track?.["סהכ_ריבית_והצמדה"]);
  const maxMonths = hasSnpvTracks
    ? Math.max(0, ...tracks.map((track) => toNumber(track?.loan_years)))
    : Math.max(0, ...currentScenarioTracks.map((track) => toNumber(track?.["תקופה_חודשים"])));
  const fallbackTerm = toNumber(frontendData?.max_term);
  const firstPayment =
    toOptionalNumber(frontendData?.first_peyment) ??
    toOptionalNumber(currentScenario?.summary?.first_payment) ??
    toOptionalNumber(currentComparison?.["החזר חודשי ראשון"]);
  const maxMonthlyPayment =
    (hasSnpvTracks
      ? Math.max(0, ...tracks.map((track) => toNumber(track?.monthly_repayment)))
      : 0) ||
    toOptionalNumber(currentScenario?.summary?.max_payment) ||
    toOptionalNumber(currentComparison?.["החזר חודשי מקסימלי"]) ||
    firstPayment ||
    0;
  const refundPerShekel =
    toOptionalNumber(frontendData?.Refund_amount_per_shekel) ??
    toOptionalNumber(currentComparison?.["החזר לשקל"]);
  const totalPayments = refundPerShekel
    ? totalAmount * refundPerShekel
    : toNumber(currentScenario?.summary?.total_repayment) ||
      toNumber(currentComparison?.["סך הכל תשלומים"]);

  const routesList = hasSnpvTracks
    ? tracks.map((track) => {
        const amount = toNumber(track?.loan_value);
        const percent = totalAmount ? (amount / totalAmount) * 100 : 0;
        return {
          name: getLoanTypeLabel(track?.loan_type),
          percentage: formatPercent(percent),
          interest: formatRate(track?.loan_interest),
          balance: formatCurrency(amount),
        };
      })
    : currentScenarioTracks.map((track) =>
        mapScenarioTrackToRoute(track, totalAmount)
      );

  const { bankName } = getBankMeta(payload);
  const mortgageData = {
    title: "המשכנתא שלך:",
    details: {
      bank: bankName,
      amount: formatCurrency(totalAmount || payload?.amount),
      years: formatYears(maxMonths || fallbackTerm),
      firstMonthlyPayment: formatCurrency(firstPayment),
      maxMonthlyPayment: formatCurrency(maxMonthlyPayment || firstPayment),
    },
    totalPayments: formatCurrency(totalPayments || totalAmount),
    note: {
      text: "הסבר על המסלולים",
    },
    routes: {
      headers: ["מסלולים", "ריבית", "יתרה"],
      list: routesList,
      totals: {
        indexLinked: formatCurrency(totalInflation),
        overall: formatCurrency(totalAmount || payload?.amount),
      },
    },
  };

  return { mortgageData, hasData: routesList.length > 0 };
};

export const buildBankMortgageData = (payload) => {
  if (!payload) {
    return null;
  }
  const tracks = getTracks(payload);
  const calcResult = getCalculatorResult(payload);
  const currentScenario = getRefinanceCurrentScenario(calcResult);
  const currentComparison = getRefinanceCurrentComparison(calcResult);
  const currentScenarioTracks = Array.isArray(currentScenario?.tracks)
    ? currentScenario.tracks
    : [];
  const totalAmount = tracks.length
    ? sumBy(tracks, (track) => getTrackOriginalAmount(track))
    : sumBy(currentScenarioTracks, (track) => track?.["סכום"]) ||
      toNumber(payload?.amount);

  const outstandingBalance =
    toNumber(currentScenario?.summary?.total_principal) ||
    sumBy(tracks, (track) => track?.loan_value) ||
    sumBy(currentScenarioTracks, (track) => track?.["סכום"]) ||
    toNumber(payload?.amount);

  const firstPayment =
    toOptionalNumber(currentScenario?.summary?.first_payment) ??
    toOptionalNumber(currentComparison?.["החזר חודשי ראשון"]);

  const totalPayments =
    toNumber(currentScenario?.summary?.total_repayment) ||
    toNumber(currentComparison?.["סך הכל תשלומים"]);

  const refundPerShekel = toOptionalNumber(currentComparison?.["החזר לשקל"]);

  const weightedRate =
    getWeightedRateFromSnpvOriginalTracks(tracks) ??
    getWeightedRateFromScenarioTracks(currentScenarioTracks, outstandingBalance) ??
    toOptionalNumber(currentComparison?.internal_rate_of_return);

  const { bankName } = getBankMeta(payload);
  return {
    name: bankName,
    tag: "המשכנתא שלך",
    details: [
      { title: "סכום", value: formatCurrency(totalAmount) },
      {
        title: "יתרה לסילוק המשכנתא",
        value: formatCurrency(outstandingBalance),
      },
      { title: "תשלום חודשי", value: formatCurrency(firstPayment) },
      { title: "ריבית שנתית כוללת", value: formatRate(weightedRate) },
      { title: 'סך הכל תשלומים', value: formatCurrency(totalPayments || outstandingBalance) },
      {
        title: "החזר לשקל",
        value: refundPerShekel ? `₪${refundPerShekel.toFixed(2)}` : "—",
      },
    ],
  };
};
