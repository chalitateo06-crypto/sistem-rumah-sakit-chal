import React, { useState, useEffect } from 'react';
import { AgentId, Message } from './types';
import AgentSidebar from './components/AgentSidebar';
import ChatInterface from './components/ChatInterface';
import { sendMessageToGemini } from './services/geminiService';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<AgentId>(AgentId.NAVIGATOR);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Checking for API Key on mount
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date()
    };
    
    // Optimistic update
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      // Prepare history for API (map internal type to Gemini API type)
      const apiHistory = updatedMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // Call Gemini Service
      const result = await sendMessageToGemini(userText, apiHistory);

      // Create Assistant Message based on structured response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.response_text,
        agentId: result.active_agent_id as AgentId,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Update the active agent in the sidebar
      if (result.active_agent_id && Object.values(AgentId).includes(result.active_agent_id as AgentId)) {
        setCurrentAgent(result.active_agent_id as AgentId);
      }

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Maaf, sistem sedang mengalami gangguan koneksi. Mohon periksa koneksi internet atau API Key Anda.",
        agentId: AgentId.NAVIGATOR,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      setCurrentAgent(AgentId.NAVIGATOR);
    } finally {
      setIsLoading(false);
    }
  };

  if (apiKeyMissing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">API Key Missing</h2>
          <p className="text-slate-600 mb-4">
            Please set the <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">API_KEY</code> environment variable to use this application.
          </p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Gemini API Key
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless toggled */}
      <div className={`
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-30 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AgentSidebar currentAgentId={currentAgent} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-600"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-slate-800">Hospital Navigator</span>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        <ChatInterface
          messages={messages}
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          onSend={handleSend}
        />
      </div>
    </div>
  );
};

export default App;