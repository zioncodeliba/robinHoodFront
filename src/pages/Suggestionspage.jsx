import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import useEmblaCarousel from "embla-carousel-react";
import '../components/suggestionscomponents/Suggestionspage.css';

// images 
import notei from '../assets/images/note_i.svg';
import nextprevarrow from "../assets/images/np_arrow.svg";

// components 
import BankMortgageCard from '../components/suggestionscomponents/BankMortgageCard';
// import InternationalSuggestionCard from '../components/suggestionscomponents/InternationalSuggestionCard';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import NotePopup from '../components/suggestionscomponents/NotePopup';
import { useNavState } from "../context/NavStateContext";

const BANK_LOGOS = {
    hapoalim: "/banks/hapoalim.png",
    leumi: "/banks/leumi.png",
    mizrahi: "/banks/mizrahi.png",
    discount: "/banks/discount.png",
    international: "/banks/international.png",
    mercantile: "/banks/mercantile.png",
};

const BANK_META = {
  1: {
    id: 1,
    name: "בנק מזרחי טפחות",
    name_en: "Mizrahi-Tefahot",
    color: "#F5821F",
    bankLogo: BANK_LOGOS.mizrahi,
  },
  2: {
    id: 2,
    name: "בנק לאומי",
    name_en: "National Bank",
    color: "#007BFF",
    bankLogo: BANK_LOGOS.leumi,
  },
  3: {
    id: 3,
    name: "בנק הפועלים",
    name_en: "Hapoalim",
    color: "#D92D20",
    bankLogo: BANK_LOGOS.hapoalim,
  },
  4: {
    id: 4,
    name: "בנק דיסקונט",
    name_en: "Discount",
    color: "#27450E",
    bankLogo: BANK_LOGOS.discount,
  },
  8: {
    id: 8,
    name: "בנק הבינלאומי",
    name_en: "International",
    color: "#FDB726",
    bankLogo: BANK_LOGOS.international,
  },
  12: {
    id: 12,
    name: "בנק מרכנתיל",
    name_en: "Mercantile",
    color: "#27450E",
    bankLogo: BANK_LOGOS.mercantile,
  },
};

const Suggestionspage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bankResponses: navBankResponses, isLoaded: navStateLoaded } = useNavState();
  const [bankResponses, setBankResponses] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [openPopupId, setOpenPopupId] = useState(null);

  const openPopup = (id) => {
    setOpenPopupId(id);
  };

  const closePopup = () => {
    setOpenPopupId(null);
  };

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) {
      handleAuthFailure();
      return undefined;
    }
    return undefined;
  }, [handleAuthFailure]);

  useEffect(() => {
    if (!navStateLoaded) {
      setOffersLoading(true);
      setOffersLoaded(false);
      setBankResponses([]);
      return;
    }
    setBankResponses(Array.isArray(navBankResponses) ? navBankResponses : []);
    setOffersLoaded(true);
    setOffersLoading(false);
  }, [navBankResponses, navStateLoaded]);

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  };

  const formatCurrency = (value) => {
    const num = toNumber(value);
    if (!Number.isFinite(num)) return '—';
    return `₪${num.toLocaleString('he-IL')}`;
  };

  const formatPercent = (value) => {
    const num = toNumber(value);
    if (!Number.isFinite(num)) return null;
    const normalized = Math.round(num * 10) / 10;
    return `${normalized.toString().replace(/\.0$/, '')}%`;
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
    response?.extracted_json?.calculator_result?.optimal_mix?.metrics ||
    null;

  const getYears = (response, summary) => {
    const months = getDurationMonths(response?.extracted_json?.calculator_result?.proposed_mix?.graph_data?.months);
    if (months !== null && months > 0) {
      const years = Math.round((months / 12) * 10) / 10;
      return String(years).replace(/\.0$/, '');
    }
    const fallbackYears =
      summary?.['תקופה_מקסימלית'] ??
      summary?.['תקופה_בשנים'] ??
      summary?.['תקופה'];
    if (fallbackYears === null || fallbackYears === undefined || fallbackYears === '') return '—';
    return String(fallbackYears);
  };

  const getRoutes = (response) => {
    const calc = response?.extracted_json?.calculator_result || null;
    const tracksDetail =
      calc?.proposed_mix?.tracks_detail ||
      calc?.optimal_mix?.tracks_detail ||
      null;
    if (Array.isArray(tracksDetail) && tracksDetail.length > 0) {
      const mappedTracks = tracksDetail.map((track) => {
        const amount = toNumber(
          track?.['סכום'] ??
          track?.amount ??
          track?.loan_value ??
          track?.balance
        ) || 0;
        const rawPercent = toNumber(
          track?.['אחוז'] ??
          track?.['אחוז מסכום ההלוואה'] ??
          track?.percentage ??
          track?.['שיעור']
        );
        const rawInterest = toNumber(
          track?.['ריבית'] ??
          track?.['שיעור_ריבית'] ??
          track?.['ריבית שנתית'] ??
          track?.interest ??
          track?.rate
        );
        const rawMonthlyPayment = toNumber(
          track?.['החזר_חודשי'] ??
          track?.monthly_payment ??
          track?.payment
        );
        const rawMonths = toNumber(
          track?.['תקופה_חודשים'] ??
          track?.['תקופה (חודשים)'] ??
          track?.months
        );
        const name =
          track?.['סוג_מסלול'] ||
          track?.['שם'] ||
          track?.['מסלול'] ||
          track?.loan_type_name ||
          'מסלול';
        return {
          label: name,
          name,
          amount,
          rawPercent,
          rawInterest,
          rawMonthlyPayment,
          rawMonths,
        };
      });
      const total = mappedTracks.reduce((sum, item) => sum + item.amount, 0);
      return mappedTracks.map((item) => ({
        label: item.label,
        name: item.name,
        amount: item.amount,
        percent:
          item.rawPercent !== null
            ? item.rawPercent
            : total
              ? Math.round((item.amount / total) * 100)
              : 0,
        percentage: formatPercent(
          item.rawPercent !== null
            ? item.rawPercent
            : total
              ? (item.amount / total) * 100
              : 0
        ),
        interest: formatPercent(item.rawInterest) || '—',
        balance: formatCurrency(item.rawMonthlyPayment ?? item.amount),
        months: item.rawMonths,
      }));
    }

    const table =
      calc?.optimal_mix?.table ||
      calc?.proposed_mix?.table ||
      null;
    if (!Array.isArray(table)) return [];
    const total = table.reduce(
      (sum, row) => sum + (toNumber(row?.['סכום']) || 0),
      0
    );
    return table.map((row) => {
      const amount = toNumber(row?.['סכום']) || 0;
      const percent = total ? Math.round((amount / total) * 100) : 0;
      return {
        label: row?.['סוג_מסלול'] || row?.['שם'] || row?.['מסלול'] || 'מסלול',
        name: row?.['סוג_מסלול'] || row?.['שם'] || row?.['מסלול'] || 'מסלול',
        amount,
        months: toNumber(
          row?.['תקופה_חודשים'] ??
          row?.['תקופה (חודשים)'] ??
          row?.months
        ),
        percent,
        percentage: formatPercent(percent) || '0%',
        interest: formatPercent(row?.['ריבית']) || '—',
        balance: formatCurrency(row?.['החזר_חודשי'] ?? amount),
      };
    });
  };

  const buildChartDataFromGraph = (graph) => {
    if (!graph || typeof graph !== 'object') return null;
    const months = Array.isArray(graph.months) ? graph.months : [];
    const interest = Array.isArray(graph.interest_payment) ? graph.interest_payment : [];
    const principal = Array.isArray(graph.principal_repayment) ? graph.principal_repayment : [];
    const length = Math.min(months.length || 0, interest.length || 0, principal.length || 0);
    if (length === 0) return null;

    const byYear = {};
    for (let i = 0; i < length; i += 1) {
      const monthValue = Number(months[i]) || i + 1;
      const yearIndex = Math.floor((monthValue - 1) / 12) + 1;
      const monthInYear = ((monthValue - 1) % 12) + 1;
      if (!byYear[yearIndex]) {
        byYear[yearIndex] = [];
      }
      byYear[yearIndex].push({
        name: String(monthInYear),
        rivit: Number(interest[i]) || 0,
        keren: Number(principal[i]) || 0,
      });
    }
    return byYear;
  };

  const getChartData = (response) => {
    const graphData = response?.extracted_json?.calculator_result?.proposed_mix?.graph_data || null;
    return buildChartDataFromGraph(graphData);
  };

  const visibleOffers = useMemo(() => {
    if (!bankResponses.length) return [];
    const byBank = new Map();
    bankResponses.forEach((response) => {
      const bankId = Number(response?.bank_id);
      if (!Number.isFinite(bankId)) return;
      const prev = byBank.get(bankId);
      if (!prev) {
        byBank.set(bankId, response);
        return;
      }
      const prevDate = new Date(prev?.uploaded_at || 0).getTime();
      const nextDate = new Date(response?.uploaded_at || 0).getTime();
      if (nextDate >= prevDate) {
        byBank.set(bankId, response);
      }
    });
    return Array.from(byBank.values())
      .filter((response) => {
        const calcResult = response?.extracted_json?.calculator_result || null;
        const isRefinance =
          Array.isArray(calcResult?.comparison_table) ||
          (calcResult?.detailed_scenarios &&
            typeof calcResult.detailed_scenarios === 'object');
        // Refinance results are not part of "Robin suggestions" list.
        if (isRefinance) return false;
        return true;
      })
      .map((response) => {
      const bankId = Number(response?.bank_id);
      const meta = BANK_META[bankId] || {};
      const summary = getSummary(response);
      const bankTitle = response?.extracted_json?.data?.bank_title;
      const amount = toNumber(summary?.['סכום_הלוואה']) ?? response?.amount ?? null;
      return {
        id: bankId,
        name: meta.name || bankTitle || `בנק ${bankId}`,
        name_en: meta.name_en || '',
        bankLogo: meta.bankLogo || '',
        color: meta.color || "#27450E",
        status: { type: "conditional" },
        amount,
        years: getYears(response, summary),
        maxMonthlyPayment: toNumber(summary?.['החזר_חודשי_ראשון']),
        firstMonthlyPayment: toNumber(summary?.['החזר_חודשי_ראשון']),
        totalPayments: toNumber(summary?.['סהכ_החזר_משוער']),
        routes: getRoutes(response),
        simulatorchartdata: getChartData(response),
      };
    });
  }, [bankResponses]);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: visibleOffers.length > 1,
    direction: "rtl",
    align: "start",
  });

  const hasOffers = visibleOffers.length > 0;
  const activeOffer = hasOffers
    ? (visibleOffers[selectedOfferIndex] || visibleOffers[0] || null)
    : null;
  const showPager = visibleOffers.length > 1;

  useEffect(() => {
    if (!visibleOffers.length) {
      setSelectedOfferIndex(0);
      return;
    }
    setSelectedOfferIndex((prev) => (
      prev < 0 || prev >= visibleOffers.length ? 0 : prev
    ));
  }, [visibleOffers.length]);

  const updateOfferCarouselControls = useCallback(() => {
    if (!emblaApi || visibleOffers.length <= 1) {
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi, visibleOffers.length]);

  useEffect(() => {
    if (!emblaApi) return;
    updateOfferCarouselControls();

    const handleSelect = () => {
      setSelectedOfferIndex(emblaApi.selectedScrollSnap());
      updateOfferCarouselControls();
    };

    emblaApi.on('select', handleSelect);
    emblaApi.on('reInit', updateOfferCarouselControls);

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('reInit', updateOfferCarouselControls);
    };
  }, [emblaApi, updateOfferCarouselControls]);

  useEffect(() => {
    if (!emblaApi || !visibleOffers.length) return;
    const params = new URLSearchParams(location.search || '');
    const routeBankId = Number(params.get('bankId'));
    if (!Number.isFinite(routeBankId)) return;

    const targetIndex = visibleOffers.findIndex((offer) => offer.id === routeBankId);
    if (targetIndex < 0) return;

    if (emblaApi.selectedScrollSnap() === targetIndex) {
      setSelectedOfferIndex(targetIndex);
      updateOfferCarouselControls();
      return;
    }

    emblaApi.scrollTo(targetIndex);
    setSelectedOfferIndex(targetIndex);
    updateOfferCarouselControls();
  }, [emblaApi, location.search, updateOfferCarouselControls, visibleOffers]);

  const handlePrevPage = () => {
    if (!emblaApi || visibleOffers.length <= 1) return;
    emblaApi.scrollPrev();
  };

  const handleNextPage = () => {
    if (!emblaApi || visibleOffers.length <= 1) return;
    emblaApi.scrollNext();
  };

  const arrowDisabled = visibleOffers.length <= 1 || !emblaApi;
  const prevDisabled = arrowDisabled || !canScrollPrev;
  const nextDisabled = arrowDisabled || !canScrollNext;

  return (
    <div className="suggestions_page">
      <div className="title">
        <h1>ההצעות של רובין.</h1>
        <p>לפניכם מגוון הצעות שיאפשרו לכם להוציא יותר מהכסף שלכם</p>
      </div>
      {offersLoading && !offersLoaded ? (
        <div className="no_offers">
          <h2>טוען הצעות...</h2>
        </div>
      ) : hasOffers ? (
        <>
          <div className="wrapper">
            <div className="colin suggestions_active_offer">
              <div className="suggestions_card_carousel">
                <div className="suggestions_card_carousel__viewport" ref={emblaRef}>
                  <div className="suggestions_card_carousel__container">
                    {visibleOffers.map((offer, index) => (
                      <div
                        className="suggestions_card_carousel__slide"
                        key={offer.id}
                        aria-hidden={index !== selectedOfferIndex}
                      >
                        <BankMortgageCard bankData={offer} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="baskets_list">
                <ul className="d_flex">
                  <li>סל אחיד 1</li>
                </ul>
              </div>
              <div className="note" onClick={() => openPopup(activeOffer.id)}>
                <img src={notei} alt="" />
                <p>הסבר על המסלולים</p>
              </div>
              <RoutesBankMortgage color={activeOffer.color} routes={activeOffer.routes} />
              {activeOffer.simulatorchartdata ? (
                <ReturnsChart
                  charttitle={'החזרים'}
                  interest={'ריבית'}
                  fund={'קרן'}
                  dataSets={activeOffer.simulatorchartdata}
                  kerenColor={"#27450E"}
                  rivitColor={"#E27600"}
                />
              ) : null}
              <NotePopup isOpen={openPopupId === activeOffer.id} onClose={closePopup} />
            </div>
          </div>
          {showPager ? (
            <div className="next_prev_box">
              <button type="button" className="prev" onClick={handlePrevPage} disabled={prevDisabled}>
                <img src={nextprevarrow} alt="" />
              </button>
              <button type="button" className="next" onClick={handleNextPage} disabled={nextDisabled}>
                <img src={nextprevarrow} alt="" />
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="no_offers">
          <h2>אין הצעות כרגע</h2>
          <p>ברגע שתתקבל הצעה חדשה — היא תופיע כאן.</p>
        </div>
      )}
    </div>
  );
};

export default Suggestionspage;
