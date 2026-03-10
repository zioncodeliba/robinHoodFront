import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Link} from 'react-router-dom';
import '../components/simulatorcomponents/Simulatorpage.css';

import simulatorImage from '../assets/images/simulator_p_img.png';

// components 
import MortgageCalculator from '../components/simulatorcomponents/MortgageCalculator';
import UniformBasket from '../components/simulatorcomponents/UniformBasket';

import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import useCustomerProfile from "../hooks/useCustomerProfile";
import { NEW_MORTGAGE_TYPE, normalizeStatusForRouting } from "../utils/customerFlowRouting";

const REGISTERED_STATUSES = new Set([
  normalizeStatusForRouting("נרשם"),
  normalizeStatusForRouting("נירשם"),
]);
const CHAT_STATUS = normalizeStatusForRouting("שיחה עם הצ׳אט");


const Simulatorpage = () => {
  const navigate = useNavigate();
  const { userData } = useCustomerProfile();
  const [uniformBaskets, setUniformBaskets] = useState(null);
  const [periodYears, setPeriodYears] = useState(null);
  const [activeUniformBasket, setActiveUniformBasket] = useState(null);
  const customerStatus = normalizeStatusForRouting(userData?.status);
  const customerMortgageType = String(
    userData?.mortgage_type || userData?.mortgageType || ""
  ).trim();
  const hasNoMortgageType = !customerMortgageType || customerMortgageType === "ללא מסלול";
  const shouldShowChatButton = useMemo(() => {
    const isRegisteredWithoutType = hasNoMortgageType && REGISTERED_STATUSES.has(customerStatus);
    const isNewMortgageInChat =
      customerMortgageType === NEW_MORTGAGE_TYPE &&
      customerStatus === CHAT_STATUS;
    return isRegisteredWithoutType || isNewMortgageInChat;
  }, [customerMortgageType, customerStatus, hasNoMortgageType]);

  const handleUniformResult = (payload) => {
    if (!payload || !payload.data) {
      setUniformBaskets(null);
      setPeriodYears(null);
      setActiveUniformBasket(null);
      return;
    }
    setUniformBaskets(payload.data);
    setPeriodYears(payload.years || null);
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `₪${Number(value).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '-';
    return `% ${Number(value).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`;
  };

  const buildRoutesList = () => {
    const basket = activeUniformBasket?.raw;
    if (!basket) return [];
    const tracks = Array.isArray(basket?.tracks_detail) ? basket.tracks_detail : [];
    const totalByTracks = tracks.reduce((sum, track) => sum + (Number(track?.Amount) || 0), 0);
    const totalAmount = totalByTracks > 0 ? totalByTracks : Number(basket?.summary?.Loan_Amount) || 0;
    const fallbackMonths = Number(periodYears) > 0 ? Number(periodYears) * 12 : null;

    return tracks.map((track) => {
      const amount = Number(track?.Amount) || 0;
      const percent = totalAmount > 0 ? `${((amount / totalAmount) * 100).toFixed(1)}%` : '-';
      return {
        name: track?.Name || '-',
        percentage: percent,
        interest: formatPercent(track?.Interest),
        balance: formatMoney(amount),
        amount,
        months: Number(
          track?.Term_Months ??
          track?.termMonths ??
          track?.durationMonths
        ) || fallbackMonths,
      };
    });
  };

  const chartData = useMemo(() => {
    const basket = activeUniformBasket?.raw;
    const graph = basket?.graph_data;
    if (!graph) return [];
    const months = Array.isArray(graph.months) ? graph.months : [];
    const interest = Array.isArray(graph.interest_payment) ? graph.interest_payment : [];
    const principal = Array.isArray(graph.principal_repayment) ? graph.principal_repayment : [];
    const indexation = Array.isArray(graph.indexation_component) ? graph.indexation_component : [];
    const length = months.length || 0;
    if (length === 0) return [];

    const byYear = {};
    for (let i = 0; i < length; i += 1) {
      const monthValue = Number(months[i]) || i + 1;
      const yearIndex = Math.floor((monthValue - 1) / 12) + 1;
      const monthInYear = ((monthValue - 1) % 12) + 1;
      if (!byYear[yearIndex]) {
        byYear[yearIndex] = [];
      }
      byYear[yearIndex].push({
        name: `${monthInYear}`,
        rivit: interest[i] || 0,
        keren: principal[i] || 0,
        hatzmada: indexation[i] || 0,
      });
    }
    return byYear;
  }, [activeUniformBasket]);

  return (
    <div className="simulator_page ">
      
       <div className="wrapper">
            <MortgageCalculator onResult={handleUniformResult} />
            <div className="contents">
              <UniformBasket
                baskets={uniformBaskets}
                periodYears={periodYears}
                onActiveChange={setActiveUniformBasket}
              />
              {chartData && Object.keys(chartData).length > 0 && (
                <div className="simulator_data_box d_flex">
                  <ReturnsChart 
                      charttitle={'החזרים'} 
                      interest={'ריבית'} 
                      indexation={'הצמדה'}
                      fund={'קרן'} 
                      dataSets={chartData} 
                      variant="stacked-bars"
                      key={activeUniformBasket?.title || 'returns-chart'}
                      kerenColor={"#E27600"}
                      hatzmadaColor={"#A7B88F"}
                      rivitColor={"#27450E"}
                    />
                  <RoutesBankMortgage
                    color="#E27600"
                    routes={buildRoutesList()}
                    maxVisibleRoutes={5}
                    expandLabel="לצפיה בכל המסלולים"
                    collapseLabel="הסתר מסלולים"
                  />
                </div>
              )}
              {shouldShowChatButton && (
                <button
                  type="button"
                  className="btn approval_btn"
                  onClick={() => navigate("/aichat")}
                >
                  מעבר להגשת בקשה לאישור עקרוני
                </button>
              )}
            </div>
            <img src={simulatorImage} className="img1 desktop_img" alt="" />
       </div>
    </div>
  );
};

export default Simulatorpage;
