// AIChatpageStatic.jsx
import React,{useState ,useRef } from "react";

import CustomRangeInput from '../components/simulatorcomponents/CustomRangeInput';

import previcon from '../assets/images/prev_icon.png';
import bouticon from '../assets/images/bout.png';
import viewicon from '../assets/images/pdf_view.svg';
import sendicon from '../assets/images/send.svg';

const MIN_AMOUNT = 100000;
const MAX_AMOUNT = 1500000;
const STEP_AMOUNT = 10000;

const MIN_TERM = 5;
const MAX_TERM = 30;
const STEP_TERM = 1;


const AIChatpageStatic = () => {
  const [value, setValue] = useState("yes");
  const [mortgageAmount, setMortgageAmount] = useState(MIN_AMOUNT);
  const [termInYears, setTermInYears] = useState(MIN_TERM);
  
  const chatInnerRef = useRef(null);

  const scrolltop =() =>{
    chatInnerRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }
 

  return (
    <div className="aichat_page">
      <a href="/" className="prev_page_link"><img src={previcon} alt="" /></a>
      <div className="wrapper">
        <div className="title">
          <h1>צא’ט הגשת בקשה לאישור עקרוני</h1>
          <p>הגשת בקשה לאישור עקרוני לכלל הבנקים בחינם לגמרי!</p>
        </div>
        <div className="ai_chat_box">
          <div className="had d_flex d_flex_jc d_flex_ac"> 
            <img src={bouticon} alt="" /> <span>רובין העוזר האישי שלך למשכנתא</span> 
          </div>
          <div className="inner"  ref={chatInnerRef}>
              <div className="colin user_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                          היי עומר! איזה כיף שאתה פה 😊<br/>
                          אני הולך לעזור לך להתקדם בתהליך לקראת קבלת המשכנתא 💪
                      </p>
                      <p>בשביל שנוכל להגיש בקשה מסודרת לאישור עקרוני מול הבנקים, אני צריך לשאול אותך כמה שאלות אישיות. <br/>
                        זה ייקח כמה דקות – וחשוב שתהיה כמה שיותר מדויק, כדי שנוכל להשיג לך את התנאים הכי טובים 🙌</p>
                      <p>מוכן? להתחיל ✨</p>
                      <span className="time">9:24</span>
                    </div>
                    <div className="btn_box d_flex d_flex_jb ">
                      <button>היי, כן מעולה!</button>
                      <button>היי, לא תודה!</button>
                    </div>
                </div>
              </div>
              <div className="colin boat_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                          היי עומר! איזה כיף שאתה פה 😊<br/>
                          אני הולך לעזור לך להתקדם בתהליך לקראת קבלת המשכנתא 💪
                      </p>
                      <p>בשביל שנוכל להגיש בקשה מסודרת לאישור עקרוני מול הבנקים, אני צריך לשאול אותך כמה שאלות אישיות. <br/>
                        זה ייקח כמה דקות – וחשוב שתהיה כמה שיותר מדויק, כדי שנוכל להשיג לך את התנאים הכי טובים 🙌</p>
                      <p>מוכן? להתחיל ✨</p>
                      <span className="time">9:24</span>
                    </div>                    
                </div>
              </div>

              <div className="colin user_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                         מצוין, בוא נתקדם שלב 😊 <br/> 
                         מה המטרה של המשכנתא שאתה מבקש ?
                      </p>                      
                      <span className="time">9:24</span>
                    </div>
                    <div className="btn_box d_flex d_flex_jb ">
                      <button className="active">רכישת דירה</button>
                      <button>רכישה מגרש</button>
                      <button>לכל מטרה</button>
                      <button>בניה עצמית</button>                      
                    </div>
                </div>
              </div>
              <div className="colin boat_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                         מעולה! עכשיו בוא נדבר על הנכס עצמו 🏠<br/> 
                         איזה סוג דירה אתה קונה?
                      </p>                      
                      <span className="time">9:24</span>
                    </div>    
                    <div className="btn_box btn_box_full d_flex d_flex_jb ">
                      <button className="active">דירה יחידה אין בבעלותי דירה</button>
                      <button>דירה להשקעה - כבר יש לי דירה אחת לפחות</button>
                      <button>דירה חליפית - יש לי דירה אבל אני מתכוון למכור אותה </button>
                    </div>                
                </div>
              </div>

              <div className="colin user_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                        מה סוג הרכישה?
                      </p>                      
                      <span className="time">9:24</span>
                    </div>
                    <div className="btn_box btn_box_full d_flex d_flex_jb ">                      
                      <button>רכישת דירה מקבלן</button>
                      <button>רכישת דירה יד שניה</button>                      
                    </div>
                </div>
              </div>
              <div className="colin boat_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>
                        מזל טוב! איזה התרגשות לרכוש את הדירה הראשונה שלך 🎉😊 <br/>
                        האם לאחד השותפים ברכישת הדירה היתה או יש דירה ב10 שנים האחרונות?
                      </p>                      
                      <span className="time">9:24</span>
                    </div>    
                    <div className="btn_box d_flex d_flex_jb ">
                      <span className="back_top" onClick={scrolltop}>חזור להתחלה</span>
                        <label htmlFor="yes">
                            <input
                              type="radio"
                              id="yes"
                              name="yesorno"
                              value="yes"
                              checked={value === "yes"}
                              onChange={(e) => setValue(e.target.value)}
                            />
                            כן
                          </label>

                          <label htmlFor="no">
                            <input
                              type="radio"
                              id="no"
                              name="yesorno"
                              value="no"
                              checked={value === "no"}
                              onChange={(e) => setValue(e.target.value)}
                            />
                            לא
                        </label>
                    </div>                
                </div>
              </div>

              <div className="colin user_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>איפה הדירה נמצאת?</p>
                      <span className="time">9:24</span>
                    </div>
                    <div className="input_box">
                      <input type="text" className="in" placeholder="נא להקליד כאן..." />
                    </div>
                </div>
              </div>
              <div className="colin boat_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>מה מחיר הדירה?</p>
                      <span className="time">9:24</span>
                    </div>
                    <div className="input_box">
                      <input type="text" className="in" placeholder="נא להקליד כאן סכום..." />
                    </div>
                </div>
              </div>

              <div className="colin colin_full user_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>בחר את הנושאים הבאים</p>
                      <span className="time">9:24</span>
                    </div>
                    <div className="calculator_box">
                      <div className="wrap d_flex d_flex_jb">
                          <div className="mortgage_amount">
                            <h3>סכום משכנתא</h3>
                            <CustomRangeInput
                              value={mortgageAmount}
                              min={MIN_AMOUNT}
                              max={MAX_AMOUNT}
                              step={STEP_AMOUNT}
                              unit="₪"
                              onChange={(e) => setMortgageAmount(Number(e.target.value))}
                            />
                          </div>
                          <div className="refund_period">
                            <h3>תקופת החזר</h3>
                              <CustomRangeInput
                              value={termInYears}
                              min={MIN_TERM}
                              max={MAX_TERM}
                              step={STEP_TERM}
                              unit="שנים"
                              onChange={(e) => setTermInYears(Number(e.target.value))}
                            />
                          </div>
                        </div>
                      <div className="monthly_repayment">
                        החזר חודשי: <span>₪250</span>
                      </div>
                    </div>
                </div>
              </div>
              <div className="colin boat_chat">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                    <div className="message_box">
                      <p>תשובה תתקבל עד 5 ימי עסקים <br/> בהתאם לפעילות הבנקים. <br/> 
                      אנו כבר העברו את הבקשה לקבלת <br/> אישור עקרוני.</p>
                      <span className="time">9:24</span>
                    </div>                    
                </div>
              </div>

              <div className="order_benefit">
                <h4>על מנת להנות מהמשך טיפול נא <br/>
                  לחתום לצורך ייפוי כוח</h4>
                <form>
                  <div className="form_input">
                    <input type="text" className="in" placeholder="full name" />
                  </div>
                  <div className="form_input">
                    <input type="text" className="in" placeholder="ID" />
                  </div>
                  <div className="signature">
                    <span>נא לחתום כאן</span>
                  </div>
                  <div className="btn_col d_flex d_flex_jb d_flex_ac">
                    <button className="view"><img src={viewicon} alt="" /></button>
                    <button className="confirmation">אישור</button>
                  </div>
                </form>
              </div>

          </div>
          <div className="send_message d_flex d_flex_ac d_flex_jb">
            <div className="form_input">
              <input type="text" placeholder="נא להקליד כאן..." className="in" />
            </div>
            <button className="send"><img src={sendicon} alt="" /></button>
          </div>
        </div>        
      </div>
    </div>
  );
};

export default AIChatpageStatic;
