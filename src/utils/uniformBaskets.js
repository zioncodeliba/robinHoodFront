export const UNIFORM_BASKET_TITLE_MAP = {
  Uniform_Basket_1: "סל אחיד 1",
  Uniform_Basket_2: "סל אחיד 2",
  Uniform_Basket_3: "סל אחיד 3",
};

export const getUniformBasketDisplayTitle = (rawTitle) =>
  UNIFORM_BASKET_TITLE_MAP[rawTitle] || rawTitle || "סל אחיד";

export const getUniformBasketOrder = (rawTitle, fallbackIndex = 0) => {
  const match = String(rawTitle || "").match(/\d+/);
  const numericOrder = match ? Number(match[0]) : fallbackIndex + 1;
  return Number.isNaN(numericOrder) ? fallbackIndex : numericOrder;
};
