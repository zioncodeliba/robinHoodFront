import React,{useState ,useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';
import brand from '../assets/images/brand.svg';
import brandWhite from '../assets/images/brand_w.svg';
import whatsapp from '../assets/images/whatsapp.svg';
import hambergericon from '../assets/images/hamberger_icon.svg';
import noficationIcon from '../assets/images/nofication_i.svg';
import panmemuImage from '../assets/images/pan_memu.png';
import { getGatewayBase } from '../utils/apiBase';
import { getGatewayApiBase } from '../utils/apiBase';

import HomeIcon from '../assets/images/m_home.svg';
import NotificationIcon from '../assets/images/m_notification.svg';
import SettingIcon from '../assets/images/m_setting.svg';
import logoutIcon from '../assets/images/m_logout.svg';


// popup
import RegistrationPopup from './homecomponents/RegistrationPopup';
import LoginPopup from './homecomponents/LoginPopup';

const Header = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.includes("login");
  const isbrokerpage = location.pathname.includes("brokerhomepage");
  const authToken = localStorage.getItem("auth_token");
  const affiliateToken = localStorage.getItem("affiliate_token");
  const isAuthenticated = Boolean(authToken || affiliateToken);
  const isDesktop = window.innerWidth >= 1024;
  const userData = JSON.parse(localStorage.getItem("user_data")) || {};
  // popup visibility state
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [showloginPopup, setShowloginPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasSuggestions, setHasSuggestions] = useState(false);

  const togglePopuprg = (e) => {
    e.preventDefault();
    setShowRegistrationPopup((prev) => !prev);
    setShowloginPopup(false);
  };
  const togglePopuplogin = (e) => {
    e.preventDefault();
    setShowloginPopup((prev) => !prev);
    setShowRegistrationPopup(false);
  };
  const openRegistrationPopup = () => {
    setShowRegistrationPopup(true);
    setShowloginPopup(false);
  };
  const openLoginPopup = () => {
    setShowloginPopup(true);
    setShowRegistrationPopup(false);
  };

  useEffect(() => {
    const handler = () => openLoginPopup();
    window.addEventListener('auth:open-login', handler);
    return () => {
      window.removeEventListener('auth:open-login', handler);
    };
  }, []);

  const handleDesktopNavClick = (event) => {
    if (!isDesktop || isAuthenticated) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    openRegistrationPopup();
  };

// headre scroll fixed
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const scrollElement = document.querySelector(".main");

    const handleScroll = () => {
      setIsFixed(scrollElement.scrollTop > 20);
    };

    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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
    const loadUnreadCount = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        if (isMounted) setUnreadCount(0);
        return;
      }
      try {
        const response = await fetch(`${getGatewayBase()}/auth/v1/notifications/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          if (isMounted) setUnreadCount(0);
          return;
        }
        const unread = Array.isArray(data) ? data.filter((n) => !n.read_at).length : 0;
        if (isMounted) setUnreadCount(unread);
      } catch (error) {
        if (isMounted) setUnreadCount(0);
      }
    };

    const handler = () => loadUnreadCount();
    loadUnreadCount();
    window.addEventListener('notifications:updated', handler);
    return () => {
      isMounted = false;
      window.removeEventListener('notifications:updated', handler);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setHasSuggestions(false);
      return () => {
        isMounted = false;
      };
    }

    const loadSuggestionsState = async () => {
      try {
        const response = await fetch(`${getGatewayBase()}/auth/v1/bank-responses/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json().catch(() => null);
        if (!isMounted) return;
        if (!response.ok) {
          setHasSuggestions(false);
          return;
        }
        setHasSuggestions(hasVisibleSuggestions(Array.isArray(data) ? data : []));
      } catch (error) {
        if (isMounted) setHasSuggestions(false);
      }
    };

    loadSuggestionsState();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const badgeText = unreadCount > 99 ? '99+' : `${unreadCount}`;
  const notificationsDisabled = isAuthenticated && unreadCount === 0;
  const suggestionsDisabled = isAuthenticated && !hasSuggestions;

  const handleStateAwareNavClick = (event, options = {}) => {
    const { requireNotifications = false, requireSuggestions = false, closeMenu = false } = options;
    const shouldDisable =
      (requireNotifications && notificationsDisabled) ||
      (requireSuggestions && suggestionsDisabled);
    if (shouldDisable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    handleDesktopNavClick(event);
    if (closeMenu) {
      setIsOpen(false);
    }
  };

  const hambergerhandle = () =>{
     setIsOpen(true);
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    const apiBase = getGatewayApiBase();
    try{
      if (token && apiBase) {
        await fetch(`${apiBase}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    }
    catch(error){
      console.log(error);
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("affiliate_token");
    localStorage.removeItem("affiliate_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    window.location.assign("/");
  }

  return (
    <>
    <header className={`d_flex d_flex_ac d_flex_jb ${isFixed ? "fixed" : ""}`}>
      {/* <div className="hamberger" onClick={hambergerhandle}><img src={hambergericon} alt="" /></div> */}
      <div className="hamberger" onClick={hambergerhandle}><img src={hambergericon} alt="" /></div>
      <nav className={`right_col ${isOpen ? 'open' : ''}`} >
        {/* for desktop menu  */}
          <ul className='d_flex d_flex_ac'>
            {/* home */}
            <li><Link to="/" onClick={handleDesktopNavClick}>דף הבית</Link></li>
            {/* Settings  */}
              <li><Link to="/settings" onClick={handleDesktopNavClick}>הגדרות</Link></li>
               
            {(!isLoginPage && !isbrokerpage) ?(
              <>
              {/* My suggestions */}
              <li>
                <Link
                  to="/suggestionspage"
                  className={suggestionsDisabled ? 'is-disabled' : ''}
                  aria-disabled={suggestionsDisabled}
                  onClick={(event) =>
                    handleStateAwareNavClick(event, { requireSuggestions: true })
                  }
                >
                  ההצעות שלי
                </Link>
              </li>
              
              <li>
                <Link
                  to="/notifications"
                  className={notificationsDisabled ? 'is-disabled' : ''}
                  aria-disabled={notificationsDisabled}
                  onClick={(event) =>
                    handleStateAwareNavClick(event, { requireNotifications: true })
                  }
                >
                ההתראות שלי
                  {unreadCount > 0 ? (
                    <span className="notification_badge">{badgeText}</span>
                  ) : null}
                </Link>
              </li>
              {/* simulation */}
              <li><Link to="/simulatorpage" onClick={handleDesktopNavClick}>סימולציה</Link></li>
              <li><Link to="/appointment" className='whatsapp' onClick={handleDesktopNavClick}>תמיכה בWhatsApp <img src={whatsapp} alt="" /></Link></li>
              {/* Mortgage monitoring */}
              {/* <li><Link to="/treatmentstatuspage" onClick={handleDesktopNavClick}> ניטור משכנתא</Link></li> */}
              {/* My suggestions */}
              {/* <li><Link to="/suggestionspage" onClick={handleDesktopNavClick}>ההצעות שלי</Link></li> */}
              </>
            ):(
              <>
              {/* Settings  */}
              <li><Link to="/settings" onClick={handleDesktopNavClick}>הגדרות</Link></li>
              {/* My suggestions */}
              <li>
                <Link
                  to="/suggestionspage"
                  className={suggestionsDisabled ? 'is-disabled' : ''}
                  aria-disabled={suggestionsDisabled}
                  onClick={(event) =>
                    handleStateAwareNavClick(event, { requireSuggestions: true })
                  }
                >
                  ההצעות שלי
                </Link>
              </li>
              {/* notifications */}
              <li>
                <Link
                  to="/notifications"
                  className={notificationsDisabled ? "nav_notification_link is-disabled" : "nav_notification_link"}
                  aria-disabled={notificationsDisabled}
                  onClick={(event) =>
                    handleStateAwareNavClick(event, { requireNotifications: true })
                  }
                >
                  ההתראות שלי
                  {unreadCount > 0 ? (
                    <span className="notification_badge">{badgeText}</span>
                  ) : null}
                </Link>
              </li>
              {/* simulation */}
              <li><Link to="/simulatorpage" onClick={handleDesktopNavClick}>סימולציה</Link></li>
              <li><Link to="/appointment" className='whatsapp' onClick={handleDesktopNavClick}>תמיכה בWhatsApp <img src={whatsapp} alt="" /></Link></li>
              </>
            )}
          </ul>

        {/* for mobile menu  */}
        <div className="bg" onClick={() => setIsOpen(false)}></div>
        <div className="mobile_menu">
          <Link to="/" className="mob_brand" onClick={() => setIsOpen(false)}> <img src={brandWhite} alt="brand" /> </Link>
          <h2>ברוך הבא, {userData?.firstName || ''}</h2>
            <ul>
                <li><Link to="/" onClick={() => setIsOpen(false)}><img src={HomeIcon} alt="" /> דף הבית</Link></li>
                <li>
                  <Link
                    to="/notifications"
                    className={notificationsDisabled ? "nav_notification_link is-disabled" : "nav_notification_link"}
                    aria-disabled={notificationsDisabled}
                    onClick={(event) =>
                      handleStateAwareNavClick(event, {
                        requireNotifications: true,
                        closeMenu: true,
                      })
                    }
                  >
                    <img src={NotificationIcon} alt="" />ההודעות שלי
                    {unreadCount > 0 ? (
                      <span className="notification_badge">{badgeText}</span>
                    ) : null}
                  </Link>
                </li>
                <li><Link to="/settings" onClick={() => setIsOpen(false)}><img src={SettingIcon} alt="" />הגדרות</Link></li>
                <li><Link to="/appointment" onClick={() => setIsOpen(false)}><img src={whatsapp} alt="" />תמיכה ב WhatsApp </Link></li>
                <li><Link to="#" onClick={(e) => {e.preventDefault(); handleLogout(); setIsOpen(false);}}><img src={logoutIcon} alt="" />התנתק</Link></li>
            </ul>
           <img src={panmemuImage} className='pan_menu' alt="" />
        </div>
      </nav>
      <div className="left_col d_flex d_flex_ac d_flex_jb">

        {isAuthenticated ? (
          <>
            <div className="username">ברוך הבא, {userData?.firstName || ''}</div>
            <button onClick={handleLogout} className='btn exit_btn'>יציאה</button>
          </>
        ) : isDesktop ? (
          <>
            <div className="registration_had">
              <a href="/registration" onClick={togglePopuprg} className='btn registration'>הרשמה</a>
              <RegistrationPopup showRegistrationPopup={showRegistrationPopup} />
            </div>
            <div className="loginrecords_had">
              <a href="/loginrecords" onClick={togglePopuplogin} className='btn login_records'>כניסה לרשומים</a>
              <LoginPopup showloginPopup={showloginPopup} />
            </div>
          </>
        ) : null}
        <Link to="/" className="brand">
          <img src={brand} alt="brand" />
        </Link>
        {isbrokerpage && (
          <button className='notification'><img src={noficationIcon} alt="" /></button>
        )}
      </div>
     </header>
    </>
  );
};

export default Header;
