import React from "react";
import AnimaBoxCard from "../components/suggestionscomponents/AnimaBoxCard";

const AnimaBoxPreview = () => {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "48px 16px",
        background: "#edf3ea",
      }}
    >
      <AnimaBoxCard />
    </div>
  );
};

export default AnimaBoxPreview;
