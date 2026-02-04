// AIChatpage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import CustomRangeInput from '../components/simulatorcomponents/CustomRangeInput';
import '../components/simulatorcomponents/Simulatorpage.css';
import previcon from '../assets/images/prev_icon.png';
import bouticon from '../assets/images/bout.png';
import viewicon from '../assets/images/pdf_view.svg';
import sendicon from '../assets/images/send.svg';
import { getGatewayBase } from "../utils/apiBase";

const DEFAULT_MIN_AMOUNT = 100000;
const DEFAULT_MAX_AMOUNT = 1500000;
const DEFAULT_STEP_AMOUNT = 10000;
const DEFAULT_MIN_TERM = 5;
const DEFAULT_MAX_TERM = 30;
const DEFAULT_STEP_TERM = 1;

const AIChatpage = () => {
  const conversationId = 1;
  const apiBase = getGatewayBase();
  const chatbotBase = `${apiBase}/chatbot/v1`;
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [options, setOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mortgageAmount, setMortgageAmount] = useState(DEFAULT_MIN_AMOUNT);
  const [mortgageYears, setMortgageYears] = useState(DEFAULT_MIN_TERM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [signatureReady, setSignatureReady] = useState(false);
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [debugFilling, setDebugFilling] = useState(false);

  const authToken = useMemo(() => localStorage.getItem('auth_token'), []);
  const isDebugAutofill = useMemo(() => process.env.NODE_ENV !== 'production', []);
  const signatureCanvasRef = useRef(null);
  const signatureCtxRef = useRef(null);
  const isDrawingRef = useRef(false);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const request = async (path, init = {}) => {
    if (!authToken) {
      throw new Error('צריך להתחבר כדי להתחיל שיחה');
    }
    const headers = {
      ...(init.headers || {}),
      Authorization: `Bearer ${authToken}`,
    };
    if (init.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${chatbotBase}${path}`, { ...init, headers });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.detail || data?.message || 'שגיאה בשיחה עם השרת';
      throw new Error(message);
    }
    return data;
  };

  const getActiveSessionId = async () => {
    const sessions = await request('/sessions/by-user');
    const activeSession = sessions.find((s) => s.is_active);
    return activeSession?.id || null;
  };

  const appendBotMessage = (block) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'bot' && last.blockKey === block.block_key) {
        return prev;
      }
      return [
        ...prev,
        {
          id: `block-${block.block_key}`,
          role: 'bot',
          text: block.message,
          blockKey: block.block_key,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  };

  const loadHistory = async (sessionIdValue) => {
    const history = await request(`/sessions/${sessionIdValue}/history-for-chat`);
    const historyMessages = [];
    history.forEach((item) => {
      if (item.block_message) {
        historyMessages.push({
          id: `history-${item.id}-bot`,
          role: 'bot',
          text: item.block_message,
          blockKey: item.block_key,
          timestamp: item.timestamp,
        });
      }
      const answerText = item.user_input || item.option_label;
      if (answerText) {
        historyMessages.push({
          id: `history-${item.id}-user`,
          role: 'user',
          text: answerText,
          timestamp: item.timestamp,
        });
      }
    });
    setMessages(historyMessages);
  };

  const loadBlock = async (sessionIdValue, blockKey) => {
    const [block, blockOptions] = await Promise.all([
      request(`/blocks/by-key/${blockKey}?session_id=${sessionIdValue}`),
      request(`/blocks/${blockKey}/options`),
    ]);
    setCurrentBlock(block);
    setOptions(blockOptions);
    appendBotMessage(block);
    setInputValue('');
    if (block.type === 'mortgage_parameters') {
      const initialAmount = Number(
        block.extra_fields?.initialAmount ?? block.extra_fields?.minAmount ?? DEFAULT_MIN_AMOUNT,
      );
      const initialYears = Number(
        block.extra_fields?.initialYears ?? block.extra_fields?.minYears ?? DEFAULT_MIN_TERM,
      );
      setMortgageAmount(Number.isFinite(initialAmount) ? initialAmount : DEFAULT_MIN_AMOUNT);
      setMortgageYears(Number.isFinite(initialYears) ? initialYears : DEFAULT_MIN_TERM);
    }
  };

  const loadSession = async () => {
    setError('');
    setIsLoading(true);
    try {
      let activeSessionId = await getActiveSessionId();
      if (!activeSessionId) {
        try {
          const created = await request(`/sessions/${conversationId}`, { method: 'POST' });
          activeSessionId = created.session_id;
        } catch (err) {
          const message = String(err?.message || '');
          // In development, React.StrictMode can trigger a double-create race.
          if (message.includes('active session')) {
            await sleep(250);
            activeSessionId = await getActiveSessionId();
          } else {
            throw err;
          }
        }
      }

      if (!activeSessionId) {
        throw new Error('לא נמצאה שיחה פעילה למשתמש');
      }
      setSessionId(activeSessionId);
      await loadHistory(activeSessionId);
      const sessionData = await request(`/sessions/${activeSessionId}`);
      await loadBlock(activeSessionId, sessionData.current_block_key);
    } catch (err) {
      setError(err?.message || 'שגיאה בטעינת השיחה');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken) {
      setError('צריך להתחבר כדי להתחיל שיחה');
      setIsLoading(false);
      return;
    }
    loadSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const signatureBlockId = 52;
  const shouldShowSignature = currentBlock?.id === signatureBlockId;

  useEffect(() => {
    if (!shouldShowSignature) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1f2937';
      signatureCtxRef.current = ctx;
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, [shouldShowSignature]);

  const inputOption = options.find((option) => option.option_type !== 'button');
  const buttonOptions = options.filter((option) => option.option_type === 'button');
  const isMortgageParameters = currentBlock?.type === 'mortgage_parameters';
  const signatureConfirmOption = useMemo(
    () => (shouldShowSignature ? buttonOptions.find((option) => option.label === 'מאשר') ?? null : null),
    [buttonOptions, shouldShowSignature],
  );
  const visibleButtonOptions = useMemo(
    () => (shouldShowSignature ? buttonOptions.filter((option) => option !== signatureConfirmOption) : buttonOptions),
    [buttonOptions, shouldShowSignature, signatureConfirmOption],
  );

  useEffect(() => {
    if (!shouldShowSignature) return;
    setSignatureReady(false);
    setSignatureSaved(false);
  }, [shouldShowSignature]);

  useEffect(() => {
    if (inputOption?.option_type !== 'date') return;
    setInputValue((prev) => {
      if (prev) return prev;
      if (currentBlock?.id === 40) {
        const today = new Date();
        return today.toISOString().slice(0, 10);
      }
      if (currentBlock?.id === 25) {
        return '1990-01-01';
      }
      return '';
    });
  }, [inputOption?.option_type, currentBlock?.id]);

  const formatNumber = (value) =>
    new Intl.NumberFormat('he-IL').format(Number.isFinite(value) ? value : 0);

  const formatMessageTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text) => {
    if (!text) return null;
    const normalized = text.replace(/\\n/g, '\n');
    const lines = normalized.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={`${index}-${line}`}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const calculateMonthlyPayment = (amount, years) => {
    if (!amount || !years) return 0;
    const baseYears = 30;
    const baseAmount = 100000;
    const baseMonthlyPayment = 550;
    return Math.round(baseMonthlyPayment * (amount / baseAmount) * (baseYears / years));
  };

  const mortgageMinAmountRaw = Number(currentBlock?.extra_fields?.minAmount ?? DEFAULT_MIN_AMOUNT);
  const mortgageMaxAmountRaw = Number(currentBlock?.extra_fields?.maxAmount ?? DEFAULT_MAX_AMOUNT);
  const mortgageMinYearsRaw = Number(currentBlock?.extra_fields?.minYears ?? DEFAULT_MIN_TERM);
  const mortgageMaxYearsRaw = Number(currentBlock?.extra_fields?.maxYears ?? DEFAULT_MAX_TERM);
  const mortgageMinAmount = Number.isFinite(mortgageMinAmountRaw) ? mortgageMinAmountRaw : DEFAULT_MIN_AMOUNT;
  const mortgageMaxAmount = Number.isFinite(mortgageMaxAmountRaw) ? mortgageMaxAmountRaw : DEFAULT_MAX_AMOUNT;
  const mortgageMinYears = Number.isFinite(mortgageMinYearsRaw) ? mortgageMinYearsRaw : DEFAULT_MIN_TERM;
  const mortgageMaxYears = Number.isFinite(mortgageMaxYearsRaw) ? mortgageMaxYearsRaw : DEFAULT_MAX_TERM;
  const mortgageMonthly = calculateMonthlyPayment(mortgageAmount, mortgageYears);

  useEffect(() => {
    if (!isMortgageParameters) return;
    setMortgageAmount((prev) => Math.min(Math.max(prev, mortgageMinAmount), mortgageMaxAmount));
    setMortgageYears((prev) => Math.min(Math.max(prev, mortgageMinYears), mortgageMaxYears));
  }, [isMortgageParameters, mortgageMinAmount, mortgageMaxAmount, mortgageMinYears, mortgageMaxYears]);

  const formatDateToSlashes = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
    return value;
  };

  const handleSendInput = async () => {
    if (!inputOption || !sessionId) return;
    if (isMortgageParameters) {
      const amountValue = Number(mortgageAmount);
      const yearsValue = Number(mortgageYears);
      if (!amountValue || !yearsValue) {
        setError('נא להזין סכום ושנים תקינים');
        return;
      }
      const displayText = `${formatNumber(amountValue)} ₪ ל-${yearsValue} שנים`;
      await sendAnswer(
        inputOption,
        JSON.stringify({ amount: amountValue, years: yearsValue }),
        displayText,
      );
      return;
    }

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('נא להזין ערך');
      return;
    }
    const formattedValue =
      inputOption.option_type === 'date' ? formatDateToSlashes(trimmed) : trimmed;
    await sendAnswer(inputOption, formattedValue, formattedValue);
  };

  const sendAnswer = async (option, value, displayText) => {
    if (!sessionId) return;
    setIsSending(true);
    setError('');
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: displayText || option.label,
        timestamp: new Date().toISOString(),
      },
    ]);
    try {
      const response = await request(`/sessions/${sessionId}/answer`, {
        method: 'POST',
        body: JSON.stringify({
          option_id: option.id,
          value,
        }),
      });
      if (response.next_block_key) {
        await loadBlock(sessionId, response.next_block_key);
      }
    } catch (err) {
      setError(err?.message || 'שגיאה בשליחת התשובה');
    } finally {
      setIsSending(false);
    }
  };

  const getSignaturePoint = (event) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleSignaturePointerDown = (event) => {
    if (!signatureCtxRef.current) return;
    event.preventDefault();
    isDrawingRef.current = true;
    if (signatureSaved) {
      setSignatureSaved(false);
    }
    signatureCanvasRef.current?.setPointerCapture?.(event.pointerId);
    const { x, y } = getSignaturePoint(event);
    signatureCtxRef.current.beginPath();
    signatureCtxRef.current.moveTo(x, y);
  };

  const handleSignaturePointerMove = (event) => {
    if (!isDrawingRef.current || !signatureCtxRef.current) return;
    event.preventDefault();
    const { x, y } = getSignaturePoint(event);
    signatureCtxRef.current.lineTo(x, y);
    signatureCtxRef.current.stroke();
    setSignatureReady(true);
  };

  const handleSignaturePointerUp = (event) => {
    if (!signatureCtxRef.current) return;
    event.preventDefault();
    isDrawingRef.current = false;
    signatureCanvasRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const handleSignatureClear = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = signatureCtxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureReady(false);
    setSignatureSaved(false);
  };

  const handleSignatureSave = async (confirmOption) => {
    if (!signatureCanvasRef.current || !authToken) return;
    if (!sessionId) {
      setError('לא ניתן לשמור חתימה ללא סשן פעיל');
      return;
    }
    if (!signatureReady) {
      setError('נא לחתום לפני שמירה');
      return;
    }
    setSignatureSaving(true);
    setError('');
    try {
      const blob = await new Promise((resolve) => {
        signatureCanvasRef.current.toBlob((fileBlob) => resolve(fileBlob), 'image/png');
      });
      if (!blob) {
        throw new Error('לא ניתן לשמור חתימה');
      }
      const formData = new FormData();
      const filename = `system_signature_${sessionId}.png`;
      formData.append('file', blob, filename);
      const response = await fetch(`${apiBase}/auth/v1/customer-files`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || 'שגיאה בשמירת החתימה');
      }
      setSignatureSaved(true);
      if (confirmOption) {
        await sendAnswer(confirmOption, null, confirmOption.label);
        return;
      }
      localStorage.setItem('new_mortgage_submitted', 'true');
      navigate('/homebeforeapproval2');
    } catch (err) {
      setError(err?.message || 'שגיאה בשמירת החתימה');
    } finally {
      setSignatureSaving(false);
    }
  };

  const handleDebugAutofill = async () => {
    if (!sessionId || debugFilling) return;
    setDebugFilling(true);
    setError('');
    try {
      await request(`/sessions/${sessionId}/debug-autofill`, { method: 'POST' });
      await loadHistory(sessionId);
      const sessionData = await request(`/sessions/${sessionId}`);
      await loadBlock(sessionId, sessionData.current_block_key);
    } catch (err) {
      setError(err?.message || 'שגיאה במילוי אוטומטי');
    } finally {
      setDebugFilling(false);
    }
  };

  const isFullWidthButtons =
    visibleButtonOptions.length === 1 ||
    visibleButtonOptions.length === 3 ||
    visibleButtonOptions.some((option) => option.label.length > 28);
  const shouldShowInputBar =
    Boolean(inputOption) && !isMortgageParameters && !currentBlock?.is_terminal;

  return (
    <div className="aichat_page">
      <Link to="/" className="prev_page_link"><img src={previcon} alt="" /></Link>
      <div className="wrapper">
        <div className="title">
          <h1>צא’ט הגשת בקשה לאישור עקרוני</h1>
          <p>הגשת בקשה לאישור עקרוני לכלל הבנקים בחינם לגמרי!</p>
        </div>
        {isDebugAutofill && (
          <div className="ai_chat_toolbar">
            <button
              className="ai_chat_debug"
              onClick={handleDebugAutofill}
              disabled={debugFilling || isSending || isLoading}
            >
              {debugFilling ? 'ממלא אוטומטית...' : 'בדיקת מילוי אוטומטי'}
            </button>
          </div>
        )}
        <div className="ai_chat_box">
          <div className="had d_flex d_flex_jc d_flex_ac">
            <img src={bouticon} alt="" /> <span>רובין העוזר האישי שלך למשכנתא</span>
          </div>
          <div className="inner" ref={scrollRef}>
            {isLoading && <div className="ai_chat_status">טוען שיחה...</div>}
            {!isLoading && messages.length === 0 && (
              <div className="ai_chat_status">אין הודעות עדיין.</div>
            )}
            {messages.map((message) => {
              const isBot = message.role === 'bot';
              const isActiveBlock = isBot && message.blockKey === currentBlock?.block_key;
              const timeLabel = formatMessageTime(message.timestamp);

              return (
                <div key={message.id} className={`colin ${isBot ? 'boat_chat' : 'user_chat'}`}>
                  <div className="icon"><img src={bouticon} alt="" /></div>
                  <div className="text">
                    <div className="message_box">
                      <p>{renderMessageText(message.text)}</p>
                      {timeLabel && <span className="time">{timeLabel}</span>}
                    </div>
                    {isActiveBlock && !currentBlock?.is_terminal && isMortgageParameters && (
                      <div className="calculator_box">
                        <div className="wrap d_flex d_flex_jb">
                          <div className="mortgage_amount">
                            <h3>סכום משכנתא</h3>
                            <CustomRangeInput
                              value={mortgageAmount}
                              min={mortgageMinAmount}
                              max={mortgageMaxAmount}
                              step={DEFAULT_STEP_AMOUNT}
                              unit="₪"
                              onChange={(e) => setMortgageAmount(Number(e.target.value))}
                            />
                          </div>
                          <div className="refund_period">
                            <h3>תקופת החזר</h3>
                            <CustomRangeInput
                              value={mortgageYears}
                              min={mortgageMinYears}
                              max={mortgageMaxYears}
                              step={DEFAULT_STEP_TERM}
                              unit="שנים"
                              onChange={(e) => setMortgageYears(Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="monthly_repayment">
                          החזר חודשי: <span>₪{formatNumber(mortgageMonthly)}</span>
                        </div>
                        <div className="btn_box btn_box_full d_flex d_flex_jb">
                          <button onClick={handleSendInput} disabled={isSending}>
                            {isSending ? 'שולח...' : 'המשך'}
                          </button>
                        </div>
                      </div>
                    )}
                    {isActiveBlock && !currentBlock?.is_terminal && !isMortgageParameters && visibleButtonOptions.length > 0 && (
                      <div className={`btn_box d_flex d_flex_jb ${isFullWidthButtons ? 'btn_box_full' : ''}`}>
                        {visibleButtonOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => sendAnswer(option, null, option.label)}
                            disabled={isSending}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {shouldShowSignature && (
              <div className="order_benefit">
                <h4>על מנת להנות מהמשך טיפול נא <br /> לחתום לצורך ייפוי כוח</h4>
                <form onSubmit={(event) => event.preventDefault()}>
                  <div className="signature signature_pad">
                    {!signatureReady && <span>נא לחתום כאן</span>}
                    <canvas
                      ref={signatureCanvasRef}
                      className="signature_canvas"
                      onPointerDown={handleSignaturePointerDown}
                      onPointerMove={handleSignaturePointerMove}
                      onPointerUp={handleSignaturePointerUp}
                      onPointerLeave={handleSignaturePointerUp}
                    />
                  </div>
                  <div className="btn_col d_flex d_flex_jb d_flex_ac">
                    <button
                      type="button"
                      className="view"
                      onClick={handleSignatureClear}
                      disabled={signatureSaving}
                      aria-label="נקה חתימה"
                    >
                      <img src={viewicon} alt="" />
                    </button>
                    <button
                      type="button"
                      className="confirmation"
                      onClick={() => handleSignatureSave(signatureConfirmOption)}
                      disabled={signatureSaving || signatureSaved}
                    >
                      {signatureSaved ? 'החתימה נשמרה' : signatureSaving ? 'שומר...' : 'אישור'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {error && <div className="ai_chat_error">{error}</div>}
            {!isLoading &&
              !currentBlock?.is_terminal &&
              !isMortgageParameters &&
              !shouldShowSignature &&
              visibleButtonOptions.length === 0 &&
              !inputOption && <div className="ai_chat_status">אין אפשרויות זמינות.</div>}
          </div>
          {shouldShowInputBar && (
            <div className="send_message d_flex d_flex_ac d_flex_jb">
              <div className="form_input">
                <input
                  type={inputOption?.option_type === 'date' ? 'date' : 'text'}
                  className="in"
                  placeholder={inputOption?.label || 'נא להקליד כאן...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendInput();
                    }
                  }}
                />
              </div>
              <button className="send" onClick={handleSendInput} disabled={isSending}>
                <img src={sendicon} alt="" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatpage;
