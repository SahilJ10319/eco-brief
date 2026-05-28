import { useEffect, useState } from 'react';
import { fetchPayloads, triggerPipeline, fetchSummary, fetchAudioUrl } from '../api';

function StatusBadge({ status }) {
  const isReady = status === 'completed';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full ${
      isReady
        ? 'bg-eco-500/10 text-eco-400 border border-eco-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-eco-400' : 'bg-amber-400'}`}></span>
      {isReady ? 'Ready' : 'Pending'}
    </span>
  );
}

function PayloadCard({ payload, onTrigger, onOpen }) {
  const [triggering, setTriggering] = useState(false);
  const isReady = payload.status === 'completed';
  const filename = payload.key.split('/').pop().replace('.txt', '');

  async function handleTrigger() {
    setTriggering(true);
    await onTrigger(payload.key);
    setTriggering(false);
  }

  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300 cursor-default">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-eco-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="space-y-4">
        <StatusBadge status={payload.status} />

        <div>
          <h3 className="text-base font-semibold text-slate-100 truncate leading-snug" title={filename}>
            {filename}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            {(payload.size / 1024).toFixed(1)} kb &middot; {new Date(payload.last_modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6">
        {isReady ? (
          <button
            onClick={() => onOpen(payload.key)}
            className="w-full py-2.5 px-4 rounded-xl bg-eco-600 hover:bg-eco-500 text-white text-sm font-semibold transition-colors duration-200"
          >
            Listen to Briefing
          </button>
        ) : (
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-slate-300 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {triggering ? 'Launching...' : 'Generate Summary'}
          </button>
        )}
      </div>
    </div>
  );
}

function BriefingModal({ payloadKey, onClose }) {
  const [summary, setSummary] = useState(null);
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const filename = payloadKey.split('/').pop().replace('.txt', '');

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([fetchSummary(payloadKey), fetchAudioUrl(payloadKey)]);
        if (s) setSummary(s);
        if (a) setAudio(a);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [payloadKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div>
            <p className="text-xs font-semibold text-eco-400 tracking-widest uppercase mb-1">Briefing</p>
            <h3 className="text-lg font-semibold text-slate-100 leading-snug">{filename}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors mt-0.5 ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-eco-500/30 border-t-eco-500 rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading briefing...</p>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              <p className="text-slate-300 leading-relaxed font-serif text-base whitespace-pre-wrap">
                {summary.content}
              </p>
              {audio && (
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-slate-500 font-semibold tracking-widest uppercase mb-3">Audio Playback</p>
                  <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
                    <audio controls src={audio.url} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-slate-500 text-sm">No briefing available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPayloads(true);
    const interval = setInterval(() => loadPayloads(false), 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadPayloads(showLoader = true) {
    if (showLoader) setLoading(true);
    try {
      const data = await fetchPayloads();
      setPayloads(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  async function handleTrigger(key) {
    try {
      await triggerPipeline(key);
    } catch {
      alert('failed to trigger pipeline — check api connection.');
    }
  }

  const pending = payloads.filter(p => p.status !== 'completed');
  const completed = payloads.filter(p => p.status === 'completed');

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">News Briefings</h2>
        <p className="text-slate-500 mt-1.5 text-sm">
          {loading ? 'Loading...' : `${payloads.length} article${payloads.length !== 1 ? 's' : ''} — ${completed.length} processed, ${pending.length} pending`}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          Cannot reach the API. Make sure the orchestrator is running.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : payloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>
            </svg>
          </div>
          <p className="text-slate-500 text-sm">No payloads found in S3.</p>
          <p className="text-slate-600 text-xs">Run the ingestion service to populate articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payloads.map(payload => (
            <PayloadCard
              key={payload.key}
              payload={payload}
              onTrigger={handleTrigger}
              onOpen={key => setActiveModal(key)}
            />
          ))}
        </div>
      )}

      {activeModal && (
        <BriefingModal payloadKey={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
