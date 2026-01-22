import React,{useState} from "react";
import '../components/notificationcomponents/notifications.css';

import notifiIcon from '../assets/images/notifi.png';
import removeIcon from '../assets/images/remove.png';
import notificationsman from '../assets/images/notifications_man.png';
import robinman from '../assets/images/robin_man.png';


const Notificationspage = () => {

 const [notifications, setNotifications] = useState([
    { id: 1, message: "נא לחתום ללאומי על המסמכים" },
    { id: 2, message: "ממתינים לך 3 הצעות חדשות" },
    { id: 3, message: "תואמה לך שיחה למחר עם נציג" },
    { id: 4, message: "קיבלת אישור עקרוני מלאומי למשכנתאות" },
    { id: 5, message: "שירות ניטור בתוקף" },
  ]);

  // function to remove a notification by ID
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };


  return (
    <div className="notifications_page">
      <div className="inner">
        <h1>התראות</h1>
        <div className="notifi_list d_flex d_flex_jb">
           {notifications.length > 0 ? (
            notifications.map((item) => (
              <div className="notifi_col" key={item.id}>
                <img src={notifiIcon} className="icon" alt="" />
                {item.message}
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
        <div className="approval_note">
          <p>היי גיל, שמחים לעדכן שקיבלנו אישור עקרוני מכלל הבנקים</p>
          <a href="/" className="btn view_certificates">לחץ כאן לצפיה באישורים</a>
        </div>
        <img src={notificationsman} className="notificationsman desktop_img" alt="" />
        <img src={robinman} className="notificationsman mobile_img" alt="" />
      </div>
    </div>
  );
};

export default Notificationspage;