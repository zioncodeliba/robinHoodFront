// Homepage.jsx
import React from "react";
import aichatImage from '../assets/images/ai_chat.png';
import previcon from '../assets/images/prev_icon.png';

const AIChatpage = () => {

  return (
    <div className="ai_charpage">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
      <div className="wrapper">
        <div className="title">
          <h1>צא’ט הגשת בקשה לאישור עקרוני</h1>
          <p>הגשת בקשה לאישור עקרוני לכלל הבנקים בחינם לגמרי!</p>
        </div>
        <img src={aichatImage} className="aichatImage" alt="" />
      </div>
    </div>
  );
};

export default AIChatpage;