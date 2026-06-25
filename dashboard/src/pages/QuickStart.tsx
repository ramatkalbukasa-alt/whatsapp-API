import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Copy, KeyRound, Loader2, Play, Plus, QrCode, RefreshCw, Terminal } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ApiError, sessionApi, type Session } from '../services/api';
import './QuickStart.css';

type StepState = 'idle' | 'busy' | 'done' | 'error';

function getFriendlyError(error: unknown, t: ReturnType<typeof useTranslation>['t']): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return t('quickStart.errors.unauthorized');
    if (error.status === 403) return t('quickStart.errors.forbidden');
    if (error.status === 409) return t('quickStart.errors.conflict');
    return error.message;
  }

  return error instanceof Error ? error.message : t('common.unknownError');
}

function maskApiKey(key: string): string {
  if (!key) return 'YOUR_API_KEY';
  if (key.length <= 16) return `${key.slice(0, 4)}...`;
  return `${key.slice(0, 12)}...${key.slice(-4)}`;
}

export function QuickStart() {
  const { t } = useTranslation();
  const [sessionName, setSessionName] = useState('test-bot');
  const [session, setSession] = useState<Session | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createState, setCreateState] = useState<StepState>('idle');
  const [startState, setStartState] = useState<StepState>('idle');
  const [qrState, setQrState] = useState<StepState>('idle');
  const qrTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const apiKey = sessionStorage.getItem('openwa_api_key') || '';
  const apiBase = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';
  const curl = useMemo(() => {
    const shownKey = maskApiKey(apiKey);
    return [
      `curl -X POST '${apiBase}/sessions' \\`,
      "  -H 'Content-Type: application/json' \\",
      `  -H 'X-API-Key: ${shownKey}' \\`,
      `  -d '{"name":"${sessionName || 'test-bot'}"}'`,
    ].join('\n');
  }, [apiBase, apiKey, sessionName]);

  const clearQrTimer = () => {
    if (qrTimer.current) {
      clearInterval(qrTimer.current);
      qrTimer.current = null;
    }
  };

  useEffect(() => clearQrTimer, []);

  const fetchQr = async (targetSession: Session) => {
    try {
      setQrState('busy');
      const qr = await sessionApi.getQR(targetSession.id);
      setQrCode(qr.qrCode);
      setQrState(qr.qrCode ? 'done' : 'busy');
      if (qr.status === 'ready') {
        const updated = await sessionApi.get(targetSession.id);
        setSession(updated);
      }
    } catch (err) {
      setQrState('error');
      setError(getFriendlyError(err, t));
    }
  };

  const createSession = async () => {
    const name = sessionName.trim();
    if (!name) {
      setError(t('quickStart.errors.nameRequired'));
      return;
    }

    clearQrTimer();
    setError(null);
    setQrCode(null);
    setCreateState('busy');
    setStartState('idle');
    setQrState('idle');

    try {
      const created = await sessionApi.create(name);
      setSession(created);
      setCreateState('done');
    } catch (err) {
      setCreateState('error');
      setError(getFriendlyError(err, t));
    }
  };

  const startSession = async () => {
    if (!session) return;

    clearQrTimer();
    setError(null);
    setStartState('busy');
    setQrState('busy');

    try {
      const started = await sessionApi.start(session.id);
      setSession(started);
      setStartState('done');
      await fetchQr(started);
      qrTimer.current = setInterval(() => {
        void fetchQr(started);
      }, 5000);
    } catch (err) {
      setStartState('error');
      setQrState('error');
      setError(getFriendlyError(err, t));
    }
  };

  const copyCurl = async () => {
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const steps = [
    { icon: KeyRound, title: t('quickStart.steps.key'), state: apiKey ? 'done' : 'error' },
    { icon: Plus, title: t('quickStart.steps.create'), state: createState },
    { icon: Play, title: t('quickStart.steps.start'), state: startState },
    { icon: QrCode, title: t('quickStart.steps.scan'), state: qrState },
  ] as const;

  return (
    <div className="quick-start-page">
      <PageHeader title={t('quickStart.title')} subtitle={t('quickStart.subtitle')} />

      <section className="quick-start-grid">
        <div className="quick-panel quick-panel-main">
          <div className="stepper" aria-label={t('quickStart.progress')}>
            {steps.map(({ icon: Icon, title, state }) => (
              <div className={`stepper-item ${state}`} key={title}>
                <span className="stepper-icon">
                  {state === 'busy' ? <Loader2 className="animate-spin" size={18} /> : <Icon size={18} />}
                </span>
                <span>{title}</span>
              </div>
            ))}
          </div>

          <div className="quick-form">
            <label htmlFor="quick-session-name">{t('quickStart.sessionName')}</label>
            <div className="quick-input-row">
              <input
                id="quick-session-name"
                value={sessionName}
                onChange={event => setSessionName(event.target.value)}
                placeholder={t('quickStart.sessionPlaceholder')}
                disabled={createState === 'busy' || startState === 'busy'}
              />
              <button className="btn-primary" onClick={createSession} disabled={createState === 'busy'}>
                {createState === 'busy' ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                {t('quickStart.createSession')}
              </button>
            </div>
          </div>

          {session && (
            <div className="session-strip">
              <div>
                <span className="strip-label">{t('quickStart.currentSession')}</span>
                <strong>{session.name}</strong>
              </div>
              <span className={`status-pill ${session.status}`}>{t(`sessionStatus.${session.status}`)}</span>
              <button className="btn-secondary" onClick={startSession} disabled={startState === 'busy'}>
                {startState === 'busy' ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                {t('quickStart.startSession')}
              </button>
            </div>
          )}

          {error && <div className="quick-alert error">{error}</div>}
        </div>

        <div className="quick-panel qr-panel">
          <div className="panel-heading">
            <h2>{t('quickStart.qrTitle')}</h2>
            {qrState === 'busy' && <RefreshCw className="animate-spin" size={18} />}
          </div>

          <div className="qr-box">
            {qrCode ? (
              <img src={qrCode} alt={t('quickStart.qrAlt')} />
            ) : (
              <div className="qr-empty">
                <QrCode size={54} />
                <span>{t('quickStart.qrEmpty')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="quick-panel curl-panel">
        <div className="panel-heading">
          <h2><Terminal size={16} /> {t('quickStart.curlTitle')}</h2>
          <button className="btn-secondary" onClick={copyCurl}>
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? t('quickStart.copied') : t('common.copy')}
          </button>
        </div>
        <pre>{curl}</pre>
      </section>
    </div>
  );
}
