import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themePresets = {
  sapphire: {
    id: 'sapphire',
    name: 'Royal Sapphire',
    headerBg: 'from-[#1a3a6b] to-[#1a56db]',
    brandBadge: 'bg-sky-600',
    primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
    accentText: 'text-blue-600',
    accentBg: 'bg-blue-50 text-blue-700',
    cardBorder: 'border-blue-100',
    ringColor: 'ring-blue-500',
    previewHex: '#1a56db'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Growth',
    headerBg: 'from-[#064e3b] to-[#10b981]',
    brandBadge: 'bg-emerald-600',
    primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    accentText: 'text-emerald-600',
    accentBg: 'bg-emerald-50 text-emerald-700',
    cardBorder: 'border-emerald-100',
    ringColor: 'ring-emerald-500',
    previewHex: '#10b981'
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    headerBg: 'from-[#7c2d12] to-[#f97316]',
    brandBadge: 'bg-amber-600',
    primaryBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
    accentText: 'text-amber-600',
    accentBg: 'bg-amber-50 text-amber-800',
    cardBorder: 'border-amber-100',
    ringColor: 'ring-amber-500',
    previewHex: '#f97316'
  },
  obsidian: {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    headerBg: 'from-[#0f172a] to-[#334155]',
    brandBadge: 'bg-slate-800',
    primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
    accentText: 'text-cyan-600',
    accentBg: 'bg-slate-100 text-slate-900',
    cardBorder: 'border-slate-300',
    ringColor: 'ring-slate-500',
    previewHex: '#0f172a'
  },
  iris: {
    id: 'iris',
    name: 'Velvet Iris',
    headerBg: 'from-[#4c1d95] to-[#7c3aed]',
    brandBadge: 'bg-purple-600',
    primaryBtn: 'bg-purple-600 hover:bg-purple-700 text-white',
    accentText: 'text-purple-600',
    accentBg: 'bg-purple-50 text-purple-700',
    cardBorder: 'border-purple-100',
    ringColor: 'ring-purple-500',
    previewHex: '#7c3aed'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('userTheme') || 'sapphire');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('userDarkMode') === 'true');

  const changeTheme = (newTheme) => {
    if (themePresets[newTheme]) {
      setTheme(newTheme);
      localStorage.setItem('userTheme', newTheme);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('userDarkMode', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const activePreset = themePresets[theme] || themePresets.sapphire;

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, isDarkMode, toggleDarkMode, activePreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
