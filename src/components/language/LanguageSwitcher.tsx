import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation, Language } from '../../hooks/useTranslation';

interface LanguageSwitcherProps {
  variant?: 'header' | 'dropdown' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { currentLanguage, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  // コンパクト版（トグルボタン）
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              currentLanguage === lang.code
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // ヘッダー版（シンプルボタン）
  if (variant === 'header') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Globe className="w-4 h-4 text-gray-600" />
        <div className="flex items-center space-x-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1">{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ドロップダウン版（デフォルト）
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span className="flex items-center space-x-1">
          <span>{currentLang?.flag}</span>
          <span>{currentLang?.name}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* ドロップダウンメニュー */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors ${
                    currentLanguage === lang.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {currentLanguage === lang.code && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};