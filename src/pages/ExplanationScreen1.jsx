// Homepage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from 'react-router-dom';

import brand from '../assets/images/logoup.svg';
import screenImage from '../assets/images/explanationscreen_image1.png';
import screenImage2 from '../assets/images/explanationscreen_image2.png';

const EXPLANATION_STEPS = [
  {
    image: screenImage,
    title: "ייעוץ משכנתא מותאם אישית",
    description: "מתכוונים לקנות בקרוב נכס? רגע לפני אולי  כדאי שפשוט תשוו, תבדקו, תעשו סימולציה ובעיקר, תנו לרובין להשיג בשבילכם יותר."
  },
  {
    image: screenImage2,
    title: "בדיקת משכנתא קיימת וניטור מתקדם",
    description: "תנו לרובין לבדוק עבורכם בחינם האם אתם יכולים לחסוך במשכנתא, מעבר לזה, רובין ממשיך לנטר בשבילכם את המשכנתא ובכל פעם שתהיה הזדמנות לחיסכון תקבלו עדכון מיידי."
  }
];
const CONNECTOR_FILL_DURATION_MS = 350;

const ExplanationScreen1 = ({ initialStep = 0 }) => {
  const normalizedInitialStep = useMemo(
    () => Math.max(0, Math.min(Number(initialStep) || 0, EXPLANATION_STEPS.length - 1)),
    [initialStep]
  );
  const [stepIndex, setStepIndex] = useState(normalizedInitialStep);
  const [isSecondDotActive, setIsSecondDotActive] = useState(
    normalizedInitialStep === EXPLANATION_STEPS.length - 1
  );
  const connectorTimeoutRef = useRef(null);

  useEffect(() => {
    if (connectorTimeoutRef.current) {
      window.clearTimeout(connectorTimeoutRef.current);
      connectorTimeoutRef.current = null;
    }
    setStepIndex(normalizedInitialStep);
    setIsSecondDotActive(normalizedInitialStep === EXPLANATION_STEPS.length - 1);
  }, [normalizedInitialStep]);

  useEffect(() => {
    return () => {
      if (connectorTimeoutRef.current) {
        window.clearTimeout(connectorTimeoutRef.current);
      }
    };
  }, []);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === EXPLANATION_STEPS.length - 1;
  const currentStep = EXPLANATION_STEPS[stepIndex];
  const handlePrevStep = () => {
    if (connectorTimeoutRef.current) {
      window.clearTimeout(connectorTimeoutRef.current);
      connectorTimeoutRef.current = null;
    }
    setStepIndex(0);
    setIsSecondDotActive(false);
  };
  const handleNextStep = () => {
    if (connectorTimeoutRef.current) {
      window.clearTimeout(connectorTimeoutRef.current);
    }
    setStepIndex(1);
    setIsSecondDotActive(false);
    connectorTimeoutRef.current = window.setTimeout(() => {
      setIsSecondDotActive(true);
      connectorTimeoutRef.current = null;
    }, CONNECTOR_FILL_DURATION_MS);
  };

  return (
    <div className={`explanation_screen ${isLastStep ? "explanation_screen2" : "explanation_screen1"}`}>
      <Link to="/login" className="skip">דלג</Link>
        <Link to="/login" className="brand"> <img src={brand} alt="brand" /> </Link> 
        <div className="inner">
            <img src={currentStep.image} className="simage" alt="" />
            <div className="text">
                <ul className={`dots d_flex d_flex_jc d_flex_ac ${isLastStep ? "step-2" : "step-1"}`}>
                  <li className="active"></li>
                  <li className={isSecondDotActive ? "active" : ""}></li>
                </ul>
                <h3>{currentStep.title}</h3>
                <p>{currentStep.description}</p>
                <div className={`btn_col d_flex d_flex_ac ${isFirstStep ? "d_flex_je" : "d_flex_jb"}`}>
                  {!isFirstStep && (
                    <button type="button" className="prev" onClick={handlePrevStep}>
                      &lt; הקודם
                    </button>
                  )}
                  {isLastStep ? (
                    <Link to="/login" className="next">הבא &gt; </Link>
                  ) : (
                    <button type="button" className="next" onClick={handleNextStep}>
                      הבא &gt;
                    </button>
                  )}
                </div>
            </div>
        </div>
    </div>  
  );
};

export default ExplanationScreen1;
