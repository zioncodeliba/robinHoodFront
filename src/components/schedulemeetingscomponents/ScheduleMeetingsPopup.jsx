import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./ScheduleMeetingspage.css";
import congo from "../../assets/images/congo_icon1.png";
import close from "../../assets/images/close_popup.png";
import { getGatewayBase } from "../../utils/apiBase";
import { getAuthToken } from "../../utils/authStorage";
import { saveBookedMeeting } from "../../utils/meetingBookingStorage";

const MIN_LEAD_MINUTES = 60;

const POPUP_COPY_BY_VARIANT = {
  refinance: {
    title: (
      <>
        ב ר כ ו ת !!!
        <br />
        על החלטתך למחזר את המשכנתא
      </>
    ),
    intro: "יש לנו תמהיל משכנתא מותאם אישית שיחסוך לך עשרות אלפי שקלים...",
    details: (
      <>
        על מנת להנות מכל הטוב הזה
        <br />
        פשוט בחרו <strong>שעה ויום</strong> ותאמו שיחה
        <br />
        עם אחד מצוות המומחים של רובין
      </>
    ),
  },
  offers: {
    title: <>ב ר כ ו ת !!!</>,
    intro: "יש לנו תמהיל משכנתא מותאם אישית שיחסוך לך עשרות אלפי שקלים...",
    details: (
      <>
        על מנת להנות מכל הטוב הזה
        <br />
        פשוט בחרו שעה ויום ותאמו שיחה
        <br />
        עם אחד מצוות המומחים של רובין
      </>
    ),
  },
};

const filterFutureSlots = (days, minLeadMinutes = MIN_LEAD_MINUTES) => {
  if (!Array.isArray(days)) return [];

  const minStartAt = new Date(Date.now() + minLeadMinutes * 60 * 1000);

  return days
    .map((day) => {
      const daySlots = Array.isArray(day?.slots) ? day.slots : [];
      const slots = daySlots.filter((slot) => {
        const slotDate = new Date(`${day?.date}T${slot}:00`);
        return Number.isFinite(slotDate.getTime()) && slotDate.getTime() >= minStartAt.getTime();
      });

      return {
        ...day,
        slots,
      };
    })
    .filter((day) => day.slots.length > 0);
};

const ScheduleMeetingsPopup = ({
  onClose,
  onBooked,
  titleId = "schedule-meetings-title",
  contentVariant = "refinance",
}) => {
  const navigate = useNavigate();
  const apiBase = useMemo(() => getGatewayBase(), []);
  const authToken = useMemo(() => getAuthToken(), []);

  const [slotDays, setSlotDays] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  const selectedDay = useMemo(
    () => slotDays.find((day) => day.date === selectedDate) ?? null,
    [slotDays, selectedDate]
  );

  useEffect(() => {
    let isActive = true;

    const loadSlots = async () => {
      if (!authToken) {
        setError("צריך להתחבר כדי לקבוע פגישה");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
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
          throw new Error(payload?.detail || "שגיאה בטעינת זמינות");
        }

        const rawDays = Array.isArray(payload?.days) ? payload.days : [];
        const days = filterFutureSlots(rawDays);
        if (!isActive) return;

        setSlotDays(days);
        setDurationMinutes(Number(payload?.duration_minutes) || 30);
        if (days.length > 0) {
          setSelectedDate(days[0].date);
          const firstSlot = Array.isArray(days[0].slots) ? days[0].slots[0] : "";
          setSelectedTime(firstSlot || "");
          return;
        }
        setSelectedDate("");
        setSelectedTime("");
      } catch (err) {
        if (!isActive) return;
        setError(err instanceof Error ? err.message : "שגיאה בטעינת זמינות");
        setSlotDays([]);
        setSelectedDate("");
        setSelectedTime("");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadSlots();
    return () => {
      isActive = false;
    };
  }, [apiBase, authToken]);

  const closePopup = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    navigate(-1);
  };

  const formatDayLabel = (dateKey) => {
    if (!dateKey) return "";
    const date = new Date(`${dateKey}T00:00:00`);
    return new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(date);
  };

  const formatSummaryDay = (dateKey) => {
    if (!dateKey) return "";
    const date = new Date(`${dateKey}T00:00:00`);
    return new Intl.DateTimeFormat("he-IL", { weekday: "long" }).format(date);
  };

  const handleDayChange = (dateKey) => {
    setSelectedDate(dateKey);
    const day = slotDays.find((item) => item.date === dateKey);
    const firstSlot = Array.isArray(day?.slots) ? day.slots[0] : "";
    setSelectedTime(firstSlot || "");
  };

  const handleConfirm = async () => {
    if (!authToken) {
      setError("צריך להתחבר כדי לקבוע פגישה");
      return;
    }
    if (!selectedDay || !selectedTime) {
      setError("בחרו יום ושעה לפגישה");
      return;
    }

    try {
      const startAt = new Date(`${selectedDay.date}T${selectedTime}:00`);
      const minStartAt = new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000);
      if (!Number.isFinite(startAt.getTime()) || startAt.getTime() < minStartAt.getTime()) {
        setError("השעה שנבחרה כבר לא זמינה. בחרו שעה אחרת.");
        return;
      }

      setIsBooking(true);
      setError("");
      const endAt = new Date(startAt.getTime() + durationMinutes * 60 * 1000);

      const response = await fetch(`${apiBase}/chatbot/v1/meetings/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          start_at: startAt.toISOString(),
          end_at: endAt.toISOString(),
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.detail || "שגיאה בקביעת פגישה");
      }
      saveBookedMeeting(payload);
      if (typeof onBooked === "function") {
        onBooked(payload);
      }
      navigate("/appointment");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בקביעת פגישה");
    } finally {
      setIsBooking(false);
    }
  };

  const daySlots = selectedDay?.slots ?? [];
  const summaryText = selectedDay && selectedTime
    ? `שיחת יעוץ ביום ${formatSummaryDay(selectedDay.date)} בשעה ${selectedTime}`
    : "בחרו יום ושעה לפגישה";
  const popupCopy = POPUP_COPY_BY_VARIANT[contentVariant] || POPUP_COPY_BY_VARIANT.refinance;

  return (
    <div className="schedule_meetings_popup">
      <button
        type="button"
        className="close"
        onClick={closePopup}
        aria-label="סגור חלון"
      >
        <img src={close} alt="" />
      </button>
      <img src={congo} alt="" />
      <h2 id={titleId}>{popupCopy.title}</h2>
      <p>{popupCopy.intro}</p>
      <p>{popupCopy.details}</p>
      {error ? <div className="form_error">{error}</div> : null}
      <div className="available_days inner">
        <p>ימים פנויים:</p>
        <div className="wrap d_flex d_flex_ac d_flex_jc">
          {isLoading ? (
            <p className="status_text">טוען ימים פנויים...</p>
          ) : slotDays.length === 0 ? (
            <p className="status_text">אין ימים פנויים כרגע.</p>
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
            <p className="status_text">טוען שעות זמינות...</p>
          ) : !selectedDay ? (
            <p className="status_text">בחרו יום כדי לראות שעות.</p>
          ) : daySlots.length === 0 ? (
            <p className="status_text">אין שעות זמינות ביום זה.</p>
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
        {isBooking ? "שומר..." : "אישור"}
      </button>
    </div>
  );
};

export default ScheduleMeetingsPopup;
