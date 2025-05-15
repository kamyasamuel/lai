import { useState } from 'react';
export function useSpeechRecognition(onResult) {
  const [listening, setListening] = useState(false);
  const start = () => {
    if (!window.webkitSpeechRecognition) return;
    const rec = new window.webkitSpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    rec.start();
    setListening(true);
    rec.onend = () => setListening(false);
  };
  return [listening, start];
}