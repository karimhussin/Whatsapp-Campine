import React from 'react';
import { COMMON_COUNTRIES } from '../constants';
import { Phone, Globe, ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (number: string) => void;
  onlyCountry?: boolean;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  onlyCountry = false,
  disabled = false,
}) => {
  return (
    <div className={`w-full space-y-1.5 ${disabled ? 'opacity-70 pointer-events-none grayscale' : ''} transition-all duration-300`}>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
        {onlyCountry ? 'Default Country' : 'Phone Number'}
      </label>
      
      <div className="flex gap-3">
        <div className={`relative group ${onlyCountry ? 'w-full' : 'w-[140px]'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Globe className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <select
            value={countryCode}
            onChange={(e) => onCountryChange(e.target.value)}
            disabled={disabled}
            className="w-full h-12 pl-10 pr-8 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer transition-all font-medium text-gray-700 disabled:bg-gray-100"
          >
            {COMMON_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.name} ({country.code})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {!onlyCountry && (
          <div className="relative flex-1 group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
             </div>
             <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  onPhoneChange(val);
                }}
                disabled={disabled}
                placeholder="123456789"
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-gray-400 text-gray-800 font-medium disabled:bg-gray-100"
              />
          </div>
        )}
      </div>
      {!onlyCountry ? (
        <p className="text-[11px] text-gray-400 ml-1">
          Enter number without leading '0'. Format: <span className="font-mono text-gray-500">1012345678</span>
        </p>
      ) : (
        <p className="text-[11px] text-gray-400 ml-1">
           Applied to numbers without a country code.
        </p>
      )}
    </div>
  );
};