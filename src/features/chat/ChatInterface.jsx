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

  /*const send = async (msg) => {
    const text = msg||input;
    if (!text.trim()) return;
    const userMsg = { text, sender:'user', timestamp:new Date().toISOString() };
    setMessages([...messages, userMsg]);
    setInput(''); setLoading(true);
    try {
      const { response } = await sendToChatAPI(text);
      setMessages(prev => [...prev, { text:response, sender:'ai', timestamp:new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { text:'Error connecting to AI.', sender:'ai', timestamp:new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };*/

  const sendMessage = (text) => {
    if (!text?.trim()) return;
    const userMsg = { text, sender: 'user', timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // open a new WS for this message
    const ws = new WebSocket('ws://localhost:8888/ws/chat');

    // accumulate the AI response in this object
    const aiMsg = { text: '', sender: 'ai', timestamp: Date.now() };

    ws.onopen = () => {
      ws.send(JSON.stringify({ message: { parts: [{ text: text }] } }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        if (data.content) {
          // append the chunk
          aiMsg.text += data.content;
          // update the last AI message in state
          setMessages((prev) => {
            const withoutLast = prev.filter((_, idx) => idx !== prev.length - 1);
            return [...withoutLast, aiMsg];
          });
        }

        if (data.event === 'done') {
          setLoading(false);
          ws.close();
        }

        if (data.error) {
          setLoading(false);
          aiMsg.text = `Error: ${data.error}`;
          setMessages((prev) => {
            const withoutLast = prev.filter((_, idx) => idx !== prev.length - 1);
            return [...withoutLast, aiMsg];
          });
          ws.close();
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error', err);
      setLoading(false);
      ws.close();
    };

    // add a placeholder AI message so UI reserves space
    setMessages((m) => [...m, aiMsg]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const examples = [
    "Explain the difference between a lease and a license.",
    "What clauses should I include in an employment contract?",
    "Summarize the Nigerian Labour Act."
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
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
        {loading && <LoadingIndicator text="🤖 AI is typing..." />}
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
/*/ src/features/chat/ChatInterface.jsx
import React, { useState, useRef } from 'react';
import ChatBubble from '../../components/ChatBubble';
import LoadingIndicator from '../../components/LoadingIndicator';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const endRef                  = useRef(null);

  // scroll to bottom whenever messages update
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text?.trim()) return;
    const userMsg = { text, sender: 'user', timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // open a new WS for this message
    const ws = new WebSocket('ws://localhost:8888/ws/chat');

    // accumulate the AI response in this object
    const aiMsg = { text: '', sender: 'ai', timestamp: Date.now() };

    ws.onopen = () => {
      ws.send(JSON.stringify({ message: text }));
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);

        if (data.content) {
          // append the chunk
          aiMsg.text += data.content;
          // update the last AI message in state
          setMessages((prev) => {
            const withoutLast = prev.filter((_, idx) => idx !== prev.length - 1);
            return [...withoutLast, aiMsg];
          });
        }

        if (data.event === 'done') {
          setLoading(false);
          ws.close();
        }

        if (data.error) {
          setLoading(false);
          aiMsg.text = `Error: ${data.error}`;
          setMessages((prev) => {
            const withoutLast = prev.filter((_, idx) => idx !== prev.length - 1);
            return [...withoutLast, aiMsg];
          });
          ws.close();
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error', err);
      setLoading(false);
      ws.close();
    };

    // add a placeholder AI message so UI reserves space
    setMessages((m) => [...m, aiMsg]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-white p-4">
      <div className="flex-1 w-full max-w-3xl space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">Start the conversation below.</p>
        )}
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} />
        ))}
        {loading && <LoadingIndicator text="🤖 AI is typing..." />}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mt-4">
        <input
          className="flex-1 p-3 rounded-l bg-[#111] text-white border border-[#333]"
          placeholder="Ask a legal question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#8c00cc] px-4 rounded-r disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}*/