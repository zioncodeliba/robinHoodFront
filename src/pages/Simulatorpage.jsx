import React  from "react";
// import { Link} from 'react-router-dom';
import '../components/simulatorcomponents/Simulatorpage.css';

import simulatorImage from '../assets/images/simulator_p_img.png';
import previcon from '../assets/images/prev_icon.png';


// components 
import MortgageCalculator from '../components/simulatorcomponents/MortgageCalculator';
import UniformBasket from '../components/simulatorcomponents/UniformBasket';

import ReturnsChart from '../components/commoncomponents/ReturnsChart';
import YourRoutesMortgageDetails from '../components/commoncomponents/YourRoutesMortgageDetails';



const Simulatorpage = () => {

  const simulatorchartdata = {
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
  };

  
  const mortgageData14 = {
    note: {
      text: "הסבר על המסלולים",
    },
    routes: {
      headers: ["מסלולים", "ריבית", "יתרה"],
      list: [
        { name: 'ק"צ', percentage: "40%", interest: "5%", balance: "₪640,000" },
        { name: 'מ"צ', percentage: "40%", interest: "5%", balance: "₪368,000" },
        { name: 'פריים', percentage: "40%", interest: "5%", balance: "₪592,000" },
      ],
      totals: {
        indexLinked: "100,000 ש\"ח",
        overall: "1,700,000 ש\"ח",
      },
    },
  };


  return (
    <div className="simulator_page">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
       <div className="wrapper">
            <MortgageCalculator />
            <div className="contents">
              <UniformBasket />   
              <div className="simulator_data_box d_flex">
                <ReturnsChart 
                    charttitle={'החזרים'} 
                    interest={'ריבית'} 
                    fund={'קרן'} 
                    dataSets={simulatorchartdata} 
                    kerenColor={"#27450E"}
                    rivitColor={"#E27600"}
                  />
                <YourRoutesMortgageDetails data={mortgageData14} themeColor="#E27600" />
              </div>
              <button className="btn approval_btn">מעבר להגשת בקשה לאישור עקרוני</button>
            </div>
            <img src={simulatorImage} className="img1 desktop_img" alt="" />
       </div>
    </div>
  );
};

export default Simulatorpage;