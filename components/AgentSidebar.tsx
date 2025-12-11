import React from 'react';
import { AGENTS } from '../constants';
import { AgentId } from '../types';
import { Compass, Calendar, User, CreditCard, FileText, Activity } from 'lucide-react';

interface AgentSidebarProps {
  currentAgentId: AgentId;
}

const IconMap: Record<string, React.FC<any>> = {
  Compass,
  Calendar,
  User,
  CreditCard,
  FileText
};

const AgentSidebar: React.FC<AgentSidebarProps> = ({ currentAgentId }) => {
  return (
    <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">Sistem RS</h1>
            <p className="text-xs text-slate-500 font-medium">AI Navigator</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-1">
          Agen Sistem Aktif
        </p>
        
        {(Object.keys(AGENTS) as AgentId[]).map((agentKey) => {
          const agent = AGENTS[agentKey];
          const IconComponent = IconMap[agent.icon];
          const isActive = currentAgentId === agent.id;

          return (
            <div
              key={agent.id}
              className={`relative p-3 rounded-xl transition-all duration-300 border ${
                isActive
                  ? 'bg-slate-50 border-indigo-100 shadow-md transform scale-[1.02]'
                  : 'bg-white border-transparent hover:bg-slate-50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isActive ? agent.color : 'bg-slate-200'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                      {agent.name}
                    </h3>
                    {isActive && (
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl" />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="text-xs text-slate-400 text-center">
          Didukung oleh Google Gemini AI
        </div>
      </div>
    </div>
  );
};

export default AgentSidebar;