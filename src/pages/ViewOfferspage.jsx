// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../components/viewofferscomponents/ViewOfferspage.css';

import offer_i from "../assets/images/offer_i.png";
import nextprevarrow from "../assets/images/np_arrow.svg";
import hapoalimbankicon from "../assets/images/hapoalimbank-icon.svg";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";

import { getGatewayBase } from "../utils/apiBase";

// page components
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
import AffordableOffer from '../components/viewofferscomponents/AffordableOffer';
import OffersStatusSummary from '../components/viewofferscomponents/OffersStatusSummary';

const DISCOUNT_BANK_LOGO_URL = "/discont.webp";
const INTERNATIONAL_BANK_LOGO_URL = "/banks/international-logo.png";
const MERCANTILE_BANK_LOGO_URL = "/Mercantile.svg.png";
const OFFER_SLIDE_DURATION_MS = 360;
const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_VERTICAL_DELTA_PX = 80;

const BANK_LIST = [
  {
    id: 3,
    bankLogo: hapoalimbankicon,
    bankName: "בנק הפועלים",
  },
  {
    id: 2,
    bankLogo: nationalbank,
    bankName: "בנק לאומי",
  },
  {
    id: 1,
    bankLogo: mizrahitefahotbank,
    bankName: "בנק מזרחי טפחות",
  },
  {
    id: 4,
    bankLogo: DISCOUNT_BANK_LOGO_URL,
    bankName: "בנק דיסקונט",
  },
  {
    id: 8,
    bankLogo: INTERNATIONAL_BANK_LOGO_URL,
    bankName: "בנק הבינלאומי",
  },
  {
    id: 12,
    bankLogo: MERCANTILE_BANK_LOGO_URL,
    bankName: "בנק מרכנתיל",
  }
];

const ViewOfferspage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const [offerBankIds, setOfferBankIds] = useState([]);
  const [bankResponses, setBankResponses] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [offerTransition, setOfferTransition] = useState(null);
  const [isOfferSlideRunning, setIsOfferSlideRunning] = useState(false);
  const slideTimeoutRef = useRef(null);
  const transitionTargetIndexRef = useRef(null);
  const touchStartRef = useRef(null);
  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user_data")) || {};
    } catch {
      return {};
    }
  }, []);
  const displayName = userData?.firstName || userData?.first_name || userData?.name || "שם";

  const handleAuthFailure = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token || !apiBase) return;
    let isMounted = true;
    setOffersLoading(true);

    const loadBankResponses = async () => {
      try {
        const response = await fetch(`${apiBase}/auth/v1/bank-responses/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401 || response.status === 403) {
          handleAuthFailure();
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to load bank responses");
        }
        const payload = await response.json().catch(() => null);
        if (!isMounted) return;
        const responses = Array.isArray(payload) ? payload : [];
        const ids = responses.map((item) => Number(item?.bank_id)).filter((id) => Number.isFinite(id));
        setOfferBankIds(Array.from(new Set(ids)));
        setBankResponses(responses);
        setOffersLoaded(true);
      } catch {
        // Keep defaults on failure
      } finally {
        if (isMounted) {
          setOffersLoading(false);
        }
      }
    };

    loadBankResponses();

    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const offerBanks = useMemo(() => {
    if (offerBankIds.length === 0) return [];
    const known = BANK_LIST.filter((bank) => offerBankIds.includes(bank.id));
    const knownIds = new Set(known.map((bank) => bank.id));
    const extras = offerBankIds
      .filter((id) => !knownIds.has(id))
      .map((id) => ({
        id,
        bankLogo: '',
        bankName: `בנק ${id}`,
      }));
    return [...known, ...extras];
  }, [offerBankIds]);

  useEffect(() => {
    if (offersLoaded && !offersLoading && offerBankIds.length === 0) {
      navigate('/homebeforeapproval2', { replace: true });
    }
  }, [offersLoaded, offersLoading, offerBankIds.length, navigate]);

  useEffect(() => {
    if (offerBanks.length === 0) {
      setActiveOfferIndex(0);
      return;
    }
    setActiveOfferIndex((prev) => (
      prev < 0 || prev >= offerBanks.length ? 0 : prev
    ));
  }, [offerBanks.length]);

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current) {
        window.clearTimeout(slideTimeoutRef.current);
        slideTimeoutRef.current = null;
      }
    };
  }, []);

  const activeBank = offerBanks.length ? offerBanks[activeOfferIndex] : null;
  const activeBankResponse = useMemo(() => {
    if (!activeBank) return null;
    return bankResponses.find((item) => Number(item?.bank_id) === activeBank.id) || null;
  }, [activeBank, bankResponses]);

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  };

  const getMetrics = (response) =>
    response?.extracted_json?.calculator_result?.proposed_mix?.metrics || null;

  const getSavings = (response) =>
    toNumber(response?.extracted_json?.calculator_result?.savings?.total_savings);

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    if (Number.isNaN(numeric)) {
      return String(value);
    }
    return `₪${numeric.toLocaleString('he-IL')}`;
  };

  const metrics = getMetrics(activeBankResponse);
  const mortgageData = activeBank
    ? {
        logobank: activeBank.bankLogo,
        title: "המשכנתא שלך:",
        expireoffertext: '',
        details: {
          bank: activeBank.bankName,
          amount: formatMoney(metrics?.['סכום_הלוואה']),
          years: formatValue(metrics?.['תקופה_מקסימלית']),
          firstMonthlyPayment: formatMoney(metrics?.['החזר_חודשי_ראשון']),
          maxMonthlyPayment: formatMoney(metrics?.['החזר_חודשי_מקסימלי']),
        },
        totalPayments: formatMoney(metrics?.['סהכ_החזר_כולל']),
      }
    : undefined;

  const mortgageDataByBankId = useMemo(() => {
    const map = new Map();
    offerBanks.forEach((bank) => {
      const response = bankResponses.find((item) => Number(item?.bank_id) === bank.id) || null;
      const bankMetrics = getMetrics(response);
      map.set(bank.id, {
        logobank: bank.bankLogo,
        title: "המשכנתא שלך:",
        expireoffertext: '',
        details: {
          bank: bank.bankName,
          amount: formatMoney(bankMetrics?.['סכום_הלוואה']),
          years: formatValue(bankMetrics?.['תקופה_מקסימלית']),
          firstMonthlyPayment: formatMoney(bankMetrics?.['החזר_חודשי_ראשון']),
          maxMonthlyPayment: formatMoney(bankMetrics?.['החזר_חודשי_מקסימלי']),
        },
        totalPayments: formatMoney(bankMetrics?.['סהכ_החזר_כולל']),
      });
    });
    return map;
  }, [offerBanks, bankResponses]);

  const bestOffer = useMemo(() => {
    if (!bankResponses.length) return null;
    const latestByBank = new Map();
    bankResponses.forEach((response) => {
      const bankId = Number(response?.bank_id);
      if (!Number.isFinite(bankId)) return;
      const prev = latestByBank.get(bankId);
      if (!prev) {
        latestByBank.set(bankId, response);
        return;
      }
      const prevDate = new Date(prev?.uploaded_at || 0).getTime();
      const nextDate = new Date(response?.uploaded_at || 0).getTime();
      if (nextDate >= prevDate) {
        latestByBank.set(bankId, response);
      }
    });

    let best = null;
    latestByBank.forEach((response, bankId) => {
      const savings = getSavings(response);
      if (savings === null) return;
      if (!best || savings > best.savings) {
        const bankMeta = offerBanks.find((bank) => bank.id === bankId);
        best = {
          bankId,
          savings,
          bankName: bankMeta?.bankName || `בנק ${bankId}`,
        };
      }
    });
    return best;
  }, [bankResponses, offerBanks]);

  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const bankIdParam = Number(params.get('bankId'));
    if (!Number.isFinite(bankIdParam)) return;
    const index = offerBanks.findIndex((bank) => bank.id === bankIdParam);
    if (index >= 0 && index !== activeOfferIndex) {
      setActiveOfferIndex(index);
    }
  }, [location.search, offerBanks, activeOfferIndex]);

  const handleSelectBank = (bankId) => {
    const index = offerBanks.findIndex((bank) => bank.id === bankId);
    if (index >= 0) {
      setActiveOfferIndex(index);
    }
    navigate(`/suggestionspage?bankId=${bankId}`);
  };

  const completeOfferSlide = useCallback(() => {
    const targetIndex = transitionTargetIndexRef.current;
    transitionTargetIndexRef.current = null;
    if (slideTimeoutRef.current) {
      window.clearTimeout(slideTimeoutRef.current);
      slideTimeoutRef.current = null;
    }
    if (typeof targetIndex === 'number') {
      const normalized = offerBanks.length
        ? ((targetIndex % offerBanks.length) + offerBanks.length) % offerBanks.length
        : 0;
      setActiveOfferIndex(normalized);
      const bankId = offerBanks[normalized]?.id;
      if (bankId) {
        navigate(`/viewoffer?bankId=${bankId}`);
      }
    }
    setOfferTransition(null);
    setIsOfferSlideRunning(false);
  }, [navigate, offerBanks]);

  const startOfferSlide = useCallback((direction) => {
    if (offerBanks.length <= 1 || offerTransition) return;

    const nextIndex = direction === 'next'
      ? (activeOfferIndex + 1) % offerBanks.length
      : (activeOfferIndex - 1 + offerBanks.length) % offerBanks.length;

    transitionTargetIndexRef.current = nextIndex;
    setOfferTransition({
      direction,
      fromIndex: activeOfferIndex,
      toIndex: nextIndex,
    });
    setIsOfferSlideRunning(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOfferSlideRunning(true);
      });
    });

    if (slideTimeoutRef.current) {
      window.clearTimeout(slideTimeoutRef.current);
    }
    slideTimeoutRef.current = window.setTimeout(
      completeOfferSlide,
      OFFER_SLIDE_DURATION_MS + 80
    );
  }, [activeOfferIndex, completeOfferSlide, offerBanks.length, offerTransition]);

  useEffect(() => {
    if (!offerTransition) return;
    if (!offerBanks[offerTransition.fromIndex] || !offerBanks[offerTransition.toIndex]) {
      completeOfferSlide();
    }
  }, [completeOfferSlide, offerBanks, offerTransition]);

  const handleDetailsTouchStart = (event) => {
    if (offerBanks.length <= 1 || offerTransition) return;
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
    };
  };

  const handleDetailsTouchMove = (event) => {
    const touch = event.touches?.[0];
    if (!touch || !touchStartRef.current) return;
    touchStartRef.current.lastX = touch.clientX;
    touchStartRef.current.lastY = touch.clientY;
  };

  const handleDetailsTouchEnd = () => {
    const touchData = touchStartRef.current;
    touchStartRef.current = null;
    if (!touchData) return;

    const deltaX = touchData.lastX - touchData.startX;
    const deltaY = touchData.lastY - touchData.startY;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL_DELTA_PX) return;
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX < 0) {
      startOfferSlide('next');
      return;
    }
    startOfferSlide('prev');
  };

  const handleDetailsTouchCancel = () => {
    touchStartRef.current = null;
  };

  const handlePrev = () => {
    startOfferSlide('prev');
  };

  const handleNext = () => {
    startOfferSlide('next');
  };

  const fromBank = offerTransition ? offerBanks[offerTransition.fromIndex] || null : null;
  const toBank = offerTransition ? offerBanks[offerTransition.toIndex] || null : null;
  const fromMortgageData = fromBank ? mortgageDataByBankId.get(fromBank.id) : mortgageData;
  const toMortgageData = toBank ? mortgageDataByBankId.get(toBank.id) : mortgageData;
  const outgoingTarget = offerTransition?.direction === 'next' ? '-100%' : '100%';
  const incomingStart = offerTransition?.direction === 'next' ? '100%' : '-100%';
  const slideTransitionStyle = isOfferSlideRunning
    ? `transform ${OFFER_SLIDE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${OFFER_SLIDE_DURATION_MS}ms ease`
    : 'none';
  const arrowDisabled = Boolean(offerTransition) || offerBanks.length <= 1;

  return (
    <div className="viewoffers_page">
      <div className="wrapper">
        <h1>ברוכים הבאים, {displayName}</h1>
        <div
          style={{ position: 'relative', overflow: 'hidden', touchAction: 'pan-y' }}
          onTouchStart={handleDetailsTouchStart}
          onTouchMove={handleDetailsTouchMove}
          onTouchEnd={handleDetailsTouchEnd}
          onTouchCancel={handleDetailsTouchCancel}
        >
          {offerTransition ? (
            <>
              <div style={{ visibility: 'hidden' }}>
                <YourRoutesMortgageDetails data={fromMortgageData} themeColor="#D92D20" />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: isOfferSlideRunning ? `translateX(${outgoingTarget})` : 'translateX(0%)',
                  opacity: isOfferSlideRunning ? 0.2 : 1,
                  transition: slideTransitionStyle,
                  willChange: 'transform, opacity',
                }}
              >
                <YourRoutesMortgageDetails data={fromMortgageData} themeColor="#D92D20" />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: isOfferSlideRunning ? 'translateX(0%)' : `translateX(${incomingStart})`,
                  opacity: isOfferSlideRunning ? 1 : 0.85,
                  transition: slideTransitionStyle,
                  willChange: 'transform, opacity',
                }}
                onTransitionEnd={(event) => {
                  if (event.propertyName !== 'transform') return;
                  if (!offerTransition || !isOfferSlideRunning) return;
                  completeOfferSlide();
                }}
              >
                <YourRoutesMortgageDetails data={toMortgageData} themeColor="#D92D20" />
              </div>
            </>
          ) : (
            <YourRoutesMortgageDetails data={mortgageData} themeColor="#D92D20" />
          )}
        </div>
        <div className="inner d_flex d_flex_jb">
          <AffordableOffer savings={bestOffer?.savings} />
          <div className="offer_col">
            <img src={offer_i} alt="" />
            <h4>נא לשים לב</h4>
            <p>בנק מזרחי ממתין למסמכי עו”ש על מנת להפניק הצעה עדכנית, נא לקדם את הנושא</p>
          </div>
          <div className="my_statuses_summary_sec d_flex d_flex_jb d_flex_as">
            <h2>ריכוז הסטטוסים שלי</h2>
            <OffersStatusSummary
              banks={offerBanks}
              bestBankId={bestOffer?.bankId}
              bestBankName={bestOffer?.bankName}
              onSelectBank={handleSelectBank}
            />
          </div>
        </div>
      </div>
      <div className="next_prev_box">
        <button type="button" className="prev" onClick={handlePrev} disabled={arrowDisabled}>
          <img src={nextprevarrow} alt="" />
        </button>
        <button type="button" className="next" onClick={handleNext} disabled={arrowDisabled}>
          <img src={nextprevarrow} alt="" />
        </button>
      </div>
    </div>
  );
};

export default ViewOfferspage;
