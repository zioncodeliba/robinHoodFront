import React,{useState ,useEffect} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const isLoginPage = location.pathname.includes("login");
  const isbrokerpage = location.pathname.includes("brokerhomepage");
  const userData = JSON.parse(localStorage.getItem("user_data")) || {};
  // popup visibility state
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);
  const [showloginPopup, setShowloginPopup] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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

// headre scroll fixed
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const scrollElement = document.querySelector(".main");

    const handleScroll = () => {
      setIsFixed(scrollElement.scrollTop > 50);
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

  const badgeText = unreadCount > 99 ? '99+' : `${unreadCount}`;

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
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login");
  }

  return (
    <>
    <header className={`d_flex d_flex_ac d_flex_jb test ${isFixed ? "fixed" : ""}`}>
      <div className="hamberger" onClick={hambergerhandle}><img src={hambergericon} alt="" /></div>
      <div className="hamberger" onClick={hambergerhandle}><img src={hambergericon} alt="" /></div>
      <nav className={`right_col ${isOpen ? 'open' : ''}`} >
        {/* for desktop menu  */}
          <ul className='d_flex d_flex_ac'>
            {/* home */}
            <li><Link to="/">דף הבית</Link></li>
            {(!isLoginPage && !isbrokerpage) ?(
              <>
              {/* My suggestions */}
              <li><Link to="/suggestionspage">ההצעות שלי</Link></li>
              {/* my files */}
              <li><Link to="/recycle-loan">הקבצים שלי </Link></li>
              {/* notifications */}
              <li>
                <Link to="/notifications" className="nav_notification_link">
                  ההתראות שלי
                  {unreadCount > 0 ? (
                    <span className="notification_badge">{badgeText}</span>
                  ) : null}
                </Link>
              </li>
              {/* Mortgage monitoring */}
              <li><Link to="/treatmentstatus"> ניטור משכנתא</Link></li>
              {/* simulation */}
              <li><Link to="/simulatorpage">סימולציה</Link></li>
              </>
            ):(
              <>
              {/* Settings  */}
              <li><Link to="/settings">הגדרות</Link></li>
              {/* My suggestions */}
              <li><Link to="/suggestionspage">ההצעות שלי</Link></li>
              {/* notifications */}
              <li>
                <Link to="/notifications" className="nav_notification_link">
                  ההתראות שלי
                  {unreadCount > 0 ? (
                    <span className="notification_badge">{badgeText}</span>
                  ) : null}
                </Link>
              </li>
              {/* simulation */}
              <li><Link to="/simulatorpage">סימולציה</Link></li>
              <li><Link to="/appointment" className='whatsapp'>תמיכה בWhatsApp <img src={whatsapp} alt="" /></Link></li>
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
                  <Link to="/notifications" onClick={() => setIsOpen(false)} className="nav_notification_link">
                    <img src={NotificationIcon} alt="" />ההודעות שלי
                    {unreadCount > 0 ? (
                      <span className="notification_badge">{badgeText}</span>
                    ) : null}
                  </Link>
                </li>
                <li><Link to="/settings" onClick={() => setIsOpen(false)}><img src={SettingIcon} alt="" />הגדרות</Link></li>
                <li><Link to="/appointment" onClick={() => setIsOpen(false)}><img src={whatsapp} alt="" />תמיכה בווצאפ</Link></li>
                <li><Link to="#" onClick={(e) => {e.preventDefault(); handleLogout(); setIsOpen(false);}}><img src={logoutIcon} alt="" />התנתק</Link></li>
            </ul>
           <img src={panmemuImage} className='pan_menu' alt="" />
        </div>
      </nav>
      <div className="left_col d_flex d_flex_ac d_flex_jb">

        {!isLoginPage ?(
          <>
              <div className="username">ברוך הבא, {userData?.firstName || ''}</div>
          <button onClick={handleLogout} className='btn exit_btn'>יציאה</button>
          </>
          ):(
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
          )}
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
