// Homepage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import '../components/schedulemeetingscomponents/ScheduleMeetingspage.css';
import manImage from '../assets/images/schedulemeetings_man.png';
import ScheduleMeetingsPopup from "../components/schedulemeetingscomponents/ScheduleMeetingsPopup";

const ScheduleMeetingspage = () => {
  const navigate = useNavigate();

  return (
    <div className="schedule_meetings_page">
      <h1>בדיקת מחזור משכנתא</h1>
      <ScheduleMeetingsPopup onClose={() => navigate(-1)} />
      <img src={manImage} className="manImage desktop_img" alt="" />
    </div>  
  );
};

export default ScheduleMeetingspage;
