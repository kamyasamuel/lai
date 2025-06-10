import React, { useEffect, useRef, useState } from 'react';
import { sendToAgenticSearchAPI } from './agenticSearchService';
import LoadingIndicator from '../../components/LoadingIndicator';
import { SendHorizontal, Mic } from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';

export default function AgenticSearchInterface() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const endRef = useRef(null);
  const [listening, startListening] = useSpeechRecognition(setInput);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [events, loading]);

  const sendMessage = (text) => {
    if (!text?.trim()) return;
    const userMsg = { type: 'query', content: text, sender: 'user', timestamp: Date.now() };
    setEvents(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let finalAnswer = { type: 'final_answer', content: '', sender: 'ai', timestamp: Date.now() };
    let finalAnswerExists = false;

    const onMessage = (data) => {
      if (data.type === 'final_answer') {
        if (!finalAnswerExists) {
          finalAnswer.timestamp = Date.now();
          setEvents(prev => [...prev, finalAnswer]);
          finalAnswerExists = true;
        }
        finalAnswer.content += data.content;
        setEvents(prev => {
          const updatedEvents = [...prev];
          const lastEvent = updatedEvents[updatedEvents.length - 1];
          if (lastEvent.type === 'final_answer') {
            lastEvent.content = finalAnswer.content;
          }
          return updatedEvents;
        });
      } else {
        setEvents(prev => [...prev, { ...data, sender: 'ai', timestamp: Date.now() }]);
      }
    };

    const onDone = () => setLoading(false);
    const onError = (error) => {
      console.error('WebSocket error:', error);
      const errorMsg = { type: 'error', content: 'Error: Something went wrong.', sender: 'ai', timestamp: Date.now() };
      setEvents(prev => [...prev, errorMsg]);
      setLoading(false);
    };

    sendToAgenticSearchAPI(text, onMessage, onDone, onError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const renderEvent = (event, index) => {
    switch(event.type) {
      case 'query':
        return (
          <div key={index} className="bg-[#111] self-end ml-auto p-3 rounded max-w-md">
            <div className="text-xs text-gray-400 mb-1">🧑 You</div>
            <p>{event.content}</p>
          </div>
        );
      case 'status':
        return <div key={index} className="text-center text-gray-400 text-sm my-2 italic">{event.content}</div>;
      case 'vector_results':
        return (
          <div key={index} className="bg-transparent self-start mr-auto p-3 rounded max-w-md">
             <div className="text-xs text-gray-400 mb-1">🤖 Agent</div>
             <div className="p-2 border border-dashed border-gray-600 rounded">
                <p className="font-semibold mb-1">Found {event.content.length} document(s) in library:</p>
                <ul className="list-disc list-inside text-sm">
                  {event.content.map((item, i) => <li key={i}>{item.title}</li>)}
                </ul>
             </div>
          </div>
        );
      case 'final_answer':
         return (
          <div key={index} className="bg-transparent self-start mr-auto p-3 rounded max-w-md">
            <div className="text-xs text-gray-400 mb-1">🤖 Agent</div>
            <MarkdownRenderer content={event.content} />
          </div>
         );
      case 'error':
        return <div key={index} className="text-center text-red-500 text-sm my-2">{event.content}</div>;
      default:
        return null;
    }
  }

  const examples = [
    "What are the key differences between Ugandan and Kenyan contract law?",
    "Summarize recent developments in AI and intellectual property rights in Africa.",
    "Draft a non-disclosure agreement for a tech startup in Nigeria."
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-white page-container-padding">
      <div className="w-full max-w-3xl flex-1 space-y-4 overflow-y-auto">
        {events.length === 0 && (
          <div className="text-center text-gray-400 h-full flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">Agentic Search</h2>
            <p className="mb-6">Your AI-powered research assistant. Ask complex questions, and the agent will search the document library and the web to provide a comprehensive answer.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {examples.map((ex, i) => (
                <button key={i} onClick={() => sendMessage(ex)}
                  className="bg-[#2c2c2c] hover:bg-[#3a3a3a] px-3 py-1 rounded-full text-sm">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
        {events.map(renderEvent)}
        {loading && <LoadingIndicator text="Agent is thinking..." />}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mt-4 gap-1 center-items">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="br-2 flex-1 p-3 rounded-l bg-[#111] text-white border border-[#333]"
          placeholder="Ask a research question..."
          disabled={loading}
        />
        <Mic onClick={startListening} className={`pointer ${loading ? 'opacity-50' : ''}`} />
        <SendHorizontal 
          onClick={handleSubmit}
          className={`pointer text-\\[#8c00cc] ${loading ? 'opacity-50' : ''}`}
        />
      </form>
    </div>
  );
} 