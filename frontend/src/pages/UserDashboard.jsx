import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, TrendingUp, Bell, ChevronRight, Activity, Target, Bookmark, AlertCircle, CheckCircle2, FileText, Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const UserDashboard = () => {
    const { t } = useLanguage();
    const [profile, setProfile] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [deadlines, setDeadlines] = useState([]);
    const [stats, setStats] = useState({ profileCompletion: 0, eligibleSchemes: 0, savedSchemes: 0, missingFields: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        // Fetch Profile
        axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setProfile(res.data))
          .catch(() => navigate('/login'));

        // Fetch Recommendations
        axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            const recs = res.data.recommendations || res.data;
            setRecommendations(recs.slice(0, 3)); // Show top 3

        }).catch(console.error);

        // Fetch Stats
        axios.get(`http://localhost:5000/api/users/dashboard-stats?t=${Date.now()}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setStats(res.data);
        }).catch(console.error);

        // Fetch all schemes to find approaching deadlines
        axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/schemes`)
            .then(res => {
                const upcoming = res.data
                    .filter(s => s.deadline)
                    .map(s => {
                        const daysLeft = Math.ceil((new Date(s.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                        return { ...s, daysLeft };
                    })
                    .filter(s => s.daysLeft > 0 && s.daysLeft <= 14) // Next 14 days
                    .sort((a, b) => a.daysLeft - b.daysLeft);
                setDeadlines(upcoming);
            }).catch(console.error);
            
    }, [navigate]);

    if (!profile) return <div className="text-center mt-20 text-cyan-500 animate-pulse font-mono tracking-widest text-sm uppercase">Loading Command Center...</div>;

    const isProfileComplete = stats.profileCompletion === 100;
    
    let tier = "Incomplete Profile";
    let tierColor = "text-red-500";
    let progressColor = "bg-red-500";
    if (stats.profileCompletion >= 90) {
        tier = "Ready to Apply";
        tierColor = "text-green-400";
        progressColor = "bg-green-500";
    } else if (stats.profileCompletion >= 70) {
        tier = "Needs Minor Updates";
        tierColor = "text-yellow-400";
        progressColor = "bg-yellow-500";
    }

    const missedBenefits = Math.max(0, stats.eligibleSchemes - stats.savedSchemes);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* HUD Header */}
            <div className="glass-panel p-8 flex flex-col lg:flex-row justify-between items-end gap-6 border border-slate-800/60 shadow-[0_24px_80px_rgba(2,12,27,0.35)] rounded-[2rem]">
                <div>
                    <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-2">Authenticated User</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">{profile.name} <span className="text-slate-500 font-light">| COMMAND CENTER</span></h1>
                    <p className="mt-4 text-slate-400 text-sm max-w-xl leading-relaxed">Your personalized scheme control panel for focused eligibility recommendations, deadlines, and application readiness.</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-500 font-mono text-xs">SYSTEM STATUS</p>
                    <p className="text-green-400 font-bold tracking-widest uppercase flex items-center justify-end"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></span> Online</p>
                </div>
            </div>

            {deadlines.length > 0 && (
                <div className="glass-panel p-6 mb-8 border-l-4 border-l-red-500">
                    <div className="flex items-center text-red-400 mb-4 font-bold tracking-wide uppercase text-sm">
                        <Bell className="mr-2 w-5 h-5 animate-[ring_2s_ease-in-out_infinite]" /> Approaching Deadlines
                    </div>
                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
                        {deadlines.map(d => (
                            <li key={d.id} className="text-sm text-red-200 bg-red-950/30 p-4 rounded-lg border border-red-800/50 flex justify-between items-center group hover:bg-red-900/40 transition-colors">
                                <span><strong className="text-white text-base">{d.scheme_name}</strong> <br/><span className="text-red-400 font-mono text-xs mt-1 block">CLOSES IN {d.daysLeft} DAYS</span></span>
                                <a href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(d.scheme_name)}`} target="_blank" rel="noreferrer" className="text-xs bg-red-600 text-white px-4 py-2 rounded font-bold tracking-wide hover:bg-red-500 transition shadow-[0_0_10px_rgba(220,38,38,0.4)]">INITIATE</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* AI Accuracy Metrics Sidebar */}
                <div className="flex flex-col space-y-8">
                    {/* Readiness Widget */}
                    <div className="glass-panel p-8 flex flex-col justify-between border-t-2 border-t-purple-500 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                            <Target className="w-32 h-32 text-purple-500" />
                        </div>
                        <div>
                            <div className="flex items-center text-purple-400 mb-2 font-mono text-xs uppercase tracking-widest">
                                <TrendingUp className="mr-2 w-4 h-4" /> {t('readinessScore')}
                            </div>
                            
                            <div className="flex items-end space-x-2">
                                <h2 className="text-4xl font-black text-white">
                                    {stats.profileCompletion}<span className="text-xl text-purple-500">%</span>
                                </h2>
                            </div>
                            
                            <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                                <div className={`${progressColor} h-2 rounded-full transition-all duration-1000`} style={{ width: `${stats.profileCompletion}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* App Readiness Score Widget */}
                    <div className="glass-panel p-8 flex flex-col justify-between border-t-2 border-t-cyan-500 relative overflow-hidden group">
                        <div>
                            <div className="flex items-center text-cyan-400 mb-2 font-mono text-xs uppercase tracking-widest">
                                <Activity className="mr-2 w-4 h-4" /> Application Readiness
                            </div>
                            <p className="text-[10px] text-slate-500 mb-4 font-light">Calculated via profile matches & document availability.</p>
                            
                            <div className="flex items-end space-x-2">
                                <h2 className="text-6xl font-black text-white">
                                    {stats.readiness?.score || 0}<span className="text-2xl text-cyan-500">/100</span>
                                </h2>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Profile Completeness (40%)</span>
                                    <span className="text-white font-bold">{Math.round((stats.profileCompletion || 0) * 0.4)} / 40</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Documents Available (40%)</span>
                                    <span className="text-white font-bold">{Math.round((stats.readiness?.documentScore || 0) * 0.4)} / 40</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Scheme Match Confidence (20%)</span>
                                    <span className="text-white font-bold">{Math.round((stats.readiness?.eligibilityScore || 0) * 0.2)} / 20</span>
                                </div>
                            </div>

                            <p className={`text-sm mt-6 font-bold uppercase tracking-widest flex items-center ${stats.readiness?.score >= 90 ? 'text-green-400' : stats.readiness?.score >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {stats.readiness?.score >= 90 ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
                                {stats.readiness?.score >= 90 ? 'Ready to Apply' : stats.readiness?.score >= 70 ? 'Almost Ready' : 'Action Required'}
                            </p>
                        </div>
                    </div>

                    <Link to="/analytics" className="block w-full text-center px-4 py-3 border border-purple-500/50 text-purple-400 font-bold rounded-lg text-sm hover:bg-purple-500/10 transition-colors uppercase tracking-wider relative z-10">View System Analytics</Link>
                </div>

                {/* AI Recommendations & Stats Widget */}
                <div className="glass-panel p-8 md:col-span-2 border border-slate-800/60 shadow-[0_24px_70px_rgba(2,12,27,0.25)] rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
                    
                    <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-4">
                        <div className="flex items-center text-slate-300 font-mono text-xs uppercase tracking-widest">
                            <Activity className="mr-2 w-4 h-4 text-cyan-400" /> High Priority Matches
                        </div>
                        <Link to="/recommendations" className="text-xs font-bold text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest flex items-center">Expand <ChevronRight className="w-4 h-4 ml-1"/></Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="glass-panel p-4 rounded-3xl border border-slate-800/50 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{t('eligibleSchemes')}</p>
                                <p className="text-2xl font-black text-white">{stats.eligibleSchemes}</p>
                            </div>
                            <Activity className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="glass-panel p-4 rounded-3xl border border-slate-800/50 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">{t('savedSchemes')}</p>
                                <p className="text-2xl font-black text-white">{stats.savedSchemes}</p>
                            </div>
                            <Bookmark className="w-6 h-6 text-cyan-400" />
                        </div>
                        
                        {/* Documents Alert */}
                        <div className={`glass-panel col-span-2 p-4 rounded-3xl border flex flex-col justify-center relative group overflow-hidden ${stats.readiness?.missingDocuments?.length > 0 ? 'bg-slate-900/40 border-slate-800/50' : 'bg-green-950/20 border-green-900/50'}`}>
                            {stats.readiness?.missingDocuments?.length > 0 && <div className="absolute inset-0 bg-gradient-to-r from-red-950/10 to-transparent opacity-50 z-0"></div>}
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <p className={`text-[9px] uppercase tracking-widest font-bold flex items-center ${stats.readiness?.missingDocuments?.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {stats.readiness?.missingDocuments?.length > 0 ? <AlertCircle className="w-3 h-3 mr-1"/> : <CheckCircle2 className="w-3 h-3 mr-1"/>}
                                        {stats.readiness?.missingDocuments?.length > 0 ? 'Action Required: Missing Docs' : 'Document Status: Complete'}
                                    </p>
                                    {stats.readiness?.missingDocuments?.length > 0 && (
                                        <Link to="/recommendations" className="text-[9px] text-cyan-500 hover:text-cyan-300 flex items-center transition-colors">
                                            Mark Available <ArrowRight className="w-3 h-3 ml-1"/>
                                        </Link>
                                    )}
                                </div>
                                
                                {stats.readiness?.missingDocuments?.length > 0 && (
                                    <p className="text-[10px] text-slate-500 mb-2 font-light leading-relaxed">
                                        Your Application Readiness is limited by missing documents. Navigate to your recommended schemes to check off documents you possess.
                                    </p>
                                )}
                                
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {stats.readiness?.missingDocuments?.length > 0 ? stats.readiness.missingDocuments.map((d, i) => (
                                        <span key={i} className="text-[9px] px-2 py-1 bg-red-950/30 text-red-400 border border-red-900/50 rounded uppercase tracking-wider">{d}</span>
                                    )) : <span className="text-[10px] text-green-500 flex items-center">All required documents are available. Your profile is ready!</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deadline Tracker */}
                    {stats.readiness?.upcomingDeadlines?.length > 0 && (
                        <div className="mb-6 p-4 rounded-xl border border-yellow-800/50 bg-yellow-950/10">
                            <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold mb-3 flex items-center"><Calendar className="w-3 h-3 mr-2"/> Upcoming Deadlines</p>
                            <div className="space-y-2">
                                {stats.readiness.upcomingDeadlines.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800">
                                        <span className="text-xs font-bold text-slate-300">{d.name}</span>
                                        <span className="text-[10px] uppercase font-bold text-yellow-500 px-2 py-1 bg-yellow-950/50 rounded border border-yellow-800">{d.daysLeft} Days Left</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {recommendations.length > 0 ? (
                        <div className="space-y-3 flex-grow">
                            {recommendations.map(rec => (
                                <div key={rec.id} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl flex justify-between items-center group hover:bg-slate-800/50 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-white text-base group-hover:text-cyan-300 transition-colors">{rec.scheme_name}</h4>
                                        <div className="flex items-center mt-2 space-x-3">
                                            <span className="text-[10px] font-mono px-2 py-1 bg-cyan-950/50 text-cyan-400 rounded border border-cyan-800/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]">MATCH: {Math.round(rec.confidence_score || 0)}%</span>
                                            {rec.category && <span className="text-[10px] font-mono px-2 py-1 bg-slate-800 text-slate-400 rounded border border-slate-700">{rec.category}</span>}
                                            {rec.member_name && <span className="text-[10px] font-mono px-2 py-1 bg-purple-900/30 text-purple-400 rounded border border-purple-800/50">Member: {rec.member_name}</span>}
                                        </div>
                                    </div>
                                    <Link to="/recommendations" className="text-cyan-500 p-2 hover:bg-cyan-900/30 rounded-full transition-colors border border-transparent hover:border-cyan-800/50"><ChevronRight className="w-5 h-5"/></Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-6 bg-slate-900/30 rounded-xl border border-slate-800/50">
                            <p className="text-xs mb-4 font-mono uppercase tracking-widest text-slate-600">No Strict Matches Found</p>
                            <Link to="/eligibility" className="glass-button px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-cyan-400">Run Engine Again</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
