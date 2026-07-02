import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, ShieldCheck, Bell } from 'lucide-react';
import axios from 'axios';

const Home = () => {
    const token = localStorage.getItem('token');
    const [deadlinesCount, setDeadlinesCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (token) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/schemes`)
                .then(res => {
                    const upcoming = res.data
                        .filter(s => s.deadline)
                        .map(s => {
                            const daysLeft = Math.ceil((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                            return daysLeft;
                        })
                        .filter(daysLeft => daysLeft > 0 && daysLeft <= 14); // Next 14 days
                    setDeadlinesCount(upcoming.length);
                }).catch(console.error);
        }
    }, [token]);

    return (
        <div className="flex flex-col items-center">
            {token && (
                <div className="w-full flex justify-end mb-4 relative z-10">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center text-slate-300 hover:text-white glass-panel border-slate-700 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(8,145,178,0.2)] transition-all relative group">
                        <Bell className="w-5 h-5 mr-2 text-cyan-500 group-hover:animate-pulse" />
                        {deadlinesCount > 0 && (
                            <span className="absolute top-1 left-7 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full animate-ping"></span>
                        )}
                        {deadlinesCount > 0 && (
                            <span className="absolute top-1 left-7 w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-full"></span>
                        )}
                        <span className={deadlinesCount > 0 ? "text-cyan-400 font-bold" : "font-medium"}>
                            {deadlinesCount > 0 ? `${deadlinesCount} Critical Alert${deadlinesCount > 1 ? 's' : ''}` : "System Nominal"}
                        </span>
                    </button>
                </div>
            )}
            {/* Hero Section */}
            <div className="w-full text-center py-28 glass-panel mb-16 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
                <h1 className="text-6xl font-black text-white tracking-tighter mb-6">
                    Welcome to GovScheme <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI</span>.
                </h1>
                <p className="mt-6 text-xl text-slate-300 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
                    The most advanced artificial intelligence engine for discovering official government welfare programs, subsidies, and schemes.
                </p>
                {!token ? (
                    <div className="flex justify-center gap-6">
                        <Link to="/login" className="glass-button inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full">
                            INITIALIZE ENGINE <ArrowRight className="ml-2 w-5 h-5"/>
                        </Link>
                        <Link to="/search" className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full text-white border border-slate-700 hover:bg-slate-800/50 transition-colors">
                            BROWSE DATABASE
                        </Link>
                    </div>
                ) : (
                    <div className="flex justify-center gap-4">
                        <Link to="/dashboard" className="glass-button inline-flex items-center justify-center px-10 py-4 text-lg font-bold rounded-full">
                            ACCESS COMMAND CENTER <ArrowRight className="ml-2 w-5 h-5"/>
                        </Link>
                    </div>
                )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                <div className="glass-panel p-10 text-center hover:-translate-y-2 transition-transform duration-300 group">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-slate-800/50 text-cyan-400 border border-slate-700 mb-8 group-hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Neural Matching</h3>
                    <p className="text-slate-400 font-light leading-relaxed">Advanced algorithms cross-reference your exact demographic footprint against 500+ rules.</p>
                </div>
                <div className="glass-panel p-10 text-center hover:-translate-y-2 transition-transform duration-300 group">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-slate-800/50 text-purple-400 border border-slate-700 mb-8 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                        <Search className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Deep Discovery</h3>
                    <p className="text-slate-400 font-light leading-relaxed">Search through hundreds of verified government programs with semantic search capabilities.</p>
                </div>
                <div className="glass-panel p-10 text-center hover:-translate-y-2 transition-transform duration-300 group">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-slate-800/50 text-green-400 border border-slate-700 mb-8 group-hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Cryptographic Verification</h3>
                    <p className="text-slate-400 font-light leading-relaxed">All schemes are strictly sourced from official government databases and updated in real-time.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
