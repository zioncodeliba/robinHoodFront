import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../components/notificationcomponents/notifications.css';
import { getGatewayBase } from "../utils/apiBase";
import { useNavState } from "../context/NavStateContext";
import { clearAuthToken, getAuthToken } from "../utils/authStorage";

import notifiIcon from '../assets/images/notifi.png';
import removeIcon from '../assets/images/remove.png';
import notificationsman from '../assets/images/notifications_man.png';
import robinman from '../assets/images/robin_man.png';
import notificationsFigure from '../assets/images/notifications_figure.png';


const EnvelopeStatusIcon = ({ isRead }) => (
  <span
    className={`read_state_icon ${isRead ? 'is-read' : 'is-unread'}`}
    aria-label={isRead ? 'הודעה נקראה' : 'הודעה לא נקראה'}
    title={isRead ? 'נקראה' : 'לא נקראה'}
  >
    {isRead ? (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9.5L12 4l9 5.5" />
        <path d="M4 10v9h16v-9" />
        <path d="m4 10 8 5 8-5" />
      </svg>
    ) : (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    )}
  </span>
);

const Notificationspage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const { notifications, isLoaded: navStateLoaded, refreshNavState } = useNavState();
  const [activeNotification, setActiveNotification] = useState(null);

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const datePart = date.toLocaleDateString("he-IL");
    const timePart = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  };

  const handleAuthFailure = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem("user_data");
    localStorage.removeItem("mortgage_cycle_result");
    localStorage.removeItem("new_mortgage_submitted");
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      handleAuthFailure();
      return;
    }
    void refreshNavState({ forceNotifications: true });
  }, [handleAuthFailure, refreshNavState]);

  useEffect(() => {
    if (!activeNotification?.id) return;
    const latest = (Array.isArray(notifications) ? notifications : []).find(
      (item) => item.id === activeNotification.id,
    );
    if (!latest) {
      setActiveNotification(null);
      return;
    }
    setActiveNotification(latest);
  }, [activeNotification?.id, notifications]);

  const notificationsList = Array.isArray(notifications) ? notifications : [];
  const loading = !navStateLoaded;

  const removeNotification = async (id) => {
    const token = getAuthToken();
    if (!token || !apiBase) {
      handleAuthFailure();
      return;
    }
    try {
      const response = await fetch(`${apiBase}/auth/v1/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        let data = null;
        try {
          data = await response.json();
        } catch {
          data = null;
        }
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה במחיקת התראה';
        throw new Error(message);
      }
      if (activeNotification?.id === id) setActiveNotification(null);
      await refreshNavState({ forceNotifications: true });
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    const token = getAuthToken();
    if (!token || !apiBase) {
      handleAuthFailure();
      return;
    }
    try {
      const response = await fetch(`${apiBase}/auth/v1/notifications/me/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה בעדכון התראות';
        throw new Error(message);
      }
      await refreshNavState({ forceNotifications: true });
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notificationsList.filter((n) => !n.read_at).length;
  const isBankUpdateNotification = (item) => {
    const title = (item?.template_name || '').trim();
    const message = (item?.message || '').trim();
    return (
      title.includes('בנק') ||
      message.includes('עודכנו הבנקים') ||
      message.includes('הבנקים שנבחרו')
    );
  };
  const approvalNotification = notificationsList.find((item) => {
    const title = (item?.template_name || '').trim();
    const message = (item?.message || '').trim();
    const hasApprovalKeyword = title.includes('אישור עקרוני') || message.includes('אישור עקרוני');
    return hasApprovalKeyword && !isBankUpdateNotification(item);
  });

  const markAsRead = async (item) => {
    if (!item || item.read_at) return;
    const token = getAuthToken();
    if (!token || !apiBase) {
      handleAuthFailure();
      return;
    }
    try {
      const response = await fetch(`${apiBase}/auth/v1/notifications/${item.id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === 'string' ? data : null) ||
          'שגיאה בעדכון התראה';
        throw new Error(message);
      }
      setActiveNotification((prev) => (
        prev?.id === item.id
          ? { ...prev, read_at: data?.read_at || new Date().toISOString() }
          : prev
      ));
      await refreshNavState({ forceNotifications: true });
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <div className="notifications_page">
      <div className="inner">
        <div className="notifications_header">
          <h1>התראות</h1>
          {unreadCount > 0 ? (
            <button type="button" className="mark_all_read" onClick={markAllAsRead}>
              סמן הכל כנקרא
            </button>
          ) : null}
        </div>
        <div className="notifi_list d_flex d_flex_jb">
           {loading ? (
            <p className="no_notifications">טוען התראות...</p>
          ) : notificationsList.length > 0 ? (
            notificationsList.map((item) => (
              <div className="notifi_col" key={item.id}>
                <img src={notifiIcon} className="icon" alt="" />
                <button
                  type="button"
                  className="notification_title"
                  onClick={() => {
                    setActiveNotification(item);
                    markAsRead(item);
                  }}
                >
                  {item.template_name || 'התראה'}
                </button>
                {item.sent_at ? (
                  <div className="notification_meta">{formatDateTime(item.sent_at)}</div>
                ) : null}
                <div className="read_state">
                  <EnvelopeStatusIcon isRead={Boolean(item.read_at)} />
                </div>
                <div
                  className="remove"
                  onClick={() => removeNotification(item.id)}
                >
                  <img src={removeIcon} alt="remove" />
                </div>
              </div>
            ))
          ) : (
            <p className="no_notifications">אין התראות כרגע</p>
          )}    

        </div>
        {approvalNotification ? (
          <div className="approval_note">
            <p>{approvalNotification.message}</p>
            <a href="/suggestionspage" className="btn view_certificates">לחץ כאן לצפיה באישורים</a>
          </div>
        ) : null}
       {notificationsList.length > 0 ? (
            <>
              <img
                src={notificationsman}
                className="notificationsman desktop_img"
                alt=""
              />
              <img
                src={notificationsFigure}
                className="notificationsman mobile_img"
                alt=""
              />
            </>
          ) : null}
      </div>

      {activeNotification && (
        <div className="notification_popup">
          <div
            className="popup_backdrop"
            onClick={() => setActiveNotification(null)}
          />
          <div className="popup_card">
            <button
              type="button"
              className="popup_close"
              onClick={() => setActiveNotification(null)}
            >
              X
            </button>
            <h2>{activeNotification.template_name || 'התראה'}</h2>
            <p>{activeNotification.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificationspage;
