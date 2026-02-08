import React from 'react';
import { Link ,useLocation } from 'react-router-dom';

import HomeIcon from '../assets/images/s_home.svg';
import messages from '../assets/images/s_messages.svg';
import Alerts from '../assets/images/s_alerts.svg';
import simulation from '../assets/images/s_simulation.svg';
import AIChat from '../assets/images/s_aichat.svg';
import Myfile from '../assets/images/s_myfiles.svg';
import status from '../assets/images/s_status.svg';
import suggestions from '../assets/images/s_suggestions.svg';


const StickyMobileMenu = () => {
  const location = useLocation();
  
  const isHome  = location.pathname === "/";
  const isViewoffer = location.pathname.includes("viewoffer");
  
  
  return (
    <>
      <div className="sticky_mobile_menu">
        <Link to='/' className='home'><img src={HomeIcon} alt="" /></Link>
        <ul>
          {/* {isViewoffer && (
            <li> <Link to='/viewoffer'><img src={messages} alt="" /><span>הודעות</span></Link></li>
          )} */}

          {/* {isHome && (
            <li><Link to='/notifications'><img src={Alerts} alt="" /><span>התראות</span></Link></li>
          )} */}
          <li><Link to='/notifications' className={location.pathname === "/notifications" ? "active" : ""}><img src={Alerts} alt="" /><span>התראות</span></Link></li>
          <li><Link to='/simulatorpage' className={location.pathname === "/simulatorpage" ? "active" : ""}><img src={simulation} alt="" /><span>סימולציה</span></Link></li>

          {/* {!isHome && !isViewoffer && (
            <li><Link to='/'><img src={AIChat} alt="" /><span>צ’אט AI</span></Link></li>
          )} */}
          {/* {!isHome && !isViewoffer && (
            <li><Link to='/mortgagecyclepage'><img src={Myfile} alt="" /><span>הקבצים שלי</span></Link></li>
          )}           */}
         
           {/* {(isHome || isViewoffer) && (
             <li><Link to='/treatmentstatus'><img src={status} alt="" /><span>סטטוס</span></Link></li>
           )} */}
           <li><Link to='/treatmentstatus' className={location.pathname === "/treatmentstatus" ? "active" : ""}><img src={status} alt="" /><span>סטטוס</span></Link></li>
          <li> <Link to='/suggestionspage' className={location.pathname === "/suggestionspage" ? "active" : ""}><img src={suggestions} alt="" /><span>הצעות</span></Link> </li>
        </ul>
      </div>
    </>
  );
};

export default StickyMobileMenu;