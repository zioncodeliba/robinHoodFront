// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";
import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import previcon from '../assets/images/prev_icon.png';

import { getGatewayBase } from "../utils/apiBase";

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';

const DISCOUNT_BANK_LOGO_URL = "/discont.webp";
const INTERNATIONAL_BANK_LOGO_URL = "/banks/international-logo.png";
const MERCANTILE_BANK_LOGO_URL = "/Mercantile.svg.png";

const BANK_MAP = {
    1: { name: "בנק מזרחי טפחות", logo: mizrahitefahotbank },
    2: { name: "בנק לאומי", logo: nationalbank },
    3: { name: "בנק הפועלים", logo: hapoalimbankicon },
    4: { name: "בנק דיסקונט", logo: DISCOUNT_BANK_LOGO_URL },
    8: { name: "בנק הבינלאומי", logo: INTERNATIONAL_BANK_LOGO_URL },
    12: { name: "בנק מרכנתיל", logo: MERCANTILE_BANK_LOGO_URL }
};

const DEFAULT_BANK_ORDER = [3, 2, 1, 4, 8, 12];

const normalizeAllowedBankIds = (ids) => {
    if (!Array.isArray(ids)) return DEFAULT_BANK_ORDER;
    const allowed = new Set(ids.map((value) => Number(value)));
    return DEFAULT_BANK_ORDER.filter((id) => allowed.has(id));
};

const HomeBeforeApproval = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const apiBase = useMemo(() => getGatewayBase(), []);
    const userData = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user_data")) || {};
        } catch {
            return {};
        }
    }, []);
    const displayName = userData?.firstName || userData?.first_name || userData?.name || "שם";
    const [allowedBankIds, setAllowedBankIds] = useState(DEFAULT_BANK_ORDER);
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
    const handleAuthFailure = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("mortgage_cycle_result");
        localStorage.removeItem("new_mortgage_submitted");
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token || !apiBase) return;
        let isMounted = true;

        const loadVisibility = async () => {
            try {
                const response = await fetch(`${apiBase}/auth/v1/customers/me/bank-visibility`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.status === 401 || response.status === 403) {
                    handleAuthFailure();
                    return;
                }
                if (!response.ok) {
                    throw new Error("Failed to load bank visibility");
                }
                const payload = await response.json().catch(() => null);
                if (!isMounted) return;
                setAllowedBankIds(normalizeAllowedBankIds(payload?.allowed_bank_ids));
            } catch {
                // Keep defaults on failure
            }
        };

        loadVisibility();

        return () => {
            isMounted = false;
        };
    }, [apiBase]);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token || !apiBase) return;
        let isMounted = true;

        const loadBankResponses = async () => {
            try {
                const response = await fetch(`${apiBase}/auth/v1/bank-responses/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
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
                const ids = Array.isArray(payload)
                    ? payload.map((item) => Number(item?.bank_id)).filter((id) => Number.isFinite(id))
                    : [];
                setApprovedBankIds(Array.from(new Set(ids)));
            } catch {
                // Keep defaults on failure
            }
        };

        loadBankResponses();

        return () => {
            isMounted = false;
        };
    }, [apiBase]);

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
