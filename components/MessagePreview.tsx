import React, { useEffect, useState } from 'react';
import { Send, CheckCheck, File, Paperclip, Battery, Wifi, Signal, ChevronLeft, Phone, Video, MoreVertical } from 'lucide-react';

interface MessagePreviewProps {
  message: string;
  attachment?: File | null;
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({ message, attachment }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (attachment) {
      const url = URL.createObjectURL(attachment);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [attachment]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isImage = attachment?.type.startsWith('image/');
  const isVideo = attachment?.type.startsWith('video/');

  return (
    <div className="w-[320px] h-[600px] bg-black rounded-[3rem] p-3 shadow-2xl border-[6px] border-gray-800 relative overflow-hidden mx-auto transform hover:scale-[1.02] transition-transform duration-500">
      
      {/* Phone Notion Island/Notch Area */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-6 w-32 bg-black rounded-b-xl z-50"></div>

      {/* Screen Container */}
      <div className="w-full h-full bg-[#E5DDD5] rounded-[2.2rem] flex flex-col relative overflow-hidden">
        
        {/* Status Bar */}
        <div className="h-8 bg-[#075E54] flex items-center justify-between px-6 pt-2 text-white text-[10px] z-20">
            <span className="font-medium">{formatTime()}</span>
            <div className="flex gap-1.5 items-center">
                <Signal size={10} fill="currentColor" />
                <Wifi size={10} />
                <Battery size={10} fill="currentColor" />
            </div>
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#075E54] p-2 flex items-center justify-between text-white shadow-md z-20">
            <div className="flex items-center gap-1">
                <ChevronLeft size={20} />
                <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden border border-white/20">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Robert&top=hat&facialHair=beardMedium" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="ml-2">
                    <p className="text-sm font-semibold leading-none">Karim Hussien</p>
                    <p className="text-[10px] opacity-80 leading-tight">online</p>
                </div>
            </div>
            <div className="flex items-center gap-4 pr-2">
                <Video size={18} />
                <Phone size={16} />
                <MoreVertical size={16} />
            </div>
        </div>

        {/* Chat Area Background */}
        <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-40 z-0"></div>
        
        {/* Messages Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-4 pb-2 space-y-2">
            
          {(message || attachment) ? (
            <div className="self-end max-w-[90%] bg-[#d9fdd3] p-1.5 rounded-lg shadow-sm rounded-tr-none flex flex-col animate-fade-in-up">
              
              {/* Attachment Preview */}
              {attachment && (
                  <div className="mb-1 rounded-md overflow-hidden bg-black/5 flex items-center justify-center relative border border-black/5">
                      {isImage ? (
                          <img src={previewUrl!} alt="Attachment" className="max-w-full max-h-[160px] object-cover" />
                      ) : isVideo ? (
                          <video src={previewUrl!} className="max-w-full max-h-[160px]" controls />
                      ) : (
                          <div className="p-3 flex items-center gap-3 bg-white/60 w-full backdrop-blur-sm">
                              <File className="w-8 h-8 text-red-500" />
                              <div className="flex flex-col overflow-hidden">
                                  <span className="text-xs font-bold truncate text-gray-700">{attachment.name}</span>
                                  <span className="text-[9px] text-gray-500">{(attachment.size / 1024).toFixed(1)} KB • DOC</span>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              <div className={`px-2 pb-1 ${attachment ? 'pt-1' : 'pt-1'}`}>
                  <p className="text-[13px] text-gray-800 whitespace-pre-wrap leading-snug break-words dir-auto">
                  {message}
                  </p>
                  <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                    <span className="text-[9px] text-gray-600">{formatTime()}</span>
                    <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
                  </div>
              </div>
            </div>
          ) : (
            <div className="self-center bg-[#FFF5C4] px-3 py-1.5 rounded-lg shadow-sm mb-auto mt-4 border border-[#ffeeb0]">
               <p className="text-[11px] text-gray-600 text-center flex items-center gap-1">
                 🔒 Messages are end-to-end encrypted.
               </p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="relative z-10 bg-[#f0f2f5] px-2 py-2 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full h-9 flex items-center px-3 shadow-sm border border-gray-100">
             <span className="text-gray-300 text-sm">Message</span>
             <Paperclip size={16} className="text-gray-400 ml-auto transform -rotate-45" />
          </div>
          <div className="w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center shadow-sm">
              <Send className="w-4 h-4 text-white ml-0.5" />
          </div>
        </div>

      </div>
    </div>
  );
};