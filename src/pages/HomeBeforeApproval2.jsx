// Homepage.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import '../components/beforeapprovalcomponents/HomeBeforeApproval.css'

import nextprevarrow from "../assets/images/np_arrow.svg";
import timeicon from "../assets/images/tt.svg";
import offericon from "../assets/images/offer_i.svg";
// import offericon from "../assets/images/offer_i.png";
import sandicon from "../assets/images/sandicon.png";
import noteIcon from "../assets/images/note_i_o.svg";

import {
    getDefaultAllowedBankIds,
    hasSupportedMortgageType,
} from "../utils/customerFlowRouting";
import useCustomerProfile, { getCustomerDisplayName } from "../hooks/useCustomerProfile";
import { useNavState } from "../context/NavStateContext";

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

const DEFAULT_OFFERS_CAROUSEL_NOTE =
    "נשלח בקשה לאישור עקרוני לכלל הבנקים כשיתקבלו האישורים ישלח עדכון.";

const HomeBeforeApproval2 = () => {
    const navigate = useNavigate();
    const { bankVisibility, bankResponses, isLoaded: navStateLoaded } = useNavState();
    const { userData } = useCustomerProfile();
    const mortgageType = String(userData?.mortgageType || userData?.mortgage_type || "").trim();
    const defaultAllowedBankIds = useMemo(
        () => (hasSupportedMortgageType(mortgageType) ? getDefaultAllowedBankIds(mortgageType) : []),
        [mortgageType]
    );
    const [allowedBankIds, setAllowedBankIds] = useState(defaultAllowedBankIds);
    const [approvedBankIds, setApprovedBankIds] = useState([]);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const displayName = getCustomerDisplayName(userData, "שם");
    const offersCarouselNote = useMemo(() => {
        const noteFromApi = typeof userData?.offers_carousel_note === "string"
            ? userData.offers_carousel_note.trim()
            : "";
        const noteFromCache = typeof userData?.offersCarouselNote === "string"
            ? userData.offersCarouselNote.trim()
            : "";
        return noteFromApi || noteFromCache || DEFAULT_OFFERS_CAROUSEL_NOTE;
    }, [userData]);
    const offersCarouselNoteVisible = useMemo(() => {
        if (typeof userData?.offers_carousel_note_visible === "boolean") {
            return userData.offers_carousel_note_visible;
        }
        if (typeof userData?.offersCarouselNoteVisible === "boolean") {
            return userData.offersCarouselNoteVisible;
        }
        return true;
    }, [userData]);

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
    const carouselBanks = statusList.length ? statusList : [null];
    const [selectedOfferIndex, setSelectedOfferIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: carouselBanks.length > 1,
        direction: "rtl",
        breakpoints: {
            "(max-width: 768px)": {
                align: "center",
                containScroll: "trimSnaps",
                dragFree: false,
            },
        },
    });

    useEffect(() => {
        if (approvedVisibleBankIds.length > 0) {
            navigate('/viewoffer', { replace: true });
        }
    }, [approvedVisibleBankIds, navigate]);

    useEffect(() => {
        if (carouselBanks.length === 0) {
            setSelectedOfferIndex(0);
            return;
        }
        setSelectedOfferIndex((prev) =>
            prev < 0 || prev >= carouselBanks.length ? 0 : prev
        );
    }, [carouselBanks.length]);

    const updateCarouselControls = useCallback(() => {
        if (!emblaApi || carouselBanks.length <= 1) {
            setCanScrollPrev(false);
            setCanScrollNext(false);
            return;
        }
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi, carouselBanks.length]);

    useEffect(() => {
        if (!emblaApi) return;
        updateCarouselControls();

        const handleSelect = () => {
            setSelectedOfferIndex(emblaApi.selectedScrollSnap());
            updateCarouselControls();
        };

        emblaApi.on("select", handleSelect);
        emblaApi.on("reInit", updateCarouselControls);
        return () => {
            emblaApi.off("select", handleSelect);
            emblaApi.off("reInit", updateCarouselControls);
        };
    }, [emblaApi, updateCarouselControls]);

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
    const fallbackOfferInfoText = waitingForAdminSelection
        ? `${summaryText}. החישוב הזמני מוכן. הצוות בודק ובוחר עבורך בנקים להצגה, וברגע שזה יקרה נראה כאן את הסטטוסים.`
        : `${summaryText}. כשיתקבלו אישורים יישלח עדכון.`;
    const offerInfoText = offersCarouselNote || fallbackOfferInfoText;

    const handleMobilePrev = () => {
        if (!emblaApi || carouselBanks.length <= 1) return;
        emblaApi.scrollPrev();
    };

    const handleMobileNext = () => {
        if (!emblaApi || carouselBanks.length <= 1) return;
        emblaApi.scrollNext();
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
                {offersCarouselNoteVisible ? (
                    <span className="notification"><img src={noteIcon} alt="" /></span>
                ) : null}
                
                <img src={sandicon} className="sandicon" alt="" />
            </div>
        </>
    );

    const arrowDisabled = carouselBanks.length <= 1 || !emblaApi;
    const prevDisabled = arrowDisabled || !canScrollPrev;
    const nextDisabled = arrowDisabled || !canScrollNext;

  return (
    <div className="homebefore_approval_page ">
        <div className="wrapper">
            <h1>ברוכים הבאים, {displayName}</h1>
            
            <div className="mobile_header_slider">
                <div className="mobile_header_slider__viewport" ref={emblaRef}>
                    <div className="mobile_header_slider__container">
                        {carouselBanks.map((bank, index) => (
                            <div
                                className="mobile_header_slider__slide"
                                key={bank?.id ?? `mobile-bank-placeholder-${index}`}
                                aria-hidden={index !== selectedOfferIndex}
                            >
                                {renderHeaderCard(bank)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="next_prev_box">
                <button type="button" className="prev" onClick={handleMobilePrev} disabled={prevDisabled}>
                    <img src={nextprevarrow} alt="" />
                </button>
                <button type="button" className="next" onClick={handleMobileNext} disabled={nextDisabled}>
                    <img src={nextprevarrow} alt="" />
                </button>
            </div>
            <div className="inner d_flex d_flex_jb">
                <div className="right_col">
                    <FrequentlyQuestions questionsdata={questionsdata} />
                </div>
                <div className="left_col">
                    {offersCarouselNoteVisible ? (
                        <div className="offer_col">
                            <img src={offericon} alt="" />
                            <h4>מידע חשוב</h4>
                            <p>{offerInfoText}</p>
                        </div>
                    ) : null}
                    <FrequentlyQuestions questionsdata={questionsdata} />
                    <StatusSummary statusData={statusData} />
                </div>
            </div>
        </div>
       
    </div>  
  );
};

export default HomeBeforeApproval2;
