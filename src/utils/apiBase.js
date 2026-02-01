const rawBase = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

const normalize = (value) => value.replace(/\/$/, "");
const stripApiSuffix = (value) => normalize(value).replace(/\/api\/?$/, "");

export const getGatewayBase = () => stripApiSuffix(rawBase);
export const getGatewayApiBase = () => `${getGatewayBase()}/api`;
