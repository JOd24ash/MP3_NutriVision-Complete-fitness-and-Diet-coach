import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { 
  X, 
  Send, 
  Sparkles, 
  BookOpen, 
  ShieldAlert, 
  Bot, 
  User, 
  HelpCircle,
  ExternalLink 
} from 'lucide-react';

export const ChatDrawer = () => {
  const { isChatOpen, setIsChatOpen, user, activeMeal } = useApp();
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Namaste ${user.name?.split(' ')[0] || ''}! I am your ICMR-aligned AI Nutrition Coach. I can analyze your meal photos, advise on glycemic control, portion scaling, and cross-reference your medical profile with official 2024 guidelines.\n\nHow can I help you today?`,
      sources: [
        { title: "ICMR-NIN Dietary Guidelines for Indians (2024)", chunk_ref: "Introductory Note on Individualized Macronutrient Guidance" }
      ],
      guardrail_flags: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Is my current thali safe for my diabetic profile?",
    "How can I hit 100g protein purely on a vegetarian Indian diet?",
    "What is the best cereal-to-pulse ratio recommended by ICMR?",
    "Which low-GI alternatives can I substitute for white rice?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isChatOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setInput('');
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.chat.send(user.id, query);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          sources: res.sources || [],
          guardrail_flags: res.guardrail_flags || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: "I encountered an error querying the guidelines. Please ensure the backend ChromaDB service is initialized.",
          sources: [],
          guardrail_flags: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsChatOpen(false)}>
      <div 
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '86vh',
          maxHeight: '850px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.8)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>ICMR RAG Diet Coach</span>
                <span className="badge badge-ai" style={{ fontSize: '0.65rem' }}>Grounded AI</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active profile: {user.conditions?.join(', ') || 'General Wellness'}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsChatOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Stream */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.map((msg, i) => (
            <div 
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  <Bot size={16} />
                </div>
              )}

              <div style={{
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                fontSize: '0.92rem',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap'
              }}>
                {msg.text}

                {/* Guardrail warnings in response */}
                {msg.guardrail_flags && msg.guardrail_flags.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(245, 158, 11, 0.15)',
                    borderRadius: '6px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--saffron-400)'
                  }}>
                    <ShieldAlert size={14} />
                    <span>Guardrail trigger: {msg.guardrail_flags.join(', ')}</span>
                  </div>
                )}

                {/* ICMR Sources list */}
                {msg.sources && msg.sources.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--violet-400)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={11} />
                      <span>ICMR-NIN RETRIEVAL SOURCES:</span>
                    </div>
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        • <strong>{src.title}</strong> — <em>{src.chunk_ref}</em>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <Bot size={16} />
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem'
              }}>
                Retrieving ICMR nutritional guidelines & formulating response...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(11, 15, 25, 0.5)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              className="btn btn-secondary btn-sm"
              onClick={() => handleSend(q)}
              style={{ fontSize: '0.76rem', padding: '4px 10px', flexShrink: 0 }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything regarding diet, thali macros, or Indian food substitutions..."
            className="text-input"
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button 
            className="btn btn-ai"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
