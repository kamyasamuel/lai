import API_BASE_URL from '../../config';

export function sendToChatAPI(message, onMessage, onDone, onError) {
  const wsUrl = import.meta.env.DEV
    ? `${API_BASE_URL.replace('http', 'ws')}/ws/chat`
    : import.meta.env.VITE_WSS_URL;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ message: message }));
  };

  ws.onmessage = (evt) => {
    try {
      const data = JSON.parse(evt.data);

      if (data.content) {
        onMessage(data.content);
      }

      if (data.event === 'done') {
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
