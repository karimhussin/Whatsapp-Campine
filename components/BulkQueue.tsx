import React, { useEffect, useRef } from 'react';
import { Recipient } from '../types';
import { CheckCircle2, Clock, Play, RotateCcw, Loader2, Trash2, Edit2, AlertOctagon, Download, Smartphone, PauseCircle, XCircle } from 'lucide-react';

interface BulkQueueProps {
  recipients: Recipient[];
  onSendNext: () => void;
  onReset: () => void;
  isAutoSending: boolean;
  onStartAuto: () => void;
  onStopAuto: () => void;
  processingId?: string | null;
  onRemove: (id: string) => void;
  onEdit: () => void;
  onDownloadReport: () => void;
  onOpenMiniWindow: () => void;
}

export const BulkQueue: React.FC<BulkQueueProps> = ({ 
  recipients, 
  onSendNext, 
  onReset,
  isAutoSending,
  onStartAuto,
  onStopAuto,
  processingId,
  onRemove,
  onEdit,
  onDownloadReport,
  onOpenMiniWindow
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const pendingCount = recipients.filter(r => r.status === 'pending').length;
  const sentCount = recipients.filter(r => r.status === 'sent').length;
  const skippedCount = recipients.filter(r => r.status === 'skipped').length;
  const total = recipients.length;
  
  const nextRecipient = recipients.find(r => r.status === 'pending');
  const isComplete = !nextRecipient;
  const progress = ((sentCount + skippedCount) / total) * 100;

  useEffect(() => {
    if (processingId && scrollRef.current) {
        const el = document.getElementById(`recipient-${processingId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [processingId]);

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-white/40">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-gray-800 text-lg">Campaign Queue</h3>
                <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{sentCount} Sent</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{pendingCount} Pending</span>
                    {skippedCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">{skippedCount} Skipped</span>}
                </div>
            </div>
            
            <div className="flex gap-1.5">
                 <button onClick={onOpenMiniWindow} disabled={isAutoSending || isComplete} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all disabled:opacity-30 disabled:grayscale" title="Mini Controller">
                    <Smartphone size={18} />
                </button>
                 <button onClick={onEdit} disabled={isAutoSending} className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30" title="Edit List">
                    <Edit2 size={18} />
                </button>
                <button onClick={onReset} disabled={isAutoSending} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30" title="Reset">
                    <RotateCcw size={18} />
                </button>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
                className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out rounded-full ${isAutoSending ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}
                style={{ width: `${progress}%`, backgroundSize: '200% 100%' }}
            ></div>
        </div>
      </div>

      {/* Main List Area */}
      <div ref={scrollRef} className="overflow-y-auto p-3 space-y-2 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent min-h-[150px] max-h-[500px]">
          {recipients.map((r, idx) => {
              const isProcessing = processingId === r.id;
              const isSent = r.status === 'sent';
              const isSkipped = r.status === 'skipped';
              
              return (
                <div 
                    key={r.id}
                    id={`recipient-${r.id}`}
                    className={`
                        relative flex items-center justify-between p-3 rounded-xl border transition-all duration-300
                        ${isProcessing 
                            ? 'bg-white border-indigo-400 shadow-lg shadow-indigo-100 scale-[1.02] z-10' 
                            : isSent 
                                ? 'bg-emerald-50/50 border-emerald-100 opacity-80' 
                                : isSkipped
                                    ? 'bg-gray-100 border-gray-200 opacity-60'
                                    : 'bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                        }
                    `}
                >
                    {isProcessing && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-xl"></div>
                    )}
                    
                    <div className="flex items-center gap-3">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            ${isProcessing ? 'bg-indigo-100 text-indigo-600' : isSent ? 'bg-emerald-100 text-emerald-600' : isSkipped ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-500'}
                        `}>
                            {idx + 1}
                        </div>
                        <div className="flex flex-col">
                             <span className={`font-mono font-bold text-sm ${isSkipped ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {r.number}
                             </span>
                             {r.original !== r.number && <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{r.original}</span>}
                        </div>
                    </div>

                    <div className="flex items-center">
                        {isSent ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-md shadow-sm border border-emerald-100">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-medium text-gray-600">{r.sentAt}</span>
                            </div>
                        ) : isSkipped ? (
                             <div className="flex items-center gap-1 text-gray-400">
                                <span className="text-[10px] font-medium uppercase">Skipped</span>
                                <XCircle size={14} />
                             </div>
                        ) : isProcessing ? (
                            <div className="flex items-center gap-2 text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-wide">Sending</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 group-hover:opacity-100 transition-opacity">
                                {!isAutoSending && (
                                     <button onClick={() => onRemove(r.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                         <Trash2 size={14} />
                                     </button>
                                )}
                                <Clock size={16} className="text-gray-300 ml-1" />
                            </div>
                        )}
                    </div>
                </div>
              );
          })}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-3 relative z-20">
         
         {/* Warning Banner */}
         {isAutoSending && (
             <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mb-2">
                 <AlertOctagon size={12} />
                 <span>Keep window open. Sending next in a few seconds...</span>
             </div>
         )}

         {!isComplete ? (
            <div className="flex gap-3">
                <button
                    onClick={isAutoSending ? onStopAuto : onStartAuto}
                    className={`flex-1 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all
                        ${isAutoSending 
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' 
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
                        }
                    `}
                >
                    {isAutoSending ? <PauseCircle size={20} fill="currentColor" className="text-white/20" /> : <Play size={20} fill="currentColor" className="text-white/20" />}
                    {isAutoSending ? 'Pause Auto Sender' : 'Start Auto Sender'}
                </button>
            </div>
         ) : (
            <div className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                <CheckCircle2 size={20} className="text-emerald-400"/>
                Campaign Finished
            </div>
         )}

         {(sentCount > 0 || skippedCount > 0) && !isAutoSending && (
             <button onClick={onDownloadReport} className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                 <Download size={14} /> Download Report
             </button>
         )}
      </div>
    </div>
  );
};