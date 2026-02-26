import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import '../components/settingscomponents/settingspage.css';
import { getGatewayBase } from "../utils/apiBase";
import { getAuthToken, syncAuthTokenPersistence } from "../utils/authStorage";

import settingsimg from '../assets/images/settings_img.png';

const DEFAULT_SETTINGS = {
  notifications: true,
  benefits: false,
  quickAccess: false,
};

const readSettingsFromPayload = (payload) => {
  const nestedSettings = payload?.settings || {};
  return {
    notifications:
      payload?.notifications_enabled ??
      nestedSettings?.notifications ??
      DEFAULT_SETTINGS.notifications,
    benefits:
      payload?.benefits_enabled ??
      nestedSettings?.benefits ??
      DEFAULT_SETTINGS.benefits,
    quickAccess:
      payload?.quick_access_enabled ??
      nestedSettings?.quickAccess ??
      DEFAULT_SETTINGS.quickAccess,
  };
};

const readStoredSettings = () => {
  try {
    const raw = localStorage.getItem('user_data');
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return readSettingsFromPayload(parsed);
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const persistSettingsToStorage = (settings, customerPayload = null) => {
  try {
    const raw = localStorage.getItem('user_data');
    const parsed = raw ? JSON.parse(raw) : {};
    const nextPayload = customerPayload && typeof customerPayload === 'object'
      ? { ...parsed, ...customerPayload }
      : { ...parsed };

    nextPayload.notifications_enabled = Boolean(settings.notifications);
    nextPayload.benefits_enabled = Boolean(settings.benefits);
    nextPayload.quick_access_enabled = Boolean(settings.quickAccess);
    nextPayload.settings = {
      ...(nextPayload.settings || {}),
      notifications: Boolean(settings.notifications),
      benefits: Boolean(settings.benefits),
      quickAccess: Boolean(settings.quickAccess),
    };
    localStorage.setItem('user_data', JSON.stringify(nextPayload));
  } catch {
    // Ignore storage errors.
  }
};

const Settingspage = () => {
  const initialSettings = readStoredSettings();
  const [notifications, setNotifications] = useState(initialSettings.notifications);
  const [benefits, setBenefits] = useState(initialSettings.benefits);
  const [quickAccess, setQuickAccess] = useState(initialSettings.quickAccess);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;

    let isMounted = true;
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${getGatewayBase()}/auth/v1/customers/me`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) return;
        const payload = await response.json().catch(() => null);
        if (!payload || typeof payload !== 'object' || !isMounted) return;
        const nextSettings = readSettingsFromPayload(payload);
        setNotifications(Boolean(nextSettings.notifications));
        setBenefits(Boolean(nextSettings.benefits));
        setQuickAccess(Boolean(nextSettings.quickAccess));
        persistSettingsToStorage(nextSettings, payload);
        syncAuthTokenPersistence(Boolean(nextSettings.quickAccess));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveSettings = async () => {
    const token = getAuthToken();

    if (!token) {
      setError('נא להתחבר כדי לשמור הגדרות');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${getGatewayBase()}/auth/v1/customers/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications_enabled: notifications,
          benefits_enabled: benefits,
          quick_access_enabled: quickAccess,
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

      if (response.ok) {
        const nextSettings = readSettingsFromPayload(data || {});
        setNotifications(Boolean(nextSettings.notifications));
        setBenefits(Boolean(nextSettings.benefits));
        setQuickAccess(Boolean(nextSettings.quickAccess));
        persistSettingsToStorage(nextSettings, data);
        syncAuthTokenPersistence(Boolean(nextSettings.quickAccess));

        setSuccess('ההגדרות נשמרו בהצלחה');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
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
            disabled={isSaving || isLoading}
          >
            {isSaving ? 'שומר...' : isLoading ? 'טוען...' : 'שמור הגדרות'}
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
