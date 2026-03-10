import React from "react";
import { createPortal } from "react-dom";

import ScheduleMeetingsPopup from "./ScheduleMeetingsPopup";

const ScheduleMeetingsModal = ({
  isOpen,
  onClose,
  onBooked,
  titleId = "schedule-meetings-modal-title",
  contentVariant = "refinance",
}) => {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="schedule_meetings_modal_overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="schedule_meetings_modal_dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <ScheduleMeetingsPopup
          onClose={onClose}
          onBooked={onBooked}
          titleId={titleId}
          contentVariant={contentVariant}
        />
      </div>
    </div>,
    document.body
  );
};

export default ScheduleMeetingsModal;
