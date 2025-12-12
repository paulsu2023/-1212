

import React, { useState, useEffect } from 'react';
import { X, Save, Key, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { verifyGeminiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [polloKey, setPolloKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const storedPollo = localStorage.getItem('pollo_api_key');
    const storedGemini = localStorage.getItem('gemini_api_key');
    if (storedPollo) setPolloKey(storedPollo);
    if (storedGemini) setGeminiKey(storedGemini);
  }, [isOpen]);

  const handleVerifyAndSave = async () => {
    let isValidGemini = true;

    // 1. Verify Gemini Key if present
    if (geminiKey.trim()) {
        setIsVerifying(true);
        setGeminiStatus('idle');
        isValidGemini = await verifyGeminiKey(geminiKey.trim());
        setIsVerifying(false);

        if (isValidGemini) {
            setGeminiStatus('success');
            localStorage.setItem('gemini_api_key', geminiKey.trim());
        } else {
            setGeminiStatus('error');
            return; // Don't close or save others if this fails
        }
    } else {
        // If cleared, remove it
        localStorage.removeItem('gemini_api_key');
        setGeminiStatus('idle');
    }

    // 2. Save Pollo Key (No verification implemented for this demo)
    if (polloKey.trim()) {
        localStorage.setItem('pollo_api_key', polloKey.trim());
    } else {
        localStorage.removeItem('pollo_api_key');
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    // Only close if successful
    if (isValidGemini) {
        setTimeout(onClose, 800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-[480px] bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-700/50 rounded-lg">
                <Key size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">设置 (Settings)</span>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Gemini Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wider">Google Gemini API Key (Required)</label>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-mono text-xs">AI-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className={`
                        w-full bg-black/30 border rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors font-mono
                        ${geminiStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : geminiStatus === 'success' ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-cyan-500/50'}
                    `}
                    placeholder="粘贴您的 Gemini API Key..."
                    value={geminiKey}
                    onChange={(e) => { setGeminiKey(e.target.value); setGeminiStatus('idle'); }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {isVerifying ? <Loader2 size={14} className="animate-spin text-cyan-500" /> : 
                     geminiStatus === 'success' ? <CheckCircle size={14} className="text-green-500" /> :
                     geminiStatus === 'error' ? <AlertCircle size={14} className="text-red-500" /> : null
                    }
                </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
                用于所有核心 AI 功能（文生图、文生视频、智能对话）。Key 将安全保存在本地。
                {geminiStatus === 'error' && <span className="text-red-400 block mt-1">验证失败，请检查 Key 是否有效。</span>}
            </p>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Pollo Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pollo.ai API Key (Optional)</label>
                <a href="https://pollo.ai/dashboard/api-keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors">
                    <span>获取 Key</span>
                    <ExternalLink size={10} />
                </a>
            </div>
            
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-mono text-xs">key-</span>
                </div>
                <input 
                    type="password" 
                    autoComplete="off"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    placeholder="粘贴您的 Pollo API Key..."
                    value={polloKey}
                    onChange={(e) => setPolloKey(e.target.value)}
                />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
                用于激活 <strong>Wan 2.1 / Wan 2.5</strong> 视频生成模型。
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 bg-[#121214] flex justify-end">
            <button 
                onClick={handleVerifyAndSave}
                disabled={isVerifying}
                className={`
                    px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2
                    ${isSaved ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-cyan-400 hover:scale-105'}
                    ${isVerifying ? 'opacity-70 cursor-wait' : ''}
                `}
            >
                {isVerifying && <Loader2 size={12} className="animate-spin" />}
                {isSaved ? '已保存' : isVerifying ? '验证中...' : '验证并保存'}
            </button>
        </div>
      </div>
    </div>
  );
};