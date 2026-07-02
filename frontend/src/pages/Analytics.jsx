import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { ShieldCheck, Activity, Users, Database, FileText, Bookmark, CheckCircle2 } from 'lucide-react';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        schemeData: [],
        demographicData: [],
        totalUsers: 0,
        totalSchemes: 0,
        monthlyTraffic: []
    });
    const [chatAnalytics, setChatAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const [res, chatRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/chat-analytics`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }))
                ]);
                setAnalytics(res.data);
                if (chatRes && chatRes.data) setChatAnalytics(chatRes.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const { schemeData, demographicData, totalUsers, totalSchemes, monthlyTraffic } = analytics;

    const COLORS = ['#06b6d4', '#a855f7', '#3b82f6', '#10b981']; // cyan, purple, blue, green

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div>
                    <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-1">Global Data Center</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">System Analytics <span className="text-slate-500 font-light">| TELEMETRY</span></h1>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 border-t-2 border-t-cyan-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-cyan-500" />
                    </div>
                    <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mb-2">Total Users</p>
                    <h3 className="text-3xl font-black text-white">{loading ? '-' : totalUsers}</h3>
                    <p className="text-cyan-400 text-xs mt-2 flex items-center"><Activity className="w-3 h-3 mr-1"/> +12% from last month</p>
                </div>
                <div className="glass-panel p-6 border-t-2 border-t-purple-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Database className="w-24 h-24 text-purple-500" />
                    </div>
                    <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mb-2">Active Schemes</p>
                    <h3 className="text-3xl font-black text-white">{loading ? '-' : totalSchemes}</h3>
                    <p className="text-purple-400 text-xs mt-2 flex items-center"><Activity className="w-3 h-3 mr-1"/> Updating continuously</p>
                </div>
                <div className="glass-panel p-6 border-t-2 border-t-blue-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="w-24 h-24 text-blue-500" />
                    </div>
                    <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mb-4">Application Funnel</p>
                    
                    <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-300">
                            <span className="flex items-center"><Activity className="w-3 h-3 text-cyan-500 mr-2"/> Explored</span>
                            <span className="font-bold">{loading ? '-' : analytics.totalApplied || 0}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full" style={{width: '100%'}}></div></div>
                        
                        <div className="flex justify-between items-center text-xs text-slate-300">
                            <span className="flex items-center"><FileText className="w-3 h-3 text-blue-500 mr-2"/> Started</span>
                            <span className="font-bold">{loading ? '-' : analytics.totalStarted || 0}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(analytics.totalStarted / (analytics.totalApplied || 1)) * 100}%`}}></div></div>
                        
                        <div className="flex justify-between items-center text-xs text-slate-300">
                            <span className="flex items-center"><CheckCircle2 className="w-3 h-3 text-green-500 mr-2"/> Completed</span>
                            <span className="font-bold">{loading ? '-' : analytics.totalCompleted || 0}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${(analytics.totalCompleted / (analytics.totalApplied || 1)) * 100}%`}}></div></div>
                    </div>
                </div>
                <div className="glass-panel p-6 border-t-2 border-t-green-500 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Bookmark className="w-24 h-24 text-green-500" />
                    </div>
                    <p className="text-slate-400 font-mono text-xs tracking-widest uppercase mb-2">Saved Schemes</p>
                    <h3 className="text-3xl font-black text-white">{loading ? '-' : analytics.totalSaved || 0}</h3>
                    <p className="text-green-400 text-xs mt-2 flex items-center"><Activity className="w-3 h-3 mr-1"/> High Intent to Apply</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-slate-200 font-bold mb-6 tracking-wide flex items-center">
                        <Database className="w-5 h-5 text-cyan-500 mr-2" /> Top Scheme Adoption Rates
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={schemeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#06b6d4' }}
                                />
                                <Bar dataKey="applications" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="glass-panel p-6">
                    <h3 className="text-slate-200 font-bold mb-6 tracking-wide flex items-center">
                        <Users className="w-5 h-5 text-purple-500 mr-2" /> Demographic Sector Breakdown
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={demographicData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {demographicData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center mt-4 gap-4">
                        {demographicData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center text-xs text-slate-400">
                                <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendation Confidence Chart */}
                <div className="glass-panel p-6 border-t-2 border-t-slate-700">
                    <h3 className="text-slate-200 font-bold mb-6 tracking-wide flex items-center">
                        <Activity className="w-5 h-5 text-green-500 mr-2" /> AI Recommendation Confidence
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'High (>80%)', count: analytics.recommendationData?.highConf || 0 },
                                { name: 'Medium (50-79%)', count: analytics.recommendationData?.medConf || 0 },
                                { name: 'Low (<50%)', count: analytics.recommendationData?.lowConf || 0 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Chat Analytics */}
                <div className="glass-panel p-6 border-t-2 border-t-pink-500 flex flex-col h-full">
                    <h3 className="text-slate-200 font-bold mb-6 tracking-wide flex items-center">
                        <Activity className="w-5 h-5 text-pink-500 mr-2" /> AI Usage Statistics
                    </h3>
                    <div className="flex-1 overflow-auto">
                        {chatAnalytics ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded border border-slate-800">
                                    <span className="text-slate-400 font-bold uppercase text-xs">Total AI Conversations</span>
                                    <span className="text-2xl font-black text-white">{chatAnalytics.totalChats}</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Most Asked Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {chatAnalytics.topKeywords.map((kw, i) => (
                                            <span key={i} className="bg-pink-900/20 text-pink-400 border border-pink-800/50 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {kw.keyword} ({kw.count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Recent Queries</h4>
                                    <div className="space-y-3">
                                        {chatAnalytics.recentChats.filter(c => c.sender === 'user').slice(0, 3).map((chat, i) => (
                                            <div key={i} className="bg-slate-800/40 p-3 rounded border border-slate-700/50">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-bold text-cyan-500 uppercase">{chat.user_name}</span>
                                                    <span className="text-[9px] text-slate-500">{new Date(chat.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 italic">"{chat.message}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-500 text-sm">Loading AI Analytics...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
