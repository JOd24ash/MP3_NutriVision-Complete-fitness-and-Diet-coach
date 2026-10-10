import React, { useRef, useState } from 'react';
import { Mic, Square, ArrowRight } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

export const VoiceLoggerReal = () => {
  const { user, showToast, setActiveMeal, setActiveTab } = useApp();
  const recorder = useRef(null), chunks = useRef([]); const [recording, setRecording] = useState(false), [seconds, setSeconds] = useState(0), [meal, setMeal] = useState(null);
  const start = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const r = new MediaRecorder(stream); chunks.current = []; r.ondataavailable = e => chunks.current.push(e.data); r.onstop = async () => { stream.getTracks().forEach(track => track.stop()); try { const form = new FormData(); form.append('user_id', user.id); form.append('audio', new Blob(chunks.current, { type: r.mimeType || 'audio/webm' }), 'meal.webm'); setMeal(await api.meals.logVoice(form)); } catch (error) { showToast(error.message, 'danger'); } }; recorder.current = r; r.start(); setSeconds(0); setRecording(true); } catch { showToast('Microphone permission is required.', 'danger'); } };
  React.useEffect(() => { if (!recording) return; const timer = setInterval(() => setSeconds(value => value + 1), 1000); return () => clearInterval(timer); }, [recording]);
  const stop = () => { recorder.current?.stop(); setRecording(false); };
  return <section className="glass-panel" style={{ maxWidth: 720, margin: '0 auto', padding: 28, display: 'grid', gap: 16 }}><h2>Hinglish voice meal log</h2><p>Audio is processed locally by Whisper. Say what you ate, then review the parsed meal.</p><button className="btn btn-primary" onClick={recording ? stop : start}>{recording ? <><Square size={18}/> Stop ({seconds}s)</> : <><Mic size={18}/> Start recording</>}</button>{meal && <><p><strong>Transcript:</strong> {meal.transcript}</p>{meal.needs_manual_review && <p role="alert">Some items need confirmation.</p>}<ul>{meal.items.map(item => <li key={item.id}>{item.food_label.replace(/_/g, ' ')} · {item.est_grams}g · confidence {Math.round((item.confidence || 0) * 100)}%</li>)}</ul><button className="btn btn-primary" onClick={() => { setActiveMeal({...meal, plate_image:'', plate_name:'Voice meal'}); setActiveTab('scan'); }}>Review and confirm <ArrowRight size={16}/></button></>}</section>;
};
