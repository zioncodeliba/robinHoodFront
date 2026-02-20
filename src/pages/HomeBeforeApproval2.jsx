// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import timeicon from "../assets/images/tt.svg";
import offericon from "../assets/images/offer_i.svg";
// import offericon from "../assets/images/offer_i.png";
import sandicon from "../assets/images/sandicon.png";
import noteIcon from "../assets/images/note_i_o.svg";

import { getGatewayBase } from "../utils/apiBase";
import {
    getDefaultAllowedBankIds,
    hasSupportedMortgageType,
} from "../utils/customerFlowRouting";
import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";

// components
import FrequentlyQuestions from '../components/beforeapprovalcomponents/FrequentlyQuestions';
import StatusSummary from '../components/commoncomponents/StatusSummary';

const BANK_LOGOS = {
    hapoalim: "/banks/hapoalim.png",
    leumi: "/banks/leumi.png",
    mizrahi: "/banks/mizrahi.png",
    discount: "/banks/discount.png",
    international: "/banks/international.png",
    mercantile: "/banks/mercantile.png",
};

const BANK_LIST = [
    {
        id: 3,
        bankLogo: BANK_LOGOS.hapoalim,
        bankName: "בנק הפועלים",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=3&status=sent"
    },
    {
        id: 2,
        bankLogo: BANK_LOGOS.leumi,
        bankName: "בנק לאומי",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=2&status=sent"
    },
    {
        id: 1,
        bankLogo: BANK_LOGOS.mizrahi,
        bankName: "בנק מזרחי טפחות",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=1&status=sent"
    },
    {
        id: 4,
        bankLogo: BANK_LOGOS.discount,
        bankName: "בנק דיסקונט",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=4&status=sent"
    },
    {
        id: 8,
        bankLogo: BANK_LOGOS.international,
        bankName: "בנק הבינלאומי",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=8&status=sent"
    },
    {
        id: 12,
        bankLogo: BANK_LOGOS.mercantile,
        bankName: "בנק מרכנתיל",
        statusText: "ממתין לאישור עקרוני",
        statusClass: "awaiting_approval",
        link: "/homebeforeapproval?bankId=12&status=sent"
    }
];

const DEFAULT_BANK_IDS = BANK_LIST.map((item) => item.id);

const normalizeAllowedBankIds = (ids, fallback = DEFAULT_BANK_IDS) => {
    if (!Array.isArray(ids)) return [...fallback];
    const allowed = new Set(ids.map((value) => Number(value)));
    return DEFAULT_BANK_IDS.filter((id) => allowed.has(id));
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

const HEADER_SLIDE_DURATION_MS = 600;
const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_VERTICAL_DELTA_PX = 80;

const HomeBeforeApproval2 = () => {
    const navigate = useNavigate();
    const apiBase = useMemo(() => getGatewayBase(), []);
    const { userData } = useCustomerProfile();
    const mortgageType = String(userData?.mortgageType || userData?.mortgage_type || "").trim();
    const defaultAllowedBankIds = useMemo(
        () => (hasSupportedMortgageType(mortgageType) ? getDefaultAllowedBankIds(mortgageType) : []),
        [mortgageType]
    );
    const [allowedBankIds, setAllowedBankIds] = useState(defaultAllowedBankIds);
    const [approvedBankIds, setApprovedBankIds] = useState([]);
    const [activeMobileBankIndex, setActiveMobileBankIndex] = useState(0);
    const [headerTransition, setHeaderTransition] = useState(null);
    const [isHeaderSlideRunning, setIsHeaderSlideRunning] = useState(false);
    const slideTimeoutRef = useRef(null);
    const transitionTargetIndexRef = useRef(null);
    const touchStartRef = useRef(null);
    const displayName = getCustomerDisplayName(userData, "שם");
    const handleAuthFailure = useCallback(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("mortgage_cycle_result");
        localStorage.removeItem("new_mortgage_submitted");
        navigate("/login", { replace: true });
    }, [navigate]);

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
        setAllowedBankIds(defaultAllowedBankIds);
    }, [defaultAllowedBankIds]);

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
                setAllowedBankIds(normalizeAllowedBankIds(payload?.allowed_bank_ids, defaultAllowedBankIds));
            } catch {
                if (!isMounted) return;
                setAllowedBankIds(defaultAllowedBankIds);
            }
        };

        loadVisibility();

        return () => {
            isMounted = false;
        };
    }, [apiBase, defaultAllowedBankIds, handleAuthFailure]);

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
                    ? payload
                        .filter((item) => {
                            const calcResult = item?.extracted_json?.calculator_result;
                            return isApprovalOfferResult(calcResult);
                        })
                        .map((item) => Number(item?.bank_id))
                        .filter((id) => Number.isFinite(id))
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
    }, [apiBase, handleAuthFailure]);

    const visibleBanks = useMemo(
        () => BANK_LIST.filter((bank) => allowedBankIds.includes(bank.id)),
        [allowedBankIds]
    );

    const approvedVisibleBankIds = useMemo(() => {
        if (!allowedBankIds.length || !approvedBankIds.length) return [];
        const allowedSet = new Set(allowedBankIds);
        return approvedBankIds.filter((bankId) => allowedSet.has(bankId));
    }, [allowedBankIds, approvedBankIds]);

    const statusList = useMemo(() => {
        const approvedSet = new Set(approvedVisibleBankIds);
        return visibleBanks.map((bank) => {
            const isApproved = approvedSet.has(bank.id);
            const statusText = isApproved ? "אישור עקרוני" : "ממתין לאישור עקרוני";
            const statusClass = isApproved ? "final_approval" : "awaiting_approval";
            const link = `/homebeforeapproval?bankId=${bank.id}&status=sent`;
            return { ...bank, statusText, statusClass, link };
        });
    }, [visibleBanks, approvedVisibleBankIds]);

    useEffect(() => {
        if (approvedVisibleBankIds.length > 0) {
            navigate('/viewoffer', { replace: true });
        }
    }, [approvedVisibleBankIds, navigate]);

    useEffect(() => {
        if (statusList.length === 0) {
            setActiveMobileBankIndex(0);
            return;
        }
        setActiveMobileBankIndex((prev) => {
            if (prev < 0 || prev >= statusList.length) {
                return 0;
            }
            return prev;
        });
    }, [statusList.length]);

    useEffect(() => {
        return () => {
            if (slideTimeoutRef.current) {
                window.clearTimeout(slideTimeoutRef.current);
                slideTimeoutRef.current = null;
            }
        };
    }, []);

    const statusData = {
        title: "ריכוז הסטטוסים שלי",
        // offertext: "ההצעה המשתלמת ביותר",
        list: statusList
    };

    const waitingForAdminSelection = allowedBankIds.length === 0;
    const summaryText = waitingForAdminSelection
        ? "ממתין לבחירת בנקים על ידי הצוות"
        : allowedBankIds.length === DEFAULT_BANK_IDS.length
            ? "הבקשה נשלחה לכל הבנקים"
            : "הבקשה נשלחה לבנקים שנבחרו";
    const mobileBank = statusList.length ? statusList[activeMobileBankIndex] : null;

    const completeHeaderSlide = useCallback(() => {
        const targetIndex = transitionTargetIndexRef.current;
        transitionTargetIndexRef.current = null;
        if (slideTimeoutRef.current) {
            window.clearTimeout(slideTimeoutRef.current);
            slideTimeoutRef.current = null;
        }
        if (typeof targetIndex === "number") {
            setActiveMobileBankIndex(targetIndex);
        }
        setHeaderTransition(null);
        setIsHeaderSlideRunning(false);
    }, []);

    const startHeaderSlide = useCallback((direction) => {
        if (statusList.length <= 1 || headerTransition) return;

        const nextIndex = direction === "next"
            ? (activeMobileBankIndex + 1) % statusList.length
            : (activeMobileBankIndex - 1 + statusList.length) % statusList.length;

        transitionTargetIndexRef.current = nextIndex;
        setHeaderTransition({
            direction,
            fromIndex: activeMobileBankIndex,
            toIndex: nextIndex
        });
        setIsHeaderSlideRunning(false);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setIsHeaderSlideRunning(true);
            });
        });

        if (slideTimeoutRef.current) {
            window.clearTimeout(slideTimeoutRef.current);
        }
        slideTimeoutRef.current = window.setTimeout(
            completeHeaderSlide,
            HEADER_SLIDE_DURATION_MS + 60
        );
    }, [activeMobileBankIndex, completeHeaderSlide, headerTransition, statusList.length]);

    useEffect(() => {
        if (!headerTransition) return;
        if (!statusList[headerTransition.fromIndex] || !statusList[headerTransition.toIndex]) {
            completeHeaderSlide();
        }
    }, [completeHeaderSlide, headerTransition, statusList]);

    const handleHeaderTouchStart = (event) => {
        if (statusList.length <= 1 || headerTransition) return;
        const touch = event.touches?.[0];
        if (!touch) return;
        touchStartRef.current = {
            startX: touch.clientX,
            startY: touch.clientY,
            lastX: touch.clientX,
            lastY: touch.clientY
        };
    };

    const handleHeaderTouchMove = (event) => {
        const touch = event.touches?.[0];
        if (!touch || !touchStartRef.current) return;
        touchStartRef.current.lastX = touch.clientX;
        touchStartRef.current.lastY = touch.clientY;
    };

    const handleHeaderTouchEnd = () => {
        const touchData = touchStartRef.current;
        touchStartRef.current = null;
        if (!touchData) return;

        const deltaX = touchData.lastX - touchData.startX;
        const deltaY = touchData.lastY - touchData.startY;

        if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
        if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL_DELTA_PX) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

        if (deltaX < 0) {
            startHeaderSlide("next");
            return;
        }
        startHeaderSlide("prev");
    };

    const handleHeaderTouchCancel = () => {
        touchStartRef.current = null;
    };

    const handleMobilePrev = () => {
        startHeaderSlide("prev");
    };

    const handleMobileNext = () => {
        startHeaderSlide("next");
    };

    const renderHeaderCard = (bank) => (
        <>
            <div className="awaiting_approval_box awaiting_approval_box_mobile">
                <div className="bank_title1">
                    {bank ? (
                        <>
                            <span><img src={bank.bankLogo} alt="" /></span>
                            <h3>{bank.bankName}</h3>
                        </>
                    ) : (
                        <h3>לא נמצאו בנקים להצגה</h3>
                    )}
                </div>
                <div className="tag"> <img src={timeicon} alt="" />ממתין לאישור עקרוני</div>
                <span className="notification"><img src={noteIcon} alt="" /></span>
                
                <img src={sandicon} className="sandicon" alt="" />
            </div>
        </>
    );

    const fromBank = headerTransition ? statusList[headerTransition.fromIndex] || null : null;
    const toBank = headerTransition ? statusList[headerTransition.toIndex] || null : null;
    const outgoingTarget = headerTransition?.direction === "next" ? "-100%" : "100%";
    const incomingStart = headerTransition?.direction === "next" ? "100%" : "-100%";
    const slideTransitionStyle = isHeaderSlideRunning
        ? `transform ${HEADER_SLIDE_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${HEADER_SLIDE_DURATION_MS}ms ease`
        : "none";
    const arrowDisabled = Boolean(headerTransition) || statusList.length <= 1;

  return (
    <div className="homebefore_approval_page ">
        <div className="wrapper">
            <h1>ברוכים הבאים, {displayName}</h1>
            
            <div
                className="mobile_header_slider"
                style={{ position: "relative", overflow: "hidden", touchAction: "pan-y" }}
                onTouchStart={handleHeaderTouchStart}
                onTouchMove={handleHeaderTouchMove}
                onTouchEnd={handleHeaderTouchEnd}
                onTouchCancel={handleHeaderTouchCancel}
            >
                {headerTransition ? (
                    <>
                        <div style={{ visibility: "hidden" }}>
                            {renderHeaderCard(fromBank || mobileBank)}
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: isHeaderSlideRunning ? `translateX(${outgoingTarget})` : "translateX(0%)",
                                opacity: isHeaderSlideRunning ? 0.2 : 1,
                                transition: slideTransitionStyle,
                                willChange: "transform, opacity"
                            }}
                        >
                            {renderHeaderCard(fromBank || mobileBank)}
                        </div>
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                transform: isHeaderSlideRunning ? "translateX(0%)" : `translateX(${incomingStart})`,
                                opacity: isHeaderSlideRunning ? 1 : 0.85,
                                transition: slideTransitionStyle,
                                willChange: "transform, opacity"
                            }}
                            onTransitionEnd={(event) => {
                                if (event.propertyName !== "transform") return;
                                if (!headerTransition || !isHeaderSlideRunning) return;
                                completeHeaderSlide();
                            }}
                        >
                            {renderHeaderCard(toBank || mobileBank)}
                        </div>
                    </>
                ) : (
                    renderHeaderCard(mobileBank)
                )}
                <div className="next_prev_box">
                    <button type="button" className="prev" onClick={handleMobilePrev} disabled={arrowDisabled}>
                        <img src={nextprevarrow} alt="" />
                    </button>
                    <button type="button" className="next" onClick={handleMobileNext} disabled={arrowDisabled}>
                        <img src={nextprevarrow} alt="" />
                    </button>
                </div>
            </div>
            <div className="inner d_flex d_flex_jb">
                <div className="right_col">
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
                <div className="left_col">
                    <div className="offer_col">
                        <img src={offericon} alt="" />
                        <h4>מידע חשוב</h4>
                        <p>
                            {waitingForAdminSelection
                                ? `${summaryText}. החישוב הזמני מוכן. הצוות בודק ובוחר עבורך בנקים להצגה, וברגע שזה יקרה נראה כאן את הסטטוסים.`
                                : `${summaryText}. כשיתקבלו אישורים יישלח עדכון.`}
                        </p>
                    </div>
                    <FrequentlyQuestions questionsdata={questionsdata} />
                    <StatusSummary statusData={statusData} />
                </div>
            </div>
        </div>
       
    </div>  
  );
};

export default HomeBeforeApproval2;
