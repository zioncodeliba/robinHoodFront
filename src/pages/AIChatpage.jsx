// AIChatpage.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  const [hasHistory, setHasHistory] = useState(false);
  const [pinnedBlockKey, setPinnedBlockKey] = useState(null);
  const [buttonBlocks, setButtonBlocks] = useState({});
  const [mortgageBlocks, setMortgageBlocks] = useState({});
  const [activeBlockToken, setActiveBlockToken] = useState(0);
  const [signatureReady, setSignatureReady] = useState(false);
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [coSignatureReady, setCoSignatureReady] = useState(false);
  const [coSignatureSaved, setCoSignatureSaved] = useState(false);
  const [needsCoBorrowerSignature, setNeedsCoBorrowerSignature] = useState(false);
  const [debugFilling, setDebugFilling] = useState(false);

  const authToken = useMemo(() => localStorage.getItem('auth_token'), []);
  const isDebugAutofill = useMemo(() => process.env.NODE_ENV !== 'production', []);
  const signatureCanvasRef = useRef(null);
  const signatureCtxRef = useRef(null);
  const isDrawingRef = useRef(false);
  const coSignatureCanvasRef = useRef(null);
  const coSignatureCtxRef = useRef(null);
  const isCoDrawingRef = useRef(false);
  const hasHistoryRef = useRef(false);
  const historyAnswerByBlockRef = useRef(new Map());
  const mortgageBlocksRef = useRef({});
  const dateInputRef = useRef(null);

  useEffect(() => {
    mortgageBlocksRef.current = mortgageBlocks;
  }, [mortgageBlocks]);

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

  const shallowEqual = (left, right) => {
    if (left === right) return true;
    if (!left || !right) return false;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    return leftKeys.every((key) => left[key] === right[key]);
  };

  const upsertButtonBlock = (blockKey, updates) => {
    if (!blockKey) return;
    setButtonBlocks((prev) => {
      const existing = prev[blockKey] || { options: [], selectedId: null, answered: false };
      return {
        ...prev,
        [blockKey]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  const upsertMortgageBlock = (blockKey, updates) => {
    if (!blockKey) return;
    setMortgageBlocks((prev) => {
      const existing = prev[blockKey] || {};
      const nextEntry = { ...existing, ...updates };
      if (shallowEqual(existing, nextEntry)) {
        return prev;
      }
      return {
        ...prev,
        [blockKey]: nextEntry,
      };
    });
  };

  const parseMortgageAnswer = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        const amount = Number(parsed?.amount);
        const years = Number(parsed?.years);
        if (Number.isFinite(amount) && Number.isFinite(years)) {
          return { amount, years };
        }
      } catch {
        // ignore JSON parse errors
      }
    }
    const match = trimmed.match(/([\d,.]+)\s*₪.*?(\d{1,2})/);
    if (!match) return null;
    const amount = Number(match[1].replace(/[^\d]/g, ''));
    const years = Number(match[2]);
    if (!Number.isFinite(amount) || !Number.isFinite(years)) return null;
    return { amount, years };
  };

  const getButtonOptions = (blockKey) => {
    if (!blockKey) return [];
    return buttonBlocks[blockKey]?.options || [];
  };

  const getButtonOptionsForBlock = (blockKey) => {
    if (!blockKey) return [];
    const stored = getButtonOptions(blockKey);
    if (stored.length > 0) return stored;
    if (blockKey === currentBlock?.block_key) return options;
    return [];
  };

  const isButtonBlockKey = (blockKey) =>
    getButtonOptionsForBlock(blockKey).some((option) => option.option_type === 'button');

  const resolveHistorySelection = (blockKey, optionsList) => {
    if (!blockKey) return null;
    const historyEntry = historyAnswerByBlockRef.current.get(blockKey);
    if (!historyEntry) return null;
    let selectedId = historyEntry.optionId;
    if (!selectedId && historyEntry.label) {
      const match = optionsList.find((option) => option.label === historyEntry.label);
      if (match) {
        selectedId = match.id;
      }
    }
    return selectedId || null;
  };

  const loadHistory = async (sessionIdValue) => {
    const history = await request(`/sessions/${sessionIdValue}/history-for-chat`);
    const historyMessages = [];
    let firstBlockKey = null;
    const historyAnswers = new Map();
    const historyMortgageBlocks = new Map();
    let hasCoBorrowerAnswer = false;
    let hasCoBorrowerYes = false;
    history.forEach((item) => {
      if (item.block_message) {
        if (!firstBlockKey) {
          firstBlockKey = item.block_key;
        }
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
        if (item.block_key) {
          historyAnswers.set(item.block_key, {
            label: item.option_label || item.user_input || '',
            optionId: item.option_id ?? null,
          });
          if (isCoBorrowerQuestionText(item.block_message)) {
            hasCoBorrowerAnswer = true;
            if (String(answerText).includes('כן')) {
              hasCoBorrowerYes = true;
            }
          }
          const parsedMortgage = parseMortgageAnswer(answerText);
          if (parsedMortgage) {
            historyMortgageBlocks.set(item.block_key, parsedMortgage);
          }
        }
        historyMessages.push({
          id: `history-${item.id}-user`,
          role: 'user',
          text: answerText,
          blockKey: item.block_key,
          timestamp: item.timestamp,
        });
      }
    });
    setMessages(historyMessages);
    const hasItems = historyMessages.length > 0;
    hasHistoryRef.current = hasItems;
    setHasHistory(hasItems);
    historyAnswerByBlockRef.current = historyAnswers;
    if (hasCoBorrowerAnswer) {
      setNeedsCoBorrowerSignature(hasCoBorrowerYes);
    }
    if (historyMortgageBlocks.size > 0) {
      setMortgageBlocks((prev) => {
        const next = { ...prev };
        historyMortgageBlocks.forEach((value, blockKey) => {
          const existing = next[blockKey] || {};
          next[blockKey] = {
            ...existing,
            amount: value.amount,
            years: value.years,
            answered: true,
          };
        });
        return next;
      });
    }
    return firstBlockKey;
  };

  const primeButtonBlocksFromHistory = async () => {
    const entries = Array.from(historyAnswerByBlockRef.current.entries());
    if (entries.length === 0) return;

    const results = await Promise.all(entries.map(async ([blockKey, answer]) => {
      try {
        const blockOptions = await request(`/blocks/${blockKey}/options`);
        return { blockKey, options: blockOptions, answer };
      } catch {
        return null;
      }
    }));

    setButtonBlocks((prev) => {
      const next = { ...prev };
      results.forEach((result) => {
        if (!result) return;
        const buttonOptions = result.options.filter((option) => option.option_type === 'button');
        if (buttonOptions.length === 0) return;
        let selectedId = result.answer?.optionId ?? null;
        if (!selectedId && result.answer?.label) {
          const match = buttonOptions.find((option) => option.label === result.answer.label);
          if (match) {
            selectedId = match.id;
          }
        }
        const existing = next[result.blockKey] || { options: [], selectedId: null, answered: false };
        next[result.blockKey] = {
          ...existing,
          options: result.options,
          selectedId,
          answered: Boolean(selectedId),
        };
      });
      return next;
    });
  };

  const loadBlock = async (sessionIdValue, blockKey) => {
    const [block, blockOptions] = await Promise.all([
      request(`/blocks/by-key/${blockKey}?session_id=${sessionIdValue}`),
      request(`/blocks/${blockKey}/options`),
    ]);
    setCurrentBlock(block);
    setOptions(blockOptions);
    appendBotMessage(block);
    if (!pinnedBlockKey && !hasHistoryRef.current) {
      setPinnedBlockKey(block.block_key);
    }
    const hasButtons = blockOptions.some((option) => option.option_type === 'button');
    if (hasButtons) {
      const historySelectedId = resolveHistorySelection(block.block_key, blockOptions);
      upsertButtonBlock(block.block_key, {
        options: blockOptions,
        ...(historySelectedId ? { selectedId: historySelectedId, answered: true } : {}),
      });
    }
    setInputValue('');
    if (block.type === 'mortgage_parameters') {
      const storedMortgage = mortgageBlocksRef.current[block.block_key];
      const initialAmount = Number(
        storedMortgage?.amount ?? block.extra_fields?.initialAmount ?? block.extra_fields?.minAmount ?? DEFAULT_MIN_AMOUNT,
      );
      const initialYears = Number(
        storedMortgage?.years ?? block.extra_fields?.initialYears ?? block.extra_fields?.minYears ?? DEFAULT_MIN_TERM,
      );
      setMortgageAmount(Number.isFinite(initialAmount) ? initialAmount : DEFAULT_MIN_AMOUNT);
      setMortgageYears(Number.isFinite(initialYears) ? initialYears : DEFAULT_MIN_TERM);
      const minAmount = Number(block.extra_fields?.minAmount ?? DEFAULT_MIN_AMOUNT);
      const maxAmount = Number(block.extra_fields?.maxAmount ?? DEFAULT_MAX_AMOUNT);
      const minYears = Number(block.extra_fields?.minYears ?? DEFAULT_MIN_TERM);
      const maxYears = Number(block.extra_fields?.maxYears ?? DEFAULT_MAX_TERM);
      upsertMortgageBlock(block.block_key, {
        amount: Number.isFinite(initialAmount) ? initialAmount : DEFAULT_MIN_AMOUNT,
        years: Number.isFinite(initialYears) ? initialYears : DEFAULT_MIN_TERM,
        minAmount: Number.isFinite(minAmount) ? minAmount : DEFAULT_MIN_AMOUNT,
        maxAmount: Number.isFinite(maxAmount) ? maxAmount : DEFAULT_MAX_AMOUNT,
        minYears: Number.isFinite(minYears) ? minYears : DEFAULT_MIN_TERM,
        maxYears: Number.isFinite(maxYears) ? maxYears : DEFAULT_MAX_TERM,
        answered: storedMortgage?.answered ?? false,
      });
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
      const firstBlockKeyFromHistory = await loadHistory(activeSessionId);
      if (firstBlockKeyFromHistory) {
        setPinnedBlockKey(firstBlockKeyFromHistory);
      }
      await primeButtonBlocksFromHistory();
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
    if (!currentBlock?.block_key) return;
    setActiveBlockToken((prev) => prev + 1);
  }, [currentBlock?.block_key]);

  const inputOption = options.find((option) => option.option_type !== 'button');
  const buttonOptions = options.filter((option) => option.option_type === 'button');
  const isMortgageParameters = currentBlock?.type === 'mortgage_parameters';
  const isDateInput = inputOption?.option_type === 'date';

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const paddingTop = 24;
    let rafId = null;

    const applyScroll = () => {
      if (isMortgageParameters && currentBlock?.block_key) {
        const target = container.querySelector(`[data-block-key="${currentBlock.block_key}"]`);
        if (target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const delta = targetRect.top - containerRect.top - paddingTop;
          container.scrollTop = Math.max(0, container.scrollTop + delta);
          return;
        }
      }
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = Math.max(0, maxScroll - paddingTop);
    };

    rafId = window.requestAnimationFrame(applyScroll);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [messages, isLoading, isMortgageParameters, currentBlock?.block_key]);

  const signatureBlockId = 52;
  const shouldShowSignature = currentBlock?.id === signatureBlockId;

  useEffect(() => {
    if (!shouldShowSignature) return;
    const initCanvas = (canvasRef, ctxRef) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
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
      ctxRef.current = ctx;
    };

    const handleResize = () => {
      initCanvas(signatureCanvasRef, signatureCtxRef);
      if (needsCoBorrowerSignature) {
        initCanvas(coSignatureCanvasRef, coSignatureCtxRef);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldShowSignature, needsCoBorrowerSignature]);

  useEffect(() => {
    if (!shouldShowSignature) return;
    setSignatureReady(false);
    setSignatureSaved(false);
    setCoSignatureReady(false);
    setCoSignatureSaved(false);
  }, [shouldShowSignature, needsCoBorrowerSignature]);

  const signatureConfirmOption = useMemo(
    () => (shouldShowSignature ? buttonOptions.find((option) => option.label === 'מאשר') ?? null : null),
    [buttonOptions, shouldShowSignature],
  );
  const visibleButtonOptions = useMemo(
    () => (shouldShowSignature ? buttonOptions.filter((option) => option !== signatureConfirmOption) : buttonOptions),
    [buttonOptions, shouldShowSignature, signatureConfirmOption],
  );

  const getDefaultDateValue = () => {
    if (currentBlock?.id === 40) {
      const today = new Date();
      return today.toISOString().slice(0, 10);
    }
    return '1990-01-01';
  };

  useEffect(() => {
    if (!isDateInput) return;
    setInputValue((prev) => {
      if (prev) return prev;
      return getDefaultDateValue();
    });
  }, [isDateInput, currentBlock?.id]);

  const handleDateInputActivate = (event) => {
    if (!isDateInput) return;
    const input = dateInputRef.current;
    if (!input) return;
    if (!inputValue) {
      const fallbackDate = getDefaultDateValue();
      input.value = fallbackDate;
      setInputValue(fallbackDate);
    }
    input.focus();
    if (event?.isTrusted && typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // Some browsers require a direct user gesture on the input.
      }
    }
  };

  const handleDateInputWrapperClick = () => {
    if (!isDateInput) return;
    const input = dateInputRef.current;
    if (!input) return;
    if (!inputValue) {
      const fallbackDate = getDefaultDateValue();
      input.value = fallbackDate;
      setInputValue(fallbackDate);
    }
    input.focus();
    input.click();
  };

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

  const renderMessageParagraphs = (text) => {
    if (!text) return null;
    const normalized = text.replace(/\\n/g, '\n');
    const paragraphs = normalized.split(/\n\s*\n/).filter(Boolean);
    if (paragraphs.length === 0) {
      return <p>{renderMessageText(normalized)}</p>;
    }
    return paragraphs.map((paragraph, index) => (
      <p key={`intro-${index}`}>{renderMessageText(paragraph)}</p>
    ));
  };

  const isCoBorrowerQuestionText = (text) => {
    if (!text) return false;
    const normalized = text.replace(/\s+/g, ' ').trim();
    const hasBorrower = normalized.includes('לווה') || normalized.includes('לווים');
    const hasAdditional = normalized.includes('עוד') || normalized.includes('נוסף') || normalized.includes('נוספים');
    const hasMortgage = normalized.includes('משכנתא');
    return hasBorrower && hasAdditional && (hasMortgage || normalized.includes('הלוואה'));
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

  useEffect(() => {
    if (!isMortgageParameters || !currentBlock?.block_key) return;
    upsertMortgageBlock(currentBlock.block_key, {
      amount: mortgageAmount,
      years: mortgageYears,
      minAmount: mortgageMinAmount,
      maxAmount: mortgageMaxAmount,
      minYears: mortgageMinYears,
      maxYears: mortgageMaxYears,
    });
  }, [
    isMortgageParameters,
    mortgageAmount,
    mortgageYears,
    mortgageMinAmount,
    mortgageMaxAmount,
    mortgageMinYears,
    mortgageMaxYears,
    currentBlock?.block_key,
  ]);

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
      if (currentBlock?.block_key) {
        upsertMortgageBlock(currentBlock.block_key, {
          amount: amountValue,
          years: yearsValue,
          answered: true,
          minAmount: mortgageMinAmount,
          maxAmount: mortgageMaxAmount,
          minYears: mortgageMinYears,
          maxYears: mortgageMaxYears,
        });
      }
      const displayText = `${formatNumber(amountValue)} ₪ ל-${yearsValue} שנים`;
      await sendAnswer(
        inputOption,
        JSON.stringify({ amount: amountValue, years: yearsValue }),
        displayText,
        { appendUserMessage: false },
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

  const sendAnswer = async (option, value, displayText, { appendUserMessage = true } = {}) => {
    if (!sessionId) return false;
    setIsSending(true);
    setError('');
    if (appendUserMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          text: displayText || option.label,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
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
      return true;
    } catch (err) {
      setError(err?.message || 'שגיאה בשליחת התשובה');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const getSignaturePoint = (event, canvas) => {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleSignaturePointerDown = (event, canvasRef, ctxRef, drawingRef, setReady, setSaved) => {
    if (!ctxRef.current) return;
    event.preventDefault();
    drawingRef.current = true;
    if (setSaved) {
      setSaved(false);
    }
    canvasRef.current?.setPointerCapture?.(event.pointerId);
    const { x, y } = getSignaturePoint(event, canvasRef.current);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const handleSignaturePointerMove = (event, canvasRef, ctxRef, drawingRef, setReady) => {
    if (!drawingRef.current || !ctxRef.current) return;
    event.preventDefault();
    const { x, y } = getSignaturePoint(event, canvasRef.current);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    setReady(true);
  };

  const handleSignaturePointerUp = (event, canvasRef, ctxRef, drawingRef) => {
    if (!ctxRef.current) return;
    event.preventDefault();
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const handlePrimaryPointerDown = (event) =>
    handleSignaturePointerDown(event, signatureCanvasRef, signatureCtxRef, isDrawingRef, setSignatureReady, setSignatureSaved);
  const handlePrimaryPointerMove = (event) =>
    handleSignaturePointerMove(event, signatureCanvasRef, signatureCtxRef, isDrawingRef, setSignatureReady);
  const handlePrimaryPointerUp = (event) =>
    handleSignaturePointerUp(event, signatureCanvasRef, signatureCtxRef, isDrawingRef);

  const handleCoPointerDown = (event) =>
    handleSignaturePointerDown(event, coSignatureCanvasRef, coSignatureCtxRef, isCoDrawingRef, setCoSignatureReady, setCoSignatureSaved);
  const handleCoPointerMove = (event) =>
    handleSignaturePointerMove(event, coSignatureCanvasRef, coSignatureCtxRef, isCoDrawingRef, setCoSignatureReady);
  const handleCoPointerUp = (event) =>
    handleSignaturePointerUp(event, coSignatureCanvasRef, coSignatureCtxRef, isCoDrawingRef);

  const handleSignatureClear = () => {
    const clearCanvas = (canvasRef, ctxRef, setReady, setSaved) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setReady(false);
      if (setSaved) setSaved(false);
    };
    clearCanvas(signatureCanvasRef, signatureCtxRef, setSignatureReady, setSignatureSaved);
    if (needsCoBorrowerSignature) {
      clearCanvas(coSignatureCanvasRef, coSignatureCtxRef, setCoSignatureReady, setCoSignatureSaved);
    }
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
    if (needsCoBorrowerSignature && !coSignatureReady) {
      setError('נא לחתום גם כלווה נוסף');
      return;
    }
    setSignatureSaving(true);
    setError('');
    try {
      const uploadSignature = async (canvasRef, filename) => {
        const blob = await new Promise((resolve) => {
          canvasRef.current.toBlob((fileBlob) => resolve(fileBlob), 'image/png');
        });
        if (!blob) {
          throw new Error('לא ניתן לשמור חתימה');
        }
        const formData = new FormData();
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
      };

      await uploadSignature(signatureCanvasRef, `system_signature_${sessionId}.png`);
      if (needsCoBorrowerSignature) {
        await uploadSignature(coSignatureCanvasRef, `system_signature_co_${sessionId}.png`);
        setSignatureSaved(true);
        setCoSignatureSaved(true);
      } else {
        setSignatureSaved(true);
      }
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

  const getIsFullWidthButtons = (buttonList) =>
    buttonList.length === 1 ||
    buttonList.length === 3 ||
    buttonList.some((option) => option.label.length > 28);

  const shouldShowInputBar =
    Boolean(inputOption) && !isMortgageParameters && !currentBlock?.is_terminal;

  const buttonBlockIndex = useMemo(() => {
    const order = [];
    messages.forEach((message) => {
      if (message.role !== 'bot') return;
      if (!isButtonBlockKey(message.blockKey)) return;
      if (!order.includes(message.blockKey)) {
        order.push(message.blockKey);
      }
    });
    return new Map(order.map((blockKey, index) => [blockKey, index]));
  }, [messages, buttonBlocks, currentBlock?.block_key, options]);

  const handleButtonOptionClick = async (blockKey, option) => {
    const blockState = buttonBlocks[blockKey];
    if (!blockKey || isSending) return;
    if (blockState?.answeredToken === activeBlockToken) return;
    if (currentBlock?.block_key === blockKey && isCoBorrowerQuestionText(currentBlock?.message)) {
      const label = String(option.label || '');
      if (label.includes('כן')) {
        setNeedsCoBorrowerSignature(true);
      } else if (label.includes('לא')) {
        setNeedsCoBorrowerSignature((prev) => prev);
      }
    }
    upsertButtonBlock(blockKey, { selectedId: option.id });
    const success = await sendAnswer(option, null, option.label, { appendUserMessage: false });
    if (success) {
      upsertButtonBlock(blockKey, { answered: true, answeredToken: activeBlockToken });
    }
  };

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
              const isPinnedMessage = isBot && pinnedBlockKey && message.blockKey === pinnedBlockKey;
              const isButtonBlockMessage = isBot && isButtonBlockKey(message.blockKey);
              const buttonOptionsForMessage = isButtonBlockMessage
                ? getButtonOptionsForBlock(message.blockKey).filter((option) => option.option_type === 'button')
                : [];
              const blockState = buttonBlocks[message.blockKey] || {};
              const buttonPosition = buttonBlockIndex.get(message.blockKey) ?? 0;
              const mortgageBlock = mortgageBlocks[message.blockKey];
              const isMortgageBlockMessage = isBot && mortgageBlock;
              const isActiveMortgageBlock = isMortgageBlockMessage && isActiveBlock && isMortgageParameters;
              const timeLabel = formatMessageTime(message.timestamp);
              const messageClass = isBot
                ? (isButtonBlockMessage
                  ? (buttonPosition % 2 === 0 ? 'user_chat' : 'boat_chat')
                  : 'boat_chat')
                : 'user_chat';
              if (!isBot && (isButtonBlockKey(message.blockKey) || mortgageBlocks[message.blockKey])) {
                return null;
              }
              const shouldRenderButtonsForMessage =
                isButtonBlockMessage &&
                buttonOptionsForMessage.length > 0 &&
                !(isActiveBlock && (isMortgageParameters || shouldShowSignature || currentBlock?.is_terminal));

              return (
                <div
                  key={message.id}
                  className={`colin ${messageClass}`}
                  data-block-key={isBot ? message.blockKey : undefined}
                >
                  <div className="icon"><img src={bouticon} alt="" /></div>
                  <div className="text">
                    <div className="message_box">
                      {isPinnedMessage ? renderMessageParagraphs(message.text) : (
                        <p>{renderMessageText(message.text)}</p>
                      )}
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
                              disabled={isSending}
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
                              disabled={isSending}
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
                    {isMortgageBlockMessage && !isActiveMortgageBlock && (
                      <div className="calculator_box">
                        <div className="wrap d_flex d_flex_jb">
                          <div className="mortgage_amount">
                            <h3>סכום משכנתא</h3>
                            <CustomRangeInput
                              value={mortgageBlock.amount ?? DEFAULT_MIN_AMOUNT}
                              min={mortgageBlock.minAmount ?? DEFAULT_MIN_AMOUNT}
                              max={mortgageBlock.maxAmount ?? DEFAULT_MAX_AMOUNT}
                              step={DEFAULT_STEP_AMOUNT}
                              unit="₪"
                              onChange={() => {}}
                              disabled
                            />
                          </div>
                          <div className="refund_period">
                            <h3>תקופת החזר</h3>
                            <CustomRangeInput
                              value={mortgageBlock.years ?? DEFAULT_MIN_TERM}
                              min={mortgageBlock.minYears ?? DEFAULT_MIN_TERM}
                              max={mortgageBlock.maxYears ?? DEFAULT_MAX_TERM}
                              step={DEFAULT_STEP_TERM}
                              unit="שנים"
                              onChange={() => {}}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="monthly_repayment">
                          החזר חודשי: <span>₪{formatNumber(calculateMonthlyPayment(mortgageBlock.amount, mortgageBlock.years))}</span>
                        </div>
                      </div>
                    )}
                    {shouldRenderButtonsForMessage && (
                      <div className={`btn_box d_flex d_flex_jb ${getIsFullWidthButtons(buttonOptionsForMessage) ? 'btn_box_full' : ''}`}>
                        {buttonOptionsForMessage.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleButtonOptionClick(message.blockKey, option)}
                            disabled={isSending || !isActiveBlock || blockState.answeredToken === activeBlockToken}
                            className={blockState.selectedId === option.id ? 'active' : ''}
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
                  <div className="signature_group">
                    <div className="signature_label">חתימת הלווה הראשי</div>
                    <div className="signature signature_pad">
                      {!signatureReady && <span>נא לחתום כאן</span>}
                      <canvas
                        ref={signatureCanvasRef}
                        className="signature_canvas"
                        onPointerDown={handlePrimaryPointerDown}
                        onPointerMove={handlePrimaryPointerMove}
                        onPointerUp={handlePrimaryPointerUp}
                        onPointerLeave={handlePrimaryPointerUp}
                      />
                    </div>
                  </div>
                  {needsCoBorrowerSignature && (
                    <div className="signature_group">
                      <div className="signature_label">חתימת לווה נוסף</div>
                      <div className="signature signature_pad">
                        {!coSignatureReady && <span>נא לחתום כאן</span>}
                        <canvas
                          ref={coSignatureCanvasRef}
                          className="signature_canvas"
                          onPointerDown={handleCoPointerDown}
                          onPointerMove={handleCoPointerMove}
                          onPointerUp={handleCoPointerUp}
                          onPointerLeave={handleCoPointerUp}
                        />
                      </div>
                    </div>
                  )}
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
                      disabled={
                        signatureSaving
                        || (needsCoBorrowerSignature
                          ? (signatureSaved && coSignatureSaved) || !signatureReady || !coSignatureReady
                          : signatureSaved || !signatureReady)
                      }
                    >
                      {signatureSaving
                        ? 'שומר...'
                        : needsCoBorrowerSignature
                          ? (signatureSaved && coSignatureSaved ? 'החתימות נשמרו' : 'אישור')
                          : (signatureSaved ? 'החתימה נשמרה' : 'אישור')}
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
              <div className="form_input" onClick={isDateInput ? handleDateInputWrapperClick : undefined}>
                <input
                  type={isDateInput ? 'date' : 'text'}
                  className="in"
                  placeholder={inputOption?.label || 'נא להקליד כאן...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                  ref={isDateInput ? dateInputRef : undefined}
                  onClick={isDateInput ? handleDateInputActivate : undefined}
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
