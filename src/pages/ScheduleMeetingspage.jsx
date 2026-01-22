// Homepage.jsx
import React from "react";
import '../components/schedulemeetingscomponents/ScheduleMeetingspage.css';
import congo from '../assets/images/congo_icon1.png';
import close from '../assets/images/close_popup.png';
import manImage from '../assets/images/schedulemeetings_man.png';

const ScheduleMeetingspage = () => {

  return (
    <div className="schedule_meetings_page">
      <h1>בדיקת מחזור משכנתא</h1>
      <div className="schedule_meetings_popup">
          <span className="close"><img src={close} alt="" /></span>
          <img src={congo} alt="" />
          <h2>ב ר כ ו ת !!!<br/>
            על החלטתך למחזר את המשכנתא</h2>
          <p>יש לנו תמהיל משכנתא מותאם אישית שיחסוך לך עשרות אלפי שקלים...</p>
          <p>על מנת להנות מכל הטוב הזה < br/>
            פשוט בחרו <a href="/"><strong>שעה ויום</strong></a>ותאמו שיחה<br/>
            עם אחד מצוות המומחים של רובין
          </p>
          <div className="available_days inner">
            <p>ימים פנויים:</p>
            <div className="wrap d_flex d_flex_ac d_flex_jc">
              <label><input  type="radio" name="day" defaultChecked/>יום ראשון</label>
              <label><input  type="radio" name="day"/>יום שני</label>
              <label><input type="radio" name="day" />יום שלישי</label>
            </div>
          </div>
          <div className="available_hours inner">
            <p>ימים פנויים:</p>
            <div className="wrap d_flex d_flex_ac d_flex_jc">
              <label><input type="radio" name="hours"/>18:00</label>
              <label><input type="radio" name="hours" defaultChecked/>18:30</label>
              <label><input type="radio" name="hours"/>19:30</label>
              <label><input type="radio" name="hours"/>09:30</label>
              <label><input type="radio" name="hours"/>11:00</label>
              <label><input type="radio" name="hours"/>14:00</label>
            </div>
          </div>
          <h4>שיחת יעוץ ביום ראשון בשעה 18:30</h4>
          <a href="/" className="btn">אישור</a>
      </div>
      <img src={manImage} className="manImage desktop_img" alt="" />
    </div>  
  );
};

export default ScheduleMeetingspage;