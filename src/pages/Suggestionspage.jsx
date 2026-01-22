import React ,{useState} from "react";
// import { Link} from 'react-router-dom';
import '../components/suggestionscomponents/Suggestionspage.css';

// images 
import notei from '../assets/images/note_i.png';
import nextprevarrow from "../assets/images/np_arrow.svg";
import previcon from '../assets/images/prev_icon.png';

// components 
import BankMortgageCard from '../components/suggestionscomponents/BankMortgageCard';
import RoutesBankMortgage from '../components/suggestionscomponents/RoutesBankMortgage';
import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import NotePopup from '../components/suggestionscomponents/NotePopup';


const Suggestionspage = () => {

  const [openPopupId, setOpenPopupId] = useState(null);

  const openPopup = (id) => {
    setOpenPopupId(id);
  };

  const closePopup = () => {
    setOpenPopupId(null);
  };
  
  const bankOffers = [
        {
            id: 1,
            name: "בנק מזרחי טפחות",
            name_en: "Mizrahi-Tefahot",
            color: "#F5821F",
            status: { type: "conditional", time: "31:02:42 -" },
            amount: 1500000,
            years: 30,
            maxMonthlyPayment: 8330,
            firstMonthlyPayment: 7982,
            totalPayments: 1458966,
            routes: [
              { label: 'ק"צ', amount: 640000, percent: 40 },
              { label: 'מ"צ', amount: 368000, percent: 23 },
              { label: 'פריים', amount: 592000, percent: 37 },
            ],
            simulatorchartdata: {
                "1": [
                { "name": "ינואר", "rivit": 1500, "keren": 2000 },
                { "name": "פברואר", "rivit": 2500, "keren": 3200 },
                { "name": "מרץ", "rivit": 3200, "keren": 3600 },
                { "name": "אפריל", "rivit": 3100, "keren": 4650 },
                { "name": "מאי", "rivit": 3500, "keren": 3000 },
                { "name": "יוני", "rivit": 3500, "keren": 4400 },
                { "name": "יולי", "rivit": 3400, "keren": 4100 }
              ],
              "2": [
                { "name": "ינואר", "rivit": 2200, "keren": 6000 },
                { "name": "פברואר", "rivit": 3000, "keren": 5000 },
                { "name": "מרץ", "rivit": 3200, "keren": 4000 },
                { "name": "אפריל", "rivit": 3100, "keren": 3000 },
                { "name": "מאי", "rivit": 3300, "keren": 3500 },
                { "name": "יוני", "rivit": 3500, "keren": 3000 },
                { "name": "יולי", "rivit": 3400, "keren": 3100 }
              ],
              "3": [
                { "name": "ינואר", "rivit": 6000, "keren": 2000 },
                { "name": "פברואר", "rivit": 5000, "keren": 3200 },
                { "name": "מרץ", "rivit": 4000, "keren": 3600 },
                { "name": "אפריל", "rivit": 3000, "keren": 4650 },
                { "name": "מאי", "rivit": 3500, "keren": 4200 },
                { "name": "יוני", "rivit": 3000, "keren": 4400 },
                { "name": "יולי", "rivit": 3100, "keren": 4100 }
              ] 
            }
        },
        {
            id: 2,
            name:'בנק לאומי',
            name_en: "National Bank",
            color: "#007BFF", 
            status: { type: "final" },
            amount: 1500000,
            years: 30,
            maxMonthlyPayment: 8330,
            firstMonthlyPayment: 7982,
            totalPayments: 1458966,
            routes: [
              { label: 'ק"צ', amount: 640000, percent: 40 },
              { label: 'מ"צ', amount: 368000, percent: 23 },
              { label: 'פריים', amount: 592000, percent: 37 },
            ],
            simulatorchartdata: {
                "1": [
                { "name": "ינואר", "rivit": 2000, "keren": 2000 },
                { "name": "פברואר", "rivit": 3000, "keren": 3200 },
                { "name": "מרץ", "rivit": 3200, "keren": 3600 },
                { "name": "אפריל", "rivit": 3100, "keren": 4650 },
                { "name": "מאי", "rivit": 3300, "keren": 4200 },
                { "name": "יוני", "rivit": 3500, "keren": 4400 },
                { "name": "יולי", "rivit": 3400, "keren": 4100 }
              ],
              "2": [
                { "name": "ינואר", "rivit": 2200, "keren": 6000 },
                { "name": "פברואר", "rivit": 3000, "keren": 5000 },
                { "name": "מרץ", "rivit": 3200, "keren": 4000 },
                { "name": "אפריל", "rivit": 3100, "keren": 3000 },
                { "name": "מאי", "rivit": 3300, "keren": 3500 },
                { "name": "יוני", "rivit": 3500, "keren": 3000 },
                { "name": "יולי", "rivit": 3400, "keren": 3100 }
              ],
              "3": [
                { "name": "ינואר", "rivit": 6000, "keren": 2000 },
                { "name": "פברואר", "rivit": 5000, "keren": 3200 },
                { "name": "מרץ", "rivit": 4000, "keren": 3600 },
                { "name": "אפריל", "rivit": 3000, "keren": 4650 },
                { "name": "מאי", "rivit": 3500, "keren": 4200 },
                { "name": "יוני", "rivit": 3000, "keren": 4400 },
                { "name": "יולי", "rivit": 3100, "keren": 4100 }
              ] 
            }
        },
        {
            id: 3,
            name: "בנק מזרחי טפחות",
            name_en: "Mizrahi-Tefahot",
            color: "#F5821F",
            status: { type: "conditional", time: "32:02:42 -" },
            amount: 1500000,
            years: 31,
            maxMonthlyPayment: 8330,
            firstMonthlyPayment: 7982,
            totalPayments: 1458966,
            routes: [
              { label: 'ק"צ', amount: 640000, percent: 40 },
              { label: 'מ"צ', amount: 368000, percent: 23 },
              { label: 'פריים', amount: 592000, percent: 37 },
            ],
            simulatorchartdata: {
                "1": [
                { "name": "ינואר", "rivit": 2000, "keren": 2000 },
                { "name": "פברואר", "rivit": 3000, "keren": 3200 },
                { "name": "מרץ", "rivit": 3200, "keren": 3600 },
                { "name": "אפריל", "rivit": 3100, "keren": 4650 },
                { "name": "מאי", "rivit": 3300, "keren": 4200 },
                { "name": "יוני", "rivit": 3500, "keren": 4400 },
                { "name": "יולי", "rivit": 3400, "keren": 4100 }
              ],
              "2": [
                { "name": "ינואר", "rivit": 2200, "keren": 6000 },
                { "name": "פברואר", "rivit": 3000, "keren": 5000 },
                { "name": "מרץ", "rivit": 3200, "keren": 4000 },
                { "name": "אפריל", "rivit": 3100, "keren": 3000 },
                { "name": "מאי", "rivit": 3300, "keren": 3500 },
                { "name": "יוני", "rivit": 3500, "keren": 3000 },
                { "name": "יולי", "rivit": 3400, "keren": 3100 }
              ],
              "3": [
                { "name": "ינואר", "rivit": 6000, "keren": 2000 },
                { "name": "פברואר", "rivit": 5000, "keren": 3200 },
                { "name": "מרץ", "rivit": 4000, "keren": 3600 },
                { "name": "אפריל", "rivit": 3000, "keren": 4650 },
                { "name": "מאי", "rivit": 3500, "keren": 4200 },
                { "name": "יוני", "rivit": 3000, "keren": 4400 },
                { "name": "יולי", "rivit": 3100, "keren": 4100 }
              ] 
            }
        },
    ];

  return (
    <div className="suggestions_page">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
      <div className="title">
        <h1>ההצעות של רובין.</h1>
        <p>לפניכם מגוון הצעות שיאפשרו לכם להוציא יותר מהכסף שלכם</p>
      </div>
      <div className="wrapper d_flex d_flex_jb">
          {bankOffers.map(offer => (
              <div className="colin" key={offer.id}>
                  <BankMortgageCard bankData={offer} />
                  <div className="baskets_list">
                    <ul className="d_flex">
                      <li>סל אחיד 1</li>
                      <li>סל אחיד 2</li>
                      <li>סל אחיד 3</li>
                    </ul>
                  </div>
                  <div className="note" onClick={() => openPopup(offer.id)}>
                    <img src={notei} alt="" />
                    <p>הסבר על המסלולים</p>
                  </div>
                  <RoutesBankMortgage color={offer.color} routes={offer.routes} />
                  <ReturnsChart 
                     charttitle={'החזרים'} 
                     interest={'ריבית'} 
                     fund={'קרן'} 
                     dataSets={offer.simulatorchartdata} 
                     kerenColor={"#27450E"}
                     rivitColor={"#E27600"}
                   />
                   <NotePopup isOpen={openPopupId === offer.id} onClose={closePopup} />
              </div>
          ))}
      </div>
      <div className="next_prev_box">
            <a href="/" className="prev"><img src={nextprevarrow} alt="" /></a>
            <a href="/" className="next"><img src={nextprevarrow} alt="" /></a>
        </div>
    </div>
  );
};

export default Suggestionspage;