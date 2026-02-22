// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import previcon from '../assets/images/prev_icon.png';

import {
    getDefaultAllowedBankIds,
    hasSupportedMortgageType,
} from "../utils/customerFlowRouting";
import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";
import { useNavState } from "../context/NavStateContext";

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';

const BANK_LOGOS = {
    hapoalim: "/banks/hapoalim.png",
    leumi: "/banks/leumi.png",
    mizrahi: "/banks/mizrahi.png",
    discount: "/banks/discount.png",
    international: "/banks/international.png",
    mercantile: "/banks/mercantile.png",
};

const BANK_MAP = {
    1: { name: "בנק מזרחי טפחות", logo: BANK_LOGOS.mizrahi },
    2: { name: "בנק לאומי", logo: BANK_LOGOS.leumi },
    3: { name: "בנק הפועלים", logo: BANK_LOGOS.hapoalim },
    4: { name: "בנק דיסקונט", logo: BANK_LOGOS.discount },
    8: { name: "בנק הבינלאומי", logo: BANK_LOGOS.international },
    12: { name: "בנק מרכנתיל", logo: BANK_LOGOS.mercantile }
};

const DEFAULT_BANK_ORDER = [3, 2, 1, 4, 8, 12];

const normalizeAllowedBankIds = (ids, fallback = DEFAULT_BANK_ORDER) => {
    if (!Array.isArray(ids)) return [...fallback];
    const allowed = new Set(ids.map((value) => Number(value)));
    return DEFAULT_BANK_ORDER.filter((id) => allowed.has(id));
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

const HomeBeforeApproval = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bankVisibility, bankResponses, isLoaded: navStateLoaded } = useNavState();
    const { userData } = useCustomerProfile();
    const mortgageType = String(userData?.mortgageType || userData?.mortgage_type || "").trim();
    const defaultAllowedBankIds = useMemo(
        () => (hasSupportedMortgageType(mortgageType) ? getDefaultAllowedBankIds(mortgageType) : []),
        [mortgageType]
    );
    const displayName = getCustomerDisplayName(userData, "שם");
    const [allowedBankIds, setAllowedBankIds] = useState(defaultAllowedBankIds);
    const [approvedBankIds, setApprovedBankIds] = useState([]);
    const params = new URLSearchParams(location.search);
    const bankIdParam = Number(params.get("bankId"));
    const statusKey = params.get("status");
    const statusTextParam = params.get("statusText");

    const statusLabels = {
        sent: "בקשה נשלחה לבנק",
        awaiting_approval: "ממתין לאישור הבנק",
        final_approval: "אישור סופי",
        declined: "הבקשה נדחתה",
        in_review: "בבדיקה"
    };

    useEffect(() => {
        if (!navStateLoaded) {
            setAllowedBankIds(defaultAllowedBankIds);
            return;
        }
        setAllowedBankIds(normalizeAllowedBankIds(bankVisibility, defaultAllowedBankIds));
    }, [bankVisibility, defaultAllowedBankIds, navStateLoaded]);

    useEffect(() => {
        const ids = Array.isArray(bankResponses)
            ? bankResponses
                .filter((item) => {
                    const calcResult = item?.extracted_json?.calculator_result;
                    return isApprovalOfferResult(calcResult);
                })
                .map((item) => Number(item?.bank_id))
                .filter((id) => Number.isFinite(id))
            : [];
        setApprovedBankIds(Array.from(new Set(ids)));
    }, [bankResponses]);

    const bankOrder = allowedBankIds;
    const hasBanks = bankOrder.length > 0;
    const activeBankId = hasBanks && bankOrder.includes(bankIdParam) ? bankIdParam : bankOrder[0];
    const selectedBank = activeBankId ? BANK_MAP[activeBankId] : null;
    const isApproved = activeBankId ? approvedBankIds.includes(activeBankId) : false;
    const statusLabel = statusTextParam
        || (isApproved ? "אישור עקרוני" : (statusLabels[statusKey] || statusLabels.awaiting_approval));
    const questionsdata = [
        {
            question: "כמה זמן לוקח האישור העקרוני?",
            answer: "האישור העקרוני לוקח בדרך כלל בין 3-5 ימי עסקים, תלוי בבנק ובמורכבות הבקשה."
        },
        {
            question: "מה קורה אם האישור נדחה?",
            answer: "במקרה של דחייה, נעזור לך להבין את הסיבות ולהגיש בקשה מתוקנת או לבנק אחר."
        },
        {
            question: "האם אני יכול לבטל את הבקשה?",
            answer: "אפשר לבטל את הבקשה כל עוד היא עדיין לא יצאה לטיפול.  אם התהליך כבר התחיל – לא ניתן לבטל, אבל תמיד אפשר לפנות אלינו וננסה לעזור."
        }
    ];

    const handleBackToHome = (event) => {
        event.preventDefault();
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate("/homebeforeapproval2", { replace: true });
    };

 
  return (
    <div className="homebefore_approval_page ">
        <button type="button" onClick={handleBackToHome} className="prev_page_link"><img src={previcon} alt="" /></button>
        <div className="wrapper">
            <h1>ברוכים הבאים, {displayName}</h1>
            <div className="bank_title">
                {selectedBank ? (
                    <>
                        <span><img src={selectedBank.logo} alt="" /></span>
                        <h3>{selectedBank.name}</h3>
                    </>
                ) : (
                    <h3>לא נמצאו בנקים להצגה</h3>
                )}
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />{statusLabel} </div>
                <ul className="d_flex d_flex_jc">
                    <li>
                        <span>1</span>
                        <h3>שליחת בקשה</h3>
                    </li>
                    <li>
                        <span>2</span>
                        <h3>אישור עקרוני</h3>
                    </li>
                </ul>
            </div>
            <div className="inner d_flex d_flex_jb">
                <div className="right_col">
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
                <div className="left_col">
                    <div className="offer_col">
                        <img src={offericon} alt="" />
                        <h4>מידע חשוב</h4>
                        <p>הבקשה לאישור העקרוני נמצאת בבדיקת הבנק ויכולה להימשך עד 5 ימי עסקים. ברגע שהבנק יסיים את הטיפול ויתקבל מענה, נעדכן אותך אוטומטית בהודעה במערכת ובאימייל.</p>
                    </div>
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
            </div>
        </div>
       
    </div>  
  );
};

export default HomeBeforeApproval;
