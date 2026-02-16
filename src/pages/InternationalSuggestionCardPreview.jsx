import React from "react";

const assets = {
  driveway: "https://www.figma.com/api/mcp/asset/c371ef51-625d-4df2-b48f-3a6adeb230e1",
  image34: "https://www.figma.com/api/mcp/asset/e9ef0e8d-8f1b-491d-bddd-82d5ab2a6729",
  line171: "https://www.figma.com/api/mcp/asset/11bfc3c4-0b2a-41a9-ad87-00309506dd36",
  infoIcon: "https://www.figma.com/api/mcp/asset/d4813ff1-2097-4730-894f-44be767310c1",
  robinLogo: "https://www.figma.com/api/mcp/asset/fb348bf1-b700-4007-ba54-bfcc9a796b6f",
  menuIcon: "https://www.figma.com/api/mcp/asset/fd80d359-abfe-42ea-8692-f1db3927b4b8",
  backArrow: "https://www.figma.com/api/mcp/asset/f5a22aae-58fa-46f1-b21b-8ccd442529f8",
  divider: "https://www.figma.com/api/mcp/asset/96e738c8-bb56-45f5-8436-3d908114fcad",
  leftHandle: "https://www.figma.com/api/mcp/asset/ac187166-ac47-473f-abfd-26c735bc9b5b",
  rightHandle: "https://www.figma.com/api/mcp/asset/85349c4f-e855-45da-b9dd-f6979ee81d0f",
  chartLine: "https://www.figma.com/api/mcp/asset/0991a8b5-27c8-4e86-bc80-56e8a2521898",
  chartPathGreen: "https://www.figma.com/api/mcp/asset/b02da3a9-8463-41d0-8a8a-2a243e3bf138",
  chartPathOrange: "https://www.figma.com/api/mcp/asset/26cbb861-abd7-47cb-a0a3-6cd0bfe5ebc6",
  chartPoint: "https://www.figma.com/api/mcp/asset/f6e337ab-331a-433f-b2e3-f0c8f3c9a820",
  chartTooltip: "https://www.figma.com/api/mcp/asset/8c298fc7-b9e0-4c16-af61-103289c4bdc4",
  legendOrange: "https://www.figma.com/api/mcp/asset/4abe899d-f169-4289-b301-1bdec67ff41f",
  legendGreen: "https://www.figma.com/api/mcp/asset/5ce6b1ae-d612-4def-b044-e82645af8acc",
  bottomNavBg: "https://www.figma.com/api/mcp/asset/ed6c559c-712b-4742-b586-cfb760adbcbc",
  centerGlow: "https://www.figma.com/api/mcp/asset/0abd0f3c-b039-4473-96f6-74e305703f74",
  iconSimulation: "https://www.figma.com/api/mcp/asset/ca9272f3-9879-4b11-9e23-ee6bd81019b3",
  iconOffers: "https://www.figma.com/api/mcp/asset/36257037-ce1c-442c-82cc-696a63a1b586",
  iconChat: "https://www.figma.com/api/mcp/asset/a0c7cfa0-7700-4ffc-96c6-d0cbe64e05ad",
  iconFiles: "https://www.figma.com/api/mcp/asset/ee616490-921d-4000-9d08-595decb98d0b",
  iconHome: "https://www.figma.com/api/mcp/asset/b3c7d4be-19d4-400c-9e3e-84596c69aa01",
};

const baseText = {
  position: "absolute",
  color: "#27450E",
  fontFamily: "Noto Sans Hebrew, Arial, sans-serif",
  lineHeight: "24px",
};

const InternationalSuggestionCardPreview = () => {
  return (
    <div
      dir="rtl"
      style={{
        width: "100%",
        minHeight: "calc(100vh - 120px)",
        background: "#f2f5ef",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px 0 48px",
        fontFamily: "Noto Sans Hebrew, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: 414,
          height: 1248,
          position: "relative",
          overflow: "hidden",
          background: "#f9f9f9",
          boxShadow: "0 8px 34px rgba(39, 69, 14, 0.18)",
        }}
      >
        <div
          style={{
            width: 502,
            height: 927.31,
            left: 458,
            top: 911.31,
            position: "absolute",
            transform: "rotate(-180deg)",
            transformOrigin: "top left",
            background: "linear-gradient(180deg, #ffffff 0%, #C1E9B9 100%)",
            borderRadius: 40,
          }}
        />

        <div
          style={{
            width: 414,
            height: 428,
            left: 0,
            top: 1,
            position: "absolute",
            overflow: "hidden",
            mixBlendMode: "luminosity",
          }}
        >
          <img
            alt=""
            src={assets.driveway}
            style={{
              width: "175.12%",
              height: "112.85%",
              position: "absolute",
              left: "-22.7%",
              top: 0,
              maxWidth: "none",
            }}
          />
        </div>

        <div
          style={{
            width: 421,
            height: 578,
            left: -7,
            top: 0,
            position: "absolute",
            background: "linear-gradient(180deg, #C1E9B9 0%, rgba(255,255,255,0) 100%)",
          }}
        />
        <div
          style={{
            width: 421,
            height: 509,
            left: 413,
            top: 493,
            position: "absolute",
            transform: "rotate(-180deg)",
            transformOrigin: "top left",
            background: "linear-gradient(180deg, #E2F1DF 17.3%, rgba(255,255,255,0.30) 100%)",
          }}
        />
        <div style={{ width: 414, height: 22, left: 0, top: 0, position: "absolute", background: "#E27600" }} />
        <div
          style={{
            width: 421,
            height: 553,
            left: -6,
            top: 345,
            position: "absolute",
            background: "linear-gradient(180deg, #E2F1DF 0%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div style={{ width: 485, height: 142, left: -17, top: 537, position: "absolute", background: "#fff", boxShadow: "0 4px 50px rgba(226, 118, 0, 0.16)" }} />
        <img alt="" src={assets.line171} style={{ width: 442, left: -29, top: 585, position: "absolute" }} />
        <img alt="" src={assets.line171} style={{ width: 442, left: -29, top: 632, position: "absolute" }} />

        <div style={{ ...baseText, left: 20, top: 548.5, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>640,000 ₪</div>
        <div style={{ ...baseText, left: 163, top: 504, color: "#1E1E1E", fontSize: 18, fontWeight: 600, lineHeight: "26px", textAlign: "center" }}>ריבית</div>
        <div style={{ ...baseText, left: 313, top: 504, color: "#1E1E1E", fontSize: 18, fontWeight: 600, lineHeight: "26px", textAlign: "right" }}>מסלולים</div>
        <div style={{ ...baseText, left: 65, top: 504, color: "#1E1E1E", fontSize: 18, fontWeight: 600, lineHeight: "26px", textAlign: "center" }}>יתרה</div>
        <div style={{ ...baseText, left: 181, top: 548.5, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>5%</div>
        <div style={{ ...baseText, left: 181, top: 593, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>5%</div>
        <div style={{ ...baseText, left: 181, top: 639, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>5%</div>
        <div style={{ ...baseText, left: 20, top: 593.5, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>368,000 ₪</div>
        <div style={{ ...baseText, left: 20, top: 638.5, color: "#1E1E1E", fontSize: 18, fontWeight: 500, lineHeight: "26px", textAlign: "center" }}>592,000 ₪</div>

        <div style={{ width: 107, height: 126, left: 274, top: 545, position: "absolute", background: "#FDB726", boxShadow: "0 4px 50px rgba(88, 47, 255, 0.18)", borderRadius: 15 }} />
        <div style={{ ...baseText, left: 300, top: 548, color: "#fff", fontSize: 18, fontWeight: 500, lineHeight: "26px" }}>{'ק"צ'}</div>
        <div style={{ ...baseText, left: 300, top: 593, color: "#fff", fontSize: 18, fontWeight: 500, lineHeight: "26px" }}>{'מ"צ'}</div>
        <div style={{ ...baseText, left: 290, top: 638, color: "#fff", fontSize: 18, fontWeight: 500, lineHeight: "26px" }}>פריים</div>
        <div style={{ ...baseText, left: 339, top: 552, color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: "26px" }}>(40%)</div>
        <div style={{ ...baseText, left: 339, top: 595, color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: "26px" }}>(40%)</div>
        <div style={{ ...baseText, left: 339, top: 639, color: "#fff", fontSize: 14, fontWeight: 500, lineHeight: "26px" }}>(40%)</div>

        <div style={{ ...baseText, left: 188, top: 469, textAlign: "center", color: "#27450E", fontSize: 14, fontWeight: 500, letterSpacing: 1, textDecoration: "underline" }}>הסבר על המסלולים</div>
        <img alt="" src={assets.infoIcon} style={{ width: 24, height: 24, left: 333, top: 469, position: "absolute" }} />

        <img alt="" src={assets.robinLogo} style={{ width: 169, height: 50, left: 103, top: 36, position: "absolute" }} />
        <img alt="" src={assets.menuIcon} style={{ width: 47, height: 29, left: 330, top: 51, position: "absolute" }} />
        <div style={{ width: 24, height: 12, left: 27, top: 73, position: "absolute", transform: "rotate(-90deg)", transformOrigin: "top left" }}>
          <img alt="" src={assets.backArrow} style={{ width: 24, height: 12 }} />
        </div>

        <div style={{ ...baseText, width: 273, left: 67, top: 108, textAlign: "center", fontSize: 22, fontWeight: 300 }}>ההצעות שלי</div>

        <div style={{ width: 356, height: 236, left: 31, top: 153, position: "absolute", background: "linear-gradient(180deg, #fff 0%, #E1F0DF 100%)", boxShadow: "0 4px 60px rgba(39, 69, 14, 0.05)", borderRadius: 15, border: "2px solid #FDB726" }} />
        <div style={{ width: 45, height: 236, left: 396, top: 153, position: "absolute", background: "linear-gradient(180deg, #ABC1AA 0%, #E1F0DF 100%)", boxShadow: "0 4px 60px rgba(39, 69, 14, 0.05)", borderRadius: 15 }} />
        <div style={{ width: 45, height: 236, left: -23, top: 153, position: "absolute", background: "linear-gradient(180deg, #ABC1AA 0%, #E1F0DF 100%)", boxShadow: "0 4px 60px rgba(39, 69, 14, 0.05)", borderRadius: 15 }} />

        <div style={{ ...baseText, width: 111, left: 121, top: 233, fontSize: 18, fontWeight: 400, textAlign: "right" }}>30</div>
        <div style={{ ...baseText, width: 176, left: 55, top: 210, fontSize: 18, fontWeight: 700, textAlign: "right" }}>תקופה בשנים</div>
        <div style={{ ...baseText, width: 111, left: 251, top: 214, fontSize: 18, fontWeight: 700, textAlign: "right" }}>סכום</div>
        <div style={{ ...baseText, width: 111, left: 251, top: 233, fontSize: 18, fontWeight: 400, textAlign: "right" }}>₪1,500,000</div>
        <div style={{ ...baseText, width: 170, left: 190, top: 182, fontSize: 18, fontWeight: 400, textAlign: "right" }}>בנק הבינלאומי</div>

        <div style={{ ...baseText, left: 88, top: 324, fontSize: 14, fontWeight: 700, textAlign: "right" }}>סך הכל תשלומים</div>
        <div style={{ ...baseText, width: 112, left: 92, top: 348, fontSize: 18, fontWeight: 400, textAlign: "center" }}>₪1,458,966</div>
        <div style={{ ...baseText, left: 238, top: 324, fontSize: 14, fontWeight: 700, textAlign: "right" }}>תשלום חודשי ראשון</div>
        <div style={{ ...baseText, width: 121, left: 245, top: 345, fontSize: 18, fontWeight: 400, textAlign: "right" }}>₪7,982</div>
        <div style={{ ...baseText, width: 185, left: 179, top: 273, fontSize: 14, fontWeight: 700, textAlign: "right" }}>תשלום חודשי מקסימלי צפוי</div>
        <div style={{ ...baseText, width: 91, left: 287, top: 292, fontSize: 18, fontWeight: 400, textAlign: "center" }}>₪8,330</div>

        <img alt="" src={assets.divider} style={{ width: 304.5, left: 55.5, top: 265, position: "absolute", transform: "rotate(90deg)", transformOrigin: "top left" }} />
        <div style={{ width: 303, height: 5, left: 61, top: 384, position: "absolute", background: "#FDB726", borderRadius: 100 }} />

        <img alt="" src={assets.leftHandle} style={{ width: 61, height: 38, left: -14, top: 319, position: "absolute" }} />
        <img alt="" src={assets.rightHandle} style={{ width: 61, height: 38, left: 378, top: 319, position: "absolute" }} />

        <div style={{ width: 110, height: 38, left: 312, top: 404, position: "absolute", borderRadius: 100, border: "1px solid #C9C9C9", display: "flex", alignItems: "center", justifyContent: "center", color: "#27450E", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 30px rgba(226,118,0,0.32)", background: "#f3f8ee" }}>סל אחיד 1</div>
        <div style={{ width: 110, height: 38, left: 193, top: 404, position: "absolute", borderRadius: 100, border: "1px solid #C9C9C9", display: "flex", alignItems: "center", justifyContent: "center", color: "#27450E", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 30px rgba(226,118,0,0.32)", background: "#f3f8ee" }}>סל אחיד 2</div>
        <div style={{ width: 110, height: 38, left: 70, top: 404, position: "absolute", borderRadius: 100, border: "1px solid #C9C9C9", display: "flex", alignItems: "center", justifyContent: "center", color: "#27450E", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 30px rgba(226,118,0,0.32)", background: "#f3f8ee" }}>סל אחיד 3</div>
        <div style={{ width: 110, height: 38, left: -53, top: 404, position: "absolute", borderRadius: 100, border: "1px solid #C9C9C9", display: "flex", alignItems: "center", justifyContent: "center", color: "#27450E", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 30px rgba(226,118,0,0.32)", background: "#f3f8ee" }}>סל אחיד 3</div>

        <div style={{ ...baseText, width: 176, left: 201, top: 700, textAlign: "right", fontSize: 18, fontWeight: 700 }}>החזרים</div>
        <div style={{ width: 386, height: 354, left: 15, top: 730, position: "absolute", background: "#fff", boxShadow: "0 2px 48px rgba(0,0,0,0.04)", borderRadius: 12 }} />

        {[109.5, 155.5, 202.5, 248.5, 289.5, 330.5, 373.5].map((left, idx) => (
          <img
            key={`line-${idx}`}
            alt=""
            src={assets.chartLine}
            style={{ width: 1, height: 234, left, top: 808, position: "absolute" }}
          />
        ))}

        <div style={{ ...baseText, left: 29, top: 808, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>6,000</div>
        <div style={{ ...baseText, left: 29, top: 852, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>5,000</div>
        <div style={{ ...baseText, left: 29, top: 896, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>4,000</div>
        <div style={{ ...baseText, left: 29, top: 940, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>3,000</div>
        <div style={{ ...baseText, left: 29, top: 984, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>2,000</div>
        <div style={{ ...baseText, left: 29, top: 1031, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>1,000</div>

        <img alt="" src={assets.chartPathGreen} style={{ width: 264, height: 89, left: 110, top: 874, position: "absolute" }} />
        <img alt="" src={assets.chartPathOrange} style={{ width: 264, height: 58, left: 110, top: 911, position: "absolute" }} />
        <img alt="" src={assets.chartPoint} style={{ width: 16, height: 16, left: 241, top: 884, position: "absolute" }} />

        <div style={{ width: 73, height: 39, left: 212, top: 839, position: "absolute", overflow: "hidden" }}>
          <img alt="" src={assets.chartTooltip} style={{ width: 73, height: 39, position: "absolute", left: 0, top: 0 }} />
          <div style={{ ...baseText, left: 6, top: 7, color: "#373A3D", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>4,650 ש”ח</div>
        </div>

        <div style={{ ...baseText, left: 340, top: 754, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 1</div>
        <div style={{ ...baseText, left: 212, top: 754, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 3</div>
        <div style={{ ...baseText, left: 155, top: 754, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 4</div>
        <div style={{ ...baseText, left: 98, top: 754, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 5</div>
        <div style={{ ...baseText, left: 38, top: 754, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 6</div>
        <div style={{ width: 60, height: 25, left: 264, top: 750, position: "absolute", background: "#27450E", borderRadius: 100 }} />
        <div style={{ ...baseText, left: 276, top: 754, color: "#fff", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>שנה 2</div>

        <div style={{ ...baseText, left: 95, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>ינואר</div>
        <div style={{ ...baseText, left: 134, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>פברואר</div>
        <div style={{ ...baseText, left: 191, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>מרץ</div>
        <div style={{ ...baseText, left: 232, top: 1048, color: "#27450E", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>אפריל</div>
        <div style={{ ...baseText, left: 280, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>מאי</div>
        <div style={{ ...baseText, left: 322, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>יוני</div>
        <div style={{ ...baseText, left: 365, top: 1048, color: "#8D9196", fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>יולי</div>

        <img alt="" src={assets.legendOrange} style={{ width: 14, height: 14, left: 365, top: 1095, position: "absolute" }} />
        <img alt="" src={assets.legendGreen} style={{ width: 14, height: 14, left: 273, top: 1095, position: "absolute" }} />
        <div style={{ ...baseText, left: 258, top: 1088, fontSize: 18, fontWeight: 400 }}>קרן</div>
        <div style={{ ...baseText, left: 348, top: 1088, color: "#E27600", fontSize: 18, fontWeight: 400 }}>ריבית</div>

        <div style={{ width: 95, height: 26, left: 62, top: 141, position: "absolute", background: "#FDB726", borderRadius: 100 }} />
        <div style={{ ...baseText, width: 96, left: 62, top: 141, textAlign: "center", color: "#fff", fontSize: 12, fontWeight: 500 }}>אישור סופי</div>

        <div style={{ width: 62, height: 58, left: 305, top: 120, position: "absolute", boxShadow: "0 4px 4px rgba(0,0,0,0.25)", overflow: "hidden" }}>
          <img alt="" src={assets.image34} style={{ width: "538.71%", height: "100.92%", position: "absolute", left: 0, top: "-0.46%", maxWidth: "none" }} />
        </div>

        <img alt="" src={assets.bottomNavBg} style={{ width: 414, height: 82, left: -1, top: 1166, position: "absolute" }} />
        <img alt="" src={assets.centerGlow} style={{ width: 78, height: 78, left: 167, top: 1127, position: "absolute" }} />

        <div style={{ width: 78, height: 78, left: 167, top: 1127, position: "absolute", background: "#E27600", boxShadow: "0 4px 30px rgba(226, 118, 0, 0.27)", borderRadius: 9999, border: "2px solid #fff", zIndex: 3 }} />
        <img alt="" src={assets.iconHome} style={{ width: 33, height: 31, left: 190, top: 1149, position: "absolute", zIndex: 4 }} />

        <img alt="" src={assets.iconSimulation} style={{ width: 26, height: 26, left: 358, top: 1186, position: "absolute" }} />
        <img alt="" src={assets.iconOffers} style={{ width: 24, height: 25, left: 35, top: 1184, position: "absolute" }} />
        <img alt="" src={assets.iconChat} style={{ width: 28, height: 26, left: 290, top: 1184, position: "absolute" }} />
        <img alt="" src={assets.iconFiles} style={{ width: 23, height: 26, left: 99, top: 1184, position: "absolute" }} />

        <div style={{ ...baseText, left: 347, top: 1215, textAlign: "center", fontSize: 12, fontWeight: 400 }}>סימולציה</div>
        <div style={{ ...baseText, left: 82, top: 1215, textAlign: "center", fontSize: 12, fontWeight: 400 }}>הקבצים שלי</div>
        <div style={{ ...baseText, left: 31, top: 1215, textAlign: "center", fontSize: 12, fontWeight: 400 }}>הצעות</div>
        <div style={{ ...baseText, left: 285, top: 1215, textAlign: "center", fontSize: 12, fontWeight: 400 }}>צ’אט AI</div>

        <div style={{ width: 60, height: 7, left: 20, top: 1241, position: "absolute", background: "#E27600" }} />
      </div>
    </div>
  );
};

export default InternationalSuggestionCardPreview;
