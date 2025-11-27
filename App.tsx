import React, { useState, useEffect, useRef } from 'react';
import { Send, Copy, Trash2, Users, User, Paperclip, X, Lock, Check, Zap, LogIn, KeyRound, ChevronRight, AlertCircle } from 'lucide-react';
import { PhoneInput } from './components/PhoneInput';
import { BulkInput } from './components/BulkInput';
import { BulkQueue } from './components/BulkQueue';
import { MessagePreview } from './components/MessagePreview';
import { MessageState, Recipient } from './types';
import { DEFAULT_COUNTRY_CODE } from './constants';

declare global {
  interface Window {
    genieGetPending: () => { id: string; phone: string; message: string } | null;
    genieUpdateStatus: (id: string, status: 'sent' | 'skipped') => void;
  }
}

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // App State
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [state, setState] = useState<MessageState>({
    countryCode: DEFAULT_COUNTRY_CODE,
    phoneNumber: '',
    message: '',
    attachment: null
  });
  
  const [bulkText, setBulkText] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isQueueActive, setIsQueueActive] = useState(false);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const recipientsRef = useRef(recipients);
  const messageRef = useRef(state.message);
  const attachmentRef = useRef(state.attachment);
  const isAutoSendingRef = useRef(isAutoSending);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const miniWindowRef = useRef<Window | null>(null);

  // Sync Refs
  useEffect(() => { recipientsRef.current = recipients; }, [recipients]);
  useEffect(() => { messageRef.current = state.message; }, [state.message]);
  useEffect(() => { attachmentRef.current = state.attachment; }, [state.attachment]);
  useEffect(() => { isAutoSendingRef.current = isAutoSending; }, [isAutoSending]);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow 'karimh' in any case (KarimH, karimh, KARIMH)
    if (loginUser.toLowerCase() === 'karimh' && loginPass === 'Kemo@0000') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  // --- Auto Sending Logic ---
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const processQueue = () => {
        if (!isAutoSendingRef.current) return;

        const currentRecipients = recipientsRef.current;
        const currentMessage = messageRef.current;
        const currentAttachment = attachmentRef.current;
        const nextRecipient = currentRecipients.find(r => r.status === 'pending');

        if (!nextRecipient) {
            setIsAutoSending(false);
            setProcessingId(null);
            alert("✅ Bulk sending complete! All messages have been processed.");
            return;
        }

        setProcessingId(nextRecipient.id);

        const cleanNum = nextRecipient.number.replace('+', '');
        const url = `whatsapp://send?phone=${cleanNum}&text=${encodeURIComponent(currentMessage)}`;
        
        const newWindow = window.open(url, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') { }

        setRecipients(prev => prev.map(r => 
            r.id === nextRecipient.id ? { ...r, status: 'sent', sentAt: new Date().toLocaleTimeString() } : r
        ));

        let delay = 3000;
        if (currentAttachment) {
            const isImage = currentAttachment.type.startsWith('image/');
            delay = isImage ? 7000 : 12000;
        }

        timeoutId = setTimeout(processQueue, delay);
    };

    if (isAutoSending) {
        processQueue();
    } else {
        setProcessingId(null);
    }

    return () => clearTimeout(timeoutId);
  }, [isAutoSending]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.message);
  };

  const clearMessage = () => {
    if (isAutoSending) return;
    setState(prev => ({ ...prev, message: '' }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setState(prev => ({ ...prev, attachment: e.target.files![0] }));
      }
  };

  const clearAttachment = () => {
      if (isAutoSending) return;
      setState(prev => ({ ...prev, attachment: null }));
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openWhatsApp = (number: string, text: string) => {
    const url = `whatsapp://send?phone=${number}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const copyImageToClipboard = async () => {
    if (state.attachment && state.attachment.type.startsWith('image/')) {
        try {
            if (typeof ClipboardItem !== 'undefined') {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [state.attachment.type]: state.attachment
                    })
                ]);
                return true;
            }
        } catch (err) {
            console.error("Clipboard copy failed:", err);
            return false;
        }
    }
    return false;
  };

  const handleDownloadReport = () => {
      const headers = "Number,Status,Time Sent,Original Input\n";
      const rows = recipients.map(r => 
          `"${r.number}","${r.status}","${r.sentAt || '-'}","${r.original}"`
      ).join("\n");
      const csvContent = headers + rows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `whatsapp_report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleSingleSend = async () => {
    if (!state.phoneNumber) {
      alert("Please enter a phone number.");
      return;
    }
    if (state.attachment) {
        if (state.attachment.type.startsWith('image/')) {
            const success = await copyImageToClipboard();
            if (success) {
                alert("✅ Image copied to clipboard!\n\nJust press (Ctrl + V) when WhatsApp opens to attach it.");
            } else {
                alert("⚠️ Could not auto-copy image.\nPlease drag and drop the image manually into WhatsApp.");
            }
        } else {
             alert("ℹ️ Video/File attachment:\nPlease manually drag and drop the file into WhatsApp when it opens.");
        }
    }
    const cleanNumber = state.phoneNumber.replace(/\D/g, '');
    const cleanCountry = state.countryCode.replace('+', '');
    const fullNumber = `${cleanCountry}${cleanNumber}`;
    openWhatsApp(fullNumber, state.message);
  };

  const parseBulkNumbers = () => {
    if (!bulkText.trim()) {
        alert("Please enter or upload numbers first.");
        return;
    }
    const lines = bulkText.split(/[\n,]/);
    const unique = new Set<string>();
    const validRecipients: Recipient[] = [];
    const defaultCode = state.countryCode;

    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        let num = cleanLine.replace(/[^0-9+]/g, '');
        if (!num) return;
        if (!num.startsWith('+')) {
            if (num.startsWith('00')) {
                num = '+' + num.substring(2);
            } else if (num.startsWith('0')) {
                num = defaultCode + num.substring(1);
            } else {
                num = defaultCode + num;
            }
        }
        if (num.length > 8 && !unique.has(num)) {
            unique.add(num);
            validRecipients.push({
                id: crypto.randomUUID(),
                original: cleanLine,
                number: num,
                status: 'pending'
            });
        }
    });

    if (validRecipients.length === 0) {
        alert("No valid numbers found.");
        return;
    }
    setRecipients(validRecipients);
    setIsQueueActive(true);
    setIsAutoSending(false);
  };

  const handleStartAutoSend = async () => {
      if (!state.message.trim() && !state.attachment) {
          alert("Please enter a message or select a file first.");
          return;
      }
      if (state.attachment) {
          if (state.attachment.type.startsWith('image/')) {
              const success = await copyImageToClipboard();
              if (success) {
                  alert("✅ Image copied to clipboard!\n\nIMPORTANT: Do not copy any other text during the process.\n\nI will trigger the WhatsApp App every 7 seconds. Press 'Ctrl + V' then 'Enter' in each window.");
              } else {
                  alert("⚠️ Could not auto-copy image. You will need to drag/drop it manually for each message.");
              }
          } else {
              alert("ℹ️ Video/File detected.\n\nI will trigger the WhatsApp App every 12 seconds.\n\nManually DRAG & DROP the file into each WhatsApp window.");
          }
      }
      setIsAutoSending(true);
  };

  const handleSendNextInQueue = () => {
      const nextRecipient = recipients.find(r => r.status === 'pending');
      if (!nextRecipient) return;
      const cleanNum = nextRecipient.number.replace('+', '');
      openWhatsApp(cleanNum, state.message);
      setRecipients(prev => prev.map(r => r.id === nextRecipient.id ? { ...r, status: 'sent', sentAt: new Date().toLocaleTimeString() } : r));
  };

  const handleRemoveRecipient = (id: string) => {
      if (isAutoSending) return;
      setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleEditList = () => {
      if (isAutoSending) return;
      setIsQueueActive(false);
  };

  const resetQueue = () => {
      if(window.confirm("Are you sure you want to clear the current queue?")) {
          setIsQueueActive(false);
          setIsAutoSending(false);
          setRecipients([]);
          setProcessingId(null);
          if(miniWindowRef.current) miniWindowRef.current.close();
      }
  };

  useEffect(() => {
    window.genieGetPending = () => {
        const currentRecipients = recipientsRef.current;
        const next = currentRecipients.find(r => r.status === 'pending');
        if (!next) return null;
        return {
            id: next.id,
            phone: next.number,
            message: messageRef.current
        };
    };
    window.genieUpdateStatus = (id: string, status: 'sent' | 'skipped') => {
        setRecipients(prev => prev.map(r => 
            r.id === id ? { ...r, status, sentAt: status === 'sent' ? new Date().toLocaleTimeString() : 'Skipped' } : r
        ));
    };
  }, []); 

  const syncMiniWindow = (win: Window, currentRecipients: Recipient[]) => {
    if (!win || win.closed || !win.document) return;
    
    const listRoot = win.document.getElementById('list-root');
    const statusEl = win.document.getElementById('status-text');
    const progEl = win.document.getElementById('progress-text');
    
    if (!listRoot) return;

    const nextRecipient = currentRecipients.find(r => r.status === 'pending');
    const sentCount = currentRecipients.filter(r => r.status === 'sent').length;
    const total = currentRecipients.length;

    // Update Header Stats
    if (progEl) progEl.innerText = `${sentCount} / ${total}`;
    if (statusEl) {
        if (!nextRecipient) {
             statusEl.innerText = "Completed";
             statusEl.style.color = "#4ade80";
        } else {
             statusEl.innerText = "Running";
             statusEl.style.color = "#fbbf24";
        }
    }

    const html = currentRecipients.map((r, i) => {
        const isPending = r.status === 'pending';
        const isSent = r.status === 'sent';
        const isSkipped = r.status === 'skipped';
        const isActive = nextRecipient && r.id === nextRecipient.id;
        
        let statusIcon = '';
        if (isSent) statusIcon = '✅';
        else if (isSkipped) statusIcon = '⏭️';
        else if (isActive) statusIcon = '👉';
        else statusIcon = '⏳';

        let rowClass = 'row';
        if (isActive) rowClass += ' row-active';
        if (isSent) rowClass += ' row-sent';
        if (isSkipped) rowClass += ' row-skipped';

        return `
            <div id="row-${r.id}" class="${rowClass}">
                <div class="row-info">
                    <span class="row-idx">${i + 1}</span>
                    <span class="row-phone">${r.number}</span>
                </div>
                <div class="row-icon">${statusIcon}</div>
            </div>
        `;
    }).join('');

    listRoot.innerHTML = html;

    if (nextRecipient) {
        const activeRow = win.document.getElementById(`row-${nextRecipient.id}`);
        if (activeRow) {
            activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  };

  const openMiniWindow = () => {
      const width = 360;
      const height = 600;
      const left = window.screen.width - width - 50;
      const top = 100;
      const win = window.open('', 'MiniController', `width=${width},height=${height},left=${left},top=${top},alwaysOnTop=yes`);
      if (!win) {
          alert("Pop-up blocked! Please allow pop-ups to use the Mini Controller.");
          return;
      }
      miniWindowRef.current = win;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <title>Bulking Remote 🎮</title>
        <style>
        body { margin: 0; background: #0f172a; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .header { padding: 16px; background: #1e293b; border-bottom: 1px solid #334155; flex-shrink: 0; display: flex; justify-content: space-between; items-center; }
        .logo { font-size: 18px; font-weight: 800; background: linear-gradient(to right, #4ade80, #3b82f6); -webkit-background-clip: text; color: transparent; }
        .stats { font-size: 12px; color: #94a3b8; font-weight: 600; }
        .controls { padding: 12px; display: flex; gap: 10px; background: #0f172a; border-bottom: 1px solid #334155; flex-shrink: 0; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .btn { flex: 1; padding: 14px; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: transform 0.1s; color: white; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn:active { transform: scale(0.96); }
        .btn-send { background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
        .btn-skip { background: #334155; color: #cbd5e1; border: 1px solid #475569; }
        .list-container { flex: 1; overflow-y: auto; padding: 10px; scroll-behavior: smooth; }
        .list-container::-webkit-scrollbar { width: 6px; }
        .list-container::-webkit-scrollbar-track { background: #0f172a; }
        .list-container::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .row { display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #1e293b; align-items: center; border-radius: 8px; margin-bottom: 4px; transition: background 0.2s; }
        .row-active { background: #1e293b; border-left: 3px solid #10b981; }
        .row-sent { opacity: 0.5; }
        .row-skipped { opacity: 0.4; background: #1f2937; }
        .row-info { display: flex; items-center; gap: 10px; }
        .row-idx { color: #64748b; font-size: 11px; font-weight: bold; width: 20px; text-align: center; }
        .row-phone { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
        .row-icon { font-size: 14px; }
        .status-text { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        </style>
        </head>
        <body>
          <div class="header">
            <div>
                <div class="logo">Bulking Message</div>
                <div id="status-text" class="status-text" style="color: #fbbf24;">Connecting...</div>
            </div>
            <div id="progress-text" class="stats">0 / 0</div>
          </div>
          <div class="controls">
             <button id="sendBtn" class="btn btn-send">SEND 🚀</button>
             <button id="skipBtn" class="btn btn-skip">SKIP ⏭️</button>
          </div>
          <div id="list-root" class="list-container">
            <div style="padding: 20px; text-align: center; color: #64748b;">Loading list...</div>
          </div>
          <script>
            const sendBtn = document.getElementById('sendBtn');
            const skipBtn = document.getElementById('skipBtn');
            sendBtn.onclick = () => {
                if(!window.opener || typeof window.opener.genieGetPending !== 'function') { alert("Connection lost. Reopen app."); return; }
                const task = window.opener.genieGetPending();
                if (!task) return;
                const cleanNum = task.phone.replace('+', '');
                window.open("whatsapp://send?phone=" + cleanNum + "&text=" + encodeURIComponent(task.message), '_blank');
                window.opener.genieUpdateStatus(task.id, 'sent');
            };
            skipBtn.onclick = () => {
                if(!window.opener) return;
                const task = window.opener.genieGetPending();
                if(task) window.opener.genieUpdateStatus(task.id, 'skipped');
            };
          </script>
        </body>
        </html>
      `;
      win.document.write(htmlContent);
      win.document.close();
      syncMiniWindow(win, recipients);
  };

  useEffect(() => {
      const win = miniWindowRef.current;
      if (win && !win.closed) {
          syncMiniWindow(win, recipients);
      }
  }, [recipients]);

  // --------------- RENDER LOGIN SCREEN IF NOT AUTHENTICATED ---------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans text-gray-800">
         <div className="glass-panel w-full max-w-md p-8 rounded-[2rem] shadow-2xl border border-white/40 relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>

             <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white mx-auto mb-4">
                     <Zap size={32} fill="currentColor" />
                </div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight mb-2">
                    Bulking Message
                </h1>
                <p className="text-sm text-gray-500 font-medium">Please login to continue</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-4 relative z-10">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            value={loginUser}
                            onChange={(e) => setLoginUser(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                            placeholder="Enter username"
                        />
                     </div>
                 </div>

                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                     <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            value={loginPass}
                            onChange={(e) => setLoginPass(e.target.value)}
                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
                            placeholder="Enter password"
                        />
                     </div>
                 </div>

                 {loginError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium animate-fade-in-up">
                        <AlertCircle size={16} />
                        {loginError}
                    </div>
                 )}

                 <button 
                    type="submit"
                    className="w-full h-12 mt-4 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                    Login <ChevronRight size={18} />
                 </button>
             </form>
             
             <div className="mt-8 text-center">
                 <p className="text-xs text-gray-400">© 2024 Bulking Message. All rights reserved.</p>
             </div>
         </div>
      </div>
    );
  }

  // --------------- MAIN APP RENDER ---------------
  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-6 lg:p-10 font-sans text-gray-800">
      
      {/* Glass Container */}
      <div className="glass-panel w-full max-w-[1200px] h-[95dvh] md:h-[90vh] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/40 relative">
        
        {/* Left Side: Controls */}
        <div className="flex-1 flex flex-col relative w-full">
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32">
                
                {/* Header */}
                <div className="mb-8 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                            <Zap size={24} fill="currentColor" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
                                Bulking Message
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">Welcome, KarimH</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAuthenticated(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Logout">
                        <LogIn size={20} className="transform rotate-180" />
                    </button>
                </div>

                {/* Mode Switcher (Segmented Control) */}
                <div className="bg-gray-100/80 p-1.5 rounded-2xl flex mb-8 w-full max-w-md mx-auto shadow-inner">
                    <button 
                        onClick={() => setMode('single')}
                        disabled={isAutoSending}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'single' ? 'bg-white shadow-md text-emerald-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User size={16} strokeWidth={2.5} /> Single Message
                    </button>
                    <button 
                        onClick={() => setMode('bulk')}
                        disabled={isAutoSending}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mode === 'bulk' ? 'bg-white shadow-md text-indigo-600 scale-[1.02]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Users size={16} strokeWidth={2.5} /> Bulk Campaign
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Inputs */}
                    <div className="animate-fade-in-up">
                        {mode === 'single' ? (
                            <PhoneInput
                                countryCode={state.countryCode}
                                phoneNumber={state.phoneNumber}
                                onCountryChange={(code) => setState(prev => ({ ...prev, countryCode: code }))}
                                onPhoneChange={(num) => setState(prev => ({ ...prev, phoneNumber: num }))}
                                disabled={isAutoSending}
                            />
                        ) : (
                            <div className="space-y-4">
                                {!isQueueActive ? (
                                    <>
                                        <PhoneInput
                                            countryCode={state.countryCode}
                                            phoneNumber=""
                                            onCountryChange={(code) => setState(prev => ({ ...prev, countryCode: code }))}
                                            onPhoneChange={() => {}}
                                            onlyCountry={true}
                                            disabled={isAutoSending}
                                        />
                                        <BulkInput text={bulkText} onChange={setBulkText} disabled={isAutoSending} />
                                    </>
                                ) : (
                                    <div className="w-full">
                                        <BulkQueue 
                                            recipients={recipients}
                                            onSendNext={handleSendNextInQueue}
                                            onReset={resetQueue}
                                            onRemove={handleRemoveRecipient}
                                            onEdit={handleEditList}
                                            isAutoSending={isAutoSending}
                                            processingId={processingId}
                                            onStartAuto={handleStartAutoSend}
                                            onStopAuto={() => setIsAutoSending(false)}
                                            onDownloadReport={handleDownloadReport}
                                            onOpenMiniWindow={openMiniWindow}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Message Composer */}
                    <div className="relative group">
                         {isAutoSending && (
                            <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-indigo-200">
                                <div className="bg-white p-3 px-5 rounded-full shadow-xl flex items-center gap-2 text-indigo-600 font-bold border border-indigo-50 animate-bounce">
                                    <Lock size={16} /> Content Locked
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Message Content</label>
                            <div className="flex gap-1">
                                <button onClick={copyToClipboard} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Copy size={14}/></button>
                                <button onClick={clearMessage} disabled={isAutoSending} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        
                        <textarea
                            value={state.message}
                            onChange={(e) => setState(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Type your marketing message here..."
                            disabled={isAutoSending}
                            className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none resize-none text-base text-gray-700 shadow-sm transition-all"
                            style={{ direction: /[\u0600-\u06FF]/.test(state.message) ? 'rtl' : 'ltr' }}
                        />

                        {/* Attachment Pill */}
                        <div className="absolute bottom-4 right-4 z-10">
                             <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,video/*" disabled={isAutoSending}/>
                             {!state.attachment ? (
                                <button onClick={() => fileInputRef.current?.click()} disabled={isAutoSending} className="flex items-center gap-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                                    <Paperclip size={14} /> Attach Media
                                </button>
                             ) : (
                                <div className="flex items-center gap-2 bg-indigo-600 text-white pl-3 pr-2 py-1.5 rounded-full shadow-lg shadow-indigo-200">
                                    <span className="text-xs font-medium truncate max-w-[120px]">{state.attachment.name}</span>
                                    <button onClick={clearAttachment} disabled={isAutoSending} className="p-0.5 hover:bg-white/20 rounded-full"><X size={12} /></button>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="p-6 border-t border-gray-100 bg-white/60 backdrop-blur-md absolute bottom-0 left-0 right-0 z-30 pb-safe">
                 {mode === 'single' ? (
                    <button
                        onClick={handleSingleSend}
                        disabled={!state.phoneNumber}
                        className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-xl ${state.phoneNumber ? 'bg-[#00a884] hover:bg-[#008f6f] text-white shadow-emerald-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Send size={20} /> Launch WhatsApp
                    </button>
                 ) : (
                    !isQueueActive && (
                        <button
                            onClick={parseBulkNumbers}
                            disabled={!bulkText.trim()}
                            className={`w-full h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-xl ${bulkText.trim() ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                        >
                            <Users size={20} /> Prepare List
                        </button>
                    )
                 )}
            </div>
        </div>

        {/* Right Side: Preview (Hidden on small screens) */}
        <div className="hidden lg:flex w-[400px] bg-gray-50/50 border-l border-white/50 p-8 flex-col items-center justify-center relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent"></div>
             
             <div className="relative z-10 w-full">
                 <div className="flex items-center justify-center gap-2 mb-8 opacity-60">
                     <div className="h-px w-8 bg-gray-400"></div>
                     <span className="text-xs font-semibold tracking-widest text-gray-500 uppercase">Live Preview</span>
                     <div className="h-px w-8 bg-gray-400"></div>
                 </div>
                 
                 <MessagePreview message={state.message} attachment={state.attachment} />
                 
                 <div className="mt-8 text-center">
                     <p className="text-xs text-gray-400 max-w-[250px] mx-auto leading-relaxed">
                        Images are auto-copied to clipboard. Videos require manual drag-and-drop due to browser security.
                     </p>
                 </div>
             </div>
        </div>

      </div>
    </div>
  );
}

export default App;