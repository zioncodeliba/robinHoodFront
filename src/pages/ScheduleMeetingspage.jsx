// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../components/schedulemeetingscomponents/ScheduleMeetingspage.css';
import congo from '../assets/images/congo_icon1.png';
import close from '../assets/images/close_popup.png';
import manImage from '../assets/images/schedulemeetings_man.png';
import { getGatewayBase } from "../utils/apiBase";

const ScheduleMeetingspage = () => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const authToken = useMemo(() => localStorage.getItem("auth_token"), []);

  const [slotDays, setSlotDays] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');

  const selectedDay = useMemo(
    () => slotDays.find((day) => day.date === selectedDate) ?? null,
    [slotDays, selectedDate]
  );

  useEffect(() => {
    let isActive = true;
    const loadSlots = async () => {
      if (!authToken) {
        setError('צריך להתחבר כדי לקבוע פגישה');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const response = await fetch(
          `${apiBase}/chatbot/v1/meeting-slots?days=7&duration_minutes=30`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.detail || 'שגיאה בטעינת זמינות');
        }

        const days = Array.isArray(payload?.days) ? payload.days : [];
        if (!isActive) return;
        setSlotDays(days);
        setDurationMinutes(Number(payload?.duration_minutes) || 30);
        if (days.length > 0) {
          setSelectedDate(days[0].date);
          const firstSlot = Array.isArray(days[0].slots) ? days[0].slots[0] : '';
          setSelectedTime(firstSlot || '');
        } else {
          setSelectedDate('');
          setSelectedTime('');
        }
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : 'שגיאה בטעינת זמינות');
        setSlotDays([]);
        setSelectedDate('');
        setSelectedTime('');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadSlots();
    return () => {
      isActive = false;
    };
  }, [apiBase, authToken]);

  const formatDayLabel = (dateKey) => {
    if (!dateKey) return '';
    const date = new Date(`${dateKey}T00:00:00`);
    const weekday = new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(date);
    const dayMonth = new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit' }).format(date);
    return `${weekday} ${dayMonth}`;
  };

  const formatSummaryDate = (dateKey) => {
    if (!dateKey) return '';
    const date = new Date(`${dateKey}T00:00:00`);
    return new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: '2-digit', month: 'long' }).format(date);
  };

  const handleDayChange = (dateKey) => {
    setSelectedDate(dateKey);
    const day = slotDays.find((item) => item.date === dateKey);
    const firstSlot = Array.isArray(day?.slots) ? day.slots[0] : '';
    setSelectedTime(firstSlot || '');
  };

  const handleConfirm = async () => {
    if (!authToken) {
      setError('צריך להתחבר כדי לקבוע פגישה');
      return;
    }
    if (!selectedDay || !selectedTime) {
      setError('בחרו יום ושעה לפגישה');
      return;
    }

    try {
      setIsBooking(true);
      setError('');
      const startAt = new Date(`${selectedDay.date}T${selectedTime}:00`);
      const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

      const response = await fetch(`${apiBase}/chatbot/v1/meetings/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || 'שגיאה בקביעת פגישה');
      }
      navigate('/appointment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בקביעת פגישה');
    } finally {
      setIsBooking(false);
    }
  };

  const daySlots = selectedDay?.slots ?? [];
  const summaryText = selectedDay && selectedTime
    ? `שיחת יעוץ ביום ${formatSummaryDate(selectedDay.date)} בשעה ${selectedTime}`
    : 'בחרו יום ושעה לפגישה';

  return (
    <div className="schedule_meetings_page">
      <h1>בדיקת מחזור משכנתא</h1>
      <div className="schedule_meetings_popup">
          <span className="close" onClick={() => navigate(-1)}><img src={close} alt="" /></span>
          <img src={congo} alt="" />
          <h2>ב ר כ ו ת !!!<br/>
            על החלטתך למחזר את המשכנתא</h2>
          <p>יש לנו תמהיל משכנתא מותאם אישית שיחסוך לך עשרות אלפי שקלים...</p>
          <p>על מנת להנות מכל הטוב הזה < br/>
            פשוט בחרו <strong>שעה ויום</strong> ותאמו שיחה<br/>
            עם אחד מצוות המומחים של רובין
          </p>
          {error ? <div className="form_error">{error}</div> : null}
          <div className="available_days inner">
            <p>ימים פנויים:</p>
            <div className="wrap d_flex d_flex_ac d_flex_jc">
              {isLoading ? (
                <p>טוען ימים פנויים...</p>
              ) : slotDays.length === 0 ? (
                <p>אין ימים פנויים כרגע.</p>
              ) : (
                slotDays.map((day) => (
                  <label key={day.date}>
                    <input
                      type="radio"
                      name="day"
                      value={day.date}
                      checked={selectedDate === day.date}
                      onChange={() => handleDayChange(day.date)}
                      disabled={isBooking}
                    />
                    {formatDayLabel(day.date)}
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="available_hours inner">
            <p>שעות פנויות:</p>
            <div className="wrap d_flex d_flex_ac d_flex_jc">
              {isLoading ? (
                <p>טוען שעות זמינות...</p>
              ) : !selectedDay ? (
                <p>בחרו יום כדי לראות שעות.</p>
              ) : daySlots.length === 0 ? (
                <p>אין שעות זמינות ביום זה.</p>
              ) : (
                daySlots.map((slot) => (
                  <label key={slot}>
                    <input
                      type="radio"
                      name="hours"
                      value={slot}
                      checked={selectedTime === slot}
                      onChange={() => setSelectedTime(slot)}
                      disabled={isBooking}
                    />
                    {slot}
                  </label>
                ))
              )}
            </div>
          </div>
          <h4>{summaryText}</h4>
          <button
            type="button"
            className="btn"
            onClick={handleConfirm}
            disabled={isBooking || isLoading || !selectedDay || !selectedTime}
          >
            {isBooking ? 'שומר...' : 'אישור'}
          </button>
      </div>
      <img src={manImage} className="manImage desktop_img" alt="" />
    </div>  
  );
};

export default ScheduleMeetingspage;
