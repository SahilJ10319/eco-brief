const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchPayloads() {
  const response = await fetch(`${API_BASE_URL}/payloads`);
  if (!response.ok) {
    throw new Error('failed to fetch payloads');
  }
  return response.json();
}

export async function triggerPipeline(payloadKey, modelId = "llama-3.2-3b-q4") {
  const response = await fetch(`${API_BASE_URL}/inference/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payload_key: payloadKey,
      model_id: modelId
    })
  });
  
  if (!response.ok) {
    throw new Error('failed to trigger pipeline');
  }
  return response.json();
}

export async function fetchSummary(payloadKey) {
  const summaryKey = payloadKey.replace('raw/', '');
  const response = await fetch(`${API_BASE_URL}/summaries/${summaryKey}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('failed to fetch summary');
  }
  return response.json();
}

export async function fetchAudioUrl(payloadKey) {
  const audioKey = payloadKey.replace('raw/', '').replace('.txt', '');
  const response = await fetch(`${API_BASE_URL}/audio/${audioKey}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('failed to fetch audio url');
  }
  return response.json();
}
