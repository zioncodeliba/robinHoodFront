// Homepage.jsx
import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import '../components/nooffercompomponents/NoofferFoundpage.css';

import mirroricon from "../assets/images/mirror.svg";
import prevIcon from '../assets/images/prev_icon.svg';

import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';
import {
  buildMortgageDataFromTracks,
  loadMortgageCycleResult,
} from "../utils/mortgageCycleResult";
// import RoutesMortgageDetails from '../components/mortgagecyclecomponents/RoutesMortgageDetails';



const NoofferFoundpage = () => {
  const location = useLocation();
  const storedResult = useMemo(() => loadMortgageCycleResult(), []);
  const bankResponse = location.state?.bankResponse || storedResult;
  const { mortgageData } = useMemo(
    () => buildMortgageDataFromTracks(bankResponse),
    [bankResponse]
  );



  return (
    <div className="no_offer_found_page">
      <a href="/recycle-loan" className="prev_page_link"><img src={prevIcon} alt="" /></a>
      <h1>בדיקת מחזור משכנתא</h1>
      <h2>נא לעלות את מסמכי המשכנתא הנוכחית שלכם </h2>
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
          <YourRoutesMortgageDetails data={mortgageData} themeColor="#D92D20" />         
        </div>
      </div>
    </div>  
  );
};

export default NoofferFoundpage;
