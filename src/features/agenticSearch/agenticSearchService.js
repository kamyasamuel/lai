import API_BASE_URL from '../../config';

export function sendToAgenticSearchAPI(query, onMessage, onDone, onError) {
  const wsUrl = import.meta.env.DEV
    ? `${API_BASE_URL.replace('http', 'ws')}/ws/agentic-search`
    : import.meta.env.VITE_WSS_URL.replace('/chat', '/agentic-search'); // Adjust for production
  
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ query: query }));
  };

  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onMessage(data); // Pass the whole data object to the handler

      if (data.type === 'event' && data.content === 'done') {
        ws.close();
        if (onDone) onDone();
      }

      if (data.error) {
        ws.close();
        if (onError) onError(data.error);
      }
    } catch (err) {
      if (onError) onError(err);
    }
  };

  ws.onerror = (err) => {
    if (onError) onError(err);
    ws.close();
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
} 