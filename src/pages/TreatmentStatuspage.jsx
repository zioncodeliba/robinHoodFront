import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/treatmentstatuscomponents/treatmentstatuspage.css";

import noteicon from "../assets/images/note_i.svg";
import yesicon from "../assets/images/yes.svg";
import treatmentstatusImage from "../assets/images/treatmentstatus_img.png";
import treatmentstatusImagemob from "../assets/images/treatmentstatus_figure.png";
import { useNavState } from "../context/NavStateContext";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";

const stepsData = [
  "אישור עקרוני",
  "שיחת תמהיל",
  "משא ומתן",
  "חתימות",
  "קבלת הכסף",
];

const STEP_BY_STATUS = {
  "אישור עקרוני": 1,
  "שיחת תמהיל": 2,
  "משא ומתן": 3,
  "חתימות": 4,
  "קבלת הכסף": 5,
};

const PRE_APPROVAL_STATUSES = new Set([
  "",
  "נרשם",
  "שיחה עם הצ׳אט",
  "העלאת קבצים",
  "ממתין לאישור עקרוני",
  "סיום צ׳אט בהצלחה",
  "חוסר התאמה",
]);

const getStepFromCustomerStatus = (status) => {
  const normalizedStatus = typeof status === "string" ? status.trim() : "";

  if (STEP_BY_STATUS[normalizedStatus]) {
    return STEP_BY_STATUS[normalizedStatus];
  }

  if (PRE_APPROVAL_STATUSES.has(normalizedStatus)) {
    return 0;
  }

  if (normalizedStatus.includes("אישור עקרוני")) return 1;
  if (normalizedStatus.includes("תמהיל")) return 2;
  if (normalizedStatus.includes("משא ומתן")) return 3;
  if (normalizedStatus.includes("חתימ")) return 4;
  if (normalizedStatus.includes("קבלת הכסף")) return 5;

  return 0;
};

const TreatmentStatuspage = () => {
  const navigate = useNavigate();
  const { customerProfile, isLoaded: navStateLoaded, refreshCustomerProfile } = useNavState();
  const [customerStatus, setCustomerStatus] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

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

  const currentStep = loadingStatus ? 0 : getStepFromCustomerStatus(customerStatus);

  const totalSteps = stepsData.length;
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
          {stepsData.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum <= currentStep;

            return (
              <li key={index} className={isCompleted ? "open" : ""}>
                <span className="number">{stepNum}</span>
                <span className="note">
                  <img src={noteicon} alt="" /> {label}
                </span>
                <img src={yesicon} className="yes" alt="" />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="img">
        <img src={treatmentstatusImage} className="desktop_img" alt="" />
        <img src={treatmentstatusImagemob} className="mobile_img" alt="" />
      </div>
    </div>
  );
};

export default TreatmentStatuspage;
