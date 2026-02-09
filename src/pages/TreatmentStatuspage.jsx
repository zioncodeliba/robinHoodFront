import React, { useState } from "react";
import "../components/treatmentstatuscomponents/treatmentstatuspage.css";

import noteicon from "../assets/images/note_i.svg";
import yesicon from "../assets/images/yes.svg";
import treatmentstatusImage from "../assets/images/treatmentstatus_img.png";
import treatmentstatusImagemob from "../assets/images/treatmentstatus_img_mobile.png";

const stepsData = [
  "אישור עקרוני",
  "שיחת תמהיל",
  "משא ומתן",
  "חתימות",
  "קבלת הכסף",
];

const TreatmentStatuspage = () => {
  const [currentStep] = useState(2); 

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
