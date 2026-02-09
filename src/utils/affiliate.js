const AFFILIATE_STORAGE_KEY = 'affiliate_code';

export function getAffiliateCode() {
  const raw = localStorage.getItem(AFFILIATE_STORAGE_KEY);
  return raw ? raw.trim() : '';
}

export function setAffiliateCode(code) {
  if (!code) return;
  localStorage.setItem(AFFILIATE_STORAGE_KEY, code.trim());
}

export function clearAffiliateCode() {
  localStorage.removeItem(AFFILIATE_STORAGE_KEY);
}
