import React, { useState } from 'react';


import CustomRangeInput from './CustomRangeInput';

const MIN_AMOUNT = 100000;
const MAX_AMOUNT = 1500000;
const STEP_AMOUNT = 10000;

const MIN_TERM = 5;
const MAX_TERM = 30;
const STEP_TERM = 1;




const MortgageCalculator = () => {
  const [mortgageAmount, setMortgageAmount] = useState(MIN_AMOUNT);
  const [termInYears, setTermInYears] = useState(MIN_TERM);


  return (
    <>
      <div className="mortgage_calculator_sec">
        <div className="had">
          <h1>מחשבון משכנתא</h1>
        </div>
        <div className="wrap_mortgage">
          <h2>סימולטור מורחב לבדיקת  <span>משכנתאות</span>.</h2>
          <p>הזינו את הפרטים הרלוונטיים על מנת לבדוק את מפרט המשכנתא</p>
          <div className="inner d_flex d_flex_jb">
            <div className="mortgage_amount">
              <h3>סכום משכנתא</h3>
              <CustomRangeInput
                value={mortgageAmount}
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                step={STEP_AMOUNT}
                unit="ש״ח"
                onChange={(e) => setMortgageAmount(Number(e.target.value))}
              />
            </div>
            <div className="refund_period">
              <h3>תקופת החזר</h3>
                <CustomRangeInput
                value={termInYears}
                min={MIN_TERM}
                max={MAX_TERM}
                step={STEP_TERM}
                unit="שנים"
                onChange={(e) => setTermInYears(Number(e.target.value))}
              />
            </div>
          </div>
          <a href="/" className='btn'>חשב</a>
        </div>
      </div>

      
    </>
  );
};

export default MortgageCalculator;