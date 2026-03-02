// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import '../components/viewofferscomponents/ViewOfferspage.css';

import offer_i from "../assets/images/offer_i.svg";
import nextprevarrow from "../assets/images/np_arrow.svg";
import timeicon from "../assets/images/tt.svg";
import sandicon from "../assets/images/sandicon.svg";
import noteIcon from "../assets/images/note_i_o.svg";

import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";
import { useNavState } from "../context/NavStateContext";

// page components
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
import AffordableOffer from '../components/viewofferscomponents/AffordableOffer';
import StatusSummary from '../components/commoncomponents/StatusSummary';

const BANK_LOGOS = {
  hapoalim: "/banks/hapoalim.svg",
  leumi: "/banks/leumi.png",
  mizrahi: "/banks/mizrahi.png",
  discount: "/banks/discount.png",
  international: "/banks/international.png",
  mercantile: "/banks/mercantile.png",
};
const DEFAULT_OFFERS_CAROUSEL_NOTE =
  "נשלח בקשה לאישור עקרוני לכלל הבנקים כשיתקבלו האישורים ישלח עדכון.";

const BANK_LIST = [
  {
    id: 3,
    bankLogo: BANK_LOGOS.hapoalim,
    bankName: "בנק הפועלים",
  },
  {
    id: 2,
    bankLogo: BANK_LOGOS.leumi,
    bankName: "בנק לאומי",
  },
  {
    id: 1,
    bankLogo: BANK_LOGOS.mizrahi,
    bankName: "בנק מזרחי טפחות",
  },
  {
    id: 4,
    bankLogo: BANK_LOGOS.discount,
    bankName: "בנק דיסקונט",
  },
  {
    id: 8,
    bankLogo: BANK_LOGOS.international,
    bankName: "בנק הבינלאומי",
  },
  {
    id: 12,
    bankLogo: BANK_LOGOS.mercantile,
    bankName: "בנק מרכנתיל",
  }
];

const DEFAULT_BANK_IDS = BANK_LIST.map((bank) => bank.id);

const normalizeAllowedBankIds = (ids, fallback = DEFAULT_BANK_IDS) => {
  if (!Array.isArray(ids)) return [...fallback];
  const allowed = new Set(ids.map((value) => Number(value)));
  return DEFAULT_BANK_IDS.filter((id) => allowed.has(id));
};

const isRefinanceResult = (calcResult) =>
  Array.isArray(calcResult?.comparison_table) ||
  (calcResult?.detailed_scenarios && typeof calcResult.detailed_scenarios === "object");

const isApprovalOfferResult = (calcResult) => {
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

const ViewOfferspage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bankVisibility, bankResponses: navBankResponses, isLoaded: navStateLoaded } = useNavState();
  const [allowedBankIds, setAllowedBankIds] = useState([]);
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);
  const [bankResponses, setBankResponses] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const isSyncingFromRouteRef = useRef(false);
  const { userData } = useCustomerProfile();
  const displayName = getCustomerDisplayName(userData, "שם");
  const offersCarouselNote = useMemo(() => {
    const noteFromApi = typeof userData?.offers_carousel_note === "string"
      ? userData.offers_carousel_note.trim()
      : "";
    const noteFromCache = typeof userData?.offersCarouselNote === "string"
      ? userData.offersCarouselNote.trim()
      : "";
    return noteFromApi || noteFromCache || DEFAULT_OFFERS_CAROUSEL_NOTE;
  }, [userData]);
  const offersCarouselNoteVisible = useMemo(() => {
    if (typeof userData?.offers_carousel_note_visible === "boolean") {
      return userData.offers_carousel_note_visible;
    }
    if (typeof userData?.offersCarouselNoteVisible === "boolean") {
      return userData.offersCarouselNoteVisible;
    }
    return true;
  }, [userData]);

  useEffect(() => {
    if (!navStateLoaded) {
      setVisibilityLoaded(false);
      return;
    }
    setAllowedBankIds(normalizeAllowedBankIds(bankVisibility, DEFAULT_BANK_IDS));
    setVisibilityLoaded(true);
  }, [bankVisibility, navStateLoaded]);

  useEffect(() => {
    if (!navStateLoaded) {
      setOffersLoading(true);
      setOffersLoaded(false);
      setBankResponses([]);
      return;
    }
    const responses = (Array.isArray(navBankResponses) ? navBankResponses : []).filter((item) => {
      const calcResult = item?.extracted_json?.calculator_result;
      return isApprovalOfferResult(calcResult);
    });
    setBankResponses(responses);
    setOffersLoading(false);
    setOffersLoaded(true);
  }, [navBankResponses, navStateLoaded]);

  const approvedBanks = useMemo(() => {
    if (allowedBankIds.length === 0) return [];
    const known = BANK_LIST.filter((bank) => allowedBankIds.includes(bank.id));
    const knownIds = new Set(known.map((bank) => bank.id));
    const extras = allowedBankIds
      .filter((id) => !knownIds.has(id))
      .map((id) => ({
        id,
        bankLogo: '',
        bankName: `בנק ${id}`,
      }));
    return [...known, ...extras];
  }, [allowedBankIds]);

  const allowedBankIdsSet = useMemo(
    () => new Set(allowedBankIds),
    [allowedBankIds]
  );

  const visibleBankResponses = useMemo(() => {
    if (!visibilityLoaded || !allowedBankIds.length || !bankResponses.length) {
      return [];
    }
    return bankResponses.filter((response) => {
      const bankId = Number(response?.bank_id);
      return Number.isFinite(bankId) && allowedBankIdsSet.has(bankId);
    });
  }, [allowedBankIds.length, allowedBankIdsSet, bankResponses, visibilityLoaded]);

  const offerBankIds = useMemo(() => {
    if (!visibleBankResponses.length) return [];
    return Array.from(
      new Set(
        visibleBankResponses
          .map((item) => Number(item?.bank_id))
          .filter((id) => Number.isFinite(id))
      )
    );
  }, [visibleBankResponses]);

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

  const carouselBanks = useMemo(() => {
    if (approvedBanks.length === 0) return offerBanks;
    const merged = [...approvedBanks];
    const mergedIds = new Set(approvedBanks.map((bank) => bank.id));
    offerBanks.forEach((bank) => {
      if (mergedIds.has(bank.id)) return;
      merged.push(bank);
      mergedIds.add(bank.id);
    });
    return merged;
  }, [approvedBanks, offerBanks]);
  // const [emblaRef, emblaApi] = useEmblaCarousel({
  //   loop: carouselBanks.length > 1,
  //   direction: "rtl",
  //   align: "start",
  // });

  // const [emblaRef, emblaApi] = useEmblaCarousel({
  //   loop: carouselBanks.length > 1,
  //   direction: "rtl",
  //   align: "start",
  // });
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: carouselBanks.length > 1,
    direction: "rtl",
    breakpoints: {
      "(max-width: 768px)": {
        align: "center",
        containScroll: "trimSnaps",
        dragFree: false,
      },
    },
  });

  useEffect(() => {
    if (offersLoaded && !offersLoading && visibilityLoaded && offerBankIds.length === 0 && allowedBankIds.length === 0) {
      navigate('/homebeforeapproval2', { replace: true });
    }
  }, [offersLoaded, offersLoading, visibilityLoaded, offerBankIds.length, allowedBankIds.length, navigate]);

  useEffect(() => {
    if (carouselBanks.length === 0) {
      setSelectedOfferIndex(0);
      return;
    }
    setSelectedOfferIndex((prev) => (
      prev < 0 || prev >= carouselBanks.length ? 0 : prev
    ));
  }, [carouselBanks.length]);

  const updateOfferCarouselControls = useCallback(() => {
    if (!emblaApi || carouselBanks.length <= 1) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, carouselBanks.length]);

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  };

  const getDurationMonths = (monthsValue) => {
    if (Array.isArray(monthsValue)) {
      const numericMonths = monthsValue
        .map((item) => toNumber(item))
        .filter((item) => item !== null && item > 0);
      if (!numericMonths.length) return null;
      return numericMonths[numericMonths.length - 1];
    }
    return toNumber(monthsValue);
  };

  const getSummary = (response) =>
    response?.extracted_json?.calculator_result?.proposed_mix?.summary ||
    response?.extracted_json?.calculator_result?.proposed_mix?.metrics ||
    null;

  const getSavings = (response) =>
    toNumber(response?.extracted_json?.calculator_result?.savings?.total_savings);

  const formatYears = (months, summary) => {
    const numericMonths = getDurationMonths(months);
    if (numericMonths !== null && numericMonths > 0) {
      const years = Math.round((numericMonths / 12) * 10) / 10;
      return String(years).replace(/\.0$/, '');
    }
    const fallbackYears =
      summary?.['תקופה_מקסימלית'] ??
      summary?.['תקופה_בשנים'] ??
      summary?.['תקופה'];
    if (fallbackYears === null || fallbackYears === undefined || fallbackYears === '') return '-';
    return String(fallbackYears);
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    if (Number.isNaN(numeric)) {
      return String(value);
    }
    return `₪${numeric.toLocaleString('he-IL')}`;
  };

  const mortgageDataByBankId = useMemo(() => {
    const map = new Map();
    carouselBanks.forEach((bank) => {
      const response = visibleBankResponses.find((item) => Number(item?.bank_id) === bank.id) || null;
      const bankSummary = getSummary(response);
      const months = response?.extracted_json?.calculator_result?.proposed_mix?.graph_data?.months;
      map.set(bank.id, {
        logobank: bank.bankLogo,
        title: "המשכנתא שלך:",
        expireoffertext: '',
        details: {
          bank: bank.bankName,
          amount: formatMoney(
            bankSummary?.Loan_Amount ??
            bankSummary?.['סכום_הלוואה']
          ),
          years: formatYears(months, bankSummary),
          firstMonthlyPayment: formatMoney(
            bankSummary?.First_Monthly_Payment ??
            bankSummary?.['החזר_חודשי_ראשון']
          ),
          maxMonthlyPayment: formatMoney(
            bankSummary?.First_Monthly_Payment ??
            bankSummary?.['החזר_חודשי_ראשון']
          ),
        },
        totalPayments: formatMoney(
          bankSummary?.Total_Estimated_Repayment ??
          bankSummary?.['סהכ_החזר_משוער']
        ),
      });
    });
    return map;
  }, [carouselBanks, visibleBankResponses]);

  const bestOffer = useMemo(() => {
    if (!visibleBankResponses.length) return null;
    const latestByBank = new Map();
    visibleBankResponses.forEach((response) => {
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
  }, [visibleBankResponses, offerBanks]);

  const offerBankIdsSet = useMemo(() => new Set(offerBankIds), [offerBankIds]);

  const statusData = useMemo(() => ({
    title: "ריכוז הסטטוסים שלי",
    offertext: bestOffer?.bankName ? `ההצעה המשתלמת ביותר: ${bestOffer.bankName}` : '',
    list: approvedBanks.map((bank) => {
      const hasOffer = offerBankIdsSet.has(bank.id);
      return {
        bankLogo: bank.bankLogo,
        bankName: bank.bankName,
        statusText: hasOffer ? "אישור עקרוני" : "ממתין לאישור עקרוני",
        statusClass: hasOffer ? "final_approval" : "awaiting_approval",
        link: hasOffer
          ? `/suggestionspage?bankId=${bank.id}`
          : `/homebeforeapproval?bankId=${bank.id}&status=sent`,
      };
    }),
  }), [approvedBanks, offerBankIdsSet, bestOffer?.bankName]);

  useEffect(() => {
    if (!emblaApi) return;
    updateOfferCarouselControls();

    const handleSelect = () => {
      const nextIndex = emblaApi.selectedScrollSnap();
      setSelectedOfferIndex(nextIndex);
      updateOfferCarouselControls();

      if (isSyncingFromRouteRef.current) {
        return;
      }

      const bankId = carouselBanks[nextIndex]?.id;
      if (!bankId) return;

      const params = new URLSearchParams(location.search || '');
      const routeBankId = Number(params.get('bankId'));
      if (Number.isFinite(routeBankId) && routeBankId === bankId) {
        return;
      }
      navigate(`/viewoffer?bankId=${bankId}`);
    };

    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', updateOfferCarouselControls);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', updateOfferCarouselControls);
    };
  }, [emblaApi, carouselBanks, location.search, navigate, updateOfferCarouselControls]);

  useEffect(() => {
    if (!emblaApi) return;
    const params = new URLSearchParams(location.search || '');
    const routeBankId = Number(params.get('bankId'));
    if (!Number.isFinite(routeBankId)) return;
    const targetIndex = carouselBanks.findIndex((bank) => bank.id === routeBankId);
    if (targetIndex < 0) return;

    if (emblaApi.selectedScrollSnap() === targetIndex) {
      setSelectedOfferIndex(targetIndex);
      updateOfferCarouselControls();
      return;
    }

    isSyncingFromRouteRef.current = true;
    emblaApi.scrollTo(targetIndex);
    setSelectedOfferIndex(targetIndex);
    updateOfferCarouselControls();

    const frameId = window.requestAnimationFrame(() => {
      isSyncingFromRouteRef.current = false;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [carouselBanks, emblaApi, location.search, updateOfferCarouselControls]);

  const handlePrev = () => {
    if (!emblaApi || carouselBanks.length <= 1) return;
    emblaApi.scrollPrev();
  };

  const handleNext = () => {
    if (!emblaApi || carouselBanks.length <= 1) return;
    emblaApi.scrollNext();
  };

  const renderAwaitingApprovalCard = useCallback((bank) => (
    <div className="awaiting_offer_card awaiting_offer_card_mobile">
      <div className="awaiting_offer_bank_title">
        {bank ? (
          <>
            <span>
              {bank.bankLogo ? (
                <img src={bank.bankLogo} alt="" />
              ) : null}
            </span>
            {/* <h3>{bank.bankName}</h3> */}
          </>
        ) : (
          <h3>לא נמצאו בנקים להצגה</h3>
        )}
      </div>
      <div className="tag"><img src={timeicon} alt="" />ממתין לאישור עקרוני</div>
      {offersCarouselNoteVisible ? (
        <span className="notification"><img src={noteIcon} alt="" /></span>
      ) : null}
      <img src={sandicon} className="sandicon" alt="" />
    </div>
  ), [offersCarouselNoteVisible]);

  const renderBankCard = useCallback((bank) => {
    if (!bank) return null;
    if (!offerBankIdsSet.has(bank.id)) {
      return renderAwaitingApprovalCard(bank);
    }
    return (
      <YourRoutesMortgageDetails
        data={mortgageDataByBankId.get(bank.id)}
        themeColor="#D92D20"
        offersCarouselNoteVisible={offersCarouselNoteVisible}
        offersCarouselNoteIcon={noteIcon}
      />
    );
  }, [offerBankIdsSet, mortgageDataByBankId, offersCarouselNoteVisible, renderAwaitingApprovalCard]);

  const arrowDisabled = carouselBanks.length <= 1 || !emblaApi;
  const prevDisabled = arrowDisabled || !canScrollPrev;
  const nextDisabled = arrowDisabled || !canScrollNext;

  return (
    <div className="viewoffers_page">
      <div className="wrapper">
        <h1>ברוכים הבאים, {displayName}</h1>
        {carouselBanks.length > 0 ? (
          <div className="viewoffers_carousel">
            <div className="viewoffers_carousel__viewport" ref={emblaRef}>
              <div className="viewoffers_carousel__container">
                {carouselBanks.map((bank, index) => (
                  <div
                    className="viewoffers_carousel__slide"
                    key={bank?.id ?? `offer-bank-placeholder-${index}`}
                    aria-hidden={index !== selectedOfferIndex}
                  >
                    {renderBankCard(bank)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="no_offers">
            <h2>אין עדיין הצעה מבנק</h2>
            <p>הבקשות ממשיכות להתעדכן. אפשר לעבור לסטטוס של כל בנק ברשימה למטה.</p>
          </div>
        )}
        <div className="inner d_flex d_flex_jb">
          <AffordableOffer savings={bestOffer?.savings} />
          {offersCarouselNoteVisible ? (
            <div className="offer_col">
              <img src={offer_i} alt="" />
              <h4>נא לשים לב</h4>
              <p>{offersCarouselNote}</p>
            </div>
          ) : null}
          <div className="my_statuses_summary_sec d_flex d_flex_jb d_flex_as">
            <StatusSummary statusData={statusData} />
          </div>
        </div>
      </div>
      <div className="next_prev_box">
        <button type="button" className="prev" onClick={handlePrev} disabled={prevDisabled}>
          <img src={nextprevarrow} alt="" />
        </button>
        <button type="button" className="next" onClick={handleNext} disabled={nextDisabled}>
          <img src={nextprevarrow} alt="" />
        </button>
      </div>
    </div>
  );
};

export default ViewOfferspage;
