import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import '../components/suggestionscomponents/Suggestionspage.css';

// images 
import notei from '../assets/images/note_i.svg';
import nextprevarrow from "../assets/images/np_arrow.svg";
import previcon from '../assets/images/prev_icon.svg';
import hapoalimbankicon from "../assets/images/hapoalimbank-icon.svg";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";

// components 
import BankMortgageCard from '../components/suggestionscomponents/BankMortgageCard';
import InternationalSuggestionCard from '../components/suggestionscomponents/InternationalSuggestionCard';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import NotePopup from '../components/suggestionscomponents/NotePopup';
import { getGatewayBase } from "../utils/apiBase";

const DISCOUNT_BANK_LOGO_URL = "/discont.webp";
const INTERNATIONAL_BANK_LOGO_URL = "/banks/international-logo.png";
const MERCANTILE_BANK_LOGO_URL = "/Mercantile.svg.png";

const BANK_META = {
  1: {
    id: 1,
    name: "בנק מזרחי טפחות",
    name_en: "Mizrahi-Tefahot",
    color: "#F5821F",
    bankLogo: mizrahitefahotbank,
  },
  2: {
    id: 2,
    name: "בנק לאומי",
    name_en: "National Bank",
    color: "#007BFF",
    bankLogo: nationalbank,
  },
  3: {
    id: 3,
    name: "בנק הפועלים",
    name_en: "Hapoalim",
    color: "#D92D20",
    bankLogo: hapoalimbankicon,
  },
  4: {
    id: 4,
    name: "בנק דיסקונט",
    name_en: "Discount",
    color: "#27450E",
    bankLogo: DISCOUNT_BANK_LOGO_URL,
  },
  8: {
    id: 8,
    name: "בנק הבינלאומי",
    name_en: "International",
    color: "#FDB726",
    bankLogo: INTERNATIONAL_BANK_LOGO_URL,
  },
  12: {
    id: 12,
    name: "בנק מרכנתיל",
    name_en: "Mercantile",
    color: "#27450E",
    bankLogo: MERCANTILE_BANK_LOGO_URL,
  },
};

const Suggestionspage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const [bankResponses, setBankResponses] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersLoaded, setOffersLoaded] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(max-width: 767px)').matches
      : false
  );

  const [openPopupId, setOpenPopupId] = useState(null);

  const openPopup = (id) => {
    setOpenPopupId(id);
  };

  const closePopup = () => {
    setOpenPopupId(null);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(max-width: 767px)');
    const handleChange = (event) => setIsMobile(event.matches);
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
    } else {
      media.addListener(handleChange);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  const handleAuthFailure = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!apiBase) return;
    if (!token) {
      handleAuthFailure();
      return;
    }
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
        setBankResponses(responses);
        setOffersLoaded(true);
      } catch {
        if (isMounted) {
          setBankResponses([]);
          setOffersLoaded(true);
        }
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

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const numeric = Number(String(value).replace(/[^\d.-]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  };

  const toPositiveInt = (value) => {
    const num = Math.round(toNumber(value) ?? 0);
    return Number.isFinite(num) && num > 0 ? num : 0;
  };

  const getMetrics = (response) =>
    response?.extracted_json?.calculator_result?.optimal_mix?.metrics ||
    response?.extracted_json?.calculator_result?.proposed_mix?.metrics ||
    null;

  const getRoutes = (response) => {
    const calc = response?.extracted_json?.calculator_result || null;
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
        amount,
        percent,
      };
    });
  };

  const computeGraphFromTable = (table) => {
    if (!Array.isArray(table) || table.length === 0) return null;
    const routes = table
      .map((row) => {
        const amount = toNumber(row?.['סכום']) ?? 0;
        const months = toPositiveInt(row?.['תקופה_חודשים'] ?? row?.['תקופה (חודשים)']);
        const ratePct = toNumber(row?.['ריבית']) ?? 0;
        const payment = toNumber(row?.['החזר_חודשי']);
        if (!amount || !months) return null;
        return { amount, months, ratePct, payment };
      })
      .filter(Boolean);

    if (!routes.length) return null;

    const maxMonths = Math.max(...routes.map((route) => route.months));
    if (!maxMonths) return null;
    const principalArr = new Array(maxMonths).fill(0);
    const interestArr = new Array(maxMonths).fill(0);

    routes.forEach((route) => {
      const monthlyRate = route.ratePct ? route.ratePct / 100 / 12 : 0;
      const payment =
        route.payment && route.payment > 0
          ? route.payment
          : monthlyRate === 0
            ? route.amount / route.months
            : (route.amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -route.months));
      let balance = route.amount;
      for (let i = 0; i < route.months; i += 1) {
        if (balance <= 0) break;
        const interest = monthlyRate ? balance * monthlyRate : 0;
        let principal = payment - interest;
        if (principal < 0) principal = 0;
        if (principal > balance) principal = balance;
        balance -= principal;
        principalArr[i] += principal;
        interestArr[i] += interest;
      }
    });

    const years = Math.max(1, Math.ceil(maxMonths / 12));
    const dataByYear = {};
    for (let year = 0; year < years; year += 1) {
      const yearData = [];
      const startIndex = year * 12;
      for (let month = 0; month < 12; month += 1) {
        const idx = startIndex + month;
        yearData.push({
          name: String(month + 1),
          keren: principalArr[idx] ?? 0,
          rivit: interestArr[idx] ?? 0,
        });
      }
      dataByYear[String(year + 1)] = yearData;
    }
    return dataByYear;
  };

  const getChartData = (response) => {
    const table = response?.extracted_json?.calculator_result?.optimal_mix?.table || null;
    return computeGraphFromTable(table);
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
      const metrics = getMetrics(response);
      const bankTitle = response?.extracted_json?.data?.bank_title;
      const amount = toNumber(metrics?.['סכום_הלוואה']) ?? response?.amount ?? null;
      return {
        id: bankId,
        name: meta.name || bankTitle || `בנק ${bankId}`,
        name_en: meta.name_en || '',
        bankLogo: meta.bankLogo || '',
        color: meta.color || "#27450E",
        status: { type: "conditional" },
        amount,
        years: metrics?.['תקופה_מקסימלית'] ?? '—',
        maxMonthlyPayment: toNumber(metrics?.['החזר_חודשי_מקסימלי']),
        firstMonthlyPayment: toNumber(metrics?.['החזר_חודשי_ראשון']),
        totalPayments: toNumber(metrics?.['סהכ_החזר_כולל']),
        routes: getRoutes(response),
        simulatorchartdata: getChartData(response),
      };
    });
  }, [bankResponses]);

  const hasOffers = visibleOffers.length > 0;
  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(visibleOffers.length / itemsPerPage);
  const showPager = visibleOffers.length > itemsPerPage;

  useEffect(() => {
    if (!visibleOffers.length) {
      setPageIndex(0);
      return;
    }
    const maxIndex = Math.max(0, totalPages - 1);
    setPageIndex((prev) => (prev > maxIndex ? 0 : prev));
  }, [visibleOffers.length, totalPages, itemsPerPage]);

  const pagedOffers = useMemo(() => {
    if (!showPager) return visibleOffers;
    const start = pageIndex * itemsPerPage;
    return visibleOffers.slice(start, start + itemsPerPage);
  }, [visibleOffers, pageIndex, showPager]);

  const handlePrevPage = () => {
    setPageIndex((prev) => (prev <= 0 ? totalPages - 1 : prev - 1));
  };

  const handleNextPage = () => {
    setPageIndex((prev) => (prev + 1) % totalPages);
  };

  return (
    <div className="suggestions_page">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
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
          <div className="wrapper d_flex d_flex_jb">
              {pagedOffers.map(offer => (
                  <div className="colin" key={offer.id}>
                      {offer.id === 8 ? (
                        <InternationalSuggestionCard bankData={offer} />
                      ) : (
                        <BankMortgageCard bankData={offer} />
                      )}
                      <div className="baskets_list">
                        <ul className="d_flex">
                          <li>סל אחיד 1</li>
                          <li>סל אחיד 2</li>
                          <li>סל אחיד 3</li>
                        </ul>
                      </div>
                      <div className="note" onClick={() => openPopup(offer.id)}>
                        <img src={notei} alt="" />
                        <p>הסבר על המסלולים</p>
                      </div>
                      {offer.routes && offer.routes.length > 0 ? (
                        <RoutesBankMortgage color={offer.color} routes={offer.routes} />
                      ) : null}
                      {offer.simulatorchartdata ? (
                        <ReturnsChart 
                           charttitle={'החזרים'} 
                           interest={'ריבית'} 
                           fund={'קרן'} 
                           dataSets={offer.simulatorchartdata} 
                           kerenColor={"#27450E"}
                           rivitColor={"#E27600"}
                         />
                      ) : null}
                      <NotePopup isOpen={openPopupId === offer.id} onClose={closePopup} />
                  </div>
              ))}
          </div>
          {showPager ? (
            <div className="next_prev_box">
              <button type="button" className="prev" onClick={handlePrevPage}>
                <img src={nextprevarrow} alt="" />
              </button>
              <button type="button" className="next" onClick={handleNextPage}>
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
