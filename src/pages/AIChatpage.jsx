// AIChatpage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import previcon from '../assets/images/prev_icon.png';

const AIChatpage = () => {
  const conversationId = 1;
  const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000').replace(/\/api\/?$/, '');
  const chatbotBase = `${apiBase}/chatbot/v1`;
  const scrollRef = useRef(null);

  const [sessionId, setSessionId] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [options, setOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [mortgageAmount, setMortgageAmount] = useState('');
  const [mortgageYears, setMortgageYears] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const authToken = useMemo(() => localStorage.getItem('auth_token'), []);

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
        });
      }
      const answerText = item.user_input || item.option_label;
      if (answerText) {
        historyMessages.push({
          id: `history-${item.id}-user`,
          role: 'user',
          text: answerText,
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
      setMortgageAmount(String(block.extra_fields?.initialAmount ?? ''));
      setMortgageYears(String(block.extra_fields?.initialYears ?? ''));
    }
  };

  const loadSession = async () => {
    setError('');
    setIsLoading(true);
    try {
      const sessions = await request('/sessions/by-user');
      const activeSession = sessions.find((s) => s.is_active);
      let activeSessionId = activeSession?.id;
      if (!activeSessionId) {
        const created = await request(`/sessions/${conversationId}`, { method: 'POST' });
        activeSessionId = created.session_id;
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

  const inputOption = options.find((option) => option.option_type !== 'button');
  const buttonOptions = options.filter((option) => option.option_type === 'button');
  const isMortgageParameters = currentBlock?.type === 'mortgage_parameters';

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
      await sendAnswer(inputOption, JSON.stringify({ amount: amountValue, years: yearsValue }), `${amountValue} ₪ ל-${yearsValue} שנים`);
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

  return (
    <div className="ai_charpage">
      <Link to="/" className="prev_page_link"><img src={previcon} alt="" /></Link>
      <div className="wrapper">
        <div className="title">
          <h1>צא’ט הגשת בקשה לאישור עקרוני</h1>
          <p>הגשת בקשה לאישור עקרוני לכלל הבנקים בחינם לגמרי!</p>
        </div>
        <div className="ai_chat_panel">
          <div className="ai_chat_messages" ref={scrollRef}>
            {isLoading && (
              <div className="ai_chat_status">טוען שיחה...</div>
            )}
            {!isLoading && messages.length === 0 && (
              <div className="ai_chat_status">אין הודעות עדיין.</div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`ai_chat_bubble ${message.role}`}>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          {error && <div className="ai_chat_error">{error}</div>}

          <div className="ai_chat_actions">
            {currentBlock?.is_terminal ? (
              <div className="ai_chat_status">השיחה הסתיימה 🎉</div>
            ) : isMortgageParameters ? (
              <div className="ai_chat_input_wrap">
                <input
                  type="number"
                  className="ai_chat_input"
                  placeholder="סכום משכנתא"
                  value={mortgageAmount}
                  onChange={(e) => setMortgageAmount(e.target.value)}
                  disabled={isSending}
                />
                <input
                  type="number"
                  className="ai_chat_input"
                  placeholder="שנות החזר"
                  value={mortgageYears}
                  onChange={(e) => setMortgageYears(e.target.value)}
                  disabled={isSending}
                />
                <button className="ai_chat_send" onClick={handleSendInput} disabled={isSending}>
                  {isSending ? 'שולח...' : 'המשך'}
                </button>
              </div>
            ) : buttonOptions.length > 0 ? (
              <div className="ai_chat_buttons">
                {buttonOptions.map((option) => (
                  <button
                    key={option.id}
                    className="ai_chat_option"
                    onClick={() => sendAnswer(option, null, option.label)}
                    disabled={isSending}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : inputOption ? (
              <div className="ai_chat_input_wrap">
                <input
                  type={inputOption.option_type === 'date' ? 'date' : 'text'}
                  className="ai_chat_input"
                  placeholder="הקלד כאן..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSendInput();
                    }
                  }}
                />
                <button className="ai_chat_send" onClick={handleSendInput} disabled={isSending}>
                  {isSending ? 'שולח...' : 'שלח'}
                </button>
              </div>
            ) : (
              <div className="ai_chat_status">אין אפשרויות זמינות.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatpage;
