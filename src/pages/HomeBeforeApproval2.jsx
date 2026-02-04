// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import timeicon from "../assets/images/tt.png";
import offericon from "../assets/images/offer_i.png";
import sandicon from "../assets/images/sandicon.png";

import hapoalimbankicon from "../assets/images/bank_hapoalim.png";
import nationalbank from "../assets/images/national_bank.png";
import mizrahitefahotbank from "../assets/images/mfahot_bank.png";
import discountbankicon from "../assets/images/bank_discount.svg";
import internationalbankicon from "../assets/images/bank_international.svg";
import mercantilebankicon from "../assets/images/bank_mercantile.svg";
import allbanksicon from "../assets/images/bank_all.svg";

import { getGatewayBase } from "../utils/apiBase";

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';
import StatusSummary from '../components/commoncomponents/StatusSummary';

const BANK_LIST = [
    {
        id: 3,
        bankLogo: hapoalimbankicon,
        bankName: "בנק הפועלים",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=3&status=sent"
    },
    {
        id: 2,
        bankLogo: nationalbank,
        bankName: "בנק לאומי",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=2&status=sent"
    },
    {
        id: 1,
        bankLogo: mizrahitefahotbank,
        bankName: "בנק מזרחי טפחות",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=1&status=sent"
    },
    {
        id: 4,
        bankLogo: discountbankicon,
        bankName: "בנק דיסקונט",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=4&status=sent"
    },
    {
        id: 8,
        bankLogo: internationalbankicon,
        bankName: "בנק הבינלאומי",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=8&status=sent"
    },
    {
        id: 12,
        bankLogo: mercantilebankicon,
        bankName: "בנק מרכנתיל",
        statusText: "בקשה נשלחה",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=12&status=sent"
    }
];

const DEFAULT_BANK_IDS = BANK_LIST.map((item) => item.id);

const normalizeAllowedBankIds = (ids) => {
    if (!Array.isArray(ids)) return DEFAULT_BANK_IDS;
    const allowed = new Set(ids.map((value) => Number(value)));
    return DEFAULT_BANK_IDS.filter((id) => allowed.has(id));
};

const HomeBeforeApproval2 = () => {
    const apiBase = useMemo(() => getGatewayBase(), []);
    const [allowedBankIds, setAllowedBankIds] = useState(DEFAULT_BANK_IDS);
    const [approvedBankIds, setApprovedBankIds] = useState([]);

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

    const visibleBanks = useMemo(
        () => BANK_LIST.filter((bank) => allowedBankIds.includes(bank.id)),
        [allowedBankIds]
    );

    const statusList = useMemo(() => {
        const approvedSet = new Set(approvedBankIds);
        return visibleBanks.map((bank) => {
            const isApproved = approvedSet.has(bank.id);
            const statusText = isApproved ? "אישור עקרוני" : "בקשה נשלחה";
            const statusClass = isApproved ? "final_approval" : "awaiting_approval";
            const link = isApproved
                ? `/homebeforeapproval?bankId=${bank.id}&statusText=${encodeURIComponent(statusText)}`
                : `/homebeforeapproval?bankId=${bank.id}&status=sent`;
            return { ...bank, statusText, statusClass, link };
        });
    }, [visibleBanks, approvedBankIds]);

    const statusData = {
        title: "ריכוז הסטטוסים שלי",
        // offertext: "ההצעה המשתלמת ביותר",
        list: statusList
    };

    const prevLink = statusList.length
        ? statusList[statusList.length - 1].link
        : "/homebeforeapproval2";
    const nextLink = statusList.length
        ? statusList[0].link
        : "/homebeforeapproval2";
    const summaryText = allowedBankIds.length === DEFAULT_BANK_IDS.length
        ? "הבקשה נשלחה לכל הבנקים"
        : "הבקשה נשלחה לבנקים שנבחרו";

  return (
    <div className="homebefore_approval_page">
        <div className="wrapper">
            <h1>ברוכים הבאים, דני</h1>
            <div className="bank_title">
                <span><img src={allbanksicon} alt="" /></span>
                <h3>{summaryText}</h3>
            </div>
            <div className="awaiting_approval_box">
                <div className="tag"> <img src={timeicon} alt="" />בקשה נשלחה לבנקים </div>
                <img src={sandicon} className="sandicon" alt="" />
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
                    <StatusSummary statusData={statusData} />
                </div>
            </div>
        </div>
        <div className="next_prev_box">
            <a href={prevLink} className="prev"><img src={nextprevarrow} alt="" /></a>
            <a href={nextLink} className="next"><img src={nextprevarrow} alt="" /></a>
        </div>
    </div>  
  );
};

export default HomeBeforeApproval2;
