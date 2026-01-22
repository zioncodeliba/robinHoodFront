import React from "react";

import '../components/mortgagecyclecheckcomponents/mortgagecyclecheck.css';

import MortgageUploadfiles from '../components/mortgagecyclecheckcomponents/MortgageUploadfiles';
import MortgageFinaldetails from '../components/mortgagecyclecheckcomponents/MortgageFinaldetails';

import prevIcon from '../assets/images/prev_icon.png';

const MortgageCycleCheck = () => {

  return (
    <div className="mortgagecyclecheck_page">
      <a href="/" className="prev_page_link"><img src={prevIcon} alt="" /></a>
      <h1>בדיקת מחזור משכנתא</h1>
      <MortgageUploadfiles />
      <MortgageFinaldetails />
      <div className="next_prev_btnk d_flex d_flex_ac d_flex_jb">
        <a href="/"> &lt; הקודם</a>
        <a href="/" className="btn">המשך</a>
      </div>
    </div>
  );
};

export default MortgageCycleCheck;