// Homepage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from 'react-router-dom';
import '../components/brokercomponents/BrokerHomepage.css';

import brokerhomeImage from '../assets/images/broker_img.png';
import { fetchAuthGet } from '../utils/authGetCache';
import { getGatewayBase } from '../utils/apiBase';

// components
import BrokerInfo from '../components/brokercomponents/BrokerInfo';
import BrokerStatementList from '../components/brokercomponents/BrokerStatementList';

const EMPTY_DASHBOARD = {
  total_credit_all_time: 0,
  balance_due: 0,
  closed_customers_count: 0,
  withdrawal_requested: false,
};

const EMPTY_CUSTOMERS = [];
const ALLOWED_STEP_FILTERS = new Set(['all', 'not_registered', 'no_offer_received', 'offer_accepted']);
const STEP_ROUTE_MAP = {
  not_registered: '/brokerhomepage?step=not_registered',
  no_offer_received: '/brokerhomepage?step=no_offer_received',
  offer_accepted: '/brokerhomepage?step=offer_accepted',
};

const NOT_REGISTERED_STATUSES = new Set([
  '',
  'נרשם',
  'שיחה עם הצ׳אט',
  'חוסר התאמה',
  'העלאת קבצים',
  'העלאת נתוני משכנתא',
  'מחזור - ניטור',
  'מיחזור - ניטור',
  'מחזור ניטור',
  'מיחזור ניטור',
]);

const NO_OFFER_KEYWORDS = ['ממתין לאישור עקרוני', 'בקשה נשלחה', 'אין הצעה'];
const OFFER_RECEIVED_KEYWORDS = ['אישור עקרוני', 'יש הצעה', 'שיחת תמהיל', 'חתימות', 'קבלת הכסף'];

const normalizeStatus = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const mapStatusToStepMeta = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (NOT_REGISTERED_STATUSES.has(normalizedStatus)) {
    return {
      step: 'לא נרשם',
      stepClass: 'not_registered',
      stepRoute: STEP_ROUTE_MAP.not_registered,
    };
  }

  if (OFFER_RECEIVED_KEYWORDS.some((keyword) => normalizedStatus.includes(keyword))) {
    return {
      step: 'התקבלה הצעה',
      stepClass: 'offer_accepted',
      stepRoute: STEP_ROUTE_MAP.offer_accepted,
    };
  }

  if (NO_OFFER_KEYWORDS.some((keyword) => normalizedStatus.includes(keyword))) {
    return {
      step: 'לא קיבל הצעות',
      stepClass: 'no_offer_received',
      stepRoute: STEP_ROUTE_MAP.no_offer_received,
    };
  }

  return {
    step: 'לא קיבל הצעות',
    stepClass: 'no_offer_received',
    stepRoute: STEP_ROUTE_MAP.no_offer_received,
  };
};

const BrokerHomepage = () => {
  const location = useLocation();
  const [affiliateIdentity] = useState(() => {
    try {
      const raw = localStorage.getItem('affiliate_data');
      const parsed = raw ? JSON.parse(raw) : null;
      const firstName = (parsed?.first_name || '').trim();
      const lastName = (parsed?.last_name || '').trim();
      const name = `${firstName} ${lastName}`.trim() || 'שותף';
      const code = (parsed?.code || '').trim();
      return { name, code };
    } catch {
      return { name: 'שותף', code: '' };
    }
  });
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [withdrawalSaving, setWithdrawalSaving] = useState(false);
  const [generateLinkSaving, setGenerateLinkSaving] = useState(false);
  const [showGenerateLinkWarning, setShowGenerateLinkWarning] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(affiliateIdentity.code);
  const [copiedCurrentLink, setCopiedCurrentLink] = useState(false);
  const [affiliateCustomers, setAffiliateCustomers] = useState(EMPTY_CUSTOMERS);
  const [affiliateCustomersLoading, setAffiliateCustomersLoading] = useState(true);

  const affiliateName = useMemo(() => affiliateIdentity.name, [affiliateIdentity.name]);
  const stepFilter = useMemo(() => {
    const params = new URLSearchParams(location.search || '');
    const raw = String(params.get('step') || '').trim();
    return ALLOWED_STEP_FILTERS.has(raw) ? raw : 'all';
  }, [location.search]);
  const statementItems = useMemo(() => {
    return affiliateCustomers.map((item) => {
      const customerName = `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.phone || '—';
      const status = normalizeStatus(item.status) || '—';
      const stepMeta = mapStatusToStepMeta(item.status);

      return {
        id: item.id,
        customerName,
        status,
        step: stepMeta.step,
        stepClass: stepMeta.stepClass,
        stepRoute: stepMeta.stepRoute,
        createdAt: item.created_at,
      };
    });
  }, [affiliateCustomers]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('affiliate_token');
    if (!token) {
      setDashboard(EMPTY_DASHBOARD);
      setDashboardLoading(false);
      return undefined;
    }

    setDashboardLoading(true);

    fetchAuthGet('/auth/v1/affiliate-dashboard', token, { force: true })
      .then((response) => {
        if (!isMounted) return;

        if (!response?.ok || !response?.data) {
          setDashboard(EMPTY_DASHBOARD);
          return;
        }

        setDashboard({
          total_credit_all_time: Number(response.data.total_credit_all_time) || 0,
          balance_due: Number(response.data.balance_due) || 0,
          closed_customers_count: Number(response.data.closed_customers_count) || 0,
          withdrawal_requested: Boolean(response.data.withdrawal_requested),
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setDashboard(EMPTY_DASHBOARD);
      })
      .finally(() => {
        if (!isMounted) return;
        setDashboardLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('affiliate_token');
    if (!token) {
      setAffiliateCustomers(EMPTY_CUSTOMERS);
      setAffiliateCustomersLoading(false);
      return undefined;
    }

    setAffiliateCustomersLoading(true);

    fetchAuthGet('/auth/v1/affiliate-customers', token, { force: true })
      .then((response) => {
        if (!isMounted) return;
        if (!response?.ok || !Array.isArray(response?.data)) {
          setAffiliateCustomers(EMPTY_CUSTOMERS);
          return;
        }
        setAffiliateCustomers(response.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setAffiliateCustomers(EMPTY_CUSTOMERS);
      })
      .finally(() => {
        if (!isMounted) return;
        setAffiliateCustomersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWithdrawalRequest = async () => {
    const token = localStorage.getItem('affiliate_token');
    if (!token || withdrawalSaving) return;

    const nextValue = !dashboard.withdrawal_requested;
    setWithdrawalSaving(true);

    try {
      const response = await fetch(`${getGatewayBase()}/auth/v1/affiliate-withdrawal-request`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ withdrawal_requested: nextValue }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || 'שגיאה בעדכון בקשת משיכה');
      }

      const updatedValue = Boolean(data?.withdrawal_requested ?? nextValue);
      setDashboard((prev) => ({
        ...prev,
        withdrawal_requested: updatedValue,
      }));

      try {
        const rawAffiliate = localStorage.getItem('affiliate_data');
        if (rawAffiliate) {
          const parsed = JSON.parse(rawAffiliate);
          parsed.withdrawal_requested = updatedValue;
          localStorage.setItem('affiliate_data', JSON.stringify(parsed));
        }
      } catch {
        // Ignore local storage parsing errors.
      }
    } catch {
      // Keep silent in this screen for now.
    } finally {
      setWithdrawalSaving(false);
    }
  };

  const openGenerateLinkWarning = () => {
    if (generateLinkSaving) return;
    setShowGenerateLinkWarning(true);
  };

  const closeGenerateLinkWarning = () => {
    if (generateLinkSaving) return;
    setShowGenerateLinkWarning(false);
  };

  const copyCurrentAffiliateLink = async () => {
    if (!affiliateCode || generateLinkSaving) return;
    const currentLink = `${window.location.origin}/r/${encodeURIComponent(affiliateCode)}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentLink;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCurrentLink(true);
      window.setTimeout(() => setCopiedCurrentLink(false), 2000);
    } catch {
      // Keep this page silent for now.
    }
  };

  const generateNewAffiliateLink = async () => {
    const token = localStorage.getItem('affiliate_token');
    if (!token || generateLinkSaving) return;

    setGenerateLinkSaving(true);
    try {
      const response = await fetch(`${getGatewayBase()}/auth/v1/affiliate-regenerate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.detail || 'שגיאה בהנפקת קוד חדש');
      }

      const nextCode = (data?.code || '').trim();
      if (!nextCode) {
        throw new Error('קוד חדש לא התקבל מהשרת');
      }
      setAffiliateCode(nextCode);
      setCopiedCurrentLink(false);

      try {
        const rawAffiliate = localStorage.getItem('affiliate_data');
        if (rawAffiliate) {
          const parsed = JSON.parse(rawAffiliate);
          parsed.code = nextCode;
          localStorage.setItem('affiliate_data', JSON.stringify(parsed));
        }
      } catch {
        // Ignore local storage parsing errors.
      }

      const nextLink = `${window.location.origin}/r/${encodeURIComponent(nextCode)}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(nextLink);
      }
      setShowGenerateLinkWarning(false);
    } catch {
      // Keep this page silent for now.
    } finally {
      setGenerateLinkSaving(false);
    }
  };

  return (
    <div className="broker_homepage">
      <div className="wrapper">
        <h1>ברוך הבא, {affiliateName}</h1>
        <BrokerInfo
          totalCreditAllTime={dashboard.total_credit_all_time}
          balanceDue={dashboard.balance_due}
          closedCustomersCount={dashboard.closed_customers_count}
          withdrawalRequested={dashboard.withdrawal_requested}
          withdrawalSaving={withdrawalSaving}
          onToggleWithdrawalRequest={toggleWithdrawalRequest}
          generateLinkSaving={generateLinkSaving}
          onGenerateNewLink={openGenerateLinkWarning}
          onCopyCurrentLink={copyCurrentAffiliateLink}
          copyCurrentLinkText={copiedCurrentLink ? 'הלינק הועתק' : 'העתקת לינק נוכחי'}
          copyCurrentLinkDisabled={!affiliateCode || generateLinkSaving}
          isLoading={dashboardLoading}
        />
        <BrokerStatementList
          items={statementItems}
          loading={affiliateCustomersLoading}
          stepFilter={stepFilter}
        />
        <img src={brokerhomeImage} className="brokerhome_image" alt="" />
      </div>

      {showGenerateLinkWarning ? (
        <div className="broker_warning_popup">
          <button
            type="button"
            className="broker_warning_backdrop"
            onClick={closeGenerateLinkWarning}
            aria-label="סגירת חלון אזהרה"
          />
          <div className="broker_warning_card" role="dialog" aria-modal="true" dir="rtl">
            <h2>אזהרה לפני הנפקת לינק חדש</h2>
            <p>ביצירת לינק חדש הלינק הנוכחי יוחלף ולא יהיה פעיל יותר.</p>
            <p>לקוחות שקיבלו את הלינק הנוכחי לא ייכנסו לספירה ולסטטיסטיקות ולא ישוייכו אלייך.</p>
            <div className="broker_warning_actions">
              <button type="button" className="warning_cancel" onClick={closeGenerateLinkWarning} disabled={generateLinkSaving}>
                ביטול
              </button>
              <button type="button" className="warning_confirm" onClick={generateNewAffiliateLink} disabled={generateLinkSaving}>
                {generateLinkSaving ? 'מנפיק לינק...' : 'הנפקת לינק חדש'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>  
  );
};

export default BrokerHomepage;
