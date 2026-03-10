export const APPROVAL_STAGE_WAITING = "waiting";
export const APPROVAL_STAGE_PRINCIPAL = "principal";
export const APPROVAL_STAGE_FINAL = "final";

const APPROVAL_STAGE_PRIORITY = {
  [APPROVAL_STAGE_WAITING]: 0,
  [APPROVAL_STAGE_PRINCIPAL]: 1,
  [APPROVAL_STAGE_FINAL]: 2,
};

export const isRefinanceResult = (calcResult) =>
  Array.isArray(calcResult?.comparison_table) ||
  (calcResult?.detailed_scenarios && typeof calcResult.detailed_scenarios === "object");

export const isApprovalOfferResult = (calcResult) => {
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

const getExtractedJson = (response) => {
  const extracted =
    response?.extracted_json && typeof response.extracted_json === "object"
      ? response.extracted_json
      : response?.extractedJson && typeof response.extractedJson === "object"
        ? response.extractedJson
        : null;
  return extracted;
};

export const isFinalApprovalResponse = (response) => {
  const extracted = getExtractedJson(response);
  if (!extracted) return false;
  return Boolean(
    extracted?.is_final_approval === true ||
    extracted?.isFinalApproval === true ||
    extracted?.approval_stage === APPROVAL_STAGE_FINAL ||
    extracted?.approvalStage === APPROVAL_STAGE_FINAL
  );
};

export const getApprovalStageFromResponse = (response) => {
  const calcResult =
    response?.extracted_json?.calculator_result ??
    response?.extractedJson?.calculator_result ??
    null;
  if (!isApprovalOfferResult(calcResult)) {
    return null;
  }
  return isFinalApprovalResponse(response)
    ? APPROVAL_STAGE_FINAL
    : APPROVAL_STAGE_PRINCIPAL;
};

export const getBankApprovalStageMap = (responses) => {
  const stagesByBankId = new Map();
  if (!Array.isArray(responses)) {
    return stagesByBankId;
  }

  responses.forEach((response) => {
    const bankId = Number(response?.bank_id ?? response?.bankId);
    if (!Number.isFinite(bankId)) return;

    const nextStage = getApprovalStageFromResponse(response);
    if (!nextStage) return;

    const currentStage = stagesByBankId.get(bankId) || APPROVAL_STAGE_WAITING;
    if ((APPROVAL_STAGE_PRIORITY[nextStage] || 0) >= (APPROVAL_STAGE_PRIORITY[currentStage] || 0)) {
      stagesByBankId.set(bankId, nextStage);
    }
  });

  return stagesByBankId;
};

export const getApprovalStatusMeta = (stage) => {
  if (stage === APPROVAL_STAGE_FINAL) {
    return {
      text: "אישור סופי",
      className: "final_approval",
    };
  }

  if (stage === APPROVAL_STAGE_PRINCIPAL) {
    return {
      text: "אישור עקרוני",
      className: "principal_approval",
    };
  }

  return {
    text: "ממתין לאישור עקרוני",
    className: "awaiting_approval",
  };
};
