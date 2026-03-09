export const TREATMENT_STEPS = [
  "אישור עקרוני",
  "שיחת תמהיל",
  "משא ומתן",
  "חתימות",
  "קבלת הכסף",
];

const STEP_BY_STATUS = {
  "אישור עקרוני": 1,
  "שיחת תמהיל": 2,
  "משא ומתן": 3,
  "חתימות": 4,
  "קבלת הכסף": 5,
};

const STEP_ONE_UNLOCKED_STATUSES = new Set([
  "ממתין לאישור עקרוני",
  "סיום צ׳אט בהצלחה",
]);

const PRE_TREATMENT_STATUSES = new Set([
  "",
  "נרשם",
  "שיחה עם הצ׳אט",
  "העלאת קבצים",
  "חוסר התאמה",
]);

export const normalizeTreatmentStatus = (status) =>
  String(status || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/'/g, "׳");

export const getTreatmentStepFromStatus = (status) => {
  const normalizedStatus = normalizeTreatmentStatus(status);

  if (STEP_BY_STATUS[normalizedStatus]) {
    return STEP_BY_STATUS[normalizedStatus];
  }

  if (STEP_ONE_UNLOCKED_STATUSES.has(normalizedStatus)) {
    return 1;
  }

  if (PRE_TREATMENT_STATUSES.has(normalizedStatus)) {
    return 0;
  }

  if (normalizedStatus.includes("אישור עקרוני")) return 1;
  if (normalizedStatus.includes("תמהיל")) return 2;
  if (normalizedStatus.includes("משא ומתן")) return 3;
  if (normalizedStatus.includes("חתימ")) return 4;
  if (normalizedStatus.includes("קבלת הכסף")) return 5;

  return 0;
};

export const hasTreatmentStatusAccess = (status) =>
  getTreatmentStepFromStatus(status) > 0;
