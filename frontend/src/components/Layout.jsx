import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, LayoutDashboard, LogOut, User, Users, CheckSquare, ShieldAlert, Bell } from 'lucide-react';
import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
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

    const isActive = (path) => location.pathname === path ? 'bg-cyan-900/40 text-cyan-400 border-r-2 border-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white';
    
    const unreadCount = notifications.filter(n => !n.read_status).length;

    if (token) {
        // Authenticated Sidebar Layout (HUD Style)
        return (
            <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
                {/* Department Branding Header */}
                <div className="bg-cyan-950/90 border-b border-cyan-900/60 text-center py-2.5 text-cyan-300 flex-shrink-0 z-30 tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <div className="text-sm font-black uppercase tracking-wider">P.E.S. College of Engineering, Mandya</div>
                    <div className="text-xs font-bold text-cyan-400/95 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
                </div>
                <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 bg-slate-950/80 backdrop-blur-md border-r border-slate-800/60 flex flex-col z-20">
                    <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
                        <span className="text-2xl font-black tracking-tighter text-white">GovScheme<span className="text-cyan-500">AI</span></span>
                    </div>
                    <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
                        <Link to="/" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/')}`}>
                            <Home className="w-5 h-5 mr-3"/> Home
                        </Link>
                        <Link to="/dashboard" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/dashboard')}`}>
                            <LayoutDashboard className="w-5 h-5 mr-3"/> Dashboard
                        </Link>
                        <Link to="/search" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/search')}`}>
                            <Search className="w-5 h-5 mr-3"/> Database
                        </Link>
                        <Link to="/analytics" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/analytics')}`}>
                            <LayoutDashboard className="w-5 h-5 mr-3"/> Analytics
                        </Link>
                        <Link to="/profile" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/profile')}`}>
                            <User className="w-5 h-5 mr-3"/> Profile
                        </Link>
                        <Link to="/profile" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActive('/family')}`}>
                            <Users className="w-5 h-5 mr-3"/> Family
                        </Link>
                        {isAdmin && (
                            <Link to="/admin" className={`flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 mt-8 border border-red-500/20 text-red-400 hover:bg-red-900/20 ${isActive('/admin')}`}>
                                <ShieldAlert className="w-5 h-5 mr-3"/> Admin Portal
                            </Link>
                        )}
                    </nav>
                    <div className="p-4 border-t border-slate-800/60">
                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300 font-medium">
                            <LogOut className="w-5 h-5 mr-3"/> Disconnect
                        </button>
                    </div>
                </aside>
                
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Futuristic Grid Background Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10"></div>
                    
                    {/* Top Header */}
                    <header className="h-16 border-b border-slate-800/60 flex items-center justify-end px-8 z-10 relative">
                        <div className="relative" ref={notificationRef}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-800/50"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                                )}
                            </button>
                            
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50">
                                    <div className="p-4 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900 z-10">
                                        <h3 className="font-bold text-slate-200">Notifications</h3>
                                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full">{unreadCount} unread</span>
                                    </div>
                                    <div className="divide-y divide-slate-800/50">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-slate-500 text-sm">
                                                No new notifications
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div 
                                                    key={n.id} 
                                                    onClick={() => !n.read_status && markAsRead(n.id)}
                                                    className={`p-4 cursor-pointer hover:bg-slate-800/30 transition-colors ${!n.read_status ? 'bg-slate-800/10' : 'opacity-75'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className={`text-sm font-bold ${!n.read_status ? 'text-cyan-400' : 'text-slate-400'}`}>{n.title}</span>
                                                        {!n.read_status && <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5"></div>}
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                                                    <span className="text-[10px] text-slate-600 block mt-2">{new Date(n.created_at).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Main Scrollable Content */}
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            {/* Department Branding Header */}
            <div className="bg-cyan-950/90 border-b border-cyan-900/60 text-center py-2.5 text-cyan-300 flex-shrink-0 z-50 tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="text-sm font-black uppercase tracking-wider">P.E.S. College of Engineering, Mandya</div>
                <div className="text-xs font-bold text-cyan-400/95 mt-0.5">Department of Computer Science and Engineering (Data Science)</div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10"></div>
            <nav className="glass-panel rounded-none border-t-0 border-x-0 border-b border-slate-800/60 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center">
                            <Link to="/" className="text-2xl font-black tracking-tighter text-white">GovScheme<span className="text-cyan-500">AI</span></Link>
                        </div>
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">Home</Link>
                            <Link to="/search" className="text-slate-300 hover:text-cyan-400 font-medium transition-colors">Database</Link>
                            <Link to="/login" className="glass-button px-6 py-2.5 rounded-full text-sm font-bold tracking-wide">INITIALIZE</Link>
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
