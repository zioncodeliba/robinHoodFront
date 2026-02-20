import React from 'react';
import { Link ,useLocation } from 'react-router-dom';
import { useNavState } from '../context/NavStateContext';

import HomeIcon from '../assets/images/s_home.svg';
import Alerts from '../assets/images/s_alerts.svg';
import simulation from '../assets/images/s_simulation.svg';
import status from '../assets/images/s_status.svg';
import suggestions from '../assets/images/s_suggestions.svg';


const StickyMobileMenu = () => {
  const location = useLocation();
  const { unreadCount, hasSuggestions, hasPrincipalApproval } = useNavState();
  
  const notificationsDisabled = Boolean(localStorage.getItem('auth_token')) && unreadCount === 0;
  const suggestionsDisabled = Boolean(localStorage.getItem('auth_token')) && !hasSuggestions;
  const statusDisabled = Boolean(localStorage.getItem('auth_token')) && !hasPrincipalApproval;

  const handleDisabledNavigation = (event, isDisabled) => {
    if (!isDisabled) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  
  
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
          <li>
            <Link
              to='/notifications'
              className={`${location.pathname === "/notifications" ? "active" : ""} ${notificationsDisabled ? "is-disabled" : ""}`.trim()}
              aria-disabled={notificationsDisabled}
              onClick={(event) => handleDisabledNavigation(event, notificationsDisabled)}
            >
              <img src={Alerts} alt="" /><span>התראות</span>
            </Link>
          </li>
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
          <li>
            <Link
              to='/treatmentstatus'
              className={`${location.pathname === "/treatmentstatus" && !statusDisabled ? "active" : ""} ${statusDisabled ? "is-disabled" : ""}`.trim()}
              aria-disabled={statusDisabled}
              onClick={(event) => handleDisabledNavigation(event, statusDisabled)}
            >
              <img src={status} alt="" /><span>סטטוס</span>
            </Link>
          </li>
          <li>
            <Link
              to='/suggestionspage'
              className={`${location.pathname === "/suggestionspage" ? "active" : ""} ${suggestionsDisabled ? "is-disabled" : ""}`.trim()}
              aria-disabled={suggestionsDisabled}
              onClick={(event) => handleDisabledNavigation(event, suggestionsDisabled)}
            >
              <img src={suggestions} alt="" /><span>הצעות</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default StickyMobileMenu;
