// 'use client';
// import { useState, useRef, useEffect } from 'react';

// const VOICE_OPTIONS = [
//   { label: 'Natalie (USA)', value: 'en-US-natalie' },
//   { label: 'Terrell (USA)', value: 'en-US-terrell' },
//   { label: 'Ariana (USA)', value: 'en-US-ariana' },
//   { label: 'Miles (USA)', value: 'en-US-miles' },
//   { label: 'Zion (USA)', value: 'en-US-zion' },
//   { label: 'Amara (USA)', value: 'en-US-amara' },
// ];

// export default function Home() {
//   // State for TTS
//   const [text, setText] = useState('');
//   const [voiceId, setVoiceId] = useState('');
//   const [audioUrl, setAudioUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [toast, setToast] = useState('');
//   const audioRef = useRef(null);

//   // State for Echo Bot
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedAudioURL, setRecordedAudioURL] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   // Effect for playing TTS audio
//   useEffect(() => {
//     if (audioUrl && audioRef.current) {
//       audioRef.current.play().catch(e => console.error("Audio play failed:", e));
//     }
//   }, [audioUrl]);

//   // Effect for toast notifications
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(''), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // TTS Handler
//   const handleGenerate = async () => {
//     if (!text.trim() || !voiceId) {
//       alert('Please enter text and choose a voice.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     setAudioUrl('');
//     setToast('Generating audio...');
//     try {
//       const res = await fetch('/api/tts', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text, voiceId }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Server error');
//       setAudioUrl(data.audioFile); // Assuming the API returns audioFile
//       setToast('✅ Audio generated!');
//       setText('');
//     } catch (err) {
//       setError(err.message);
//       setToast('❌ Failed to generate audio');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Echo Bot Handlers
//   const handleStartRecording = async () => {
//     setRecordedAudioURL('');
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setRecordedAudioURL(audioUrl);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//       setToast('🎙️ Recording started...');
//     } catch (err) {
//       console.error("Error starting recording:", err);
//       setError("Microphone access was denied. Please allow microphone access in your browser settings.");
//       setToast('❌ Mic access denied');
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
//       setToast('✅ Recording stopped.');
//     }
//   };


//   return (
//     <>
//       <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12">
//         {/* TTS Section */}
//         <div className="w-full max-w-md bg-gray-900/50 border border-cyan-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10">
//           <h1 className="text-3xl font-extrabold tracking-tight text-center text-[#00ffe5] drop-shadow-[0_0_20px_#00ffe5] animate-pulse">
//             Voice Agent
//           </h1>
//           <textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             rows={5}
//             className="w-full p-3 rounded-xl bg-gray-800/70 text-white border border-gray-600 focus:ring-2 focus:ring-[#00ffe5] focus:outline-none transition resize-none shadow-inner"
//             placeholder="Your Text..."
//           />
//           <div className="relative">
//             <select
//               value={voiceId}
//               onChange={(e) => setVoiceId(e.target.value)}
//               className={`w-full appearance-none p-3 pr-10 rounded-xl bg-gray-800/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00ffe5] transition cursor-pointer ${voiceId ? 'text-white' : 'text-gray-400'}`}
//             >
//               <option value="" disabled>Choose a Voice</option>
//               {VOICE_OPTIONS.map((voice) => (
//                 <option key={voice.value} value={voice.value} className="bg-gray-900 text-white">
//                   {voice.label}
//                 </option>
//               ))}
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
//             </div>
//           </div>
//           <button
//             onClick={handleGenerate}
//             disabled={loading || !text.trim() || !voiceId}
//             className="w-full flex items-center justify-center px-6 py-3 bg-[#00ffe5] text-black text-base font-bold rounded-xl shadow-[0_0_20px_#00ffe5] hover:shadow-[0_0_30px_#00ffe5] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed hover:scale-105 active:scale-95"
//           >
//             {loading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : 'Generate Audio'}
//           </button>
//           <div className="pt-2 min-h-[56px]">
//             {error && (<div className="bg-red-900/50 border border-red-500/30 text-red-300 p-2.5 rounded-xl text-center text-sm">⚠️ <span className="font-semibold">Error:</span> {error}</div>)}
//             {audioUrl && (<div className="w-full animate-fade-in"><audio ref={audioRef} controls className="w-full"><source src={audioUrl} type="audio/mpeg" />Your browser does not support the audio element.</audio></div>)}
//           </div>
//         </div>

//         {/* Echo Bot Section */}
//         <div className="w-full max-w-md bg-gray-900/50 border border-cyan-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10 mt-8">
//             <h1 className="text-2xl font-bold tracking-tight text-center text-[#00ffe5] drop-shadow-[0_0_10px_#00ffe5]">
//                 Echo Bot
//             </h1>
//             <p className="text-center text-gray-400 text-sm">Record your voice and play it back.</p>
//             <div className="flex items-center justify-center space-x-4">
//                 <button
//                     onClick={handleStartRecording}
//                     disabled={isRecording}
//                     className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-[0_0_20px_#10B981] hover:shadow-[0_0_30px_#10B981] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
//                 >
//                     Start Recording
//                 </button>
//                 <button
//                     onClick={handleStopRecording}
//                     disabled={!isRecording}
//                     className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_#EF4444] hover:shadow-[0_0_30px_#EF4444] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
//                 >
//                     Stop Recording
//                 </button>
//             </div>
//             <div className="pt-2 min-h-[56px]">
//                 {recordedAudioURL && (
//                     <div className="w-full animate-fade-in">
//                         <audio controls className="w-full" src={recordedAudioURL}>
//                             Your browser does not support the audio element.
//                         </audio>
//                     </div>
//                 )}
//             </div>
//         </div>
//       </main>
      
//       {/* Toast Notification */}
//       {toast && (<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#00ffe5] text-black font-bold px-5 py-2.5 rounded-full shadow-lg shadow-cyan-400/50 animate-fade-in z-50 text-sm">{toast}</div>)}
//     </>
//   );
// }

// 'use client';
// import { useState, useRef, useEffect } from 'react';

// const VOICE_OPTIONS = [
//   { label: 'Natalie (USA)', value: 'en-US-natalie' },
//   { label: 'Terrell (USA)', value: 'en-US-terrell' },
//   { label: 'Ariana (USA)', value: 'en-US-ariana' },
//   { label: 'Miles (USA)', value: 'en-US-miles' },
//   { label: 'Zion (USA)', value: 'en-US-zion' },
//   { label: 'Amara (USA)', value: 'en-US-amara' },
// ];

// export default function Home() {
//   // State for TTS
//   const [text, setText] = useState('');
//   const [voiceId, setVoiceId] = useState('');
//   const [audioUrl, setAudioUrl] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [toast, setToast] = useState('');
//   const audioRef = useRef(null);

//   // State for Echo Bot v2
//   const [isRecording, setIsRecording] = useState(false);
//   const [echoLoading, setEchoLoading] = useState(false);
//   const [echoAudioUrl, setEchoAudioUrl] = useState('');
//   const [transcribedText, setTranscribedText] = useState('');
//   const [echoError, setEchoError] = useState('');
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const echoAudioRef = useRef(null);

//   // --- NEW: State for LLM Agent ---
//   const [isLLMRecording, setIsLLMRecording] = useState(false);
//   const [isLLMProcessing, setIsLLMProcessing] = useState(false);
//   const [llmError, setLlmError] = useState('');
//   const [userQuery, setUserQuery] = useState('');
//   const [llmResponse, setLlmResponse] = useState('');
//   const [llmAudioUrl, setLlmAudioUrl] = useState('');
//   const llmAudioRef = useRef(null);

//   // Effect for playing TTS audio
//   useEffect(() => {
//     if (audioUrl && audioRef.current) {
//       audioRef.current.play().catch(e => console.error("Audio play failed:", e));
//     }
//   }, [audioUrl]);

//   // Effect for playing Echo Bot audio
//   useEffect(() => {
//     if (echoAudioUrl && echoAudioRef.current) {
//         echoAudioRef.current.play().catch(e => console.error("Echo audio play failed:", e));
//     }
//   }, [echoAudioUrl]);

//   // --- NEW: Effect for playing LLM audio ---
//   useEffect(() => {
//     if (llmAudioUrl && llmAudioRef.current) {
//         llmAudioRef.current.play().catch(e => console.error("LLM audio play failed:", e));
//     }
//   }, [llmAudioUrl]);

//   // Effect for toast notifications
//   useEffect(() => {
//     if (toast) {
//       const timer = setTimeout(() => setToast(''), 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [toast]);

//   // TTS Handler
//   const handleGenerate = async () => {
//     if (!text.trim() || !voiceId) {
//       setError('Please enter text and choose a voice.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     setAudioUrl('');
//     setToast('Generating audio...');
//     try {
//       const res = await fetch('/api/tts', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ text, voiceId }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || 'Server error');
//       setAudioUrl(data.audioFile); // Using the correct key 'audioFile'
//       setToast('✅ Audio generated!');
//       setText('');
//     } catch (err) {
//       setError(err.message);
//       setToast('❌ Failed to generate audio');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Echo Bot Handlers
//   const handleStartRecording = async () => {
//     setEchoAudioUrl('');
//     setTranscribedText('');
//     setEchoError('');
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
//       audioChunksRef.current = [];
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) audioChunksRef.current.push(event.data);
//       };
//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//       setToast('🎙️ Recording started...');
//     } catch (err) {
//       setEchoError("Microphone access was denied.");
//       setToast('❌ Mic access denied');
//     }
//   };

//   const handleStopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
//         setEchoLoading(true);
//         setEchoError('');
//         setToast('🤖 Transcribing & generating echo...');
//         const formData = new FormData();
//         formData.append('audio', audioBlob, 'recording.webm');
//         try {
//           const res = await fetch('/api/tts/echo', { method: 'POST', body: formData });
//           const result = await res.json();
//           if (!res.ok) throw new Error(result.error || 'Failed to generate echo.');
//           setTranscribedText(result.transcript);
//           setEchoAudioUrl(result.audioUrl);
//           setToast('✅ Echo generated successfully!');
//         } catch (err) {
//           const errorMessage = err.message || "An unknown error occurred.";
//           setEchoError(errorMessage);
//           setToast(`❌ Error: ${errorMessage}`);
//         } finally {
//           setEchoLoading(false);
//         }
//       };
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//       setIsRecording(false);
//     }
//   };

//   // --- NEW: Handlers for LLM Agent ---
//   const handleLLMStartRecording = async () => {
//     setUserQuery('');
//     setLlmResponse('');
//     setLlmAudioUrl('');
//     setLlmError('');
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
//       audioChunksRef.current = [];
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) audioChunksRef.current.push(event.data);
//       };
//       mediaRecorderRef.current.start();
//       setIsLLMRecording(true);
//       setToast('🎙️ Oracle is listening...');
//     } catch (err) {
//       setLlmError('Microphone access denied.');
//       setIsLLMRecording(false);
//     }
//   };

//   const handleLLMStopRecording = () => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       setIsLLMRecording(false);
//       mediaRecorderRef.current.onstop = async () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
//         setIsLLMProcessing(true);
//         setToast('🤔 Oracle is thinking...');

//         const formData = new FormData();
//         formData.append('audio', audioBlob, 'recording.webm');
        
//         try {
//           const res = await fetch('/api/llm/query', { method: 'POST', body: formData });
//           const result = await res.json();
//           if (!res.ok) throw new Error(result.error || "An unknown error occurred.");
          
//           setUserQuery(result.userQuery);
//           setLlmResponse(result.llmResponse);
//           setLlmAudioUrl(result.audioUrl);
//           setToast('✅ Oracle has responded.');

//         } catch (err) {
//           setLlmError(err.message);
//         } finally {
//           setIsLLMProcessing(false);
//         }
//       };
//       mediaRecorderRef.current.stop();
//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     }
//   };

//   return (
//     <>
//       <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 space-y-8">
        
//         {/* TTS Section */}
//         <div className="w-full max-w-md bg-gray-900/50 border border-cyan-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10">
//           <h1 className="text-3xl font-extrabold tracking-tight text-center text-[#00ffe5] drop-shadow-[0_0_20px_#00ffe5] animate-pulse">
//             Voice Agent
//           </h1>
//           <textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             rows={5}
//             className="w-full p-3 rounded-xl bg-gray-800/70 text-white border border-gray-600 focus:ring-2 focus:ring-[#00ffe5] focus:outline-none transition resize-none shadow-inner"
//             placeholder="Your Text..."
//           />
//           <div className="relative">
//             <select
//               value={voiceId}
//               onChange={(e) => setVoiceId(e.target.value)}
//               className={`w-full appearance-none p-3 pr-10 rounded-xl bg-gray-800/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00ffe5] transition cursor-pointer ${voiceId ? 'text-white' : 'text-gray-400'}`}
//             >
//               <option value="" disabled>Choose a Voice</option>
//               {VOICE_OPTIONS.map((voice) => (
//                 <option key={voice.value} value={voice.value} className="bg-gray-900 text-white">
//                   {voice.label}
//                 </option>
//               ))}
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
//               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
//             </div>
//           </div>
//           <button
//             onClick={handleGenerate}
//             disabled={loading || !text.trim() || !voiceId}
//             className="w-full flex items-center justify-center px-6 py-3 bg-[#00ffe5] text-black text-base font-bold rounded-xl shadow-[0_0_20px_#00ffe5] hover:shadow-[0_0_30px_#00ffe5] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed hover:scale-105 active:scale-95"
//           >
//             {loading ? (<> ...Loading SVG... </>) : 'Generate Audio'}
//           </button>
//           <div className="pt-2 min-h-[56px]">
//             {error && (<div className="bg-red-900/50 ...">⚠️ <span className="font-semibold">Error:</span> {error}</div>)}
//             {audioUrl && (<div className="w-full animate-fade-in"><audio ref={audioRef} controls className="w-full" src={audioUrl} /></div>)}
//           </div>
//         </div>

//         {/* Echo Bot Section */}
//         <div className="w-full max-w-md bg-gray-900/50 border border-purple-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-purple-500/10">
//             <h2 className="text-2xl font-bold tracking-tight text-center text-[#d8b4fe] drop-shadow-[0_0_10px_#d8b4fe]">
//                 Echo Bot v2
//             </h2>
//             <p className="text-center text-gray-400 text-sm">I'll repeat what you say in my voice.</p>
//             <div className="flex items-center justify-center space-x-4">
//                 <button onClick={handleStartRecording} disabled={isRecording || echoLoading} className="w-36 ...">
//                     {isRecording ? 'Recording...' : 'Start Record'}
//                 </button>
//                 <button onClick={handleStopRecording} disabled={!isRecording || echoLoading} className="w-36 ...">
//                     Stop Record
//                 </button>
//             </div>
//             <div className="pt-2 min-h-[120px] flex flex-col justify-center items-center space-y-3">
//                 {echoLoading && ( <div className="text-center ...">Generating Echo...</div> )}
//                 {echoError && ( <div className="w-full ...">⚠️ <span>Error:</span> {echoError}</div> )}
//                 {transcribedText && !echoError && !echoLoading && (
//                   <div className="w-full ...">You said: &quot;{transcribedText}&quot;</div>
//                 )}
//                 {echoAudioUrl && (
//                     <div className="w-full ...">
//                         <audio ref={echoAudioRef} controls className="w-full" src={echoAudioUrl} />
//                     </div>
//                 )}
//             </div>
//         </div>

//         {/* --- NEW: LLM Conversational Agent Section --- */}
//         <div className="w-full max-w-md bg-gray-900/50 border border-amber-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-amber-500/10">
//             <h2 className="text-2xl font-bold tracking-tight text-center text-[#fbbF24] drop-shadow-[0_0_10px_#fbbF24]">
//                 The Oracle
//             </h2>
//             <p className="text-center text-gray-400 text-sm">Ask me anything.</p>
//             <div className="flex items-center justify-center space-x-4">
//                 <button
//                     onClick={handleLLMStartRecording}
//                     disabled={isLLMRecording || isLLMProcessing}
//                     className="w-36 px-4 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_#3b82f6] hover:shadow-[0_0_30px_#3b82f6] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
//                 >
//                     {isLLMRecording ? 'Listening...' : 'Ask Question'}
//                 </button>
//                 <button
//                     onClick={handleLLMStopRecording}
//                     disabled={!isLLMRecording || isLLMProcessing}
//                     className="w-36 px-4 py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_#ef4444] hover:shadow-[0_0_30px_#ef4444] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
//                 >
//                     Stop
//                 </button>
//             </div>
//             <div className="pt-2 min-h-[150px] flex flex-col justify-center items-center space-y-3">
//               {isLLMProcessing ? (
//                 <div className="text-center animate-pulse text-amber-300 flex items-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
//                     Oracle is thinking...
//                 </div>
//               ) : (
//                 <>
//                   {llmError && <div className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-lg">{llmError}</div>}
//                   {llmResponse ? (
//                     <div className="w-full space-y-4 text-sm animate-fade-in">
//                       <p className="p-3 bg-blue-900/50 rounded-lg border border-blue-700"><strong>You:</strong> {userQuery}</p>
//                       <p className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"><strong>Oracle:</strong> {llmResponse}</p>
//                       {llmAudioUrl && <audio ref={llmAudioRef} controls className="w-full mt-2" src={llmAudioUrl} />}
//                     </div>
//                   ) : (
//                     <p className="text-gray-500">The Oracle awaits your query.</p>
//                   )}
//                 </>
//               )}
//             </div>
//         </div>
//       </main>
      
//       {/* Toast Notification */}
//       {toast && (<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#00ffe5] text-black font-bold px-5 py-2.5 rounded-full shadow-lg shadow-cyan-400/50 animate-fade-in z-50 text-sm">{toast}</div>)}
//     </>
//   );
// }

'use client';
import { useState, useRef, useEffect } from 'react';

const VOICE_OPTIONS = [
  { label: 'Natalie (USA)', value: 'en-US-natalie' },
  { label: 'Terrell (USA)', value: 'en-US-terrell' },
  { label: 'Ariana (USA)', value: 'en-US-ariana' },
  { label: 'Miles (USA)', value: 'en-US-miles' },
  { label: 'Zion (USA)', value: 'en-US-zion' },
  { label: 'Amara (USA)', value: 'en-US-amara' },
];

export default function Home() {
  // State for TTS
  const [text, setText] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const audioRef = useRef(null);

  // State for Echo Bot v2
  const [isRecording, setIsRecording] = useState(false);
  const [echoLoading, setEchoLoading] = useState(false);
  const [echoAudioUrl, setEchoAudioUrl] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [echoError, setEchoError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const echoAudioRef = useRef(null);

  // --- NEW: State for LLM Agent ---
  const [isLLMRecording, setIsLLMRecording] = useState(false);
  const [isLLMProcessing, setIsLLMProcessing] = useState(false);
  const [llmError, setLlmError] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [llmResponse, setLlmResponse] = useState('');
  const [llmAudioUrl, setLlmAudioUrl] = useState('');
  const llmAudioRef = useRef(null);

  // Effect for playing TTS audio
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [audioUrl]);

  // Effect for playing Echo Bot audio
  useEffect(() => {
    if (echoAudioUrl && echoAudioRef.current) {
        echoAudioRef.current.play().catch(e => console.error("Echo audio play failed:", e));
    }
  }, [echoAudioUrl]);

  // --- NEW: Effect for playing LLM audio ---
  useEffect(() => {
    if (llmAudioUrl && llmAudioRef.current) {
        llmAudioRef.current.play().catch(e => console.error("LLM audio play failed:", e));
    }
  }, [llmAudioUrl]);

  // Effect for toast notifications
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // TTS Handler
  const handleGenerate = async () => {
    if (!text.trim() || !voiceId) {
      setError('Please enter text and choose a voice.');
      return;
    }
    setLoading(true);
    setError('');
    setAudioUrl('');
    setToast('Generating audio...');
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setAudioUrl(data.audioFile); // Using the correct key 'audioFile'
      setToast('✅ Audio generated!');
      setText('');
    } catch (err) {
      setError(err.message);
      setToast('❌ Failed to generate audio');
    } finally {
      setLoading(false);
    }
  };

  // Echo Bot Handlers
  const handleStartRecording = async () => {
    setEchoAudioUrl('');
    setTranscribedText('');
    setEchoError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setToast('🎙️ Recording started...');
    } catch (err) {
      setEchoError("Microphone access was denied.");
      setToast('❌ Mic access denied');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setEchoLoading(true);
        setEchoError('');
        setToast('🤖 Transcribing & generating echo...');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        try {
          const res = await fetch('/api/tts/echo', { method: 'POST', body: formData });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Failed to generate echo.');
          setTranscribedText(result.transcript);
          setEchoAudioUrl(result.audioUrl);
          setToast('✅ Echo generated successfully!');
        } catch (err) {
          const errorMessage = err.message || "An unknown error occurred.";
          setEchoError(errorMessage);
          setToast(`❌ Error: ${errorMessage}`);
        } finally {
          setEchoLoading(false);
        }
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // --- NEW: Handlers for LLM Agent ---
  const handleLLMStartRecording = async () => {
    setUserQuery('');
    setLlmResponse('');
    setLlmAudioUrl('');
    setLlmError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.start();
      setIsLLMRecording(true);
      setToast('🎙️ Oracle is listening...');
    } catch (err) {
      setLlmError('Microphone access denied.');
      setIsLLMRecording(false);
    }
  };

  const handleLLMStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsLLMRecording(false);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setIsLLMProcessing(true);
        setToast('🤔 Oracle is thinking...');

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        try {
          const res = await fetch('/api/llm/query', { method: 'POST', body: formData });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "An unknown error occurred.");
          
          setUserQuery(result.userQuery);
          setLlmResponse(result.llmResponse);
          setLlmAudioUrl(result.audioUrl);
          setToast('✅ Oracle has responded.');

        } catch (err) {
          setLlmError(err.message);
        } finally {
          setIsLLMProcessing(false);
        }
      };
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <>
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 space-y-8">
        
        {/* TTS Section */}
        <div className="w-full max-w-xl bg-gray-900/50 border border-cyan-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-cyan-500/10"> {/* CHANGED */}
          <h1 className="text-3xl font-extrabold tracking-tight text-center text-[#00ffe5] drop-shadow-[0_0_20px_#00ffe5] animate-pulse">
            Voice Agent
          </h1>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-xl bg-gray-800/70 text-white border border-gray-600 focus:ring-2 focus:ring-[#00ffe5] focus:outline-none transition resize-none shadow-inner"
            placeholder="Your Text..."
          />
          <div className="relative">
            <select
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className={`w-full appearance-none p-3 pr-10 rounded-xl bg-gray-800/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00ffe5] transition cursor-pointer ${voiceId ? 'text-white' : 'text-gray-400'}`}
            >
              <option value="" disabled>Choose a Voice</option>
              {VOICE_OPTIONS.map((voice) => (
                <option key={voice.value} value={voice.value} className="bg-gray-900 text-white">
                  {voice.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim() || !voiceId}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#00ffe5] text-black text-base font-bold rounded-xl shadow-[0_0_20px_#00ffe5] hover:shadow-[0_0_30px_#00ffe5] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {loading ? ( <>{/* ...Loading SVG... */} </> ) : 'Generate Audio'}
          </button>
          <div className="pt-2 min-h-[56px]">
            {error && (<div className="bg-red-900/50 ...">⚠️ <span className="font-semibold">Error:</span> {error}</div>)}
            {audioUrl && (<div className="w-full animate-fade-in"><audio ref={audioRef} controls className="w-full" src={audioUrl} /></div>)}
          </div>
        </div>

        {/* Echo Bot Section */}
        <div className="w-full max-w-xl bg-gray-900/50 border border-purple-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-purple-500/10"> {/* CHANGED */}
            <h2 className="text-2xl font-bold tracking-tight text-center text-[#d8b4fe] drop-shadow-[0_0_10px_#d8b4fe]">
                Echo Bot v2
            </h2>
            <p className="text-center text-gray-400 text-sm">I'll repeat what you say in my voice.</p>
            <div className="flex items-center justify-center space-x-4">
                <button onClick={handleStartRecording} disabled={isRecording || echoLoading} className="w-36 ...">
                    {isRecording ? 'Recording...' : 'Start Record'}
                </button>
                <button onClick={handleStopRecording} disabled={!isRecording || echoLoading} className="w-36 ...">
                    Stop Record
                </button>
            </div>
            <div className="pt-2 min-h-[120px] flex flex-col justify-center items-center space-y-3">
                {echoLoading && ( <div className="text-center ...">Generating Echo...</div> )}
                {echoError && ( <div className="w-full ...">⚠️ <span>Error:</span> {echoError}</div> )}
                {transcribedText && !echoError && !echoLoading && (
                  <div className="w-full ...">You said: &quot;{transcribedText}&quot;</div>
                )}
                {echoAudioUrl && (
                    <div className="w-full ...">
                        <audio ref={echoAudioRef} controls className="w-full" src={echoAudioUrl} />
                    </div>
                )}
            </div>
        </div>

        {/* --- NEW: LLM Conversational Agent Section --- */}
        <div className="w-full max-w-xl bg-gray-900/50 border border-amber-400/20 rounded-2xl p-6 space-y-4 shadow-lg shadow-amber-500/10"> {/* CHANGED */}
            <h2 className="text-2xl font-bold tracking-tight text-center text-[#fbbF24] drop-shadow-[0_0_10px_#fbbF24]">
                The Oracle
            </h2>
            <p className="text-center text-gray-400 text-sm">Ask me anything.</p>
            <div className="flex items-center justify-center space-x-4">
                <button
                    onClick={handleLLMStartRecording}
                    disabled={isLLMRecording || isLLMProcessing}
                    className="w-36 px-4 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_#3b82f6] hover:shadow-[0_0_30px_#3b82f6] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {isLLMRecording ? 'Listening...' : 'Ask Question'}
                </button>
                <button
                    onClick={handleLLMStopRecording}
                    disabled={!isLLMRecording || isLLMProcessing}
                    className="w-36 px-4 py-3 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_#ef4444] hover:shadow-[0_0_30px_#ef4444] transition-all duration-300 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    Stop
                </button>
            </div>
            <div className="pt-2 min-h-[150px] flex flex-col justify-center items-center space-y-3">
              {isLLMProcessing ? (
                <div className="text-center animate-pulse text-amber-300 flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Oracle is thinking...
                </div>
              ) : (
                <>
                  {llmError && <div className="text-red-400 text-sm text-center p-2 bg-red-900/30 rounded-lg">{llmError}</div>}
                  {llmResponse ? (
                    <div className="w-full space-y-4 text-sm animate-fade-in">
                      <p className="p-3 bg-blue-900/50 rounded-lg border border-blue-700"><strong>You:</strong> {userQuery}</p>
                      <p className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"><strong>Oracle:</strong> {llmResponse}</p>
                      {llmAudioUrl && <audio ref={llmAudioRef} controls className="w-full mt-2" src={llmAudioUrl} />}
                    </div>
                  ) : (
                    <p className="text-gray-500">The Oracle awaits your query.</p>
                  )}
                </>
              )}
            </div>
        </div>
      </main>
      
      {/* Toast Notification */}
      {toast && (<div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#00ffe5] text-black font-bold px-5 py-2.5 rounded-full shadow-lg shadow-cyan-400/50 animate-fade-in z-50 text-sm">{toast}</div>)}
    </>
  );
}