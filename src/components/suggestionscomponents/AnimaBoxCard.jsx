import React from "react";
import line176 from "../../assets/anima-box/line-176.svg";
import line179 from "../../assets/anima-box/line-179.svg";
import image32 from "../../assets/anima-box/image-32.png";
import "./AnimaBoxCard.css";

const AnimaBoxCard = () => {
  return (
    <div className="anima-box-card" data-model-id="3273:37-frame">
      <div className="group">
        <div className="rectangle" />

        <div className="text-wrapper">25</div>

        <div className="div">יתרה לסילוק המשכנתא</div>

        <div className="text-wrapper-2">₪1,500,000</div>

        <div className="text-wrapper-3">החזר לשקל</div>

        <div className="text-wrapper-4">₪2.10</div>

        <div className="text-wrapper-5">תשלום חודשי</div>

        <div className="text-wrapper-6">ריבית שנתית כוללת</div>

        <div className="text-wrapper-7">הצמדה למדד</div>

        <div className="text-wrapper-8">סך הכל תשלומים</div>

        <div className="text-wrapper-9">₪8,330</div>

        <div className="text-wrapper-10">4.5%</div>

        <div className="text-wrapper-11">₪ 2,700,000</div>

        <div className="element"> ₪ 86,457</div>

        <img className="line" alt="" src={line176} />

        <img className="img" alt="" src={line176} />

        <img className="line-2" alt="" src={line179} />

        <img className="line-3" alt="" src={line179} />

        <img className="line-4" alt="" src={line179} />

        <div className="text-wrapper-12">בנק לאומי</div>

        <img className="image" alt="" src={image32} />

        <div className="text-wrapper-13">תקופה בשנים</div>

        <div className="rectangle-2" />

        <div className="text-wrapper-14">המשכנתא שלך</div>
      </div>
    </div>
  );
};

export default AnimaBoxCard;
