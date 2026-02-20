export const SUPPORTED_BANK_IDS = [3, 2, 1, 4, 8, 12];
export const NEW_MORTGAGE_TYPE = "משכנתא חדשה";
export const REFINANCE_MORTGAGE_TYPE = "מחזור משכנתא";

export const BANK_VISIBILITY_BLOCKED_STATUSES = new Set([
  "נרשם",
  "שיחה עם הצ׳אט",
  "חוסר התאמה",
  "העלאת קבצים",
  "מחזור - אין הצעה",
  "מחזור - ניטור",
  "מיחזור - ניטור",
  "מחזור ניטור",
  "מיחזור ניטור",
]);

export const normalizeStatusForRouting = (status) =>
  String(status || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, "׳");

export const hasSupportedMortgageType = (mortgageType) => {
  const normalizedType = String(mortgageType || "").trim();
  return normalizedType === NEW_MORTGAGE_TYPE || normalizedType === REFINANCE_MORTGAGE_TYPE;
};

export const canRouteByBankVisibility = ({ mortgageType, status }) => {
  if (!hasSupportedMortgageType(mortgageType)) {
    return false;
  }
  const normalizedStatus = normalizeStatusForRouting(status);
  if (!normalizedStatus) {
    return false;
  }
  return !BANK_VISIBILITY_BLOCKED_STATUSES.has(normalizedStatus);
};

export const normalizeAllowedBankIds = (ids, fallback = SUPPORTED_BANK_IDS) => {
  if (!Array.isArray(ids)) return [...fallback];
  const allowed = new Set(ids.map((value) => Number(value)));
  return SUPPORTED_BANK_IDS.filter((id) => allowed.has(id));
};

export const getDefaultAllowedBankIds = (mortgageType) => {
  const normalizedType = String(mortgageType || "").trim();
  if (normalizedType === REFINANCE_MORTGAGE_TYPE) {
    return [];
  }
  if (hasSupportedMortgageType(normalizedType)) {
    return [...SUPPORTED_BANK_IDS];
  }
  return [];
};

