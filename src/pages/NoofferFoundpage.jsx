// Homepage.jsx
import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import '../components/nooffercompomponents/NoofferFoundpage.css';

import mirroricon from "../assets/images/mirror.svg";

import NoOfferMortgageDetails from '../components/nooffercompomponents/NoOfferMortgageDetails';
import {
  buildBankMortgageData,
  buildMortgageDataFromTracks,
  getLatestMortgageCycleResponse,
  loadMortgageCycleResult,
  saveMortgageCycleResult,
} from "../utils/mortgageCycleResult";
import { useNavState } from "../context/NavStateContext";
// import RoutesMortgageDetails from '../components/mortgagecyclecomponents/RoutesMortgageDetails';



const NoofferFoundpage = () => {
  const location = useLocation();
  const { bankResponses: navBankResponses } = useNavState();
  const storedResult = useMemo(() => loadMortgageCycleResult(), []);
  const fallbackNavBankResponse = useMemo(
    () => getLatestMortgageCycleResponse(navBankResponses),
    [navBankResponses]
  );
  const bankResponse =
    location.state?.bankResponse ||
    storedResult ||
    fallbackNavBankResponse ||
    null;

  useEffect(() => {
    if (!bankResponse) return;
    if (location.state?.bankResponse || storedResult) return;
    saveMortgageCycleResult(bankResponse);
  }, [bankResponse, location.state?.bankResponse, storedResult]);

  const { mortgageData } = useMemo(
    () => buildMortgageDataFromTracks(bankResponse),
    [bankResponse]
  );
  const bankMortgageData = useMemo(
    () => buildBankMortgageData(bankResponse),
    [bankResponse]
  );
  const routesFromCurrentMortgage = useMemo(() => {
    const tracks =
      bankResponse?.extracted_json?.calculator_result?.detailed_scenarios?.["משכנתא נוכחית"]?.tracks;
    if (Array.isArray(tracks) && tracks.length > 0) {
      const formatCurrency = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return "—";
        return `₪${Math.round(num).toLocaleString("he-IL")}`;
      };
      const formatRate = (value) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return "—";
        return `${num.toFixed(2).replace(/\.00$/, "")}%`;
      };
      return tracks.map((track, index) => {
        const amount = Number(
          track?.["סכום"] ??
          track?.amount ??
          track?.loan_value ??
          0
        );
        const months = Number(
          track?.["תקופה_חודשים"] ??
          track?.["תקופה (חודשים)"] ??
          track?.months
        );
        return {
          name:
            track?.["מסלול"] ||
            track?.["סוג_מסלול"] ||
            track?.name ||
            `מסלול ${index + 1}`,
          interest: formatRate(track?.["ריבית"] ?? track?.rate),
          balance: formatCurrency(amount),
          amount: Number.isFinite(amount) ? amount : 0,
          months: Number.isFinite(months) ? months : null,
        };
      });
    }
    return Array.isArray(mortgageData?.routes?.list) ? mortgageData.routes.list : [];
  }, [bankResponse, mortgageData]);

  return (
    <div className="no_offer_found_page">
      {/* <a href="/recycle-loan" className="prev_page_link"><img src={prevIcon} alt="" /></a> */}
      {/* <h1>בדיקת מחזור משכנתא</h1>
      <h2>נא לעלות את מסמכי המשכנתא הנוכחית שלכם </h2> */}
      <div className="check_nav d_flex d_flex_ac d_flex_jc">
        <span className="number">1</span>
        <span className="title">תוצאות</span>
      </div>
      <div className="wrapper d_flex d_flex_jb d_flex_as">       
        <div className="right_col">
          <div className="mirror_col">
            <img src={mirroricon} alt="" />
            <h2>בדקנו ואין כדאיות כרגע למחזור את <br/> המשכנתא</h2>
            <p>המשכנתא שלך נמצאת בתנאים האופטימליים <br/>
                אך אל דאגה פיתחנו אלגוריתם חכם שיודע לנטר את המשכנתא שלך וברגע שימצא חיסכון להתריע מיידית.
             </p>
          </div>
        </div>
        <div className="left_col">
          {/* <BankMortgage data={bankMortgageData} /> */}
          {mortgageData ? (
            <NoOfferMortgageDetails
              data={mortgageData}
              themeColor={bankMortgageData?.color || "#4E8FF7"}
              routesFromCurrentMortgage={routesFromCurrentMortgage}
              bankLogo={bankMortgageData?.icon}
              bankName={bankMortgageData?.name}
              bankCardData={bankMortgageData}
            />
          ) : null}
        </div>
      </div>
    </div>  
  );
};

export default NoofferFoundpage;
