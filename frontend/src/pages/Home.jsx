import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, ShieldCheck, Bell, Users, Zap, FileText, ChevronRight } from 'lucide-react';
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
                        .filter(daysLeft => daysLeft > 0 && daysLeft <= 14);
                    setDeadlinesCount(upcoming.length);
                }).catch(console.error);
        }
    }, [token]);

    return (
        <div className="flex flex-col items-center min-h-[80vh] pb-20 px-4 sm:px-6" style={{backgroundColor: '#eef3f8'}}>

            {/* Hero Section */}
            <section className="w-full max-w-7xl mx-auto pt-12 pb-10">
                <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] items-start">

                    {/* Left: Text */}
                    <div>
                        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-5">
                            <ShieldCheck className="w-3.5 h-3.5" /> Official Government Welfare Assistant
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-5" style={{color: '#0d1f3c'}}>
                            Discover welfare<br />
                            <span style={{color: '#1a56db'}}>schemes made</span><br />
                            for you & your family.
                        </h1>
                        <p className="text-lg leading-relaxed max-w-xl mb-8" style={{color: '#3d5473'}}>
                            GovSchemeAI uses AI to match your profile — income, occupation, state, category — with verified government programs, and explains every decision transparently.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 mb-12">
                            <Link to="/login" className="glass-button inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-xl">
                                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link to="/search" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold rounded-xl border-2 border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition-all duration-200 shadow-sm">
                                Browse Schemes <ChevronRight className="ml-1 w-5 h-5" />
                            </Link>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Official Sources', value: '100%', sub: 'Verified data' },
                                { label: 'AI Matching', value: 'Smart', sub: 'Explainable AI' },
                                { label: 'Support', value: '24/7', sub: 'Chatbot assistance' },
                                { label: 'Security', value: 'JWT', sub: 'Secure & private' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200">
                                    <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{color: '#6b8299'}}>{stat.label}</p>
                                    <p className="text-2xl font-black" style={{color: '#1a56db'}}>{stat.value}</p>
                                    <p className="text-xs mt-1" style={{color: '#6b8299'}}>{stat.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Dashboard Preview Card */}
                    <div className="bg-white border border-blue-100 rounded-3xl shadow-xl overflow-hidden">
                        {/* Card Header */}
                        <div className="px-6 py-5 border-b border-blue-50" style={{background: 'linear-gradient(135deg, #1a3a6b 0%, #1a56db 100%)'}}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold tracking-widest text-blue-200 uppercase">Platform Overview</p>
                                    <h2 className="text-xl font-bold text-white mt-1">Your Welfare Dashboard</h2>
                                </div>
                                <div className="bg-white/20 rounded-xl p-2.5">
                                    <Bell className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 space-y-4">
                            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500 mb-2">Top Recommendation</p>
                                <p className="text-sm font-semibold text-slate-800">Find the best scheme fit based on your profile and family details.</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[10px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-bold">MATCH: 100%</span>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">✓ Eligible</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Update Profile', 'Search Schemes', 'View Analytics', 'Ask AI Assistant'].map((action, i) => (
                                        <button key={i} className="text-left rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200">
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-widest font-bold text-blue-600 mb-2">Why GovSchemeAI?</p>
                    <h2 className="text-3xl font-black" style={{color: '#0d1f3c'}}>Everything you need in one place</h2>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    {[
                        {
                            icon: <CheckCircle className="w-7 h-7" />,
                            iconBg: 'bg-blue-50',
                            iconColor: 'text-blue-600',
                            borderColor: 'border-t-blue-500',
                            title: 'Smart Eligibility',
                            desc: 'Match quickly with programs that suit your household status, income, occupation, caste category, and state.',
                        },
                        {
                            icon: <Search className="w-7 h-7" />,
                            iconBg: 'bg-violet-50',
                            iconColor: 'text-violet-600',
                            borderColor: 'border-t-violet-500',
                            title: 'Verified Search',
                            desc: 'Search government schemes with filters for state, occupation, category, and eligibility criteria.',
                        },
                        {
                            icon: <Users className="w-7 h-7" />,
                            iconBg: 'bg-emerald-50',
                            iconColor: 'text-emerald-600',
                            borderColor: 'border-t-emerald-500',
                            title: 'Family Coverage',
                            desc: 'Add your entire family and discover welfare schemes that each member individually qualifies for.',
                        },
                    ].map((f, i) => (
                        <div key={i} className={`bg-white border border-slate-200 ${f.borderColor} border-t-4 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-opacity-80 transition-all duration-200 hover:-translate-y-1`}>
                            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${f.iconBg} ${f.iconColor} mb-5`}>
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3" style={{color: '#0d1f3c'}}>{f.title}</h3>
                            <p className="leading-relaxed text-sm" style={{color: '#3d5473'}}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
