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
        <div className="flex flex-col items-center min-h-[80vh] pb-16 px-4 sm:px-6 bg-slate-50">
            {/* Hero Section */}
            <section className="w-full max-w-7xl mx-auto py-16">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
                    <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-sky-600 font-semibold mb-4">Government Welfare Assistant</p>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-950 leading-tight">Find the right government schemes with confidence.</h1>
                        <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-relaxed">GovSchemeAI helps citizens discover verified welfare programs, eligibility matches, and application steps in one modern, accessible platform.</p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link to="/login" className="glass-button inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full shadow-[0_18px_40px_rgba(37,99,235,0.16)]">
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                            <Link to="/search" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-sm">
                                Explore Schemes
                            </Link>
                        </div>
                        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Trusted</p>
                                <p className="text-3xl font-bold text-slate-950">100%</p>
                                <p className="text-sm text-slate-500 mt-1">Official scheme sources</p>
                            </div>
                            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Awarded</p>
                                <p className="text-3xl font-bold text-slate-950">AI</p>
                                <p className="text-sm text-slate-500 mt-1">Smart eligibility matching</p>
                            </div>
                            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Support</p>
                                <p className="text-3xl font-bold text-slate-950">24/7</p>
                                <p className="text-sm text-slate-500 mt-1">Guidance for every citizen</p>
                            </div>
                            <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-2">Secure</p>
                                <p className="text-3xl font-bold text-slate-950">High</p>
                                <p className="text-sm text-slate-500 mt-1">Privacy-first experience</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Platform overview</p>
                                <h2 className="text-2xl font-bold text-slate-950 mt-2">Your welfare dashboard</h2>
                            </div>
                            <div className="rounded-2xl bg-sky-50 text-sky-600 p-3">
                                <Bell className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-5">
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Top Recommendation</p>
                                <p className="text-lg font-semibold text-slate-900">Find the best scheme fit based on your profile and family details.</p>
                            </div>
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-3">Quick Actions</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="text-left rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">Update Profile</button>
                                    <button className="text-left rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">Search Schemes</button>
                                    <button className="text-left rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">View Analytics</button>
                                    <button className="text-left rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition">Ask AI Assistant</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="w-full max-w-7xl mx-auto grid gap-8 lg:grid-cols-3">
                <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 mb-6">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950 mb-3">Smart Eligibility</h3>
                    <p className="text-slate-600 leading-relaxed">Match quickly with programs that suit your household status, income, and occupation.</p>
                </div>
                <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-50 text-violet-600 mb-6">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950 mb-3">Verified Search</h3>
                    <p className="text-slate-600 leading-relaxed">Search government schemes with filters for state, occupation, category, and eligibility.</p>
                </div>
                <div className="rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950 mb-3">Trusted Source</h3>
                    <p className="text-slate-600 leading-relaxed">Every recommendation is based on official program details and real eligibility rules.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
