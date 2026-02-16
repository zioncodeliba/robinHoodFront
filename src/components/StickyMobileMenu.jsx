import React, { useEffect, useState } from 'react';
import { Link ,useLocation } from 'react-router-dom';
import { getGatewayBase } from '../utils/apiBase';

import HomeIcon from '../assets/images/s_home.svg';
import Alerts from '../assets/images/s_alerts.svg';
import simulation from '../assets/images/s_simulation.svg';
import status from '../assets/images/s_status.svg';
import suggestions from '../assets/images/s_suggestions.svg';


const StickyMobileMenu = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSuggestions, setHasSuggestions] = useState(false);
  
  const notificationsDisabled = Boolean(localStorage.getItem('auth_token')) && unreadCount === 0;
  const suggestionsDisabled = Boolean(localStorage.getItem('auth_token')) && !hasSuggestions;

  const hasVisibleSuggestions = (responses) => {
    if (!Array.isArray(responses) || !responses.length) {
      return false;
    }
    const latestByBank = new Map();
    responses.forEach((response) => {
      const bankId = Number(response?.bank_id);
      if (!Number.isFinite(bankId)) {
        return;
      }
      const previous = latestByBank.get(bankId);
      if (!previous) {
        latestByBank.set(bankId, response);
        return;
      }
      const prevDate = new Date(previous?.uploaded_at || 0).getTime();
      const nextDate = new Date(response?.uploaded_at || 0).getTime();
      if (nextDate >= prevDate) {
        latestByBank.set(bankId, response);
      }
    });

    return Array.from(latestByBank.values()).some((response) => {
      const calcResult = response?.extracted_json?.calculator_result || null;
      const isRefinance =
        Array.isArray(calcResult?.comparison_table) ||
        (calcResult?.detailed_scenarios &&
          typeof calcResult.detailed_scenarios === 'object');
      if (isRefinance) return false;
      return true;
    });
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUnreadCount(0);
      setHasSuggestions(false);
      return () => {
        isMounted = false;
      };
    }

    const loadNavigationState = async () => {
      try {
        const [notificationsResponse, suggestionsResponse] = await Promise.all([
          fetch(`${getGatewayBase()}/auth/v1/notifications/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
          fetch(`${getGatewayBase()}/auth/v1/bank-responses/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }),
        ]);

        if (!isMounted) return;

        const notificationsPayload = await notificationsResponse.json().catch(() => null);
        const suggestionsPayload = await suggestionsResponse.json().catch(() => null);

        if (notificationsResponse.ok) {
          const unread = Array.isArray(notificationsPayload)
            ? notificationsPayload.filter((item) => !item.read_at).length
            : 0;
          setUnreadCount(unread);
        } else {
          setUnreadCount(0);
        }

        if (suggestionsResponse.ok) {
          setHasSuggestions(hasVisibleSuggestions(Array.isArray(suggestionsPayload) ? suggestionsPayload : []));
        } else {
          setHasSuggestions(false);
        }
      } catch (error) {
        if (!isMounted) return;
        setUnreadCount(0);
        setHasSuggestions(false);
      }
    };

    loadNavigationState();

    const notificationsHandler = () => {
      loadNavigationState();
    };
    window.addEventListener('notifications:updated', notificationsHandler);
    return () => {
      isMounted = false;
      window.removeEventListener('notifications:updated', notificationsHandler);
    };
  }, [location.pathname]);

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
           <li><Link to='/treatmentstatus' className={location.pathname === "/treatmentstatus" ? "active" : ""}><img src={status} alt="" /><span>סטטוס</span></Link></li>
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
