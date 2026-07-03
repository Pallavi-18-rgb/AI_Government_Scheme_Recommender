import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, LogOut, User, Users, CheckSquare, ShieldAlert, Bell, Sun, Moon, Menu } from 'lucide-react';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const notificationRef = useRef(null);

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
            
            // Auto refresh notifications every 30s
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [token]);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);
    
    // Click outside to close notifications
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path ? 'bg-emerald-900/40 text-emerald-400 border-r-2 border-emerald-400' : 'text-slate-400 hover:bg-emerald-900/20 hover:text-emerald-300';
    
    const unreadCount = notifications.filter(n => !n.read_status).length;

    if (token) {
        return (
            <div className="flex flex-col h-screen bg-[#0a0f0a] text-slate-100 overflow-hidden font-sans">
                {/* Department Branding Header */}
                <div className="bg-emerald-950/60 border-b border-emerald-900/50 text-center py-3 flex-shrink-0 z-30 tracking-wide shadow-[0_2px_12px_rgba(16,185,129,0.08)]">
                    <div className="text-sm font-black uppercase tracking-widest text-emerald-300">P.E.S. College of Engineering, Mandya</div>
                    <div className="text-xs font-semibold text-emerald-500/80 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 flex-shrink-0 bg-[#0d150d] border-r border-emerald-900/40 flex flex-col z-20">
                    <div className="h-24 flex flex-col justify-center px-6 border-b border-emerald-900/40">
                        <span className="text-2xl font-black tracking-tight text-white">GovScheme<span className="text-emerald-400">AI</span></span>
                        <span className="text-xs text-emerald-600 mt-1 uppercase tracking-[0.18em] font-medium">AI Welfare Assistant</span>
                    </div>
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/dashboard')}`}>
                            <LayoutDashboard className="w-5 h-5 mr-3"/> Dashboard
                        </Link>
                        <Link to="/search" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/search')}`}>
                            <Search className="w-5 h-5 mr-3"/> Schemes
                        </Link>
                        <Link to="/recommendations" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/recommendations')}`}>
                            <CheckSquare className="w-5 h-5 mr-3"/> Recommendations
                        </Link>
                        <Link to="/analytics" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/analytics')}`}>
                            <LayoutDashboard className="w-5 h-5 mr-3"/> Analytics
                        </Link>
                        <Link to="/profile" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/profile')}`}>
                            <User className="w-5 h-5 mr-3"/> Profile
                        </Link>
                        <Link to="/search" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${isActive('/family')}`}>
                            <Users className="w-5 h-5 mr-3"/> Family
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className={`flex items-center px-4 py-3 rounded-2xl font-medium transition-all duration-300 mt-8 border border-slate-200 text-slate-700 hover:bg-slate-100 ${isActive('/admin')}`}>
                                <ShieldAlert className="w-5 h-5 mr-3"/> Admin Portal
                            </Link>
                        )}
                    </nav>
                    <div className="p-4 border-t border-slate-200">
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all duration-300 font-medium">
                            <LogOut className="w-5 h-5 mr-3"/> Logout
                        </button>
                    </div>
                </aside>
                
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10"></div>
                    
                    <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 z-10 relative bg-white shadow-sm">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">GovSchemeAI Platform</p>
                            <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="inline-flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm hover:bg-slate-100 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                                aria-label="Open notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]"></span>
                                )}
                            </button>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold">G</div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Guest User</p>
                                    <p className="text-xs text-slate-500">Citizen Dashboard</p>
                                </div>
                            </div>
                        </div>
                    </header>
                    {showNotifications && (
                        <div className="absolute right-8 top-24 w-96 bg-white border border-slate-200 rounded-3xl shadow-xl z-40 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                                <p className="text-sm font-bold text-slate-900">Notifications</p>
                                <p className="text-xs text-slate-500 mt-1">Latest updates from your welfare recommendations</p>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-500 text-sm">No new notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className={`px-6 py-4 hover:bg-slate-50 transition-colors ${!n.read_status ? 'bg-slate-100' : ''}`} onClick={() => !n.read_status && markAsRead(n.id)}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                                </div>
                                                {!n.read_status && <span className="h-2.5 w-2.5 rounded-full bg-sky-500 mt-1.5" />}
                                            </div>
                                            <p className="mt-2 text-sm text-slate-600">{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-10 max-w-7xl mx-auto w-full">
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
        <div className="min-h-screen bg-[#0a0f0a] text-slate-100 flex flex-col font-sans">
            {/* Department Branding Header */}
            <div className="bg-emerald-950/60 border-b border-emerald-900/50 text-center py-3 flex-shrink-0 z-50 tracking-wide shadow-[0_2px_12px_rgba(16,185,129,0.08)]">
                <div className="text-sm font-black uppercase tracking-widest text-emerald-300">P.E.S. College of Engineering, Mandya</div>
                <div className="text-xs font-semibold text-emerald-500/80 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10"></div>
            <nav className="rounded-none border-b border-emerald-900/40 sticky top-0 z-50 bg-[#0d150d]/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-black tracking-tighter text-white">GovScheme<span className="text-cyan-400">AI</span></Link>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"><Home className="w-4 h-4 mr-1"/> Home</Link>
                            <Link to="/search" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"><Search className="w-4 h-4 mr-1"/> Schemes</Link>
                            <Link to="/login" className="glass-button inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold">Login / Register</Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-12">
                {children}
                <Chatbot />
            </main>
        </div>
    );
};

export default Layout;
