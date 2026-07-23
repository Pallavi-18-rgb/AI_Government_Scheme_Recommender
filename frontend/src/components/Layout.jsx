import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, LogOut, User, Users, CheckSquare, ShieldAlert, Bell, Sun, Moon, Palette, Globe, FileCheck, FileText, ChevronDown } from 'lucide-react';
import Chatbot from './Chatbot';
import { useLanguage } from '../context/LanguageContext';
import { useTheme, themePresets } from '../context/ThemeContext';

const Layout = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const location = useLocation();

    const { t, lang, changeLanguage } = useLanguage();
    const { theme, changeTheme, isDarkMode, toggleDarkMode, activePreset } = useTheme();

    const [isAdmin, setIsAdmin] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [showLangPicker, setShowLangPicker] = useState(false);

    const notificationRef = useRef(null);
    const themeRef = useRef(null);
    const langRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const { default: axios } = await import('axios');
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const { default: axios } = await import('axios');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_status: 1 } : n));
        } catch (error) {}
    };

    useEffect(() => {
        if (token) {
            import('axios').then(axios => {
                axios.default.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(res => {
                    if (res.data.is_admin) setIsAdmin(true);
                }).catch(() => {});
            });
            fetchNotifications();
            
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (themeRef.current && !themeRef.current.contains(event.target)) {
                setShowThemePicker(false);
            }
            if (langRef.current && !langRef.current.contains(event.target)) {
                setShowLangPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path 
        ? `${activePreset.accentBg} font-bold border-r-4 border-blue-600 shadow-sm` 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900';

    const unreadCount = notifications.filter(n => !n.read_status).length;

    const languageOptions = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी (Hindi)' },
        { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'te', label: 'తెలుగు (Telugu)' },
        { code: 'mr', label: 'मराठी (Marathi)' }
    ];

    if (token) {
        return (
            <div className="flex flex-col h-screen bg-[#f1f5f9] text-slate-800 overflow-hidden font-sans">
                {/* Department Branding Header */}
                <div className="bg-[#1a3a6b] text-center py-2.5 flex-shrink-0 z-30 tracking-wide">
                    <div className="text-sm font-bold uppercase tracking-widest text-white">P.E.S. College of Engineering, Mandya</div>
                    <div className="text-xs font-medium text-blue-200 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
                        <div className="h-24 flex flex-col justify-center px-6 border-b border-slate-200 text-white transition-all duration-500" style={{ background: 'var(--header-bg)' }}>
                            <span className="text-2xl font-black tracking-tight text-white">GovScheme<span className="text-yellow-300">AI</span></span>
                            <span className="text-xs text-blue-100 mt-1 uppercase tracking-[0.15em] font-medium">AI Welfare Assistant</span>
                        </div>
                        
                        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                            <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/dashboard')}`}>
                                <LayoutDashboard className="w-4 h-4 mr-3"/> {t('dashboard')}
                            </Link>
                            <Link to="/search" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/search')}`}>
                                <Search className="w-4 h-4 mr-3"/> {t('schemes')}
                            </Link>
                            <Link to="/recommendations" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/recommendations')}`}>
                                <CheckSquare className="w-4 h-4 mr-3"/> {t('recommendations')}
                            </Link>
                            <Link to="/applications" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/applications')}`}>
                                <FileCheck className="w-4 h-4 mr-3"/> {t('applications')}
                            </Link>
                            <Link to="/documents" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/documents')}`}>
                                <FileText className="w-4 h-4 mr-3"/> {t('documents')}
                            </Link>
                            <Link to="/analytics" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/analytics')}`}>
                                <LayoutDashboard className="w-4 h-4 mr-3"/> {t('analytics')}
                            </Link>
                            <Link to="/profile" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/profile')}`}>
                                <User className="w-4 h-4 mr-3"/> {t('profile')}
                            </Link>
                            <Link to="/family" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${isActive('/family')}`}>
                                <Users className="w-4 h-4 mr-3"/> {t('family')}
                            </Link>

                            {isAdmin && (
                                <Link to="/admin" className={`flex items-center px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-300 mt-6 border border-slate-200 text-slate-700 hover:bg-slate-100 ${isActive('/admin')}`}>
                                    <ShieldAlert className="w-4 h-4 mr-3"/> {t('adminPortal')}
                                </Link>
                            )}
                        </nav>

                        <div className="p-4 border-t border-slate-200">
                            <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-medium text-sm">
                                <LogOut className="w-4 h-4 mr-3"/> {t('logout')}
                            </button>
                        </div>
                    </aside>

                    {/* Main Workspace */}
                    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 z-10 relative bg-white shadow-sm">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">GovSchemeAI Platform</p>
                                <h2 className="text-xl font-extrabold text-slate-900">{t('welcomeBack')}</h2>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Language Selector */}
                                <div className="relative" ref={langRef}>
                                    <button
                                        onClick={() => setShowLangPicker(!showLangPicker)}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        <Globe className="w-4 h-4 text-blue-600" />
                                        <span className="uppercase">{lang}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    {showLangPicker && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1">
                                            {languageOptions.map(opt => (
                                                <button
                                                    key={opt.code}
                                                    onClick={() => {
                                                        changeLanguage(opt.code);
                                                        setShowLangPicker(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                                        lang === opt.code ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Theme Customizer */}
                                <div className="relative" ref={themeRef}>
                                    <button
                                        onClick={() => setShowThemePicker(!showThemePicker)}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
                                        title="Customize Theme"
                                    >
                                        <Palette className="w-4 h-4 text-purple-600" />
                                    </button>
                                    {showThemePicker && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                                            <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('selectTheme')}</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.values(themePresets).map(preset => (
                                                    <button
                                                        key={preset.id}
                                                        onClick={() => {
                                                            changeTheme(preset.id);
                                                            setShowThemePicker(false);
                                                        }}
                                                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                                                            theme === preset.id ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold' : 'border-slate-100 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-4 h-4 rounded-full border shadow-sm" style={{ backgroundColor: preset.previewHex }}></span>
                                                            <span>{preset.name}</span>
                                                        </div>
                                                        {theme === preset.id && <span className="text-blue-600 text-xs">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dark/Light Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
                                    aria-label="Toggle theme"
                                >
                                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                                </button>

                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button 
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        <Bell className="w-4 h-4" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 top-14 w-80 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden">
                                            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
                                                <p className="text-xs font-bold text-slate-900">Notifications</p>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-slate-500 text-xs">No new notifications</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n.id} className={`px-5 py-3 hover:bg-slate-50 transition-colors ${!n.read_status ? 'bg-slate-100' : ''}`} onClick={() => !n.read_status && markAsRead(n.id)}>
                                                            <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                                            <p className="mt-1 text-xs text-slate-600">{n.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                        <Chatbot />
                    </main>
                </div>
            </div>
        );
    }

    // Public Top Navbar Layout
    return (
        <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans">
            <div className="bg-[#1a3a6b] text-center py-2.5 flex-shrink-0 z-50 tracking-wide">
                <div className="text-sm font-bold uppercase tracking-widest text-white">P.E.S. College of Engineering, Mandya</div>
                <div className="text-xs font-medium text-blue-200 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
            </div>
            
            <nav className="border-b border-slate-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="text-2xl font-black tracking-tighter text-slate-900">GovScheme<span className="text-blue-600">AI</span></Link>
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-semibold flex items-center"><Home className="w-4 h-4 mr-1"/> {t('dashboard')}</Link>
                            <Link to="/search" className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-semibold flex items-center"><Search className="w-4 h-4 mr-1"/> {t('schemes')}</Link>
                            <Link to="/login" className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md transition-colors">Login / Register</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
                {children}
                <Chatbot />
            </main>
        </div>
    );
};

export default Layout;
