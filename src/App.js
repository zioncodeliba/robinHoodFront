import React, { useEffect } from 'react';
import './assets/fonts/stylesheet.css';
import './App.css';

import leavesleft from './assets/images/leaves_left.png';
import leavesright from './assets/images/leaves_right.png';

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Component
import Header from './components/Header';
import StickyMobileMenu from './components/StickyMobileMenu';
import ProtectedRoute from './components/ProtectedRoute';

//pages
import Registration from './pages/Registrationpage';
import Loginpage from './pages/Loginpage';

import Homepage from './pages/Homepage';
import MortgagePage from './pages/MortgagePage';
import Notificationspage from './pages/Notificationspage';
import Settingspage from './pages/Settingspage';
import TreatmentStatuspage from './pages/TreatmentStatuspage';
import MortgageCycleCheck from './pages/MortgageCycleCheck';

import MortgageCyclepage from './pages/MortgageCyclePage';
import NoofferFoundpage from './pages/NoofferFoundpage';
import ScheduleMeetingspage from './pages/ScheduleMeetingspage';
import AppointmentConfirmationpage from './pages/AppointmentConfirmationpage';
import ViewOfferspage from './pages/ViewOfferspage';
import Simulatorpage from './pages/Simulatorpage';
import Suggestionspage from './pages/Suggestionspage';
import HomeBeforeApproval from './pages/HomeBeforeApproval';
import HomeBeforeApproval2 from './pages/HomeBeforeApproval2';
import BrokerHomepage from './pages/BrokerHomepage';

import ExplanationScreen1 from './pages/ExplanationScreen1';
import ExplanationScreen2 from './pages/ExplanationScreen2';
import OtpScreen from './pages/OtpScreen';
import OtpVerify from './pages/OtpVerify';
import AIChatpage from './pages/AIChatpage';


function AppWrapper() {
  const location = useLocation();

  // If backend redirects back with token in querystring (Apple OAuth, etc.)
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const token = params.get('token') || params.get('auth_token');
    const customerRaw = params.get('customer') || params.get('user') || params.get('user_data');

    if (!token && !customerRaw) return;

    try {
      if (token) localStorage.setItem('auth_token', token);

      if (customerRaw) {
        // Expect URL-encoded JSON. Keep failure silent.
        const decoded = decodeURIComponent(customerRaw);
        const parsed = JSON.parse(decoded);
        localStorage.setItem('user_data', JSON.stringify(parsed));
      }

      // Remove query params from URL (avoid leaking tokens via history/share)
      window.history.replaceState({}, document.title, location.pathname);
    } catch {
      // If parsing fails, still try to clear the URL if we got token
      if (token) window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.pathname, location.search]);

  // const hideHeader = location.pathname === "/appointment";
  // const hidepan = ["/simulatorpage"];
  // const hidepans = hidepan.includes(location.pathname);

  // const appointmentBg = ["/appointment"].includes(location.pathname);
  const path = location.pathname.toLowerCase();

  // const hideHeader = path === ["/appointment","/explanation-screen"];
  const hideHeaderPaths = [
    "/appointment",
    "/explanation-screen",
    "/explanation-screen2",
    "/login-with-otp",
    "/otp-verify",
    "/registration",
  ];
  const hideHeader = hideHeaderPaths.includes(path);

  // screen check
  const isDesktop = window.innerWidth >= 1024;

  const hidepan = ["/simulatorpage", "/brokerhomepage", "/login"].includes(path);
  const appointmentBg = ["/appointment"].includes(path);
  const exscreenBg = ["/explanation-screen", "/explanation-screen2", "/login-with-otp", "/otp-verify", "/registration", "/login"].includes(path);
  const HidestickyMenu = ["/registration", "/login", "/login-with-otp", "/otp-verify", "/aichat"].includes(path);


  return (
    <div className={`App ${(exscreenBg ? "exscreenhideheader " : "")}`}>

      {(!isDesktop || !hideHeader) &&
        <Header />
      }

      {/* <div className={`main ${appointmentBg ? "appointmentBg" : ""} ${hidepans ? "test" : ""}`} > */}
      <div className={`main ${(appointmentBg ? "appointmentBg " : "")} ${(exscreenBg ? "exscreenBg " : "")} ${(hidepan ? "hidepan" : "")} `}>

        <img src={leavesleft} alt="" className='l_left' />
        <img src={leavesright} alt="" className='l_right' />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ProtectedRoute><Homepage /></ProtectedRoute>} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Loginpage />} />
          <Route path="/login-with-otp" element={<OtpScreen />} />
          <Route path="/otp-verify" element={<OtpVerify />} />

          {/* Protected routes */}
          <Route path="/new-loan" element={<ProtectedRoute><MortgagePage /></ProtectedRoute>} />
          <Route path="/recycle-loan" element={<ProtectedRoute><MortgageCycleCheck /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notificationspage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settingspage /></ProtectedRoute>} />
          <Route path="/treatmentstatus" element={<ProtectedRoute><TreatmentStatuspage /></ProtectedRoute>} />
          <Route path="/mortgagecyclepage" element={<ProtectedRoute><MortgageCyclepage /></ProtectedRoute>} />
          <Route path="/noofferfound" element={<ProtectedRoute><NoofferFoundpage /></ProtectedRoute>} />
          <Route path="/schedulemeetings" element={<ProtectedRoute><ScheduleMeetingspage /></ProtectedRoute>} />
          <Route path="/appointment" element={<ProtectedRoute><AppointmentConfirmationpage /></ProtectedRoute>} />
          <Route path="/viewoffer" element={<ProtectedRoute><ViewOfferspage /></ProtectedRoute>} />
          <Route path="/simulatorpage" element={<ProtectedRoute><Simulatorpage /></ProtectedRoute>} />
          <Route path="/suggestionspage" element={<ProtectedRoute><Suggestionspage /></ProtectedRoute>} />
          <Route path="/homebeforeapproval" element={<ProtectedRoute><HomeBeforeApproval /></ProtectedRoute>} />
          <Route path="/homebeforeapproval2" element={<ProtectedRoute><HomeBeforeApproval2 /></ProtectedRoute>} />
          <Route path="/brokerhomepage" element={<ProtectedRoute><BrokerHomepage /></ProtectedRoute>} />
          <Route path="/explanation-screen" element={<ProtectedRoute><ExplanationScreen1 /></ProtectedRoute>} />
          <Route path="/explanation-screen2" element={<ProtectedRoute><ExplanationScreen2 /></ProtectedRoute>} />
          <Route path="/aichat" element={<ProtectedRoute><AIChatpage /></ProtectedRoute>} />
        </Routes>

      </div>

      {!HidestickyMenu && (
        <StickyMobileMenu />
      )}

    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
