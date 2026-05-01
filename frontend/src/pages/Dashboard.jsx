import { useEffect, useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { fetchPayloads, triggerPipeline } from '../api';

export default function Dashboard() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <Button variant="secondary" className="w-full" onClick={() => handleTrigger(payload.key)}>
                  Process Summary
                </Button>
              </div>
            </Card>
          ))}
          {payloads.length === 0 && (
            <div className="text-slate-400 col-span-full">no payloads found in s3.</div>
          )}
        </div>
      )}
    </div>
  );
}
