import React from "react";
import "../commoncomponents/YourRoutesMortgageDetails.css";
import noteicon from "../../assets/images/note_i.svg";
import RoutesBankMortgage from "../suggestionscomponents/RoutesBankMortgage";
import NoOfferCard from "./NoOfferCard";

const NoOfferMortgageDetails = ({
  data,
  themeColor,
  routesFromCurrentMortgage,
  bankLogo,
  bankName,
  bankCardData,
}) => {
  const mortgageData = data || {
    title: "המשכנתא שלך:",
    details: {
      bank: "בנק הפועלים",
      amount: "₪1,500,000",
      years: "30",
      firstMonthlyPayment: "₪7,982",
      maxMonthlyPayment: "₪8,330",
    },
    totalPayments: "₪1,458,966",
    note: {
      text: "הסבר על המסלולים",
    },
    routes: {
      headers: ["מסלולים", "ריבית", "יתרה"],
      list: [
        { name: 'ק"צ', percentage: "40%", interest: "5%", balance: "₪640,000" },
        { name: 'מ"צ', percentage: "40%", interest: "5%", balance: "₪368,000" },
        { name: "פריים", percentage: "40%", interest: "5%", balance: "₪592,000" },
      ],
      totals: {
        indexLinked: '100,000 ש"ח',
        overall: '1,700,000 ש"ח',
      },
    },
  };

  const {
    title,
    details,
    totalPayments,
    note,
  } = mortgageData;
  const routesForDisplay = Array.isArray(routesFromCurrentMortgage) && routesFromCurrentMortgage.length > 0
    ? routesFromCurrentMortgage
    : (Array.isArray(mortgageData?.routes?.list) ? mortgageData.routes.list : []);

  return (
    <div className="routes_mortgage_sec" style={{ borderColor: themeColor, "--bgcolor": themeColor }}>
      <NoOfferCard
        title={title}
        details={details}
        totalPayments={totalPayments}
        themeColor={themeColor}
        bankLogo={bankLogo}
        bankName={bankName || details?.bank}
        mobileBankCardData={bankCardData}
      />
      {note?.text && (
        <div className="routs_note">
          <img src={noteicon} alt="" />
          <p>{note.text}</p>
        </div>
      )}
      {routesForDisplay.length > 0 ? (
        <RoutesBankMortgage
          color={themeColor || "#4E8FF7"}
          routes={routesForDisplay}
          maxVisibleRoutes={5}
          expandLabel="לצפיה בכל המסלולים"
          collapseLabel="הסתר מסלולים"
        />
      ) : null}
    </div>
  );
};

export default NoOfferMortgageDetails;
