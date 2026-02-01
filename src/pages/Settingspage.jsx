import React, { useState } from "react";
import { Link } from 'react-router-dom';
import '../components/settingscomponents/settingspage.css';
import { getGatewayApiBase } from "../utils/apiBase";

import settingsimg from '../assets/images/settings_img.png';

const Settingspage = () => {

  // Function to get initial values from localStorage
  const getInitialSettings = () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const parsed = JSON.parse(userData);
        const settings = parsed?.settings || {};
        return {
          notifications: settings.notifications ?? true,
          benefits: settings.benefits ?? false,
          quickAccess: settings.quickAccess ?? false,
        };
      }
    } catch (error) {
      console.error('Error reading user_data from localStorage:', error);
    }
    // Default fallback values
    return {
      notifications: true,
      benefits: false,
      quickAccess: false,
    };
  };

  const initialSettings = getInitialSettings();
  const [notifications, setNotifications] = useState(initialSettings.notifications);
  const [benefits, setBenefits] = useState(initialSettings.benefits);
  const [quickAccess, setQuickAccess] = useState(initialSettings.quickAccess);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveSettings = async () => {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      setError('נא להתחבר כדי לשמור הגדרות');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getGatewayApiBase()}/customer-settings-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications: notifications,
          benefits: benefits,
          quick_access: quickAccess,
        }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה בשמירת ההגדרות. נסה שוב.';
        throw new Error(errorMessage);
      }

      if (data?.success || response.ok) {
        setSuccess(data?.message || 'ההגדרות נשמרו בהצלחה');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);

        // Update user_data in localStorage with new settings
        try {
          const userData = localStorage.getItem('user_data');
          if (userData) {
            const parsed = JSON.parse(userData);
            parsed.settings = {
              ...parsed.settings,
              notifications: notifications,
              benefits: benefits,
              quickAccess: quickAccess,
            };
            localStorage.setItem('user_data', JSON.stringify(parsed));
          }
        } catch (error) {
          console.error('Error updating user_data in localStorage:', error);
        }
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בשמירת ההגדרות. נסה שוב.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings_page d_flex">
      <div className="settings_inner">
        <h1>הגדרות</h1>
        <p>כאן תוכלו לנהל את העדפות החשבון שלכם, לשלוט בהתראות ובהודעות שיווקיות, ולהתאים את חווית השימוש ב- ROBiN בדיוק לצרכים שלכם.</p>
        <div className="settings_options">

          {error && <div className="form_error">{error}</div>}
          {success && <div className="form_success">{success}</div>}

          <div className="settings_list">
            <ul>
              <li>קבלת התראות</li>
              <li>
                <div className="yes_no">
                  <span className={`yes ${notifications ? "open" : ""}`}>כן</span>
                  <span className={`no ${!notifications ? "open" : ""}`}>לא</span>
                </div>
                <label htmlFor="notifications"
                  onClick={() => setNotifications(!notifications)} >
                  <input type="checkbox" checked={notifications} readOnly />
                </label>
              </li>
            </ul>
            <ul>
              <li>הצע לי הטבות ומבצעים</li>
              <li>
                <div className="yes_no">
                  <span className={`yes ${benefits ? "open" : ""}`}>כן</span>
                  <span className={`no ${!benefits ? "open" : ""}`}>לא</span>
                </div>
                <label htmlFor="benefits"
                  onClick={() => setBenefits(!benefits)} >
                  <input type="checkbox" checked={benefits} readOnly />
                </label>
              </li>
            </ul>
            <ul>
              <li>שמור אותי לכניסה מהיר</li>
              <li>
                <div className="yes_no">
                  <span className={`yes ${quickAccess ? "open" : ""}`}>כן</span>
                  <span className={`no ${!quickAccess ? "open" : ""}`}>לא</span>
                </div>
                <label htmlFor="quickaccess"
                  onClick={() => setQuickAccess(!quickAccess)}
                >
                  <input type="checkbox" checked={quickAccess} readOnly />
                </label>
              </li>
            </ul>

          </div>


          <Link to="/" className="terms_conditions">תקנון ומדיניות פרטיות</Link>
          <button
            className="btn save_settings"
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? 'שומר...' : 'שמור הגדרות'}
          </button>
        </div>
      </div>
      <div className="settings_img">
        <img src={settingsimg} alt="" />
      </div>
    </div>
  );
};

export default Settingspage;
