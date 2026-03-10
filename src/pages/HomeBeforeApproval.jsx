// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import timeicon from "../assets/images/homebeforeapproval_clock.png";
import offericon from "../assets/images/offer_i.png";
import previcon from '../assets/images/prev_icon.png';

import {
    getDefaultAllowedBankIds,
    hasSupportedMortgageType,
} from "../utils/customerFlowRouting";
import {
    APPROVAL_STAGE_FINAL,
    APPROVAL_STAGE_PRINCIPAL,
    getApprovalStatusMeta,
    getBankApprovalStageMap,
    isApprovalOfferResult,
} from "../utils/approvalStatus";
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
const DEFAULT_WAITING_PAGE_NOTE_TITLE = "מידע חשוב";
const DEFAULT_WAITING_PAGE_NOTE_BODY =
    "הבקשה לאישור העקרוני נמצאת בבדיקת הבנק ויכולה להימשך עד 5 ימי עסקים. ברגע שהבנק יסיים את הטיפול ויתקבל מענה, נעדכן אותך אוטומטית בהודעה במערכת ובאימייל.";

const normalizeAllowedBankIds = (ids, fallback = DEFAULT_BANK_ORDER) => {
    if (!Array.isArray(ids)) return [...fallback];
    const allowed = new Set(ids.map((value) => Number(value)));
    return DEFAULT_BANK_ORDER.filter((id) => allowed.has(id));
};

const resolveWaitingPageNoteForBank = (waitingPageNotes, bankId) => {
    if (!bankId || !waitingPageNotes || typeof waitingPageNotes !== "object") {
        return {
            title: DEFAULT_WAITING_PAGE_NOTE_TITLE,
            body: DEFAULT_WAITING_PAGE_NOTE_BODY,
        };
    }

    const rawValue = waitingPageNotes[String(bankId)] ?? waitingPageNotes[bankId];

    if (rawValue && typeof rawValue === "object") {
        return {
            title: typeof rawValue.title === "string" && rawValue.title.trim()
                ? rawValue.title.trim()
                : DEFAULT_WAITING_PAGE_NOTE_TITLE,
            body: typeof rawValue.body === "string" && rawValue.body.trim()
                ? rawValue.body.trim()
                : DEFAULT_WAITING_PAGE_NOTE_BODY,
        };
    }

    if (typeof rawValue === "string" && rawValue.trim()) {
        return {
            title: DEFAULT_WAITING_PAGE_NOTE_TITLE,
            body: rawValue.trim(),
        };
    }

    return {
        title: DEFAULT_WAITING_PAGE_NOTE_TITLE,
        body: DEFAULT_WAITING_PAGE_NOTE_BODY,
    };
};

const HomeBeforeApproval = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bankVisibility, bankVisibilityDetails, bankResponses, isLoaded: navStateLoaded } = useNavState();
    const { userData } = useCustomerProfile();
    const mortgageType = String(userData?.mortgageType || userData?.mortgage_type || "").trim();
    const defaultAllowedBankIds = useMemo(
        () => (hasSupportedMortgageType(mortgageType) ? getDefaultAllowedBankIds(mortgageType) : []),
        [mortgageType]
    );
    const displayName = getCustomerDisplayName(userData, "שם");
    const [allowedBankIds, setAllowedBankIds] = useState(defaultAllowedBankIds);
    const params = new URLSearchParams(location.search);
    const bankIdParam = Number(params.get("bankId"));
    const statusKey = params.get("status");
    const statusTextParam = params.get("statusText");

    const isWideLogoBankSent = (bankIdParam === 4 || bankIdParam === 12) && statusKey === "sent";
    const isPoalimSent = bankIdParam === 3 && statusKey === "sent";

    const statusLabels = {
        sent: "בקשה נשלחה לבנק",
        awaiting_approval: "ממתין לאישור עקרוני",
        principal_approval: "אישור עקרוני",
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

    const approvalResponses = useMemo(
        () =>
            Array.isArray(bankResponses)
                ? bankResponses.filter((item) => {
                    const calcResult = item?.extracted_json?.calculator_result;
                    return isApprovalOfferResult(calcResult);
                })
                : [],
        [bankResponses]
    );

    const approvalStageByBankId = useMemo(
        () => getBankApprovalStageMap(approvalResponses),
        [approvalResponses]
    );

    const bankOrder = allowedBankIds;
    const hasBanks = bankOrder.length > 0;
    const activeBankId = hasBanks && bankOrder.includes(bankIdParam) ? bankIdParam : bankOrder[0];
    const selectedBank = activeBankId ? BANK_MAP[activeBankId] : null;
    const waitingPageNote = resolveWaitingPageNoteForBank(
        bankVisibilityDetails?.waiting_page_notes,
        activeBankId
    );
    const activeBankApprovalStage = activeBankId ? approvalStageByBankId.get(activeBankId) : null;
    const statusLabel = statusTextParam
        || (
            activeBankApprovalStage === APPROVAL_STAGE_FINAL
                ? getApprovalStatusMeta(APPROVAL_STAGE_FINAL).text
                : activeBankApprovalStage === APPROVAL_STAGE_PRINCIPAL
                    ? getApprovalStatusMeta(APPROVAL_STAGE_PRINCIPAL).text
                    : (statusLabels[statusKey] || statusLabels.awaiting_approval)
        );
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
    <div className={`homebefore_approval_page ${isWideLogoBankSent ? "homebefore_approval_page--wide-logo" : ""}`}>
        <button type="button" onClick={handleBackToHome} className="prev_page_link"><img src={previcon} alt="" /></button>
        <div className="wrapper">
            <h1>ברוכים הבאים, {displayName}</h1>
            <div className="bank_title">
                {selectedBank ? (
                    <>
                        <span>
                            <img
                                src={selectedBank.logo}
                                alt=""
                                style={isPoalimSent ? { filter: "drop-shadow(0px 4px 2px rgba(0, 0, 0, 0.25))" } : undefined}
                            />
                        </span>
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
                        <h4>{waitingPageNote.title}</h4>
                        <p style={{ whiteSpace: "pre-line" }}>{waitingPageNote.body}</p>
                    </div>
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
            </div>
        </div>
       
    </div>  
  );
};

export default HomeBeforeApproval;
