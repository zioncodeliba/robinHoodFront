import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/treatmentstatuscomponents/treatmentstatuspage.css";

import noteicon from "../assets/images/note_i.svg";
import yesicon from "../assets/images/yes.svg";
import closePopupImg from "../assets/images/close_popup.png";
import treatmentstatusImage from "../assets/images/treatmentstatus_img.png";
import treatmentstatusImagemob from "../assets/images/treatmentstatus_figure.png";
import { useNavState } from "../context/NavStateContext";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";
import { getTreatmentStepFromStatus, TREATMENT_STEPS } from "../utils/treatmentStatus";

/**
 * Content for each step’s note popup (same popup as suggestions page: note_popup note_popup open).
 * To change popup text: edit the title and body for each step below.
 */
const TREATMENT_NOTE_CONTENT = {
  1: {
    title: "אישור עקרוני",
    body: "אישור עקרוני הוא שלב ראשוני בתהליך המשכנתא, שבו נבדק באופן כללי האם תוכלו לקבל משכנתא בהתאם לנתונים שהזנתם, כגון הכנסות, התחייבויות והון עצמי.\n\nבשלב זה העברנו את הבקשה שלכם לבנקים הרלוונטיים לצורך בדיקה ואישור.\n\nעם קבלת האישורים העקרוניים מהבנקים, נעדכן אתכם ונוכל להתקדם לשלבים הבאים בתהליך.",
  },
  2: {
    title: "שיחת תמהיל",
    body: "בשיחה זו מומחה של ROBIN יסביר לכם בצורה ברורה את האפשרויות העומדות לרשותכם, בהתאם לנתונים ולצרכים האישיים שלכם.\n\nאם תבחרו להתקדם ולרכוש את השירות שלנו, המערכת שלנו תבנה עבורכם תמהיל משכנתא מותאם אישית, שיאפשר לכם להתקדם בביטחון לשלב הבא בתהליך.",
  },
  3: {
    title: "משא ומתן מול הבנקים",
    body: "בשלב הזה אנחנו עובדים עבורך מאחורי הקלעים מול הבנקים.\n\nאנחנו משווים בין ההצעות שמתקבלות ומנהלים משא ומתן על הריביות, המסלולים והתנאים.\n\nהמטרה שלנו היא להילחם בשבילך ולהשיג את תנאי המשכנתא הטובים ביותר.",
  },
  4: {
    title: "חתימות",
    body: "בשלב זה נבחר הבנק שאיתו מתקדמים לקחת את המשכנתא, ואנחנו מתאמים עבורכם את החתימות מול הבנק.\n\nלאחר השלמת כל החתימות, נוכל להתקדם לשלב האחרון בתהליך - קבלת כספי המשכנתא.",
  },
  5: {
    title: "קבלת הכסף",
    body: "זהו השלב האחרון בתהליך. לאחר השלמת כל החתימות והאישורים, הבנק מעביר את כספי המשכנתא בהתאם לתנאי העסקה.\n\nברגע שהכסף מועבר, המשכנתא יוצאת לדרך, והדרך לבית החדש הושלמה.",
  },
};

const TreatmentStatuspage = () => {
  const navigate = useNavigate();
  const { customerProfile, isLoaded: navStateLoaded, refreshCustomerProfile } = useNavState();
  const [customerStatus, setCustomerStatus] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [notePopupStep, setNotePopupStep] = useState(null);

  const handleAuthFailure = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (customerProfile && typeof customerProfile === "object") {
      setCustomerStatus(customerProfile.status || "");
      setLoadingStatus(false);
      return;
    }
    if (navStateLoaded) {
      setCustomerStatus("");
      setLoadingStatus(false);
    }
  }, [customerProfile, navStateLoaded]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      handleAuthFailure();
      return;
    }
    if (customerProfile && typeof customerProfile === "object") {
      return;
    }
    let isMounted = true;

    const loadCustomerStatus = async () => {
      try {
        const response = await refreshCustomerProfile({ force: false });
        if (!isMounted) return;
        if (response?.status === 401 || response?.status === 403) {
          handleAuthFailure();
          return;
        }
        if (response?.ok) {
          setCustomerStatus(response?.data?.status || "");
          return;
        }
        setCustomerStatus("");
      } catch {
        if (isMounted) {
          setCustomerStatus("");
        }
      } finally {
        if (isMounted) {
          setLoadingStatus(false);
        }
      }
    };

    void loadCustomerStatus();

    return () => {
      isMounted = false;
    };
  }, [customerProfile, handleAuthFailure, refreshCustomerProfile]);

  const currentStep = loadingStatus ? 0 : getTreatmentStepFromStatus(customerStatus);

  const totalSteps = TREATMENT_STEPS.length;
  const completedSteps = currentStep;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="treatment_status_page">
      <h3>סטטוס המשכנתא שלי בחמישה צעדים פשוטים.</h3>

      {/* ✅ Progress bar */}
      <div className="status_box">
        <span className="percentage">{progressPercent}%</span>
        <div className="progress">
          <div className="progress_line">
            <span style={{ width: `${progressPercent}%` }}></span>
          </div>
        </div>
      </div>

      {/* ✅ Steps */}
      <div className="step_box">
        <ul className="d_flex d_flex_jc">
          {TREATMENT_STEPS.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum <= currentStep;

            return (
              <li key={index} className={isCompleted ? "open" : ""}>
                <span className="number">{stepNum}</span>
                <span
                  className="note"
                  role="button"
                  tabIndex={0}
                  onClick={() => setNotePopupStep(stepNum)}
                  onKeyDown={(e) => e.key === "Enter" && setNotePopupStep(stepNum)}
                >
                  <img src={noteicon} alt="" /> {label}
                </span>
                <img src={yesicon} className="yes" alt="" />
              </li>
            );
          })}
        </ul>
      </div>

      {/* Note popup – same structure as suggestions page (class: note_popup note_popup open) */}
      {notePopupStep != null && TREATMENT_NOTE_CONTENT[notePopupStep] && (
        <div className="note_popup note_popup open">
          <span className="close" onClick={() => setNotePopupStep(null)}>
            <img src={closePopupImg} alt="" />
          </span>
          <div className="inner">
            <h2>{TREATMENT_NOTE_CONTENT[notePopupStep].title}</h2>
            <div className="col">
              <p style={{ whiteSpace: "pre-line" }}>{TREATMENT_NOTE_CONTENT[notePopupStep].body}</p>
            </div>
          </div>
        </div>
      )}

      <div className="img">
        <img src={treatmentstatusImage} className="desktop_img" alt="" />
        <img src={treatmentstatusImagemob} className="mobile_img" alt="" />
      </div>
    </div>
  );
};

export default TreatmentStatuspage;
