import React, { useEffect, useRef, useState } from 'react';
import { sendToChatAPI } from './chatService';
import { useChatHistory } from './useChatHistory';
import ChatBubble from '../../components/ChatBubble';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { SendHorizontal, Mic } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useChatHistory();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const [listening, startListening] = useSpeechRecognition(setInput);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading]);

  const sendMessage = (text) => {
    if (!text?.trim()) return; 
    const userMsg = { text, sender: 'user', timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    const aiMsg = { text: '', sender: 'ai', timestamp: Date.now() };
    // add a placeholder AI message so UI reserves space
    setMessages((m) => [...m, aiMsg]);

    const onMessage = (content) => {
      aiMsg.text += content;
      setMessages((prev) => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, { ...aiMsg }];
      });
    };

    const onDone = () => {
      setLoading(false);
    };

    const onError = (error) => {
      console.error('WebSocket error:', error);
      aiMsg.text = 'Error: Something went wrong.';
      setMessages((prev) => {
        const withoutLast = prev.slice(0, -1);
        return [...withoutLast, { ...aiMsg }];
      });
      setLoading(false);
    };

    sendToChatAPI(text, onMessage, onDone, onError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const examples = [
    "Explain the difference between a lease and a license.",
    "What clauses should I include in an employment contract?",
    "Summarize the Ugandan Labour Act."
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-white page-container-padding">
      <div className={`w-full max-w-3xl space-y-4 overflow-y-auto ${messages.length > 0 ? 'flex-1' : ''}`}>
        {messages.length===0 && (
          <div className="text-center text-gray-400 mb-6">
            <p className="mb-2">Try one of the following examples:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {examples.map((ex,i)=>(
                <button key={i} onClick={()=>sendMessage(ex)}
                        className="bg-[#2c2c2c] hover:bg-[#3a3a3a] px-3 py-1 rounded-full text-sm">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i)=> <ChatBubble key={i} msg={m}/> )}
        {loading && <LoadingIndicator text="Generating..." />}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mt-4 gap-1 center-items">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="br-2 flex-1 p-3 rounded-l bg-[#111] text-white border border-[#333]"
          placeholder="Ask a legal question..."
        />
        <Mic onClick={startListening} className="pointer" />
        <SendHorizontal 
        onClick={handleSubmit}
        type="submit"
        disabled={loading} className="pointer text-\[\#8c00cc\]" />
      </form>
    </div>
  );
}
