import React, { useRef } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';

interface BulkInputProps {
  text: string;
  onChange: (text: string) => void;
  disabled?: boolean;
}

export const BulkInput: React.FC<BulkInputProps> = ({ text, onChange, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const newText = text ? `${text}\n${content}` : content;
        onChange(newText);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-70 pointer-events-none grayscale' : ''} transition-all`}>
      <div className="flex justify-between items-end">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-2">
            <FileText className="w-3 h-3" />
            Recipients List
        </label>
        <div className="flex gap-2">
            <button
              onClick={() => onChange('')}
              disabled={disabled || !text}
              className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
            >
               Clear
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <Upload size={12} /> Upload List
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".txt,.csv" 
                className="hidden" 
                disabled={disabled}
            />
        </div>
      </div>
      
      <div className="relative group">
        <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Paste numbers here, one per line.\n01012345678\n+966501234567`}
            className="w-full h-36 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none text-sm font-mono text-gray-600 disabled:bg-gray-100 transition-all leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded">
                CSV / TXT
            </span>
        </div>
      </div>
    </div>
  );
};