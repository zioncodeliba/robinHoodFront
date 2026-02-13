import React, { useMemo, useState } from "react";
// import { Link} from 'react-router-dom';
import '../components/simulatorcomponents/Simulatorpage.css';

import simulatorImage from '../assets/images/simulator_p_img.png';
import previcon from '../assets/images/prev_icon.png';

// components 
import MortgageCalculator from '../components/simulatorcomponents/MortgageCalculator';
import UniformBasket from '../components/simulatorcomponents/UniformBasket';

import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';


const Simulatorpage = () => {
  const [uniformBaskets, setUniformBaskets] = useState(null);
  const [periodYears, setPeriodYears] = useState(null);
  const [activeUniformBasket, setActiveUniformBasket] = useState(null);

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

  const getMaxMonthly = (basket) => {
    const principal = basket?.graph_data?.principal_repayment || [];
    const interest = basket?.graph_data?.interest_payment || [];
    const indexation = basket?.graph_data?.indexation_component || [];
    const length = Math.max(principal.length, interest.length, indexation.length);
    let max = 0;
    for (let i = 0; i < length; i += 1) {
      const sum = (principal[i] || 0) + (interest[i] || 0) + (indexation[i] || 0);
      if (sum > max) max = sum;
    }
    return max || null;
  };

  const buildRoutesData = () => {
    const basket = activeUniformBasket?.raw;
    if (!basket) return {};
    const summary = basket?.summary || {};
    const tracks = Array.isArray(basket?.tracks_detail) ? basket.tracks_detail : [];
    const totalByTracks = tracks.reduce((sum, t) => sum + (Number(t?.['סכום']) || 0), 0);
    const totalAmount = totalByTracks > 0 ? totalByTracks : Number(summary['סכום_הלוואה']) || 0;

    const routesList = tracks.map((track) => {
      const amount = Number(track?.['סכום']) || 0;
      const percent = totalAmount > 0 ? `${((amount / totalAmount) * 100).toFixed(1)}%` : '-';
      return {
        name: track?.['שם'] || '-',
        percentage: percent,
        interest: formatPercent(track?.['ריבית']),
        balance: formatMoney(amount),
      };
    });

    return {
      title: activeUniformBasket?.title || "המשכנתא שלך:",
      details: {
        bank: "סל אחיד",
        amount: formatMoney(summary['סכום_הלוואה']),
        years: periodYears ? `${periodYears}` : '-',
        firstMonthlyPayment: formatMoney(summary['החזר_חודשי_ראשון']),
        maxMonthlyPayment: formatMoney(getMaxMonthly(basket)),
      },
      totalPayments: formatMoney(summary['סהכ_החזר_משוער']),
      note: {
        text: "הסבר על המסלולים",
      },
      routes: {
        headers: ["מסלולים", "ריבית", "יתרה"],
        list: routesList,
      },
    };
  };

  const chartData = useMemo(() => {
    const basket = activeUniformBasket?.raw;
    const graph = basket?.graph_data;
    if (!graph) return [];
    const months = Array.isArray(graph.months) ? graph.months : [];
    const interest = Array.isArray(graph.interest_payment) ? graph.interest_payment : [];
    const principal = Array.isArray(graph.principal_repayment) ? graph.principal_repayment : [];
    const length = Math.min(months.length || 0, interest.length || 0, principal.length || 0);
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
      });
    }
    return byYear;
  }, [activeUniformBasket]);

  return (
    <div className="simulator_page ">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
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
                      fund={'קרן'} 
                      dataSets={chartData} 
                      key={activeUniformBasket?.title || 'returns-chart'}
                      kerenColor={"#27450E"}
                      rivitColor={"#E27600"}
                    />
                  <YourRoutesMortgageDetails data={buildRoutesData()} themeColor="#E27600" />
                </div>
              )}
              <button className="btn approval_btn">מעבר להגשת בקשה לאישור עקרוני</button>
            </div>
            <img src={simulatorImage} className="img1 desktop_img" alt="" />
       </div>
    </div>
  );
};

export default Simulatorpage;