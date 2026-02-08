import React, { useState } from "react";

const FrequentlyQuestions = ({questionsdata}) => {
  const [openIndex, setOpenIndex] = useState(2); // default open first one

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="frequently_questions_sec">
      <h2>שאלות נפוצות</h2>

      {questionsdata.map((item, index) => (
        <div
          className={`colin ${openIndex === index ? "open" : ""}`}
          key={index}
        >
          <h3 onClick={() => toggleQuestion(index)}>
            {item.question} <span></span>
          </h3>

          <div className="text">
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FrequentlyQuestions;
