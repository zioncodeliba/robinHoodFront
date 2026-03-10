// AIChatpage.jsx
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import CustomRangeInput from '../components/simulatorcomponents/CustomRangeInput';
import '../components/simulatorcomponents/Simulatorpage.css';
import bouticon from '../assets/images/bout.png';
import aichatFigure from '../assets/images/aichat_figure.png';
import removeIcon from '../assets/images/remove.png';
import viewicon from '../assets/images/pdf_view.svg';
import sendicon from '../assets/images/send.svg';
import whatsappFabIcon from '../assets/images/aichat_whatsapp.png';
import aichatSignPen from '../assets/images/aichat_signpen.png';
import { getGatewayBase } from "../utils/apiBase";
import { getAuthToken } from "../utils/authStorage";
import { WHATSAPP_SUPPORT_LINK } from '../utils/whatsappSupport';

const DEFAULT_MIN_AMOUNT = 100000;
const DEFAULT_MAX_AMOUNT = 1500000;
const DEFAULT_STEP_AMOUNT = 10000;
const DEFAULT_MIN_TERM = 5;
const DEFAULT_MAX_TERM = 30;
const DEFAULT_STEP_TERM = 1;
const BOT_TYPING_DELAY_MS = 3000;
const DATA_GOV_CKAN_BASE = 'https://data.gov.il/api/3/action/datastore_search';
const DATA_GOV_CITIES_RESOURCE_ID = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';
const DATA_GOV_STREETS_RESOURCE_ID = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
const CITY_FETCH_PAGE_SIZE = 1000;
const STREET_FETCH_PAGE_SIZE = 1000;
const FALLBACK_COUNTRIES = [
  'ישראל',
  'ארצות הברית',
  'בריטניה',
  'צרפת',
  'גרמניה',
  'איטליה',
  'ספרד',
  'רוסיה',
  'אוקראינה',
  'קנדה',
  'אוסטרליה',
  'הודו',
  'סין',
  'יפן',
  'ברזיל',
  'ארגנטינה',
  'דרום אפריקה',
  'טורקיה',
  'יוון',
  'קפריסין',
];
const BANK_LOGO_BY_KEY = {
  poalim: '/banks/hapoalim.png',
  leumi: '/banks/leumi.png',
  mizrahi: '/banks/mizrahi.png',
  discont: '/banks/discount.png',
  international: '/banks/international.png',
  mercantil: '/banks/mercantile.png',
};

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
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [error, setError] = useState('');
  const [hasHistory, setHasHistory] = useState(false);
  const [pinnedBlockKey, setPinnedBlockKey] = useState(null);
  const [buttonBlocks, setButtonBlocks] = useState({});
  const [buttonAnswersByMessageId, setButtonAnswersByMessageId] = useState({});
  const [mortgageBlocks, setMortgageBlocks] = useState({});
  const [activeBlockToken, setActiveBlockToken] = useState(0);
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [requiredSignatureCount, setRequiredSignatureCount] = useState(1);
  const [signatureReadyByIndex, setSignatureReadyByIndex] = useState({ 0: false });
  const [signatureSavedByIndex, setSignatureSavedByIndex] = useState({ 0: false });
  const [isSignatureDocsOpen, setIsSignatureDocsOpen] = useState(false);
  const [signatureTemplates, setSignatureTemplates] = useState([]);
  const [signatureTemplatesLoading, setSignatureTemplatesLoading] = useState(false);
  const [signatureTemplatesError, setSignatureTemplatesError] = useState('');
  const [signatureTemplateDownloadingKey, setSignatureTemplateDownloadingKey] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [selectedResidenceCity, setSelectedResidenceCity] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [citySuggestionsLoading, setCitySuggestionsLoading] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [streetSuggestionsLoading, setStreetSuggestionsLoading] = useState(false);

  const authToken = useMemo(() => getAuthToken(), []);
  const signatureCanvasRefs = useRef([]);
  const signatureCtxRefs = useRef([]);
  const signatureDrawingRefs = useRef([]);
  const hasHistoryRef = useRef(false);
  const historyAnswerByBlockRef = useRef(new Map());
  const mortgageBlocksRef = useRef({});
  const chatInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const countryInputWrapperRef = useRef(null);
  const liveMessageCounterRef = useRef(0);
  const botTypingTokenRef = useRef(0);
  const optionsCacheRef = useRef(new Map());
  const optionsInFlightRef = useRef(new Map());
  const sessionInitRef = useRef(false);
  const signatureTemplatesLoadedRef = useRef(false);
  const citySuggestionsCacheRef = useRef(new Map());
  const allCitiesRef = useRef([]);
  const allCitiesInFlightRef = useRef(null);
  const streetSuggestionsCacheRef = useRef(new Map());
  const allStreetsByCityRef = useRef(new Map());
  const allStreetsInFlightRef = useRef(new Map());

  useEffect(() => {
    mortgageBlocksRef.current = mortgageBlocks;
  }, [mortgageBlocks]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const createLiveMessageId = (prefix, blockKey = '') => {
    liveMessageCounterRef.current += 1;
    return `${prefix}-${blockKey || 'message'}-${Date.now()}-${liveMessageCounterRef.current}`;
  };

  const upsertButtonAnswerForMessage = (messageId, updates) => {
    if (!messageId) return;
    setButtonAnswersByMessageId((prev) => {
      const existing = prev[messageId] || {};
      return {
        ...prev,
        [messageId]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

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

  const requestAuthJson = async (path, init = {}) => {
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
    const response = await fetch(`${apiBase}/auth/v1${path}`, { ...init, headers });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.detail || data?.message || 'שגיאה בשליפת המסמכים';
      throw new Error(message);
    }
    return data;
  };

  const fetchBlockOptions = async (blockKey) => {
    if (!blockKey) return [];
    const cached = optionsCacheRef.current.get(blockKey);
    if (cached) return cached;
    const inFlight = optionsInFlightRef.current.get(blockKey);
    if (inFlight) return inFlight;

    const promise = request(`/blocks/${blockKey}/options`)
      .then((blockOptions) => {
        optionsCacheRef.current.set(blockKey, blockOptions);
        optionsInFlightRef.current.delete(blockKey);
        return blockOptions;
      })
      .catch((err) => {
        optionsInFlightRef.current.delete(blockKey);
        throw err;
      });

    optionsInFlightRef.current.set(blockKey, promise);
    return promise;
  };

  const getActiveSessionId = async () => {
    const sessions = await request('/sessions/by-user');
    const activeSession = sessions.find((s) => s.is_active);
    return activeSession?.id || null;
  };

  const appendBotMessage = (block) => {
    setMessages((prev) => {
      return [
        ...prev,
        {
          id: createLiveMessageId('block', block.block_key),
          role: 'bot',
          text: block.message,
          blockKey: block.block_key,
          timestamp: new Date().toISOString(),
        },
      ];
    });
  };

  const startBotTypingIndicator = () => {
    const nextToken = botTypingTokenRef.current + 1;
    botTypingTokenRef.current = nextToken;
    setIsBotTyping(true);
    return nextToken;
  };

  const stopBotTypingIndicator = (token = null) => {
    if (token !== null && botTypingTokenRef.current !== token) return;
    botTypingTokenRef.current += 1;
    setIsBotTyping(false);
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
      const existing = prev[blockKey] || {
        options: [],
        selectedId: null,
        selectedToken: null,
        answered: false,
        answeredToken: null,
      };
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

  const normalizeHistoryItems = (history) => {
    if (!Array.isArray(history)) return [];
    return history
      .filter((item) => item?.is_active !== false)
      .sort((left, right) => new Date(left?.timestamp || 0) - new Date(right?.timestamp || 0));
  };

  const fetchActiveHistory = async (sessionIdValue) => {
    const history = await request(`/sessions/${sessionIdValue}/history-for-chat`);
    return normalizeHistoryItems(history);
  };

  const countCoBorrowerYesAnswers = (historyItems) => {
    let coBorrowerYesCount = 0;
    historyItems.forEach((item) => {
      const answerText = item?.user_input || item?.option_label;
      if (!answerText) return;
      if (!isCoBorrowerQuestionText(item?.block_message)) return;
      if (String(answerText).includes('כן')) {
        coBorrowerYesCount += 1;
      }
    });
    return coBorrowerYesCount;
  };

  const normalizeLocationText = (value) => String(value || '')
    .replace(/\\n/g, ' ')
    .replace(/[״"'`.,!?;:()/_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizeLocationLookup = (value) => normalizeLocationText(value).toLowerCase();
  const normalizeCityCode = (value) => {
    const normalized = String(value ?? '').trim();
    if (!normalized) return '';
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? String(numeric) : normalized;
  };

  const isResidenceCityQuestionText = (text) => {
    const normalized = normalizeLocationLookup(text);
    return normalized.includes('עיר') && normalized.includes('מגורים');
  };

  const isResidenceAddressQuestionText = (text) => {
    const normalized = normalizeLocationLookup(text);
    if (!normalized.includes('כתובת')) return false;
    const isEmailAddressQuestion =
      normalized.includes('מייל') ||
      normalized.includes('אימייל') ||
      normalized.includes('email') ||
      normalized.includes('דוא') ||
      normalized.includes('@');
    return !isEmailAddressQuestion;
  };

  const mapCityRecord = (record) => {
    const code = normalizeCityCode(record?.['סמל_ישוב']);
    const name = String(record?.['שם_ישוב'] ?? '').trim();
    if (!code || code === '0' || !name) return null;
    if (normalizeLocationLookup(name) === normalizeLocationLookup('לא רשום')) return null;
    return { code, name };
  };

  const mapStreetRecord = (record) => {
    const cityCode = normalizeCityCode(record?.['סמל_ישוב']);
    const streetCode = String(record?.['סמל_רחוב'] ?? '').trim();
    const name = String(record?.['שם_רחוב'] ?? '').trim();
    if (!cityCode || cityCode === '0' || !streetCode || !name) return null;
    return { cityCode, streetCode, name };
  };

  const fetchDataGovRecords = async ({ resourceId, limit, offset = 0, query = '', filters = null }) => {
    const url = new URL(DATA_GOV_CKAN_BASE);
    url.searchParams.set('resource_id', resourceId);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(Math.max(0, Number(offset) || 0)));
    if (query) {
      url.searchParams.set('q', query);
    }
    if (filters) {
      url.searchParams.set('filters', JSON.stringify(filters));
    }
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('שגיאה בטעינת נתוני כתובות');
    }
    const payload = await response.json().catch(() => null);
    if (!payload?.success) {
      throw new Error('שגיאה בטעינת נתוני כתובות');
    }
    return Array.isArray(payload?.result?.records) ? payload.result.records : [];
  };

  const fetchAllCitiesFromApi = async () => {
    if (allCitiesRef.current.length > 0) {
      return allCitiesRef.current;
    }
    if (allCitiesInFlightRef.current) {
      return allCitiesInFlightRef.current;
    }

    const promise = (async () => {
      const seen = new Set();
      const allCities = [];
      let offset = 0;
      let pageCount = 0;

      while (pageCount < 100) {
        const records = await fetchDataGovRecords({
          resourceId: DATA_GOV_CITIES_RESOURCE_ID,
          limit: CITY_FETCH_PAGE_SIZE,
          offset,
        });

        if (records.length === 0) {
          break;
        }

        records.forEach((record) => {
          const parsed = mapCityRecord(record);
          if (!parsed) return;
          if (seen.has(parsed.code)) return;
          seen.add(parsed.code);
          allCities.push(parsed);
        });

        if (records.length < CITY_FETCH_PAGE_SIZE) {
          break;
        }

        offset += CITY_FETCH_PAGE_SIZE;
        pageCount += 1;
      }

      allCities.sort((left, right) => left.name.localeCompare(right.name, 'he'));
      allCitiesRef.current = allCities;
      citySuggestionsCacheRef.current.clear();
      return allCities;
    })();

    allCitiesInFlightRef.current = promise;
    try {
      return await promise;
    } finally {
      allCitiesInFlightRef.current = null;
    }
  };

  const fetchCitySuggestionsFromApi = async (query = '') => {
    const normalizedQuery = normalizeLocationLookup(query);
    const cacheKey = normalizedQuery;
    const cached = citySuggestionsCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const allCities = await fetchAllCitiesFromApi();
    if (!normalizedQuery) {
      citySuggestionsCacheRef.current.set(cacheKey, allCities);
      return allCities;
    }

    const suggestions = allCities.filter((city) =>
      normalizeLocationLookup(city.name).includes(normalizedQuery),
    );
    citySuggestionsCacheRef.current.set(cacheKey, suggestions);
    return suggestions;
  };

  const fetchStreetSuggestionsFromApi = async (cityCode, query = '') => {
    const normalizedCityCode = normalizeCityCode(cityCode);
    if (!normalizedCityCode) return [];

    const normalizedQuery = normalizeLocationLookup(query);
    const cacheKey = `${normalizedCityCode}::${normalizedQuery}`;
    const cached = streetSuggestionsCacheRef.current.get(cacheKey);
    if (cached) return cached;

    const fetchAllStreetsForCityFromApi = async (selectedCityCode) => {
      if (allStreetsByCityRef.current.has(selectedCityCode)) {
        return allStreetsByCityRef.current.get(selectedCityCode) || [];
      }
      if (allStreetsInFlightRef.current.has(selectedCityCode)) {
        return allStreetsInFlightRef.current.get(selectedCityCode);
      }

      const promise = (async () => {
        const seen = new Set();
        const streets = [];
        let offset = 0;
        let pageCount = 0;

        while (pageCount < 400) {
          const records = await fetchDataGovRecords({
            resourceId: DATA_GOV_STREETS_RESOURCE_ID,
            limit: STREET_FETCH_PAGE_SIZE,
            offset,
            filters: { סמל_ישוב: Number(selectedCityCode) },
          });

          if (records.length === 0) {
            break;
          }

          records.forEach((record) => {
            const parsed = mapStreetRecord(record);
            if (!parsed || parsed.cityCode !== selectedCityCode) return;
            if (seen.has(parsed.streetCode)) return;
            seen.add(parsed.streetCode);
            streets.push(parsed);
          });

          if (records.length < STREET_FETCH_PAGE_SIZE) {
            break;
          }

          offset += STREET_FETCH_PAGE_SIZE;
          pageCount += 1;
        }

        streets.sort((left, right) => left.name.localeCompare(right.name, 'he'));
        allStreetsByCityRef.current.set(selectedCityCode, streets);
        return streets;
      })();

      allStreetsInFlightRef.current.set(selectedCityCode, promise);
      try {
        return await promise;
      } finally {
        allStreetsInFlightRef.current.delete(selectedCityCode);
      }
    };

    const allStreetsForCity = await fetchAllStreetsForCityFromApi(normalizedCityCode);
    if (!normalizedQuery) {
      streetSuggestionsCacheRef.current.set(cacheKey, allStreetsForCity);
      return allStreetsForCity;
    }

    const suggestions = allStreetsForCity.filter((street) =>
      normalizeLocationLookup(street.name).includes(normalizedQuery),
    );
    streetSuggestionsCacheRef.current.set(cacheKey, suggestions);
    return suggestions;
  };

  const resolveResidenceCityByName = async (cityName) => {
    const normalizedCityName = normalizeLocationLookup(cityName);
    if (!normalizedCityName) return null;
    const suggestions = await fetchCitySuggestionsFromApi(cityName);
    if (suggestions.length === 0) return null;
    const exactMatch = suggestions.find(
      (item) => normalizeLocationLookup(item.name) === normalizedCityName,
    );
    if (exactMatch) return exactMatch;
    if (suggestions.length === 1) return suggestions[0];
    const startsWithMatches = suggestions.filter((item) =>
      normalizeLocationLookup(item.name).startsWith(normalizedCityName),
    );
    if (startsWithMatches.length === 1) {
      return startsWithMatches[0];
    }
    return null;
  };

  const deriveLatestResidenceCityFromMessages = (messageList) => {
    if (!Array.isArray(messageList) || messageList.length === 0) return null;
    const botMessageByBlockKey = new Map();
    messageList.forEach((message) => {
      if (message.role === 'bot' && message.blockKey) {
        botMessageByBlockKey.set(message.blockKey, message.text);
      }
    });

    let latestCity = null;
    messageList.forEach((message) => {
      if (message.role !== 'user' || !message.blockKey) return;
      const botText = botMessageByBlockKey.get(message.blockKey);
      if (!isResidenceCityQuestionText(botText)) return;
      const cityName = String(message.text || '').trim();
      if (!cityName) return;
      latestCity = cityName;
    });
    return latestCity;
  };

  const rollbackToMessageBlock = async ({
    blockKey,
    messageHistoryId = null,
    messageIndex = null,
    reloadSession = false,
  }) => {
    if (!sessionId) {
      throw new Error('לא נמצאה שיחה פעילה');
    }
    if (!blockKey) {
      throw new Error('לא נמצאה שאלה לעריכה');
    }

    const activeHistory = await fetchActiveHistory(sessionId);
    const rollbackCandidates = activeHistory.filter((item) => item.block_key === blockKey);
    const rollbackTarget = messageHistoryId
      ? rollbackCandidates.find((item) => item.id === messageHistoryId)
      : rollbackCandidates[rollbackCandidates.length - 1];

    if (!rollbackTarget) {
      throw new Error('לא נמצאה נקודת חזרה עבור השאלה');
    }

    await request(`/sessions/${sessionId}/rollback`, {
      method: 'PATCH',
      body: JSON.stringify({ history_id: rollbackTarget.id }),
    });

    if (!reloadSession && Number.isInteger(messageIndex) && messageIndex >= 0) {
      const trimmedMessages = messages.slice(0, messageIndex + 1);
      const keptMessageIds = new Set(trimmedMessages.map((message) => message.id));
      const keptBlockKeys = new Set(
        trimmedMessages
          .filter((message) => message.role === 'bot' && message.blockKey)
          .map((message) => message.blockKey),
      );
      setMessages(trimmedMessages);
      setButtonAnswersByMessageId((prev) => Object.fromEntries(
        Object.entries(prev).filter(([entryMessageId]) => keptMessageIds.has(entryMessageId)),
      ));
      setMortgageBlocks((prev) => Object.fromEntries(
        Object.entries(prev).filter(([entryBlockKey]) => keptBlockKeys.has(entryBlockKey)),
      ));
      const latestResidenceCity = deriveLatestResidenceCityFromMessages(trimmedMessages);
      setSelectedResidenceCity(latestResidenceCity ? { code: null, name: latestResidenceCity } : null);
    }

    const recalculatedHistory = await fetchActiveHistory(sessionId);
    setRequiredSignatureCount(Math.max(1, 1 + countCoBorrowerYesAnswers(recalculatedHistory)));

    if (reloadSession) {
      await loadSession();
    }

    return rollbackTarget;
  };

  const loadHistory = async (sessionIdValue) => {
    const history = await fetchActiveHistory(sessionIdValue);
    const historyMessages = [];
    const historyButtonAnswers = {};
    let firstBlockKey = null;
    let latestResidenceCityFromHistory = null;
    const historyAnswers = new Map();
    const historyMortgageBlocks = new Map();
    const coBorrowerYesCount = countCoBorrowerYesAnswers(history);
    history.forEach((item) => {
      let botMessageId = null;
      if (item.block_message) {
        if (!firstBlockKey) {
          firstBlockKey = item.block_key;
        }
        botMessageId = `history-${item.id}-bot`;
        historyMessages.push({
          id: botMessageId,
          role: 'bot',
          text: item.block_message,
          blockKey: item.block_key,
          timestamp: item.timestamp,
          historyId: item.id,
          preventRollback: item?.prevent_rollback === true,
        });
      }
      const answerText = item.user_input || item.option_label;
      if (answerText) {
        if (isResidenceCityQuestionText(item.block_message)) {
          const normalizedCityName = String(answerText || '').trim();
          if (normalizedCityName) {
            latestResidenceCityFromHistory = normalizedCityName;
          }
        }
        if (botMessageId) {
          historyButtonAnswers[botMessageId] = {
            selectedId: item.option_id ?? item.selected_option_id ?? null,
            selectedLabel: item.option_label || item.user_input || '',
            answered: true,
          };
        }
        if (item.block_key) {
          const optionId = item.option_id ?? item.selected_option_id ?? null;
          const hasOptionAnswer = optionId !== null && optionId !== undefined
            ? true
            : Boolean(item.option_label);
          if (hasOptionAnswer) {
            historyAnswers.set(item.block_key, true);
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
          historyId: item.id,
          preventRollback: item?.prevent_rollback === true,
        });
      }
    });
    setMessages(historyMessages);
    setButtonAnswersByMessageId(historyButtonAnswers);
    const hasItems = historyMessages.length > 0;
    hasHistoryRef.current = hasItems;
    setHasHistory(hasItems);
    historyAnswerByBlockRef.current = historyAnswers;
    setSelectedResidenceCity(
      latestResidenceCityFromHistory ? { code: null, name: latestResidenceCityFromHistory } : null,
    );
    setRequiredSignatureCount(Math.max(1, 1 + coBorrowerYesCount));
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
    const blockKeys = Array.from(historyAnswerByBlockRef.current.keys());
    if (blockKeys.length === 0) return;

    const results = await Promise.all(blockKeys.map(async (blockKey) => {
      try {
        const blockOptions = await fetchBlockOptions(blockKey);
        return { blockKey, options: blockOptions };
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
        const existing = next[result.blockKey] || {
          options: [],
          selectedId: null,
          selectedToken: null,
          answered: false,
          answeredToken: null,
        };
        next[result.blockKey] = {
          ...existing,
          options: result.options,
        };
      });
      return next;
    });
  };

  const loadBlock = async (sessionIdValue, blockKey) => {
    const [block, blockOptions] = await Promise.all([
      request(`/blocks/by-key/${blockKey}?session_id=${sessionIdValue}`),
      fetchBlockOptions(blockKey),
    ]);
    setCurrentBlock(block);
    setOptions(blockOptions);
    appendBotMessage(block);
    if (!pinnedBlockKey && !hasHistoryRef.current) {
      setPinnedBlockKey(block.block_key);
    }
    const hasButtons = blockOptions.some((option) => option.option_type === 'button');
    if (hasButtons) {
      upsertButtonBlock(block.block_key, {
        options: blockOptions,
        answeredToken: null,
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
    stopBotTypingIndicator();
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
    if (sessionInitRef.current) {
      return;
    }
    sessionInitRef.current = true;
    loadSession();
  }, [authToken]);

  useEffect(() => () => {
    stopBotTypingIndicator();
  }, []);

  useEffect(() => {
    if (!currentBlock?.block_key) return;
    setActiveBlockToken((prev) => prev + 1);
  }, [currentBlock?.block_key]);

  useEffect(() => {
    if (!isSignatureDocsOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSignatureDocsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSignatureDocsOpen]);

  const inputOption = options.find((option) => option.option_type !== 'button');
  const buttonOptions = options.filter((option) => option.option_type === 'button');
  const isMortgageParameters = currentBlock?.type === 'mortgage_parameters';
  const isDateInput = inputOption?.option_type === 'date';
  const isContractorNameInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type === 'attach') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    const normalized = `${label} ${message}`
      .toLowerCase()
      .replace(/["'״׳.\-_/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!normalized) return false;
    const hasContractorKeyword =
      normalized.includes('קבלן') ||
      normalized.includes('יזם') ||
      normalized.includes('חברת בניה') ||
      normalized.includes('חברת בנייה');
    const hasNameIntent =
      normalized.includes('שם') ||
      normalized.includes('נא לציין') ||
      normalized.includes('הקלד') ||
      normalized.includes('כתבו');
    return hasContractorKeyword && hasNameIntent;
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isPriceAmountInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type !== 'input') {
      return false;
    }
    if (isContractorNameInput) {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    const combinedText = `${label} ${message}`.toLowerCase();
    const amountKeywords = ['מחיר', 'שווי', 'סכום', 'עלות', 'הכנסה', 'הכנסות', 'שכר', 'יתרה'];
    return amountKeywords.some((keyword) => combinedText.includes(keyword));
  }, [inputOption, isDateInput, isContractorNameInput, currentBlock?.message]);
  const isIdentityNumberInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type !== 'input') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    const normalized = `${label} ${message}`.toLowerCase().replace(/["'״׳.\-_/\\]/g, '');
    return normalized.includes('תז') || normalized.includes('תעודת זהות');
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isPhoneNumberInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type !== 'input') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    const normalized = `${label} ${message}`.toLowerCase().replace(/["'״׳.\-_/\\]/g, '');
    return normalized.includes('טלפון') || normalized.includes('פלאפון') || normalized.includes('נייד');
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isCountrySelectionInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type !== 'scroll') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    const normalized = `${label} ${message}`.toLowerCase();
    return normalized.includes('ארץ') || normalized.includes('מדינה');
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isResidenceCityInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type === 'attach') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    return isResidenceCityQuestionText(`${label} ${message}`);
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isResidenceAddressInput = useMemo(() => {
    if (!inputOption || isDateInput || inputOption.option_type === 'attach') {
      return false;
    }
    const label = String(inputOption?.label || '').replace(/\s+/g, ' ').trim();
    const message = String(currentBlock?.message || '').replace(/\s+/g, ' ').trim();
    return isResidenceAddressQuestionText(`${label} ${message}`);
  }, [inputOption, isDateInput, currentBlock?.message]);
  const isApiDropdownSelectionInput =
    isCountrySelectionInput || isResidenceCityInput || isResidenceAddressInput;
  const countryOptions = useMemo(() => {
    try {
      if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
        return FALLBACK_COUNTRIES;
      }
      const displayNames = new Intl.DisplayNames(['he', 'en'], { type: 'region' });
      const regionCodes = typeof Intl.supportedValuesOf === 'function'
        ? Intl.supportedValuesOf('region')
        : [];
      const resolved = regionCodes
        .map((code) => displayNames.of(code))
        .filter((name) => typeof name === 'string')
        .map((name) => name.trim())
        .filter(Boolean);
      const unique = Array.from(new Set([...FALLBACK_COUNTRIES, ...resolved]));
      unique.sort((a, b) => a.localeCompare(b, 'he'));
      const israelIndex = unique.indexOf('ישראל');
      if (israelIndex > 0) {
        unique.splice(israelIndex, 1);
        unique.unshift('ישראל');
      } else if (israelIndex === -1) {
        unique.unshift('ישראל');
      }
      return unique;
    } catch {
      return FALLBACK_COUNTRIES;
    }
  }, []);
  const filteredCountryOptions = useMemo(() => {
    if (!isCountrySelectionInput) {
      return [];
    }
    const normalizedQuery = String(inputValue || '').trim().toLowerCase();
    if (!normalizedQuery) {
      return countryOptions;
    }
    return countryOptions.filter((country) => country.toLowerCase().includes(normalizedQuery));
  }, [isCountrySelectionInput, countryOptions, inputValue]);

  useEffect(() => {
    if (!isResidenceCityInput) {
      setCitySuggestions([]);
      setCitySuggestionsLoading(false);
      return undefined;
    }

    let isCancelled = false;
    const timer = window.setTimeout(async () => {
      setCitySuggestionsLoading(true);
      try {
        const nextSuggestions = await fetchCitySuggestionsFromApi(inputValue);
        if (!isCancelled) {
          setCitySuggestions(nextSuggestions);
        }
      } catch {
        if (!isCancelled) {
          setCitySuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setCitySuggestionsLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [isResidenceCityInput, inputValue]);

  useEffect(() => {
    if (!isResidenceAddressInput) return undefined;
    if (!selectedResidenceCity?.name || selectedResidenceCity?.code) return undefined;

    let isCancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const resolved = await resolveResidenceCityByName(selectedResidenceCity.name);
        if (!isCancelled && resolved) {
          setSelectedResidenceCity(resolved);
        }
      } catch {
        // Ignore resolution failures and keep free-text city fallback.
      }
    }, 120);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [isResidenceAddressInput, selectedResidenceCity?.name, selectedResidenceCity?.code]);

  useEffect(() => {
    if (!isResidenceAddressInput) {
      setStreetSuggestions([]);
      setStreetSuggestionsLoading(false);
      return undefined;
    }
    if (!selectedResidenceCity?.code) {
      setStreetSuggestions([]);
      setStreetSuggestionsLoading(false);
      return undefined;
    }

    let isCancelled = false;
    const timer = window.setTimeout(async () => {
      setStreetSuggestionsLoading(true);
      try {
        const nextSuggestions = await fetchStreetSuggestionsFromApi(selectedResidenceCity.code, inputValue);
        if (!isCancelled) {
          setStreetSuggestions(nextSuggestions);
        }
      } catch {
        if (!isCancelled) {
          setStreetSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setStreetSuggestionsLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [isResidenceAddressInput, selectedResidenceCity?.code, inputValue]);

  const dropdownOptions = useMemo(() => {
    if (isCountrySelectionInput) {
      return filteredCountryOptions.map((country) => ({
        key: `country-${country}`,
        value: country,
        label: country,
      }));
    }
    if (isResidenceCityInput) {
      return citySuggestions.map((city) => ({
        key: `city-${city.code}`,
        value: city.name,
        label: city.name,
        city,
      }));
    }
    if (isResidenceAddressInput) {
      return streetSuggestions.map((street) => ({
        key: `street-${street.cityCode}-${street.streetCode}`,
        value: street.name,
        label: street.name,
      }));
    }
    return [];
  }, [
    isCountrySelectionInput,
    filteredCountryOptions,
    isResidenceCityInput,
    citySuggestions,
    isResidenceAddressInput,
    streetSuggestions,
  ]);

  const isDropdownLoading = isResidenceCityInput
    ? citySuggestionsLoading
    : isResidenceAddressInput
      ? streetSuggestionsLoading
      : false;

  useLayoutEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;
    const paddingTop = 24;
    let rafId = null;

    const applyScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      container.scrollTop = Math.max(0, maxScroll);
    };

    rafId = window.requestAnimationFrame(applyScroll);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [messages, isLoading, isBotTyping, isMortgageParameters, currentBlock?.block_key]);

  const signatureBlockId = 52;
  const shouldShowSignature = currentBlock?.id === signatureBlockId;
  const signatureIndexes = useMemo(
    () => Array.from({ length: Math.max(requiredSignatureCount, 1) }, (_, signatureIndex) => signatureIndex),
    [requiredSignatureCount],
  );
  const areAllSignaturesReady = useMemo(
    () => signatureIndexes.every((signatureIndex) => Boolean(signatureReadyByIndex[signatureIndex])),
    [signatureIndexes, signatureReadyByIndex],
  );
  const areAllSignaturesSaved = useMemo(
    () => signatureIndexes.every((signatureIndex) => Boolean(signatureSavedByIndex[signatureIndex])),
    [signatureIndexes, signatureSavedByIndex],
  );

  useEffect(() => {
    const maxCount = Math.max(requiredSignatureCount, 1);
    signatureCanvasRefs.current = signatureCanvasRefs.current.slice(0, maxCount);
    signatureCtxRefs.current = signatureCtxRefs.current.slice(0, maxCount);
    signatureDrawingRefs.current = signatureDrawingRefs.current.slice(0, maxCount);
  }, [requiredSignatureCount]);

  useEffect(() => {
    if (!shouldShowSignature) return;
    const initCanvas = (signatureIndex) => {
      const canvas = signatureCanvasRefs.current[signatureIndex];
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#1d4ed8';
      signatureCtxRefs.current[signatureIndex] = ctx;
    };

    const handleResize = () => {
      signatureIndexes.forEach((signatureIndex) => initCanvas(signatureIndex));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldShowSignature, signatureIndexes]);

  useEffect(() => {
    if (!shouldShowSignature) return;
    const defaultState = {};
    signatureIndexes.forEach((signatureIndex) => {
      defaultState[signatureIndex] = false;
    });
    setSignatureReadyByIndex(defaultState);
    setSignatureSavedByIndex(defaultState);
  }, [shouldShowSignature, signatureIndexes]);

  const signatureConfirmOption = useMemo(
    () => (shouldShowSignature ? buttonOptions.find((option) => option.label === 'מאשר') ?? null : null),
    [buttonOptions, shouldShowSignature],
  );
  const visibleButtonOptions = useMemo(
    () => (shouldShowSignature ? buttonOptions.filter((option) => option !== signatureConfirmOption) : buttonOptions),
    [buttonOptions, shouldShowSignature, signatureConfirmOption],
  );

  const toDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultDateValue = () => {
    if (currentBlock?.id === 40) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return toDateInputValue(oneYearAgo);
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

  useEffect(() => {
    if (!isCountrySelectionInput) return;
    setInputValue((prev) => {
      if (prev) return prev;
      return 'ישראל';
    });
  }, [isCountrySelectionInput, currentBlock?.id]);

  useEffect(() => {
    if (isApiDropdownSelectionInput) return;
    setIsCountryDropdownOpen(false);
  }, [isApiDropdownSelectionInput, currentBlock?.id]);

  useEffect(() => {
    if (!isCountryDropdownOpen) return undefined;
    const handleOutsidePointer = (event) => {
      const wrapper = countryInputWrapperRef.current;
      if (wrapper && !wrapper.contains(event.target)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsidePointer);
    document.addEventListener('touchstart', handleOutsidePointer);
    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer);
      document.removeEventListener('touchstart', handleOutsidePointer);
    };
  }, [isCountryDropdownOpen]);

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

  const hasChoiceOptions = visibleButtonOptions.length > 0;
  const hasTypedInputOption = useMemo(() => {
    if (!inputOption) return false;
    const optionType = String(inputOption.option_type || '').toLowerCase();
    return optionType === 'input' || optionType === 'scroll' || optionType === 'date' || optionType === 'text';
  }, [inputOption]);
  const canTypeAlongsideChoiceOptions = hasChoiceOptions && hasTypedInputOption;
  const isInputModeAvailable =
    Boolean(inputOption) &&
    (!hasChoiceOptions || canTypeAlongsideChoiceOptions) &&
    !isMortgageParameters &&
    !shouldShowSignature &&
    !currentBlock?.is_terminal;
  const isSendAreaDisabled = isLoading || isSending || isRollingBack || !isInputModeAvailable;
  const inputPlaceholder = useMemo(() => {
    if (isLoading) return 'טוען שיחה...';
    if (currentBlock?.is_terminal) return 'השיחה הסתיימה';
    if (isMortgageParameters) return 'יש לבחור פרטי משכנתא למעלה';
    if (shouldShowSignature) return 'יש להשלים חתימה כדי להמשיך';
    if (hasChoiceOptions && !canTypeAlongsideChoiceOptions) return 'יש לבחור אחת מהאפשרויות למעלה';
    if (canTypeAlongsideChoiceOptions) return inputOption?.label || 'אפשר לבחור אפשרות או להקליד כאן...';
    if (isResidenceAddressInput && !selectedResidenceCity?.name) return 'יש לבחור עיר מגורים קודם';
    if (!inputOption) return 'אין שדה קלט בשלב זה';
    return inputOption?.label || 'נא להקליד כאן...';
  }, [
    isLoading,
    currentBlock?.is_terminal,
    isMortgageParameters,
    shouldShowSignature,
    hasChoiceOptions,
    canTypeAlongsideChoiceOptions,
    isResidenceAddressInput,
    selectedResidenceCity?.name,
    inputOption,
  ]);

  const handleInputWrapperClick = () => {
    if (isSendAreaDisabled) return;
    if (isDateInput) {
      handleDateInputWrapperClick();
      return;
    }
    if (isApiDropdownSelectionInput) {
      setIsCountryDropdownOpen(true);
    }
  };

  const handleInputFocus = () => {
    if (isSendAreaDisabled) return;
    if (isApiDropdownSelectionInput) {
      setIsCountryDropdownOpen(true);
    }
  };

  const handleDropdownSelect = (option, event) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    if (!option) return;
    setInputValue(option.value || option.label || '');
    if (isResidenceCityInput) {
      const selectedCity = option.city || null;
      setSelectedResidenceCity(selectedCity);
      setStreetSuggestions([]);
      streetSuggestionsCacheRef.current.clear();
    }
    setIsCountryDropdownOpen(false);
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat('he-IL').format(Number.isFinite(value) ? value : 0);
  const stripToDigits = (value) => String(value || '').replace(/[^\d]/g, '');
  const formatDigitsWithCommas = (value) => {
    const digits = stripToDigits(value).replace(/^0+(?=\d)/, '');
    if (!digits) return '';
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  const handleInputValueChange = (event) => {
    const nextValue = event.target.value;
    if (isPriceAmountInput) {
      const digitsOnly = stripToDigits(nextValue);
      setInputValue(formatDigitsWithCommas(digitsOnly));
      return;
    }
    if (isIdentityNumberInput || isPhoneNumberInput) {
      setInputValue(stripToDigits(nextValue));
      return;
    }
    if (isResidenceCityInput) {
      setSelectedResidenceCity({
        code: null,
        name: nextValue,
      });
      setStreetSuggestions([]);
    }
    setInputValue(nextValue);
  };

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

  const shouldUseSeparateRestartRowForQuestionText = (text) => {
    if (!text) return false;
    const normalized = text.replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
    return (
      (normalized.includes('מצב המשפחתי') && normalized.includes('נא לבחור את המצב המתאים')) ||
      normalized.includes('מה העבודה העיקרית')
    );
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
    if (isResidenceAddressInput && !selectedResidenceCity?.name) {
      setError('יש לבחור עיר מגורים לפני הזנת כתובת');
      return;
    }
    if (isResidenceCityInput) {
      const normalizedTypedCity = normalizeLocationLookup(trimmed);
      const normalizedSelectedCity = normalizeLocationLookup(selectedResidenceCity?.name || '');
      if (!selectedResidenceCity || normalizedTypedCity !== normalizedSelectedCity) {
        setSelectedResidenceCity({ code: null, name: trimmed });
      }
    }
    const isNumericTextInput = isPriceAmountInput || isIdentityNumberInput || isPhoneNumberInput;
    const digitsOnlyValue = isNumericTextInput ? stripToDigits(trimmed) : '';
    if (isNumericTextInput && !digitsOnlyValue) {
      setError('נא להזין מספר תקין');
      return;
    }
    const formattedValue = inputOption.option_type === 'date'
      ? formatDateToSlashes(trimmed)
      : isNumericTextInput
        ? digitsOnlyValue
        : trimmed;
    const displayValue = isPriceAmountInput
      ? formatDigitsWithCommas(digitsOnlyValue)
      : isIdentityNumberInput || isPhoneNumberInput
        ? digitsOnlyValue
        : formattedValue;
    await sendAnswer(inputOption, formattedValue, displayValue);
  };

  const sendAnswer = async (option, value, displayText, { appendUserMessage = true } = {}) => {
    if (!sessionId) return false;
    setIsSending(true);
    setError('');
    const typingToken = startBotTypingIndicator();
    const typingStartedAt = Date.now();
    if (appendUserMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: createLiveMessageId('user', currentBlock?.block_key),
          role: 'user',
          text: displayText || option.label,
          blockKey: currentBlock?.block_key,
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
      const waitForTypingIndicator = async () => {
        const elapsed = Date.now() - typingStartedAt;
        const remaining = BOT_TYPING_DELAY_MS - elapsed;
        if (remaining > 0) {
          await sleep(remaining);
        }
      };

      if (response.next_block_key) {
        await Promise.all([
          loadHistory(sessionId),
          waitForTypingIndicator(),
        ]);
      } else {
        await loadHistory(sessionId);
      }
      if (response.next_block_key) {
        await loadBlock(sessionId, response.next_block_key);
      }
      return true;
    } catch (err) {
      setError(err?.message || 'שגיאה בשליחת התשובה');
      return false;
    } finally {
      stopBotTypingIndicator(typingToken);
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

  const setSignatureReady = (signatureIndex, value) => {
    setSignatureReadyByIndex((prev) => {
      if (Boolean(prev[signatureIndex]) === value) {
        return prev;
      }
      return {
        ...prev,
        [signatureIndex]: value,
      };
    });
  };

  const setSignatureSaved = (signatureIndex, value) => {
    setSignatureSavedByIndex((prev) => {
      if (Boolean(prev[signatureIndex]) === value) {
        return prev;
      }
      return {
        ...prev,
        [signatureIndex]: value,
      };
    });
  };

  const handleSignaturePointerDown = (event, signatureIndex) => {
    const canvas = signatureCanvasRefs.current[signatureIndex];
    const ctx = signatureCtxRefs.current[signatureIndex];
    if (!canvas || !ctx) return;
    event.preventDefault();
    signatureDrawingRefs.current[signatureIndex] = true;
    setSignatureSaved(signatureIndex, false);
    canvas.setPointerCapture?.(event.pointerId);
    const { x, y } = getSignaturePoint(event, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSignaturePointerMove = (event, signatureIndex) => {
    const canvas = signatureCanvasRefs.current[signatureIndex];
    const ctx = signatureCtxRefs.current[signatureIndex];
    if (!signatureDrawingRefs.current[signatureIndex] || !canvas || !ctx) return;
    event.preventDefault();
    const { x, y } = getSignaturePoint(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureReady(signatureIndex, true);
  };

  const handleSignaturePointerUp = (event, signatureIndex) => {
    const canvas = signatureCanvasRefs.current[signatureIndex];
    const ctx = signatureCtxRefs.current[signatureIndex];
    if (!canvas || !ctx) return;
    event.preventDefault();
    signatureDrawingRefs.current[signatureIndex] = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };

  const clearSignaturePad = (signatureIndex) => {
    const canvas = signatureCanvasRefs.current[signatureIndex];
    const ctx = signatureCtxRefs.current[signatureIndex];
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    signatureDrawingRefs.current[signatureIndex] = false;
    setSignatureReady(signatureIndex, false);
    setSignatureSaved(signatureIndex, false);
    setError('');
  };

  const loadSignatureTemplates = async () => {
    if (signatureTemplatesLoadedRef.current || signatureTemplatesLoading) return;
    setSignatureTemplatesLoading(true);
    setSignatureTemplatesError('');
    try {
      const templates = await requestAuthJson('/bank-signature/templates');
      setSignatureTemplates(Array.isArray(templates) ? templates : []);
      signatureTemplatesLoadedRef.current = true;
    } catch (err) {
      setSignatureTemplatesError(err?.message || 'שגיאה בטעינת רשימת המסמכים');
    } finally {
      setSignatureTemplatesLoading(false);
    }
  };

  const handleOpenSignatureDocs = async () => {
    setIsSignatureDocsOpen(true);
    await loadSignatureTemplates();
  };

  const handleCloseSignatureDocs = () => {
    setIsSignatureDocsOpen(false);
  };

  const extractFilenameFromContentDisposition = (value, fallback) => {
    if (!value) return fallback;
    const utfMatch = value.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      try {
        return decodeURIComponent(utfMatch[1]);
      } catch {
        return utfMatch[1];
      }
    }
    const plainMatch = value.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) {
      return plainMatch[1];
    }
    return fallback;
  };

  const handleOpenSignatureTemplate = async (bankKey, templateType, fallbackName) => {
    if (!authToken || !bankKey || !templateType) return;
    const requestKey = `${bankKey}:${templateType}`;
    setSignatureTemplateDownloadingKey(requestKey);
    setSignatureTemplatesError('');
    try {
      const response = await fetch(
        `${apiBase}/auth/v1/bank-signature/templates/${encodeURIComponent(bankKey)}/${encodeURIComponent(templateType)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.detail || payload?.message || 'שגיאה בפתיחת המסמך');
      }
      const blob = await response.blob();
      const fileName = extractFilenameFromContentDisposition(
        response.headers.get('content-disposition'),
        fallbackName || `${bankKey}-${templateType}.pdf`,
      );
      const objectUrl = window.URL.createObjectURL(blob);
      const previewWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');
      if (!previewWindow) {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 60000);
    } catch (err) {
      setSignatureTemplatesError(err?.message || 'שגיאה בפתיחת המסמך');
    } finally {
      setSignatureTemplateDownloadingKey('');
    }
  };

  const handleSignatureSave = async (confirmOption) => {
    if (!signatureCanvasRefs.current[0] || !authToken) return;
    if (!sessionId) {
      setError('לא ניתן לשמור חתימה ללא סשן פעיל');
      return;
    }
    const missingSignatureIndex = signatureIndexes.find((signatureIndex) => !signatureReadyByIndex[signatureIndex]);
    if (missingSignatureIndex !== undefined) {
      setError(
        missingSignatureIndex === 0
          ? 'נא לחתום לפני שמירה'
          : `נא לחתום גם כלווה נוסף ${missingSignatureIndex}`,
      );
      return;
    }
    setSignatureSaving(true);
    setError('');
    try {
      const uploadSignature = async (signatureIndex, filename) => {
        const canvas = signatureCanvasRefs.current[signatureIndex];
        if (!canvas) {
          throw new Error('לא ניתן לשמור חתימה');
        }
        const blob = await new Promise((resolve) => {
          canvas.toBlob((fileBlob) => resolve(fileBlob), 'image/png');
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

      const getSignatureFileName = (signatureIndex) => {
        if (signatureIndex === 0) {
          return `system_signature_${sessionId}.png`;
        }
        if (signatureIndex === 1) {
          return `system_signature_co_${sessionId}.png`;
        }
        return `system_signature_co_${signatureIndex}_${sessionId}.png`;
      };

      const orderedSignatureIndexes = signatureIndexes.length > 1
        ? [...signatureIndexes.slice(1), signatureIndexes[0]]
        : signatureIndexes;
      for (const signatureIndex of orderedSignatureIndexes) {
        const filename = getSignatureFileName(signatureIndex);
        await uploadSignature(signatureIndex, filename);
      }
      setSignatureSavedByIndex((prev) => {
        const next = { ...prev };
        signatureIndexes.forEach((signatureIndex) => {
          next[signatureIndex] = true;
        });
        return next;
      });
      if (confirmOption) {
        const confirmSaved = await sendAnswer(confirmOption, null, confirmOption.label);
        if (!confirmSaved) {
          return;
        }
      }
      localStorage.setItem('new_mortgage_submitted', 'true');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'שגיאה בשמירת החתימה');
    } finally {
      setSignatureSaving(false);
    }
  };

  const getIsFullWidthButtons = (buttonList) =>
    buttonList.length === 1 ||
    buttonList.length === 3 ||
    buttonList.some((option) => option.label.length > 28);

  const shouldAutoFocusInput =
    isInputModeAvailable &&
    inputOption?.option_type === 'input' &&
    !isDateInput;
  const isBlockingOverlayVisible = isLoading || signatureSaving;

  useEffect(() => {
    if (!shouldAutoFocusInput || isSending || isRollingBack || isBlockingOverlayVisible) return undefined;
    const input = chatInputRef.current;
    if (!input) return undefined;
    const timer = window.setTimeout(() => {
      input.focus({ preventScroll: true });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [shouldAutoFocusInput, isSending, isRollingBack, isBlockingOverlayVisible, currentBlock?.block_key]);

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

  const latestBotMessageIndexByBlockKey = useMemo(() => {
    const indexByBlock = new Map();
    messages.forEach((message, index) => {
      if (message.role !== 'bot' || !message.blockKey) return;
      indexByBlock.set(message.blockKey, index);
    });
    return indexByBlock;
  }, [messages]);

  const answeredBlockKeySet = useMemo(() => {
    const answered = new Set();
    messages.forEach((message) => {
      if (message.role === 'user' && message.blockKey) {
        answered.add(message.blockKey);
      }
    });
    return answered;
  }, [messages]);

  const historyIdsWithVisibleUserAnswer = useMemo(() => {
    const historyIds = new Set();
    messages.forEach((message) => {
      if (message.role !== 'user' || !message.historyId) return;
      if (isButtonBlockKey(message.blockKey) || mortgageBlocks[message.blockKey]) return;
      historyIds.add(message.historyId);
    });
    return historyIds;
  }, [messages, buttonBlocks, mortgageBlocks, currentBlock?.block_key, options]);

  const handleButtonOptionClick = async ({
    messageId,
    blockKey,
    option,
    isActiveBlock,
    messageText,
    messageHistoryId,
    messageIndex,
  }) => {
    const blockState = buttonBlocks[blockKey];
    const messageAnswer = buttonAnswersByMessageId[messageId];
    if (!messageId || !blockKey || isSending || isRollingBack) return;
    if (messageAnswer?.answeredToken === activeBlockToken || blockState?.answeredToken === activeBlockToken) return;
    if (!sessionId) return;

    const isRollbackFlow = !isActiveBlock;
    const isCoBorrowerQuestion =
      isRollbackFlow
        ? isCoBorrowerQuestionText(messageText)
        : currentBlock?.block_key === blockKey && isCoBorrowerQuestionText(currentBlock?.message);
    const shouldAddSignature = isCoBorrowerQuestion && String(option.label || '').includes('כן');

    if (isRollbackFlow) {
      setIsRollingBack(true);
      try {
        await rollbackToMessageBlock({
          blockKey,
          messageHistoryId,
          messageIndex,
        });
      } catch (err) {
        setError(err?.message || 'שגיאה בחזרה לשלב קודם');
        return;
      } finally {
        setIsRollingBack(false);
      }
    }

    upsertButtonAnswerForMessage(messageId, {
      selectedId: option.id,
      selectedLabel: option.label,
    });

    const success = await sendAnswer(option, null, option.label, { appendUserMessage: false });
    if (success) {
      upsertButtonAnswerForMessage(messageId, { answered: true, answeredToken: activeBlockToken });
      upsertButtonBlock(blockKey, { answered: true, answeredToken: activeBlockToken });
      if (shouldAddSignature) {
        setRequiredSignatureCount((prev) => prev + 1);
      }
    }
  };

  const handleInputEditClick = async ({
    blockKey,
    messageHistoryId,
  }) => {
    if (!blockKey || isSending || isRollingBack) return;
    setError('');
    setIsRollingBack(true);
    try {
      await rollbackToMessageBlock({
        blockKey,
        messageHistoryId,
        reloadSession: true,
      });
    } catch (err) {
      setError(err?.message || 'שגיאה בפתיחת העריכה');
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleRollbackToLatestAllowed = async () => {
    if (isSending || isRollingBack) return;
    if (!sessionId) {
      setError('לא נמצאה שיחה פעילה');
      return;
    }

    setError('');
    setIsRollingBack(true);
    try {
      const activeHistory = await fetchActiveHistory(sessionId);
      const latestRollbackable = [...activeHistory].reverse().find((item) =>
        item?.prevent_rollback === false &&
        Boolean(item?.block_key),
      );

      if (!latestRollbackable) {
        throw new Error('לא נמצאה שאלה שניתן לחזור אליה');
      }

      await rollbackToMessageBlock({
        blockKey: latestRollbackable.block_key,
        messageHistoryId: latestRollbackable.id,
        reloadSession: true,
      });
    } catch (err) {
      setError(err?.message || 'שגיאה בחזרה לשאלה האחרונה שניתנת לעריכה');
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div className="aichat_page">
      <div className="wrapper">
        <div className="title">
          <h1>צא’ט הגשת בקשה לאישור עקרוני</h1>
          <p>הגשת בקשה לאישור עקרוני לכלל הבנקים בחינם לגמרי!</p>
        </div>
        <div className="ai_chat_box">
          <div className="had d_flex d_flex_jc d_flex_ac">
            <img src={aichatFigure} alt="" /> <span>רובין העוזר האישי שלך למשכנתא</span>
          </div>
          {isBlockingOverlayVisible && (
            <div className="ai_chat_loading_overlay" role="status" aria-live="polite">
              <div className="ai_chat_loading_box">
                <span className="ai_chat_loading_spinner" aria-hidden="true" />
                <span>{signatureSaving ? 'שומר את הנתונים...' : 'טוען את היסטוריית השיחה...'}</span>
              </div>
            </div>
          )}
          <div className="inner" ref={scrollRef}>
            {!isLoading && messages.length === 0 && (
              <div className="ai_chat_status">אין הודעות עדיין.</div>
            )}
            {messages.map((message, index) => {
              const isBot = message.role === 'bot';
              const isLatestForBlock = isBot && latestBotMessageIndexByBlockKey.get(message.blockKey) === index;
              const isActiveBlock = isBot && isLatestForBlock && message.blockKey === currentBlock?.block_key;
              const isPinnedMessage = isBot && pinnedBlockKey && message.blockKey === pinnedBlockKey;
              const isButtonBlockMessage = isBot && isButtonBlockKey(message.blockKey);
              const buttonOptionsForMessage = isButtonBlockMessage
                ? getButtonOptionsForBlock(message.blockKey).filter((option) => option.option_type === 'button')
                : [];
              const messageAnswer = buttonAnswersByMessageId[message.id] || {};
              const buttonPosition = buttonBlockIndex.get(message.blockKey) ?? 0;
              const mortgageBlock = mortgageBlocks[message.blockKey];
              const isMortgageBlockMessage = isBot && mortgageBlock;
              const isActiveMortgageBlock = isMortgageBlockMessage && isActiveBlock && isMortgageParameters;
              const hasAnsweredBlock = answeredBlockKeySet.has(message.blockKey);
              const isHistoryUserAnswer = !isBot && Boolean(message.historyId);
              const isTextHistoryMessage =
                Boolean(message.historyId) &&
                !isButtonBlockKey(message.blockKey) &&
                !mortgageBlocks[message.blockKey];
              const hasVisibleHistoryAnswer =
                Boolean(message.historyId) &&
                historyIdsWithVisibleUserAnswer.has(message.historyId);
              const canRollbackMessage = message.preventRollback === false;
              const isRollbackBlockedMessage = message.preventRollback === true;
              const shouldRenderEditButton =
                isHistoryUserAnswer &&
                canRollbackMessage &&
                Boolean(message.blockKey) &&
                hasAnsweredBlock &&
                !isButtonBlockKey(message.blockKey) &&
                !mortgageBlocks[message.blockKey] &&
                !currentBlock?.is_terminal;
              const shouldRenderRestartButton =
                isRollbackBlockedMessage &&
                (
                  !isTextHistoryMessage ||
                  (hasVisibleHistoryAnswer ? !isBot : isBot)
                );
              const timeLabel = formatMessageTime(message.timestamp);
              const messageClass = isBot
                ? (isButtonBlockMessage
                  ? (buttonPosition % 2 === 0 ? 'user_chat' : 'boat_chat')
                  : 'boat_chat')
                : 'user_chat';
              const messageIconSrc = messageClass === 'user_chat' ? aichatFigure : bouticon;
              if (!isBot && (isButtonBlockKey(message.blockKey) || mortgageBlocks[message.blockKey])) {
                return null;
              }
              const shouldRenderButtonsForMessage =
                isButtonBlockMessage &&
                buttonOptionsForMessage.length > 0 &&
                !(isActiveBlock && (isMortgageParameters || shouldShowSignature || currentBlock?.is_terminal));
              const shouldRenderSeparateRestartRow =
                shouldRenderRestartButton &&
                shouldRenderButtonsForMessage &&
                shouldUseSeparateRestartRowForQuestionText(message.text);
              const shouldRenderInlineRestartButton =
                shouldRenderRestartButton && !shouldRenderSeparateRestartRow;
              const shouldRenderAnyButtonRow =
                shouldRenderButtonsForMessage || shouldRenderInlineRestartButton;
              const shouldUseFullWidthButtons =
                shouldRenderButtonsForMessage &&
                !shouldRenderInlineRestartButton &&
                getIsFullWidthButtons(buttonOptionsForMessage);

              return (
                <div
                  key={message.id}
                  className={`colin ${messageClass}`}
                  data-block-key={isBot ? message.blockKey : undefined}
                >
                  <div className="icon"><img src={messageIconSrc} alt="" /></div>
                  <div className="text">
                    <div className="message_box">
                      {isPinnedMessage ? renderMessageParagraphs(message.text) : (
                        <p>{renderMessageText(message.text)}</p>
                      )}
                      {shouldRenderEditButton && (
                        <button
                          type="button"
                          className="message_edit_button"
                          onClick={() => handleInputEditClick({
                            blockKey: message.blockKey,
                            messageHistoryId: message.historyId,
                          })}
                          disabled={isSending || isRollingBack}
                          aria-label="ערוך תשובה"
                          title="ערוך תשובה"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d="M4 16.7V20h3.3l9.7-9.7-3.3-3.3L4 16.7Zm15.6-9.1a.9.9 0 0 0 0-1.3L17.7 4.4a.9.9 0 0 0-1.3 0L15 5.8l3.3 3.3 1.3-1.5Z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
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
                              disabled={isSending || isRollingBack}
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
                              disabled={isSending || isRollingBack}
                            />
                          </div>
                        </div>
                        <div className="monthly_repayment">
                          החזר חודשי: <span>₪{formatNumber(mortgageMonthly)}</span>
                        </div>
                        <div className="btn_box btn_box_full d_flex d_flex_jb">
                          <button onClick={handleSendInput} disabled={isSending || isRollingBack}>
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
                    {shouldRenderAnyButtonRow && (
                      <div
                        className={`btn_box d_flex ${shouldRenderInlineRestartButton ? 'btn_box_with_restart' : 'd_flex_jb'} ${shouldUseFullWidthButtons ? 'btn_box_full' : ''}`}
                      >
                        {shouldRenderInlineRestartButton && (
                          <button
                            type="button"
                            className="message_restart_option"
                            onClick={handleRollbackToLatestAllowed}
                            disabled={isSending || isRollingBack}
                            aria-label="חזרה לשאלה האחרונה שניתנת לעריכה"
                            title="חזרה להתחלה"
                          >
                            <span>חזור</span>
                            <span>להתחלה</span>
                          </button>
                        )}
                        {shouldRenderButtonsForMessage && buttonOptionsForMessage.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleButtonOptionClick({
                              messageId: message.id,
                              blockKey: message.blockKey,
                              option,
                              isActiveBlock,
                              messageText: message.text,
                              messageHistoryId: message.historyId,
                              messageIndex: index,
                            })}
                            disabled={isSending || isRollingBack || messageAnswer.answeredToken === activeBlockToken}
                            className={
                              (messageAnswer.selectedId !== null &&
                                messageAnswer.selectedId !== undefined &&
                                messageAnswer.selectedId !== '' &&
                                messageAnswer.selectedId === option.id) ||
                              ((messageAnswer.selectedId === null ||
                                messageAnswer.selectedId === undefined ||
                                messageAnswer.selectedId === '') &&
                                messageAnswer.selectedLabel &&
                                messageAnswer.selectedLabel === option.label)
                                ? 'active'
                                : ''
                            }
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {shouldRenderSeparateRestartRow && (
                      <div
                        className="btn_box_restart_row btn_box_restart_row_after_buttons"
                      >
                        <button
                          type="button"
                          className="message_restart_option"
                          onClick={handleRollbackToLatestAllowed}
                          disabled={isSending || isRollingBack}
                          aria-label="חזרה לשאלה האחרונה שניתנת לעריכה"
                          title="חזרה להתחלה"
                        >
                          <span>חזור</span>
                          <span>להתחלה</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isBotTyping && !isLoading && (
              <div className="colin boat_chat ai_chat_typing_row" aria-live="polite" aria-label="הצ'אט מקליד">
                <div className="icon"><img src={bouticon} alt="" /></div>
                <div className="text">
                  <div className="message_box is_typing">
                    <div className="ai_chat_typing_dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {shouldShowSignature && (
              <div className="order_benefit">
                <h4>על מנת להנות מהמשך טיפול נא <br /> לחתום לצורך ייפוי כוח</h4>
                <form onSubmit={(event) => event.preventDefault()}>
                  {signatureIndexes.map((signatureIndex) => {
                    const isPrimarySignature = signatureIndex === 0;
                    const isSignatureReady = Boolean(signatureReadyByIndex[signatureIndex]);
                    const signatureLabel = isPrimarySignature
                      ? 'חתימת הלווה הראשי'
                      : `חתימת לווה נוסף ${signatureIndex}`;
                    const clearLabel = isPrimarySignature
                      ? 'נקה חתימה'
                      : `נקה חתימת לווה נוסף ${signatureIndex}`;
                    return (
                      <div className="signature_group" key={`signature-${signatureIndex}`}>
                        <div className="signature_label">{signatureLabel}</div>
                        <div className="signature signature_pad">
                          {!isSignatureReady && <span>נא לחתום כאן</span>}
                          <img src={aichatSignPen} alt="" className="signature_pen_icon" aria-hidden="true" />
                          <button
                            type="button"
                            className={`signature_clear_icon ${isSignatureReady ? 'is-visible' : ''}`}
                            onClick={() => clearSignaturePad(signatureIndex)}
                            disabled={signatureSaving}
                            aria-label={clearLabel}
                          >
                            <img src={removeIcon} alt="" />
                          </button>
                          <canvas
                            ref={(element) => {
                              signatureCanvasRefs.current[signatureIndex] = element;
                            }}
                            className="signature_canvas"
                            onPointerDown={(event) => handleSignaturePointerDown(event, signatureIndex)}
                            onPointerMove={(event) => handleSignaturePointerMove(event, signatureIndex)}
                            onPointerUp={(event) => handleSignaturePointerUp(event, signatureIndex)}
                            onPointerLeave={(event) => handleSignaturePointerUp(event, signatureIndex)}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="btn_col d_flex d_flex_jb d_flex_ac">
                    <button
                      type="button"
                      className="view"
                      onClick={handleOpenSignatureDocs}
                      disabled={signatureSaving}
                      aria-label="הצג מסמכים לחתימה"
                    >
                      <img src={viewicon} alt="" />
                    </button>
                    <button
                      type="button"
                      className="confirmation"
                      onClick={() => handleSignatureSave(signatureConfirmOption)}
                      disabled={signatureSaving || areAllSignaturesSaved || !areAllSignaturesReady}
                    >
                      {signatureSaving
                        ? 'שומר...'
                        : areAllSignaturesSaved
                          ? (requiredSignatureCount > 1 ? 'החתימות נשמרו' : 'החתימה נשמרה')
                          : 'אישור'}
                    </button>
                  </div>
                </form>
                {isSignatureDocsOpen && (
                  <div
                    className="signature_docs_modal_overlay"
                    role="presentation"
                    onClick={handleCloseSignatureDocs}
                  >
                    <div
                      className="signature_docs_modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="signature-docs-title"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="signature_docs_modal_header d_flex d_flex_jb d_flex_ac">
                        <h5 id="signature-docs-title">מסמכים לחתימה</h5>
                        <button
                          type="button"
                          className="signature_docs_close"
                          onClick={handleCloseSignatureDocs}
                          aria-label="סגור חלון מסמכים"
                        >
                          ×
                        </button>
                      </div>
                      <p className="signature_docs_intro">
                        לפני האישור ניתן לעיין במסמכי החתימה לכל בנק.
                      </p>
                      {signatureTemplatesLoading && (
                        <div className="signature_docs_status">טוען מסמכים...</div>
                      )}
                      {!signatureTemplatesLoading && signatureTemplates.length === 0 && (
                        <div className="signature_docs_status">לא נמצאו מסמכי חתימה זמינים.</div>
                      )}
                      {!signatureTemplatesLoading && signatureTemplates.length > 0 && (
                        <div className="signature_docs_list">
                          {signatureTemplates.map((bank) => {
                            const bankLogo = BANK_LOGO_BY_KEY[bank.bank_key] || '';
                            return (
                            <div className="signature_docs_bank" key={bank.bank_key}>
                              <div className="signature_docs_bank_header d_flex d_flex_ac">
                                {bankLogo && (
                                  <img src={bankLogo} alt={bank.bank_name} className="signature_docs_bank_logo" />
                                )}
                                <h6>{bank.bank_name}</h6>
                              </div>
                              <div className="signature_docs_links">
                                {bank.power_of_attorney_filename ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSignatureTemplate(
                                      bank.bank_key,
                                      'power-of-attorney',
                                      bank.power_of_attorney_filename,
                                    )}
                                    disabled={signatureTemplateDownloadingKey === `${bank.bank_key}:power-of-attorney`}
                                  >
                                    {signatureTemplateDownloadingKey === `${bank.bank_key}:power-of-attorney`
                                      ? 'פותח...'
                                      : 'ייפוי כוח'}
                                  </button>
                                ) : (
                                  <span className="signature_docs_missing">ייפוי כוח לא זמין</span>
                                )}
                                {bank.credit_card_authorization_filename ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSignatureTemplate(
                                      bank.bank_key,
                                      'credit-card-authorization',
                                      bank.credit_card_authorization_filename,
                                    )}
                                    disabled={signatureTemplateDownloadingKey === `${bank.bank_key}:credit-card-authorization`}
                                  >
                                    {signatureTemplateDownloadingKey === `${bank.bank_key}:credit-card-authorization`
                                      ? 'פותח...'
                                      : 'הסכמה להוצאת חיווי אשראי'}
                                  </button>
                                ) : (
                                  <span className="signature_docs_missing">הרשאה לכרטיסי אשראי לא זמינה</span>
                                )}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                      {signatureTemplatesError && (
                        <div className="signature_docs_error">{signatureTemplatesError}</div>
                      )}
                    </div>
                  </div>
                )}
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

          <a
            className="ai_chat_whatsapp_fab"
            href={WHATSAPP_SUPPORT_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="מעבר לוואטסאפ"
            title="מעבר לוואטסאפ"
          >
            <img src={whatsappFabIcon} alt="" aria-hidden="true" />
          </a>

          <div className="send_message d_flex d_flex_ac d_flex_jb">
            <div className="form_input" ref={countryInputWrapperRef} onClick={handleInputWrapperClick}>
              <input
                type={isDateInput ? 'date' : 'text'}
                className="in"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={handleInputValueChange}
                onFocus={handleInputFocus}
                disabled={isSendAreaDisabled}
                inputMode={
                  !isContractorNameInput && (isPriceAmountInput || isIdentityNumberInput || isPhoneNumberInput)
                    ? 'numeric'
                    : undefined
                }
                pattern={
                  !isContractorNameInput
                    ? (isPriceAmountInput
                      ? '[0-9,]*'
                      : (isIdentityNumberInput || isPhoneNumberInput)
                        ? '[0-9]*'
                        : undefined)
                    : undefined
                }
                ref={isDateInput ? dateInputRef : chatInputRef}
                onClick={isDateInput ? handleDateInputActivate : undefined}
                onKeyDown={(e) => {
                  if (isSendAreaDisabled) return;
                  if (e.key === 'Enter') {
                    handleSendInput();
                  }
                }}
              />
              {isApiDropdownSelectionInput && isCountryDropdownOpen && !isSendAreaDisabled && (
                <div
                  className="ai_country_dropdown"
                  role="listbox"
                  aria-label={
                    isCountrySelectionInput
                      ? 'רשימת מדינות'
                      : isResidenceCityInput
                        ? 'רשימת ערים'
                        : 'רשימת כתובות'
                  }
                >
                  {dropdownOptions.length > 0 ? (
                    dropdownOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className="ai_country_option"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => handleDropdownSelect(option, event)}
                      >
                        {option.label}
                      </button>
                    ))
                  ) : (
                    <div className="ai_country_empty">
                      {isDropdownLoading
                        ? (
                          isResidenceCityInput
                            ? 'טוען ערים...'
                            : 'טוען כתובות...'
                        )
                        : isResidenceAddressInput && !selectedResidenceCity?.name
                          ? 'יש לבחור עיר מגורים קודם'
                          : isResidenceCityInput
                            ? 'לא נמצאו ערים'
                            : isResidenceAddressInput
                              ? 'לא נמצאו כתובות'
                              : 'לא נמצאו מדינות'}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="send" onClick={handleSendInput} disabled={isSendAreaDisabled}>
              <img src={sendicon} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatpage;
