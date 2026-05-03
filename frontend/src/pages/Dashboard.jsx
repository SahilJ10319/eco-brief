import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import AudioPlayer from '../components/AudioPlayer';
import { fetchPayloads, triggerPipeline, fetchSummary, fetchAudioUrl } from '../api';

export default function Dashboard() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeModal, setActiveModal] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadPayloads();
  }, []);

  async function loadPayloads() {
    setLoading(true);
    try {
      const data = await fetchPayloads();
      setPayloads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrigger(key) {
    try {
      await triggerPipeline(key);
      alert('pipeline triggered successfully');
    } catch (error) {
      console.error(error);
      alert('failed to trigger pipeline');
    }
  }

  async function openBriefing(key) {
    setActiveModal(key);
    setModalLoading(true);
    setSummaryData(null);
    setAudioData(null);
    try {
      const sum = await fetchSummary(key);
      const aud = await fetchAudioUrl(key);
      if (sum) setSummaryData(sum);
      if (aud) setAudioData(aud);
    } catch (error) {
      console.error(error);
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">Raw Payloads</h2>
        <Button variant="primary" onClick={loadPayloads}>Refresh Data</Button>
      </div>
      
      {loading ? (
        <div className="text-slate-400">loading payloads...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payloads.map((payload) => (
            <Card key={payload.key}>
              <div className="flex flex-col h-full justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-eco-400 tracking-wider uppercase mb-2 block">Source File</span>
                  <h3 className="text-lg font-medium text-slate-200 mb-1 truncate" title={payload.key}>
                    {payload.key.split('/').pop()}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    size: {(payload.size / 1024).toFixed(2)} kb
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    modified: {new Date(payload.last_modified).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full text-sm" onClick={() => openBriefing(payload.key)}>
                    View Briefing
                  </Button>
                  <Button variant="secondary" className="w-full text-sm" onClick={() => handleTrigger(payload.key)}>
                    Process Summary
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {payloads.length === 0 && (
            <div className="text-slate-400 col-span-full">no payloads found in s3.</div>
          )}
        </div>
      )}

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-semibold text-lg truncate pr-4 text-slate-100">
                {activeModal.split('/').pop()}
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {modalLoading ? (
                <div className="text-slate-400 text-center py-8">fetching intelligence...</div>
              ) : summaryData ? (
                <div className="space-y-4">
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif">
                    {summaryData.content}
                  </p>
                  {audioData && <AudioPlayer url={audioData.url} />}
                </div>
              ) : (
                <div className="text-slate-400 text-center py-8 flex flex-col items-center gap-3">
                  <p>no briefing available yet.</p>
                  <Button variant="primary" onClick={() => handleTrigger(activeModal)}>
                    Trigger Inference
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
