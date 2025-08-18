
// 'use client';
// import { useState, useRef, useEffect } from 'react';
// import { v4 as uuidv4 } from 'uuid';

// // --- SVG Icon Components (Your components are great, no changes needed) ---
// const MicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" /></svg> );
// const StopIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3-3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" /></svg> );
// const LoadingSpinner = () => ( <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
// const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>);
// const SidebarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>);

// // --- Sidebar Component (No changes needed) ---
// const Sidebar = ({ conversations, onSelectChat, onNewChat, activeId, isOpen }) => (
//     <div className={`flex flex-col h-full bg-gray-900/70 border-r border-amber-400/20 p-4 transition-all duration-300 ${isOpen ? 'w-full max-w-xs' : 'w-0 p-0 overflow-hidden'}`}>
//         <button onClick={onNewChat} className="flex items-center justify-center gap-2 w-full p-2 mb-4 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors shrink-0">
//             <PlusIcon /> New Chat
//         </button>
//         <div className="flex-grow overflow-y-auto pr-2 chat-scrollbar">
//             <h2 className="text-lg font-semibold text-gray-400 mb-2 shrink-0">History</h2>
//             <div className="flex flex-col gap-2">
//                 {Object.keys(conversations).map(id => (
//                     <button 
//                         key={id} 
//                         onClick={() => onSelectChat(id)}
//                         className={`p-2 text-left rounded-lg truncate text-sm transition-colors w-full shrink-0 ${activeId === id ? 'bg-amber-500/30 text-amber-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
//                     >
//                         {conversations[id].messages[0]?.content || "New Conversation"}
//                     </button>
//                 ))}
//             </div>
//         </div>
//     </div>
// );


// export default function Home() {
//   // --- State Management ---
//   const [conversations, setConversations] = useState({});
//   const [activeConversationId, setActiveConversationId] = useState(null);
//   const [agentStatus, setAgentStatus] = useState('idle'); // idle, listening, thinking, speaking
//   const [llmError, setLlmError] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
//   // --- Refs ---
//   const mediaRecorderRef = useRef(null);
//   const wsRef = useRef(null); // WebSocket reference
//   const llmAudioRef = useRef(null);
//   const chatContainerRef = useRef(null);

//   // --- localStorage Hooks ---
//   useEffect(() => {
//     const savedHistory = localStorage.getItem('oracle-chat-history');
//     if (savedHistory) {
//       setConversations(JSON.parse(savedHistory));
//     }
//   }, []);

//   useEffect(() => {
//     // Only save if there's something to save
//     if (Object.keys(conversations).length > 0) {
//       localStorage.setItem('oracle-chat-history', JSON.stringify(conversations));
//     }
//   }, [conversations]);
  
//   // --- Audio Playback Hook ---
//   useEffect(() => {
//     const playAudio = async (audioUrl) => {
//       if (audioUrl && llmAudioRef.current) {
//         try {
//           llmAudioRef.current.src = audioUrl;
//           llmAudioRef.current.load();
//           await llmAudioRef.current.play();
//           setAgentStatus('speaking');
//         } catch (err) {
//           console.error("Audio play failed:", err);
//           setLlmError("Audio playback failed. The browser may have blocked it.");
//           setAgentStatus('idle');
//         }
//       }
//     };

//     const conversation = activeConversationId ? conversations[activeConversationId] : null;
//     if (agentStatus === 'thinking' && conversation?.audioUrl) {
//       playAudio(conversation.audioUrl);
//     }
//   }, [conversations, activeConversationId, agentStatus]);

//   // --- Handlers ---
//   const handleNewChat = () => { setActiveConversationId(null); setLlmError(''); setAgentStatus('idle'); };
//   const handleSelectChat = (id) => { setActiveConversationId(id); setLlmError(''); setAgentStatus('idle'); };

//   const startRecording = async () => {
//     setLlmError('');
//     setAgentStatus('listening');
    
//     try {
//       // 1. Get Microphone Permissions
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });

//       // 2. Establish WebSocket Connection
//       // Note: Make sure your WebSocket server is running on ws://localhost:8080
//       wsRef.current = new WebSocket('ws://localhost:8080');

//       wsRef.current.onopen = () => {
//         console.log("WebSocket connection established.");
//         // Start recording and streaming in 1-second chunks
//         mediaRecorderRef.current.start(1000); 
//       };

//       wsRef.current.onerror = (error) => {
//         console.error("WebSocket Error:", error);
//         setLlmError("Connection to the server failed.");
//         setAgentStatus('idle');
//       };

//       wsRef.current.onclose = () => {
//         console.log("WebSocket connection closed.");
//         // Stop the microphone tracks to release the resource
//         mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
//       };

//       // 4. Handle incoming messages from the server (the final result)
//       wsRef.current.onmessage = (event) => {
//         const result = JSON.parse(event.data);

//         if (result.error) {
//            setLlmError(result.error);
//            setAgentStatus('idle');
//            return;
//         }

//         const userMessage = { role: 'user', content: result.userQuery };
//         const assistantMessage = { role: 'assistant', content: result.llmResponse };
        
//         const currentId = activeConversationId || uuidv4();
//         const currentMessages = activeConversationId ? conversations[currentId].messages : [];
//         const newMessages = [...currentMessages, userMessage, assistantMessage];

//         setConversations(prev => ({
//           ...prev,
//           [currentId]: { messages: newMessages, audioUrl: result.audioUrl }
//         }));
        
//         if (!activeConversationId) {
//             setActiveConversationId(currentId);
//         }
//       };

//       // 3. Send audio chunks to the server as they become available
//       mediaRecorderRef.current.ondataavailable = event => {
//         if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
//           wsRef.current.send(event.data);
//         }
//       };
      
//     } catch (err) {
//       console.error("Microphone access error:", err);
//       setLlmError('Microphone access denied. Please allow microphone permissions.');
//       setAgentStatus('idle');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current?.state === 'recording') {
//       mediaRecorderRef.current.stop();
//       setAgentStatus('thinking'); // Transition to thinking state immediately
//     }
//     // The connection will be closed by the onclose handler after the stream ends
//     if (wsRef.current?.readyState === WebSocket.OPEN) {
//         wsRef.current.close();
//     }
//   };

//   const handleToggleRecording = () => {
//     if (agentStatus === 'idle' || agentStatus === 'speaking') {
//       startRecording();
//     } else if (agentStatus === 'listening') {
//       stopRecording();
//     }
//   };

//   const handleAudioPlaybackEnd = () => setAgentStatus('idle');
  
//   const getButtonAppearance = () => {
//     switch (agentStatus) {
//       case 'listening': return 'bg-red-500 shadow-[0_0_25px_#ef4444] animate-pulse';
//       case 'thinking': return 'bg-amber-500 cursor-not-allowed';
//       case 'speaking': return 'bg-green-500 shadow-[0_0_25px_#22c55e]';
//       default: return 'bg-blue-600 hover:bg-blue-500';
//     }
//   };

//   const currentMessages = activeConversationId ? conversations[activeConversationId]?.messages : [];

//   return (
//     <main className="h-screen bg-black text-white flex">
//       <Sidebar 
//         conversations={conversations} 
//         onSelectChat={handleSelectChat} 
//         onNewChat={handleNewChat}
//         activeId={activeConversationId}
//         isOpen={isSidebarOpen}
//       />
//       <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
//         <button 
//           onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
//           className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors z-20"
//           aria-label="Toggle Sidebar"
//         >
//           <SidebarIcon />
//         </button>
        
//         <div className="w-full max-w-3xl h-full flex flex-col bg-gray-900/40 border border-amber-400/30 rounded-3xl p-6 shadow-[0_0_30px_#fbbf24]/20 text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight text-[#fBBF24] drop-shadow-[0_0_20px_#fBBF24] mb-4">The Oracle</h1>
          
//           <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 text-left p-2 chat-scrollbar">
//             {currentMessages && currentMessages.length > 0 ? (
//               currentMessages.map((msg, index) => (
//                 <div key={index} className={`flex w-full animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <p className={`max-w-xl p-4 rounded-xl shadow-lg text-base ${msg.role === 'user' ? 'bg-blue-900/50' : 'bg-gray-800/50'}`}>
//                     {msg.content}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="h-full flex items-center justify-center">
//                 <p className="text-gray-500 text-lg italic">
//                    {llmError || "Press the microphone to speak with The Oracle."}
//                 </p>
//               </div>
//             )}
//             {agentStatus === 'thinking' && (
//                 <div className="flex justify-start animate-fade-in">
//                     <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-xl">
//                         <LoadingSpinner />
//                         <span className="text-base text-gray-300">The Oracle is thinking...</span>
//                     </div>
//                 </div>
//             )}
//           </div>
          
//           <div className='flex justify-center pt-6'>
//             <button
//               onClick={handleToggleRecording}
//               disabled={agentStatus === 'thinking'}
//               className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out ${getButtonAppearance()}`}
//               aria-label={agentStatus === 'listening' ? 'Stop Recording' : 'Start Recording'}
//             >
//               {agentStatus === 'thinking' ? <LoadingSpinner /> : (agentStatus === 'listening' ? <StopIcon /> : <MicIcon />)}
//             </button>
//           </div>
//         </div>
//       </div>
//       <audio ref={llmAudioRef} onEnded={handleAudioPlaybackEnd} className="hidden" />
//     </main>
//   );
// }


'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Click Start to Talk');
  const [transcript, setTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const processorRef = useRef(null);
  const recordingAudioContextRef = useRef(null);

  const playAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setStatus('Agent Speaking...');
    
    const audioData = audioQueueRef.current.shift();
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        if (audioQueueRef.current.length > 0) {
          playAudioQueue();
        } else {
          setStatus('Ready to Listen');
        }
      };
      source.start();
    } catch (error) {
      console.error("Error decoding audio data:", error);
      isPlayingRef.current = false;
    }
  };

  const handleStartRecording = async () => {
    setStatus('Connecting...');
    setTranscript('');
    setFullTranscript('');
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      socketRef.current = new WebSocket('ws://localhost:3000/ws');

      socketRef.current.onopen = () => {
        setIsRecording(true);
        setStatus('Listening...');

        recordingAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
        const source = recordingAudioContextRef.current.createMediaStreamSource(streamRef.current);
        processorRef.current = recordingAudioContextRef.current.createScriptProcessor(1024, 1, 1);
        
        processorRef.current.onaudioprocess = (event) => {
          const pcmData = new Int16Array(event.inputBuffer.getChannelData(0).map(s => s * 32767));
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(pcmData.buffer);
          }
        };
        source.connect(processorRef.current);
        processorRef.current.connect(recordingAudioContextRef.current.destination);
      };

      socketRef.current.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const arrayBuffer = await event.data.arrayBuffer();
          audioQueueRef.current.push(arrayBuffer);
          playAudioQueue();
        } else {
          const message = JSON.parse(event.data);
          if (message.type === 'transcript') {
            setTranscript(message.text);
            if (message.isFinal) {
              setFullTranscript(prev => (prev + ' ' + message.text).trim());
              setTranscript('');
            }
          }
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setStatus('Error. Try refreshing.');
      };
      socketRef.current.onclose = () => {
        setStatus('Click Start to Talk');
        setIsRecording(false);
      };

    } catch (err) {
      console.error(err);
      setStatus('Microphone access denied.');
    }
  };

  const handleStopRecording = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (processorRef.current) processorRef.current.disconnect();
    if (recordingAudioContextRef.current) recordingAudioContextRef.current.close();
    if (socketRef.current) socketRef.current.close();
    setIsRecording(false);
    setStatus('Session Ended');
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-gray-900/50 border border-cyan-400/20 rounded-2xl p-8 space-y-6 shadow-lg shadow-cyan-500/10">
        <h1 className="text-4xl font-extrabold tracking-tight text-center text-[#00ffe5] drop-shadow-[0_0_20px_#00ffe5]">
          AI Voice Agent
        </h1>
        
        <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-lg font-medium">Status: 
            <span className={`ml-2 font-bold ${isRecording ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
              {status}
            </span>
          </p>
        </div>
        
        <div className="w-full h-48 bg-black/30 rounded-lg p-4 border border-gray-700 overflow-y-auto shadow-inner">
          <p className="text-gray-300">{fullTranscript} <span className="text-white">{transcript}</span></p>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleStartRecording}
            disabled={isRecording}
            className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl shadow-[0_0_20px_#10B981] hover:shadow-[0_0_30px_#10B981] transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            Start
          </button>
          <button
            onClick={handleStopRecording}
            disabled={!isRecording}
            className="px-8 py-4 bg-red-500 text-white font-bold rounded-xl shadow-[0_0_20px_#EF4444] hover:shadow-[0_0_30px_#EF4444] transition-all duration-300 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            Stop
          </button>
        </div>
      </div>
      <footer className="text-center text-gray-600 text-sm mt-8">
        <p>30 Days of Voice Agents Challenge</p>
      </footer>
    </main>
  );
}


