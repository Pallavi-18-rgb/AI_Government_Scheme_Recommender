import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, ChevronRight, Activity, Info, XCircle, Clock, Eye, ThumbsUp, ThumbsDown, Bookmark, ExternalLink, FileText, Calendar, Coins, CheckSquare, Square, Users } from 'lucide-react';
import PdfReportGenerator from '../components/PdfReportGenerator';
import { useLanguage } from '../context/LanguageContext';

const Recommendations = () => {
    const { t } = useLanguage();
    const [recommendations, setRecommendations] = useState([]);
    const [insights, setInsights] = useState(null);
    const [userDocuments, setUserDocuments] = useState({});
    const [loading, setLoading] = useState(true);
    const [feedbackState, setFeedbackState] = useState({});

    const toggleDocument = async (docName) => {
        const current = userDocuments[docName];
        const next = !current;
        setUserDocuments(prev => ({ ...prev, [docName]: next }));
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/documents/update`, {
                document_type: docName,
                is_available: next
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error('Error updating document', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                
                const [recsRes, insightsRes, docsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/recommendations`, { headers }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/recommendations/insights`, { headers }).catch(() => ({ data: null })),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/documents`, { headers }).catch(() => ({ data: [] }))
                ]);
                
                if (recsRes.data.recommendations) {
                    // Handled the empty case gracefully
                    setRecommendations(recsRes.data.recommendations);
                } else {
                    setRecommendations(recsRes.data);
                }
                
                setInsights(insightsRes?.data);
                
                const docMap = {};
                if (docsRes?.data) {
                    docsRes.data.forEach(d => { docMap[d.name] = d.is_available });
                }
                setUserDocuments(docMap);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center mt-32 text-cyan-500">
            <Activity className="w-16 h-16 animate-pulse mb-6" />
            <p className="font-mono tracking-widest text-sm uppercase">AI Engine Processing Family Neural Match...</p>
            <div className="w-64 h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 w-1/2 animate-[pulse_1s_ease-in-out_infinite]"></div>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-1">{t('aiRecommendations') || 'Family Recommendation Engine'}</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">{t('recommendations')} <span className="text-slate-500 font-light">| {t('xaiMatrix') || 'EXPLAINABLE AI'}</span></h1>
                    <p className="text-slate-400 mt-2 font-light">The neural engine has evaluated your entire family against all active government protocols with full transparency.</p>
                </div>
                <PdfReportGenerator recommendations={recommendations} />
            </div>

            {/* AI Insights Panel */}
            {insights && (
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-5 border-t-2 border-t-purple-500">
                        <div className="flex items-center text-purple-400 mb-3 font-bold uppercase tracking-widest text-xs">
                            <Info className="w-4 h-4 mr-2" /> Influential Factors
                        </div>
                        <ul className="space-y-2">
                            {insights.influentialFactors.map((f, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start"><CheckCircle2 className="w-4 h-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0"/> {f}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="glass-panel p-5 border-t-2 border-t-red-500">
                        <div className="flex items-center text-red-400 mb-3 font-bold uppercase tracking-widest text-xs">
                            <XCircle className="w-4 h-4 mr-2" /> Exclusion Reasons
                        </div>
                        <ul className="space-y-2">
                            {insights.exclusionReasons.map((f, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start"><AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0"/> {f}</li>
                            ))}
                            {insights.exclusionReasons.length === 0 && <li className="text-sm text-slate-500">No major exclusions detected.</li>}
                        </ul>
                    </div>
                    <div className="glass-panel p-5 border-t-2 border-t-yellow-500">
                        <div className="flex items-center text-yellow-400 mb-3 font-bold uppercase tracking-widest text-xs">
                            <Activity className="w-4 h-4 mr-2" /> Alternative Paths
                        </div>
                        <ul className="space-y-2">
                            {insights.alternativeRecommendations.map((f, i) => (
                                <li key={i} className="text-sm text-slate-300 flex items-start"><ChevronRight className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0"/> {f}</li>
                            ))}
                            {insights.alternativeRecommendations.length === 0 && <li className="text-sm text-slate-500">No alternative paths currently identified.</li>}
                        </ul>
                    </div>
                </div>
            )}

            {recommendations.length === 0 ? (
                <div className="text-center py-20 glass-panel">
                    <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">No Eligible Schemes Found Based on Current Family Profile</h3>
                    <p className="text-slate-500">Please add more family members or update existing profiles to broaden the search parameters.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {recommendations.map((rec, idx) => {
                        let confidenceColor = "text-red-400";
                        let confidenceBorder = "border-red-800/50";
                        let confidenceBg = "bg-red-950/30";
                        if (rec.confidence_tier?.includes("High")) {
                            confidenceColor = "text-green-400";
                            confidenceBorder = "border-green-800/50";
                            confidenceBg = "bg-green-950/30";
                        } else if (rec.confidence_tier?.includes("Medium")) {
                            confidenceColor = "text-yellow-400";
                            confidenceBorder = "border-yellow-800/50";
                            confidenceBg = "bg-yellow-950/30";
                        }

                        const breakdown = rec.match_breakdown || {};

                        return (
                            <div key={idx} className={`glass-panel overflow-hidden border-l-4 ${confidenceBorder}`}>
                                <div className={`p-6 flex flex-col lg:flex-row gap-8`}>
                                    
                                    {/* Left Column: Scheme Info & XAI */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 bg-cyan-950/50 px-2 py-1 rounded">{rec.category}</span>
                                                <h2 className="text-2xl font-bold text-white mt-2 mb-1">{rec.scheme_name}</h2>
                                                
                                                {/* FAMILY TAG */}
                                                <div className="flex items-center text-sm text-slate-300 mt-2 bg-slate-800/50 inline-block px-3 py-1.5 rounded-full border border-slate-700">
                                                    <Users className="w-4 h-4 mr-2 text-cyan-400" />
                                                    Eligible Member: <span className="font-bold text-white ml-1">{rec.member_name}</span> 
                                                    <span className="text-slate-500 ml-2 text-xs">({rec.relationship})</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-4xl font-black ${confidenceColor}`}>{Math.round(rec.confidence_score)}%</div>
                                                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Match Score</div>
                                            </div>
                                        </div>

                                        <p className="text-slate-300 mb-6 text-sm leading-relaxed">{rec.benefits}</p>

                                        {/* STRICT XAI EXPLANATION GRID */}
                                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                                                <Activity className="w-4 h-4 mr-2"/> XAI Evaluation Matrix
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                {Object.entries(breakdown).map(([key, val]) => (
                                                    <div key={key} className={`flex items-start p-2 rounded ${val.match ? 'bg-green-950/20 border border-green-900/30' : 'bg-red-950/20 border border-red-900/30'}`}>
                                                        {val.match ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                                        )}
                                                        <div>
                                                            <div className="capitalize font-bold text-slate-300 text-xs">{key} Match</div>
                                                            <div className={`text-xs ${val.match ? 'text-green-400/70' : 'text-red-400/70'}`}>{val.reason}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Actions & Details */}
                                    <div className="w-full lg:w-80 flex flex-col space-y-4">
                                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                                            <div className="flex items-center text-slate-300 text-sm mb-3"><Calendar className="w-4 h-4 mr-2 text-cyan-500"/> <span className="text-slate-500 mr-2">Est. Approval:</span> {rec.estimated_approval_time}</div>
                                            <div className="flex items-center text-slate-300 text-sm mb-4"><Coins className="w-4 h-4 mr-2 text-yellow-500"/> <span className="text-slate-500 mr-2">Funding:</span> {rec.benefits_amount}</div>
                                            
                                            <a href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(rec.scheme_name)}`} target="_blank" rel="noopener noreferrer" className="glass-button w-full py-3 rounded-lg font-bold text-center flex items-center justify-center">
                                                Proceed to Application <ExternalLink className="w-4 h-4 ml-2"/>
                                            </a>
                                        </div>

                                        {rec.required_documents?.length > 0 && (
                                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2 text-blue-500"/> Required Documents
                                                </div>
                                                <ul className="space-y-2">
                                                    {rec.required_documents.map((doc, dIdx) => {
                                                        const hasDoc = userDocuments[doc];
                                                        return (
                                                            <li key={dIdx} className={`flex items-center text-sm cursor-pointer p-2 rounded transition-colors ${hasDoc ? 'bg-green-500/10 hover:bg-green-500/20' : 'bg-red-500/10 hover:bg-red-500/20'}`} onClick={() => toggleDocument(doc)}>
                                                                {hasDoc ? (
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2.5 flex-shrink-0" />
                                                                ) : (
                                                                    <AlertCircle className="w-4 h-4 text-red-500 mr-2.5 flex-shrink-0 animate-pulse" />
                                                                )}
                                                                <span className={hasDoc ? "text-green-700 line-through font-medium" : "text-red-700 font-black"}>
                                                                    {doc} {hasDoc ? "(Available)" : "(Required)"}
                                                                </span>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default Recommendations;
