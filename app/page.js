
'use client';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// --- SVG Icon Components ---
const MicIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" /></svg> );
const StopIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" /></svg> );
const LoadingSpinner = () => ( <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" /></svg>);
const SidebarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>);


// --- Sidebar Component ---
const Sidebar = ({ conversations, onSelectChat, onNewChat, activeId, isOpen }) => (
    <div className={`flex flex-col h-full bg-gray-900/70 border-r border-amber-400/20 p-4 transition-all duration-300 ${isOpen ? 'w-full max-w-xs' : 'w-0 p-0 overflow-hidden'}`}>
        <button onClick={onNewChat} className="flex items-center justify-center gap-2 w-full p-2 mb-4 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-400 transition-colors shrink-0">
            <PlusIcon /> New Chat
        </button>
        <div className="flex-grow overflow-y-auto pr-2 chat-scrollbar">
            <h2 className="text-lg font-semibold text-gray-400 mb-2 shrink-0">History</h2>
            <div className="flex flex-col gap-2">
                {Object.keys(conversations).map(id => (
                    <button 
                        key={id} 
                        onClick={() => onSelectChat(id)}
                        className={`p-2 text-left rounded-lg truncate text-sm transition-colors w-full shrink-0 ${activeId === id ? 'bg-amber-500/30 text-amber-300' : 'text-gray-300 hover:bg-gray-700/50'}`}
                    >
                        {conversations[id].messages[0]?.content || "New Conversation"}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

export default function Home() {
  // --- State Management ---
  const [conversations, setConversations] = useState({});
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [agentStatus, setAgentStatus] = useState('idle');
  const [llmError, setLlmError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // --- Refs ---
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const llmAudioRef = useRef(null);
  const chatContainerRef = useRef(null);

  // --- localStorage Hooks ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('oracle-chat-history');
    if (savedHistory) {
      setConversations(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (Object.keys(conversations).length > 0) {
      localStorage.setItem('oracle-chat-history', JSON.stringify(conversations));
    }
  }, [conversations]);
  
  // --- Audio Playback Hook ---
  useEffect(() => {
    const playAudio = async (audioUrl) => {
      if (audioUrl && llmAudioRef.current) {
        try {
          llmAudioRef.current.src = audioUrl;
          llmAudioRef.current.load();
          await llmAudioRef.current.play();
          setAgentStatus('speaking');
        } catch (err) {
          console.error("Audio play failed:", err);
          setLlmError("Audio playback failed. The browser may have blocked it.");
          setAgentStatus('idle');
        }
      }
    };

    const conversation = activeConversationId ? conversations[activeConversationId] : null;
    if (agentStatus === 'thinking' && conversation?.audioUrl) {
      playAudio(conversation.audioUrl);
    }
  }, [conversations, activeConversationId, agentStatus]);

  // --- Handlers ---
  const handleNewChat = () => { setActiveConversationId(null); setLlmError(''); setAgentStatus('idle'); };
  const handleSelectChat = (id) => { setActiveConversationId(id); setLlmError(''); setAgentStatus('idle'); };

  const startRecording = async () => {
    setLlmError('');
    setAgentStatus('listening');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = event => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        
        setAgentStatus('thinking');
        
        try {
          const res = await fetch('/api/llm/query', { method: 'POST', body: formData });
          const result = await res.json();
          
          if (!res.ok) {
            if (result.fallbackAudioUrl) {
              setLlmError(result.errorMessage);
              if(llmAudioRef.current) {
                llmAudioRef.current.src = result.fallbackAudioUrl;
                llmAudioRef.current.load();
                await llmAudioRef.current.play();
                setAgentStatus('speaking');
              }
            } else {
              throw new Error(result.error || "An unknown network error occurred.");
            }
          } else {
            const userMessage = { role: 'user', content: result.userQuery };
            const assistantMessage = { role: 'assistant', content: result.llmResponse };
            const currentId = activeConversationId || uuidv4();
            const currentMessages = activeConversationId ? conversations[currentId].messages : [];
            const newMessages = [...currentMessages, userMessage, assistantMessage];

            setConversations(prev => ({ ...prev, [currentId]: { messages: newMessages, audioUrl: result.audioUrl } }));
            setActiveConversationId(currentId);
          }
        } catch (err) {
          setLlmError(err.message);
          setAgentStatus('idle');
        }
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      setLlmError('Microphone access denied.');
      setAgentStatus('idle');
    }
  };

  const stopRecording = () => { if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop(); };
  const handleToggleRecording = () => { if (agentStatus === 'idle' || agentStatus === 'speaking') startRecording(); else if (agentStatus === 'listening') stopRecording(); };
  const handleAudioPlaybackEnd = () => setAgentStatus('idle');
  
  const getButtonAppearance = () => {
    switch (agentStatus) {
      case 'listening': return 'bg-red-500 shadow-[0_0_25px_#ef4444] animate-pulse';
      case 'thinking': return 'bg-amber-500 cursor-not-allowed';
      case 'speaking': return 'bg-green-500 shadow-[0_0_25px_#22c55e]';
      default: return 'bg-blue-600 hover:bg-blue-500';
    }
  };

  const currentMessages = activeConversationId ? conversations[activeConversationId]?.messages : [];

  return (
    <main className="h-screen bg-black text-white flex">
     
      <div className="flex-grow flex flex-col items-center justify-center p-4 relative">
        
       
        <div className="w-full max-w-3xl h-full flex flex-col bg-gray-900/40 border border-amber-400/30 rounded-3xl p-6 shadow-[0_0_30px_#fbbf24]/20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#fBBF24] drop-shadow-[0_0_20px_#fBBF24] mb-4">The Oracle</h1>
          
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 text-left p-2 chat-scrollbar">
            {currentMessages && currentMessages.length > 0 ? (
                currentMessages.map((msg, index) => (
                    <div key={index} className={`flex w-full animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`max-w-xl p-4 rounded-xl shadow-lg text-base ${msg.role === 'user' ? 'bg-blue-900/50' : 'bg-gray-800/50'}`}>
                            {msg.content}
                        </p>
                    </div>
                ))
            ) : (
                <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 text-lg italic">
                      {llmError || "Start a new conversation or select one from the history."}
                    </p>
                </div>
            )}
            {agentStatus === 'thinking' && <div className="flex justify-start"><LoadingSpinner /></div>}
          </div>
          
          <div className='flex justify-center pt-6'>
            <button
              onClick={handleToggleRecording}
              disabled={agentStatus === 'thinking'}
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 ease-in-out ${getButtonAppearance()}`}
            >
              {agentStatus === 'thinking' ? <LoadingSpinner /> : (agentStatus === 'listening' ? <StopIcon /> : <MicIcon />)}
            </button>
          </div>
        </div>
      </div>
      <audio ref={llmAudioRef} onEnded={handleAudioPlaybackEnd} className="hidden" />
    </main>
  );
}






