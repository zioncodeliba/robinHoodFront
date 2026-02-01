import React,{useEffect, useState} from "react";
import '../components/notificationcomponents/notifications.css';
import { getGatewayBase } from "../utils/apiBase";

import notifiIcon from '../assets/images/notifi.png';
import removeIcon from '../assets/images/remove.png';
import notificationsman from '../assets/images/notifications_man.png';
import robinman from '../assets/images/robin_man.png';


const Notificationspage = () => {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState(null);

  const formatDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const datePart = date.toLocaleDateString("he-IL");
    const timePart = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const apiBase = getGatewayBase();
    if (!token || !apiBase) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const response = await fetch(`${apiBase}/auth/v1/notifications/me`, {
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
            'שגיאה בטעינת התראות';
          throw new Error(message);
        }
        if (isMounted) {
          setNotifications(Array.isArray(data) ? data : []);
          window.dispatchEvent(new CustomEvent('notifications:updated'));
        }
      } catch (error) {
        if (isMounted) {
          setNotifications([]);
        }
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const removeNotification = async (id) => {
    const token = localStorage.getItem("auth_token");
    const apiBase = getGatewayBase();
    if (!token || !apiBase) {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      if (activeNotification?.id === id) {
        setActiveNotification(null);
      }
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
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      window.dispatchEvent(new CustomEvent('notifications:updated'));
      if (activeNotification?.id === id) {
        setActiveNotification(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("auth_token");
    const apiBase = getGatewayBase();
    if (!token || !apiBase) return;
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
      if (Array.isArray(data)) {
        setNotifications(data);
      } else {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
        );
      }
      window.dispatchEvent(new CustomEvent('notifications:updated'));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const approvalNotification = notifications.find((item) => {
    const title = item?.template_name || '';
    const message = item?.message || '';
    return `${title} ${message}`.includes('אישור עקרוני');
  });

  const markAsRead = async (item) => {
    if (!item || item.read_at) return;
    const token = localStorage.getItem("auth_token");
    const apiBase = getGatewayBase();
    if (!token || !apiBase) return;
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
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read_at: data?.read_at || new Date().toISOString() } : n))
      );
      setActiveNotification((prev) =>
        prev?.id === item.id ? { ...prev, read_at: data?.read_at || new Date().toISOString() } : prev
      );
      window.dispatchEvent(new CustomEvent('notifications:updated'));
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
          ) : notifications.length > 0 ? (
            notifications.map((item) => (
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
            <a href="/" className="btn view_certificates">לחץ כאן לצפיה באישורים</a>
          </div>
        ) : null}
        <img src={notificationsman} className="notificationsman desktop_img" alt="" />
        <img src={robinman} className="notificationsman mobile_img" alt="" />
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
