const BOOKED_MEETING_STORAGE_KEY = "booked_meeting";

const readCurrentUserId = () => {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.localStorage.getItem("user_data");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return String(parsed?.id || parsed?.user_id || "").trim();
  } catch {
    return "";
  }
};

const safeParseMeeting = (value) => {
  if (!value || typeof value !== "object") return null;
  const startAt = String(value.start_at || "").trim();
  if (!startAt) return null;
  const startDate = new Date(startAt);
  if (!Number.isFinite(startDate.getTime())) return null;
  return {
    id: value.id ? String(value.id) : "",
    user_id: value.user_id ? String(value.user_id) : "",
    start_at: startAt,
    end_at: value.end_at ? String(value.end_at) : "",
    status: value.status ? String(value.status) : "",
  };
};

export const saveBookedMeeting = (meeting) => {
  if (typeof window === "undefined") return;
  const parsed = safeParseMeeting(meeting);
  if (!parsed) return;

  const currentUserId = readCurrentUserId();
  const payload = {
    ...parsed,
    user_id: parsed.user_id || currentUserId,
  };

  try {
    window.localStorage.setItem(BOOKED_MEETING_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage failures.
  }
};

export const clearBookedMeeting = () => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BOOKED_MEETING_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
};

export const loadUpcomingBookedMeeting = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BOOKED_MEETING_STORAGE_KEY);
    if (!raw) return null;

    const parsed = safeParseMeeting(JSON.parse(raw));
    if (!parsed) {
      clearBookedMeeting();
      return null;
    }

    const currentUserId = readCurrentUserId();
    if (currentUserId && parsed.user_id && parsed.user_id !== currentUserId) {
      return null;
    }

    if (parsed.status === "בוטל") {
      clearBookedMeeting();
      return null;
    }

    const startAt = new Date(parsed.start_at);
    if (!Number.isFinite(startAt.getTime()) || startAt.getTime() < Date.now()) {
      clearBookedMeeting();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

