// Homepage.jsx
import React from "react";
import logoup from '../assets/images/logoup.svg';
import prevIcon from '../assets/images/prev_icon.png';
import whatsapp from '../assets/images/whats_app.svg';
import appointmentmanImage from '../assets/images/appointment_man.png';
import appointmentmanImagemob from '../assets/images/appointmentmanImage_mob.png';

const AppointmentConfirmationpage = () => {

  return (
    <div className="appointment_page">
        <a href="/" className="appoimentlogo"> <img src={logoup}  alt="" /> </a>
        <a href="/schedulemeetings" className="prev_page_link"><img src={prevIcon} alt="" /> חזור</a>
        <div className="colin">
            <img src={whatsapp} alt="" />
            <h3>בשעה טובה</h3>
            <h4>נקבעה פגישה בהצלחה.</h4>
            <p>ברגעים אלו שלחנו קישור לפגישה< br/> 
ב WhatsApp           </p>
            <a href="/" className="confirmation">אישור</a>
        </div>
        <img src={appointmentmanImage} className="appointment_man desktop_img" alt="" />
        <img src={appointmentmanImagemob} className="appointment_man mobile_img" alt="" />
    </div>  
  );
};

export default AppointmentConfirmationpage;