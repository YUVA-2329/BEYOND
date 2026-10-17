import React, { useState, useEffect } from 'react';
import { Sparkles, X, Search, Cpu, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import { api } from '../services/api';
import { AIModelStatus, Discovery, ScreenId } from '../types';
import { BeyondImage } from './BeyondImage';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: ScreenId, params?: any) => void;
}

const SAMPLE_QUERIES = [
  'Find peaceful sunset viewpoints near me',
  'Show quiet cafés where I can work',
  'Find nature destinations for a weekend trip',
  'Suggest photography locations with low crowds',
];

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AIModelStatus | null>(null);
  const [aiResult, setAiResult] = useState<{
    explanation: string;
    parsedFilters: any;
    matchedDiscoveries: Discovery[];
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getAIStatus().then((s) => setStatus(s)).catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (qText = query) => {
    if (!qText.trim()) return;
    try {
      setLoading(true);
      const res = await api.discoverWithAI(qText.trim());
      setAiResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0B1525] border border-[#1A2D48] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#142236] flex items-center justify-between bg-[#0E1A2C]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-display">BEYOND AI Assistant</h2>
              <p className="text-[10px] text-slate-400">Natural Language Discovery & Offline Neural Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto hide-scrollbar space-y-4 flex-1">
          {/* Hardware & Engine Status Bar */}
          {status && (
            <div className="p-3 bg-[#080E18] border border-[#16253C] rounded-2xl text-[11px] space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Cpu size={13} className="text-[#00E599]" />
                  <span>Hardware Accelerator</span>
                </span>
                <span className="font-semibold text-white truncate max-w-[220px]">
                  {status.hardware.gpu} ({status.hardware.vramGb} GB VRAM)
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400 font-medium">Inference Architecture:</span>
                <span className="text-[#00E599] font-medium flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>Local Offline Native</span>
                </span>
              </div>
            </div>
          )}

          {/* Search Query Input */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Ask in natural language..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-[#0E1A2C] border border-[#1A2D48] rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#00E599] shadow-inner"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Sample Queries */}
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {SAMPLE_QUERIES.map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setQuery(sample);
                    handleSearch(sample);
                  }}
                  className="px-2.5 py-1 rounded-full text-[10px] bg-[#122238] border border-[#1A2F4D] text-slate-300 hover:text-white hover:border-[#00E599]/60 whitespace-nowrap cursor-pointer transition-colors"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Results View */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-[#00E599] border-t-transparent rounded-full animate-spin mb-2" />
              Parsing natural language intent and matching coordinates...
            </div>
          ) : aiResult ? (
            <div className="space-y-3">
              {/* AI Explanation Banner */}
              <div className="p-3 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/30 text-xs text-slate-200">
                <span className="font-semibold text-[#00E599]">AI Insight: </span>
                {aiResult.explanation}
              </div>

              {/* Matched Places List */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400">
                  Matched Discoveries ({aiResult.matchedDiscoveries.length})
                </div>

                {aiResult.matchedDiscoveries.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      onClose();
                      onNavigate('screen_04_place_details', { discoveryId: d.id });
                    }}
                    className="p-2.5 rounded-2xl bg-[#0E1A2C] border border-[#182B46] hover:border-[#00E599]/50 transition-all flex items-center gap-3 cursor-pointer group"
                  >
                    <BeyondImage
                      src={d.imageUrl}
                      alt={d.title}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate font-display group-hover:text-[#00E599]">
                        {d.title}
                      </h4>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-[#00E599]" />
                        <span>{d.distanceKm} km • {d.location}</span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5">{d.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-white" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-[#142236] bg-[#0E1A2C] flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Powered by BEYOND Local Semantic Adapter
          </span>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-4 py-1.5 rounded-full bg-[#00E599] text-[#080E18] text-xs font-bold hover:bg-[#00C883] disabled:opacity-50 transition-all cursor-pointer"
          >
            Run Discovery Search
          </button>
        </div>
      </div>
    </div>
  );
};
