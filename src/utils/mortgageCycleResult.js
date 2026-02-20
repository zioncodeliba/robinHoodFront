const STORAGE_KEY = "mortgage_cycle_result";

const BANK_LABELS = {
  1: "מזרחי",
  2: "לאומי",
  3: "הפועלים",
  4: "דיסקונט",
  8: "הבינלאומי",
  12: "מרכנתיל",
};

const BANK_LOGOS = {
  1: "/banks/mizrahi.png",
  2: "/banks/leumi.png",
  3: "/banks/hapoalim.png",
  4: "/banks/discount.png",
  8: "/banks/international.png",
  12: "/banks/mercantile.png",
};

const BANK_COLORS = {
  1: "#F5821F",
  2: "#007BFF",
  3: "#D92D20",
  4: "#27450E",
  8: "#FDB726",
  12: "#27450E",
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

const formatYearsCount = (value) => {
  const num = toOptionalNumber(value);
  if (num === null || num <= 0) {
    return "—";
  }
  const formatted = num.toFixed(1).replace(/\.0$/, "");
  return formatted;
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
const NO_SAVING_BEST_RESULT = "there is no saving!!";

const normalizeScenarioName = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getBestResultScenarioName = (calcResult) =>
  String(calcResult?.best_res?.name ?? "").trim();

const isNoSavingBestResult = (calcResult) =>
  normalizeScenarioName(getBestResultScenarioName(calcResult)) ===
  normalizeScenarioName(NO_SAVING_BEST_RESULT);

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
    const normalizedName = normalizeScenarioName(name);
    if (!normalizedName) {
      continue;
    }
    const row =
      table.find((item) => normalizeScenarioName(item?.["תרחיש"]) === normalizedName) || null;
    if (row) return row;
  }
  return null;
};

const getScenario = (calcResult, preferredNames) => {
  const scenarios = getDetailedScenarios(calcResult);
  const scenarioEntries = Object.entries(scenarios);
  for (const name of preferredNames) {
    const normalizedName = normalizeScenarioName(name);
    if (!normalizedName) continue;
    const match = scenarioEntries.find(
      ([scenarioName]) => normalizeScenarioName(scenarioName) === normalizedName
    );
    if (match?.[1] && typeof match[1] === "object") return match[1];
  }
  return null;
};

const getRefinanceCurrentScenario = (calcResult) =>
  getScenario(calcResult, [SCENARIO_CURRENT]);

const getRefinanceOptimalScenario = (calcResult) => {
  const bestScenarioName = getBestResultScenarioName(calcResult);
  if (!bestScenarioName || isNoSavingBestResult(calcResult)) {
    return null;
  }
  return getScenario(calcResult, [bestScenarioName]);
};

const getRefinanceCurrentComparison = (calcResult) =>
  getComparisonRow(calcResult, [SCENARIO_CURRENT]);

const getRefinanceOptimalComparison = (calcResult) => {
  const bestScenarioName = getBestResultScenarioName(calcResult);
  if (!bestScenarioName || isNoSavingBestResult(calcResult)) {
    return null;
  }
  return getComparisonRow(calcResult, [bestScenarioName]);
};

export const isMortgageCycleCalculatorResultValid = (calcResult) => {
  if (!calcResult || typeof calcResult !== "object") {
    return false;
  }
  if (calcResult.error || calcResult.status_code) {
    return false;
  }
  const hasRequiredShape =
    Object.prototype.hasOwnProperty.call(calcResult, "best_res") &&
    Object.prototype.hasOwnProperty.call(calcResult, "ltv_used") &&
    Object.prototype.hasOwnProperty.call(calcResult, "comparison_table") &&
    Object.prototype.hasOwnProperty.call(calcResult, "detailed_scenarios");
  if (!hasRequiredShape) {
    return false;
  }
  if (!Array.isArray(calcResult?.comparison_table)) {
    return false;
  }
  if (!calcResult?.detailed_scenarios || typeof calcResult.detailed_scenarios !== "object") {
    return false;
  }
  return typeof calcResult?.best_res?.name === "string";
};

export const hasCalculatorOffer = (calcResult) => {
  if (!isMortgageCycleCalculatorResultValid(calcResult)) {
    return false;
  }
  const bestScenarioName = getBestResultScenarioName(calcResult);
  if (!bestScenarioName) {
    return false;
  }
  return !isNoSavingBestResult(calcResult);
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

  const optimalScenario = getRefinanceOptimalScenario(calcResult);
  const optimalComparison = getRefinanceOptimalComparison(calcResult);
  const optimalTracks = Array.isArray(optimalScenario?.tracks)
    ? optimalScenario.tracks
    : [];

  const totalAmount =
    toNumber(optimalScenario?.summary?.total_principal) ||
    sumBy(optimalTracks, (track) => track?.["סכום"]) ||
    toNumber(payload?.amount);
  const maxMonths = Math.max(
    0,
    ...optimalTracks.map((track) => toNumber(track?.["תקופה_חודשים"]))
  );
  const totalPayments =
    toNumber(optimalScenario?.summary?.total_repayment) ||
    toNumber(optimalComparison?.["סך הכל תשלומים"]);
  const firstPayment =
    toNumber(optimalScenario?.summary?.first_payment) ||
    toNumber(optimalComparison?.["החזר חודשי ראשון"]);
  const maxPayment =
    toNumber(optimalScenario?.summary?.max_payment) ||
    toNumber(optimalComparison?.["החזר חודשי מקסימלי"]) ||
    firstPayment;
  const totalInterestIndex = sumBy(
    optimalTracks,
    (track) => track?.["סהכ_ריבית_והצמדה"]
  );
  const routesList = optimalTracks.map((track) =>
    mapScenarioTrackToRoute(track, totalAmount)
  );

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
  const outstandingBalance =
    toNumber(currentScenario?.summary?.total_principal) ||
    sumBy(tracks, (track) => track?.loan_value) ||
    sumBy(currentScenarioTracks, (track) => track?.["סכום"]) ||
    toNumber(payload?.amount);

  const firstPayment =
    toOptionalNumber(currentScenario?.summary?.first_payment) ??
    toOptionalNumber(currentComparison?.["החזר חודשי ראשון"]);

  const combinedGraphMonthsRaw = currentScenario?.combined_graph?.months;
  const termMonthsFromCombinedGraph = Array.isArray(combinedGraphMonthsRaw)
    ? (
        combinedGraphMonthsRaw
          .map((value) => toOptionalNumber(value))
          .filter((value) => value !== null && value > 0)
          .pop() ?? null
      )
    : toOptionalNumber(combinedGraphMonthsRaw);
  const termYearsFromSnpvTracks = tracks.length
    ? Math.max(0, ...tracks.map((track) => toNumber(track?.loan_years)))
    : 0;
  const termMonthsFromScenarioTracks = currentScenarioTracks.length
    ? Math.max(0, ...currentScenarioTracks.map((track) => toNumber(track?.["תקופה_חודשים"])))
    : 0;
  const fallbackTermYears =
    toOptionalNumber(currentScenario?.summary?.max_term_years) ??
    toOptionalNumber(currentComparison?.["תקופה בשנים"]) ??
    toOptionalNumber(currentComparison?.["תקופה_בשנים"]);
  const termYears = (termMonthsFromCombinedGraph !== null && termMonthsFromCombinedGraph > 0)
    ? (termMonthsFromCombinedGraph / 12)
    : termYearsFromSnpvTracks > 0
    ? termYearsFromSnpvTracks
    : termMonthsFromScenarioTracks > 0
      ? termMonthsFromScenarioTracks / 12
      : fallbackTermYears;

  const totalPayments =
    toOptionalNumber(currentScenario?.summary?.total_repayment) ??
    toOptionalNumber(currentComparison?.["סך הכל תשלומים"]);

  const refundPerShekel = toOptionalNumber(currentComparison?.["החזר לשקל"]);

  const summaryIndexation = toOptionalNumber(currentScenario?.summary?.total_indexation);
  const indexLinkedAmount = summaryIndexation ?? (
    sumBy(tracks, (track) => track?.loan_value_inflation) ||
    sumBy(currentScenarioTracks, (track) => track?.["סהכ_ריבית_והצמדה"]) ||
    toNumber(currentComparison?.["סהכ ריבית והצמדה"]) ||
    toNumber(currentComparison?.['סה״כ ריבית והצמדה'])
  );

  const averageScenarioRate = currentScenarioTracks.length
    ? (() => {
        const rates = currentScenarioTracks
          .map((track) => toOptionalNumber(track?.["ריבית"]))
          .filter((rate) => rate !== null);
        if (!rates.length) return null;
        const sumRates = rates.reduce((sum, rate) => sum + rate, 0);
        return sumRates / rates.length;
      })()
    : null;

  const weightedRate =
    averageScenarioRate ??
    getWeightedRateFromSnpvOriginalTracks(tracks) ??
    getWeightedRateFromScenarioTracks(currentScenarioTracks, outstandingBalance) ??
    toOptionalNumber(currentComparison?.internal_rate_of_return);

  const { bankId, bankName } = getBankMeta(payload);
  return {
    name: bankName,
    icon: BANK_LOGOS[bankId] || "",
    color: BANK_COLORS[bankId] || "#4E8FF7",
    tag: "המשכנתא שלך",
    details: [
      {
        title: "יתרה לסילוק המשכנתא",
        value: formatCurrency(outstandingBalance),
      },
      { title: "תקופה בשנים", value: formatYearsCount(termYears) },
      { title: "תשלום חודשי", value: formatCurrency(firstPayment) },
      { title: "ריבית שנתית כוללת", value: formatRate(weightedRate) },
      { title: 'סך הכל תשלומים', value: formatCurrency(totalPayments ?? outstandingBalance) },
      {
        title: "החזר לשקל",
        value: refundPerShekel ? refundPerShekel.toFixed(2).replace(/\.00$/, "") : "—",
      },
      { title: "הצמדה למדד", value: formatCurrency(indexLinkedAmount) },
    ],
  };
};
