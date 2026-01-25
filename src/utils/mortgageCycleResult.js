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

export const hasCalculatorOffer = (calcResult) =>
  Array.isArray(calcResult?.optimal_mortgage_mix) &&
  calcResult.optimal_mortgage_mix.length > 0 &&
  Array.isArray(calcResult.optimal_mortgage_mix[0]);

export const buildMortgageDataFromOptimal = (payload) => {
  if (!payload) {
    return { mortgageData: null, hasData: false };
  }
  const calcResult = getCalculatorResult(payload);
  if (!hasCalculatorOffer(calcResult)) {
    return { mortgageData: null, hasData: false };
  }

  const optimalMix = calcResult.optimal_mortgage_mix;
  const candidate = Array.isArray(optimalMix?.[0]) ? optimalMix[0] : [];
  const totalAmount = sumBy(candidate, ([route]) => route?.["סכום"]);
  const maxMonths = Math.max(
    0,
    ...candidate.map(([route]) => toNumber(route?.["תקופה (חודשים)"]))
  );
  const totalPayments = toNumber(optimalMix?.[1]);
  const firstPayment = toNumber(optimalMix?.[2]);
  const maxPayment = toNumber(optimalMix?.[3]) || firstPayment;
  const totalInterestIndex = sumBy(
    candidate,
    ([route]) => route?.['סה״כ ריבית והצמדה']
  );

  const routesList = candidate.map(([route]) => {
    const amount = toNumber(route?.["סכום"]);
    const percent = totalAmount ? (amount / totalAmount) * 100 : 0;
    return {
      name: route?.["מסלול"] || "—",
      percentage: formatPercent(percent),
      interest: formatRate(route?.["ריבית"]),
      balance: formatCurrency(amount),
    };
  });

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
  if (tracks.length === 0) {
    return { mortgageData: null, hasData: false };
  }

  const totalAmount = sumBy(tracks, (track) => track?.loan_value);
  const totalInflation = sumBy(tracks, (track) => track?.loan_value_inflation);
  const maxMonths = Math.max(
    0,
    ...tracks.map((track) => toNumber(track?.loan_years))
  );
  const calcResult = getCalculatorResult(payload);
  const frontendData = calcResult?.frontend_data || {};
  const fallbackTerm = toNumber(frontendData?.max_term);
  const firstPayment = toOptionalNumber(frontendData?.first_peyment);
  const maxMonthlyPayment =
    Math.max(0, ...tracks.map((track) => toNumber(track?.monthly_repayment))) ||
    firstPayment ||
    0;
  const refundPerShekel = toOptionalNumber(frontendData?.Refund_amount_per_shekel);
  const totalPayments = refundPerShekel ? totalAmount * refundPerShekel : 0;

  const routesList = tracks.map((track) => {
    const amount = toNumber(track?.loan_value);
    const percent = totalAmount ? (amount / totalAmount) * 100 : 0;
    return {
      name: getLoanTypeLabel(track?.loan_type),
      percentage: formatPercent(percent),
      interest: formatRate(track?.loan_interest),
      balance: formatCurrency(amount),
    };
  });

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
  const totalAmount =
    sumBy(tracks, (track) => track?.loan_value) || toNumber(payload?.amount);
  const calcResult = getCalculatorResult(payload);
  const frontendData = calcResult?.frontend_data || {};
  const refundPerShekel = toOptionalNumber(frontendData?.Refund_amount_per_shekel);
  const totalPayments = refundPerShekel ? totalAmount * refundPerShekel : 0;
  const firstPayment = toOptionalNumber(frontendData?.first_peyment);
  const weightedRate = toOptionalNumber(frontendData?.weighted_avg_rate);

  const { bankName } = getBankMeta(payload);
  return {
    name: bankName,
    tag: "המשכנתא שלך",
    details: [
      { title: "סכום", value: formatCurrency(totalAmount) },
      {
        title: "יתרה לסילוק המשכנתא",
        value: formatCurrency(totalPayments || totalAmount),
      },
      { title: "תשלום חודשי", value: formatCurrency(firstPayment) },
      { title: "ריבית שנתית כוללת", value: formatRate(weightedRate) },
      { title: 'סך הכל תשלומים', value: formatCurrency(totalPayments || totalAmount) },
      {
        title: "החזר לשקל",
        value: refundPerShekel ? `₪${refundPerShekel.toFixed(2)}` : "—",
      },
    ],
  };
};
