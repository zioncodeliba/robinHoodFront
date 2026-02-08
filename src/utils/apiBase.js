const rawBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
const rawCalcBase = process.env.REACT_APP_CALC_API_BASE_URL || "http://127.0.0.1:8010";

const normalize = (value) => value.replace(/\/$/, "");
const stripApiSuffix = (value) => normalize(value).replace(/\/api\/?$/, "");

export const getGatewayBase = () => stripApiSuffix(rawBase);
export const getGatewayApiBase = () => `${getGatewayBase()}/api`;

export const getCalcApiBase = () => normalize(rawCalcBase);
