import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, X, ChevronDown, Bookmark, ExternalLink, Star, ArrowRightLeft, MessageSquare } from 'lucide-react';

const SearchSchemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stateFilter, setStateFilter] = useState('All');
    const [occupationFilter, setOccupationFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');

    // Modals
    const [selectedScheme, setSelectedScheme] = useState(null);
    const [comparisonList, setComparisonList] = useState([]);
    const [showComparison, setShowComparison] = useState(false);

    // Reviews State (for selectedScheme)
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [newReview, setNewReview] = useState({ rating: 5, review: '' });

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/schemes`)
            .then(res => {
                setSchemes(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load schemes', err);
                setLoading(false);
            });
    }, []);

    // Fetch reviews when a scheme is selected
    useEffect(() => {
        if (selectedScheme) {
            axios.get(`http://localhost:5000/api/schemes/${selectedScheme.id}/reviews`)
                .then(res => {
                    setReviews(res.data.reviews);
                    setAverageRating(res.data.average_rating);
                }).catch(console.error);
        }
    }, [selectedScheme]);

    const submitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert('Please login to submit a review.');
        
        try {
            await axios.post(`http://localhost:5000/api/schemes/${selectedScheme.id}/reviews`, newReview, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Review submitted successfully!');
            // Refresh reviews
            const res = await axios.get(`http://localhost:5000/api/schemes/${selectedScheme.id}/reviews`);
            setReviews(res.data.reviews);
            setAverageRating(res.data.average_rating);
            setNewReview({ rating: 5, review: '' });
        } catch (error) {
            alert('Error submitting review');
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:5000/api/schemes/${selectedScheme.id}/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh reviews
            const res = await axios.get(`http://localhost:5000/api/schemes/${selectedScheme.id}/reviews`);
            setReviews(res.data.reviews);
            setAverageRating(res.data.average_rating);
        } catch (error) {
            alert('Error deleting review or unauthorized');
        }
    };

    const toggleCompare = (e, scheme) => {
        e.stopPropagation();
        if (comparisonList.find(s => s.id === scheme.id)) {
            setComparisonList(comparisonList.filter(s => s.id !== scheme.id));
        } else {
            if (comparisonList.length >= 3) return alert('You can only compare up to 3 schemes at a time.');
            setComparisonList([...comparisonList, scheme]);
        }
    };

    const filteredSchemes = schemes.filter(s => {
        const matchesSearch = s.scheme_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (s.benefits && s.benefits.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
        const matchesState = stateFilter === 'All' || s.state === stateFilter || s.state === 'All';
        const matchesOccupation = occupationFilter === '' || (s.occupation && s.occupation.toLowerCase().includes(occupationFilter.toLowerCase()));
        
        return matchesSearch && matchesCategory && matchesState && matchesOccupation;
    }).sort((a, b) => {
        if (sortBy === 'name') return a.scheme_name.localeCompare(b.scheme_name);
        if (sortBy === 'category') return (a.category || '').localeCompare(b.category || '');
        return 0;
    });

    const uniqueCategories = ['All', ...new Set(schemes.map(s => s.category).filter(Boolean))];

    return (
        <div className="animate-in fade-in duration-500 pb-24">
            {/* Header & Global Search */}
            <div className="glass-panel p-8 flex flex-col lg:flex-row justify-between items-end mb-8 border border-slate-800/60 shadow-[0_24px_70px_rgba(2,12,27,0.3)] rounded-[2rem]">
                <div>
                    <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-2">Global Scheme Directory</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Database <span className="text-slate-500 font-light">| SEARCH</span></h1>
                </div>
                <div className="mt-6 md:mt-0 relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-cyan-500" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search schemes or benefits..." 
                        className="glass-input w-full pl-12 p-4 text-white bg-slate-950/80 border border-slate-800/50 rounded-3xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="glass-panel p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 border border-slate-800/60 rounded-[1.75rem] shadow-[0_18px_48px_rgba(2,12,27,0.22)]">
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center"><Filter className="w-3 h-3 mr-1"/> Category</label>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="glass-input w-full p-3 bg-slate-950/80 border border-slate-800/50 text-sm rounded-3xl">
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">State</label>
                    <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="glass-input w-full p-3 bg-slate-800 text-sm">
                        <option value="All">All States (Central)</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Delhi">Delhi</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Target Occupation</label>
                    <input type="text" value={occupationFilter} onChange={(e) => setOccupationFilter(e.target.value)} className="glass-input w-full p-3 text-sm" placeholder="e.g. Farmer, Student" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Sort By</label>
                    <div className="relative">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="glass-input w-full p-3 bg-slate-800 text-sm appearance-none">
                            <option value="name">Alphabetical (A-Z)</option>
                            <option value="category">Category</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-cyan-500 absolute right-4 top-4 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="text-center py-20 text-cyan-500 animate-pulse font-mono tracking-widest text-sm">INITIALIZING DATABASE...</div>
            ) : (
                <>
                    <p className="text-slate-400 text-sm mb-4 font-mono">FOUND <span className="text-cyan-400 font-bold">{filteredSchemes.length}</span> SCHEMES MATCHING CRITERIA</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSchemes.map(scheme => {
                            const isComparing = comparisonList.find(s => s.id === scheme.id);
                            return (
                                <div key={scheme.id} className={`glass-panel p-6 flex flex-col transition-all group cursor-pointer border border-slate-800/50 rounded-[1.75rem] shadow-[0_16px_40px_rgba(3,26,56,0.24)] ${isComparing ? 'ring-2 ring-cyan-500 bg-cyan-950/20' : 'hover:border-cyan-500/50'}`} onClick={() => setSelectedScheme(scheme)}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded border border-cyan-800">
                                            {scheme.category || 'General'}
                                        </span>
                                        <div className="flex space-x-2">
                                            <button 
                                                className={`transition-colors p-1.5 rounded ${isComparing ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:text-cyan-400 hover:bg-slate-800'}`}
                                                onClick={(e) => toggleCompare(e, scheme)}
                                                title="Add to Compare"
                                            >
                                                <ArrowRightLeft className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="text-slate-500 hover:text-purple-400 transition-colors p-1.5 rounded hover:bg-slate-800" 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    const token = localStorage.getItem('token');
                                                    if(!token) return alert('Please login to save schemes');
                                                    axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/saved-schemes`, { scheme_id: scheme.id }, { headers: { Authorization: `Bearer ${token}` }})
                                                        .then(() => alert('Scheme saved successfully!'))
                                                        .catch(() => alert('Failed to save scheme. It may already be saved.'));
                                                }}
                                            >
                                                <Bookmark className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-3 group-hover:text-cyan-300 transition-colors">{scheme.scheme_name}</h3>
                                    <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-3 leading-relaxed">{scheme.benefits}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Scheme Detail Modal */}
            {selectedScheme && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-cyan-500/30 bg-slate-950/95 rounded-[2rem] relative animate-in zoom-in-95 duration-200 flex flex-col md:flex-row shadow-[0_30px_80px_rgba(2,12,27,0.35)]">
                        <button onClick={() => setSelectedScheme(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-slate-800/90 rounded-full p-2 z-10">
                            <X className="w-5 h-5" />
                        </button>
                        
                        {/* Scheme Info Column */}
                        <div className="p-8 md:w-2/3 border-r border-slate-800">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 block">Scheme Details</span>
                                <div className="flex items-center text-yellow-400 text-sm ml-4 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                                    <Star className="w-3 h-3 fill-yellow-400 mr-1" /> {Number(averageRating).toFixed(1)} / 5
                                </div>
                            </div>
                            
                            <h2 className="text-3xl font-black text-white mb-6 pr-8">{selectedScheme.scheme_name}</h2>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Category</span>
                                    <span className="text-white font-medium">{selectedScheme.category || 'General'}</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">State Focus</span>
                                    <span className="text-white font-medium">{selectedScheme.state || 'All India'}</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Target Occupation</span>
                                    <span className="text-white font-medium">{selectedScheme.occupation || 'Any'}</span>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Income Limit</span>
                                    <span className="text-white font-medium">{selectedScheme.income_limit ? `₹${selectedScheme.income_limit}` : 'No Limit'}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-lg font-bold text-cyan-400 mb-2">Benefits Overview</h4>
                                    <p className="text-slate-300 leading-relaxed text-sm bg-cyan-950/20 p-4 rounded border border-cyan-900/50">{selectedScheme.benefits}</p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-purple-400 mb-2">Eligibility Criteria</h4>
                                    <p className="text-slate-300 leading-relaxed text-sm bg-purple-950/20 p-4 rounded border border-purple-900/50">{selectedScheme.eligibility}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-800 flex space-x-4">
                                <button 
                                    className="glass-button px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center bg-slate-800 hover:bg-slate-700"
                                    onClick={(e) => { 
                                        const token = localStorage.getItem('token');
                                        if(!token) return alert('Please login to save schemes');
                                        axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/saved-schemes`, { scheme_id: selectedScheme.id }, { headers: { Authorization: `Bearer ${token}` }})
                                            .then(() => alert('Scheme saved successfully!'))
                                            .catch(() => alert('Failed to save scheme.'));
                                    }}
                                >
                                    <Bookmark className="w-4 h-4 mr-2" /> Save
                                </button>
                                <a 
                                    href={`https://www.myscheme.gov.in/search?q=${encodeURIComponent(selectedScheme.scheme_name)}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="glass-button px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                >
                                    Initiate Application <ExternalLink className="w-4 h-4 ml-2" />
                                </a>
                            </div>
                        </div>

                        {/* Reviews Column */}
                        <div className="p-8 md:w-1/3 bg-slate-900/80 flex flex-col h-full">
                            <h3 className="font-bold text-white mb-6 flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-cyan-400" /> Community Reviews</h3>
                            
                            <form onSubmit={submitReview} className="mb-8">
                                <label className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">Leave a Rating</label>
                                <div className="flex space-x-2 mb-4">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button 
                                            key={num} 
                                            type="button" 
                                            onClick={() => setNewReview({...newReview, rating: num})}
                                            className="focus:outline-none"
                                        >
                                            <Star className={`w-6 h-6 ${newReview.rating >= num ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'} transition-colors hover:text-yellow-300`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    placeholder="Share your experience..." 
                                    className="w-full glass-input p-3 text-sm h-24 mb-3 resize-none bg-slate-800"
                                    value={newReview.review}
                                    onChange={(e) => setNewReview({...newReview, review: e.target.value})}
                                    required
                                ></textarea>
<button type="submit" className="w-full glass-button text-white font-bold uppercase text-xs tracking-widest py-3 rounded-2xl">Submit Review</button>
                            </form>

                            <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 pr-2">
                                {reviews.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic text-center mt-10">No reviews yet. Be the first!</p>
                                ) : (
                                    reviews.map(r => (
                                        <div key={r.id} className="bg-slate-800/50 p-4 rounded border border-slate-700/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-sm text-white">{r.user_name || 'Anonymous'}</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed">{r.review}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[9px] text-slate-500">{new Date(r.created_at).toLocaleDateString()}</p>
                                                <button onClick={() => deleteReview(r.id)} className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold">Delete</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Compare Floating Action Bar */}
            {comparisonList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-cyan-500/50 p-4 flex justify-between items-center z-40 bg-slate-900/95 backdrop-blur-xl animate-in slide-in-from-bottom-10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-cyan-900 border border-cyan-500 text-cyan-400 rounded-full flex items-center justify-center font-black mr-4 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                            {comparisonList.length}
                        </div>
                        <div>
                            <p className="text-white font-bold">Schemes Selected for Comparison</p>
                            <p className="text-xs text-slate-400">Select up to 3 schemes to compare side-by-side.</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={() => setComparisonList([])} className="px-6 py-3 text-slate-400 hover:text-white text-sm font-bold transition-colors">Clear</button>
                        <button 
                            onClick={() => setShowComparison(true)}
                            disabled={comparisonList.length < 2}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-colors shadow-lg"
                        >
                            Compare Now
                        </button>
                    </div>
                </div>
            )}

            {/* Comparison Modal */}
            {showComparison && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-6xl max-h-[90vh] flex flex-col border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center"><ArrowRightLeft className="w-6 h-6 mr-3 text-cyan-400" /> Scheme Comparison Matrix</h2>
                                <p className="text-sm text-slate-400 mt-1">Side-by-side analysis of selected government schemes</p>
                            </div>
                            <button onClick={() => setShowComparison(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-auto p-6">
                            <div className="min-w-[800px]">
                                {/* Header Row */}
                                <div className="flex border-b border-slate-800 pb-4 mb-4">
                                    <div className="w-1/4 pr-4 border-r border-slate-800 flex flex-col justify-end">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Comparison Parameters</span>
                                    </div>
                                    {comparisonList.map(s => (
                                        <div key={s.id} className="w-1/3 px-4 relative group">
                                            <button 
                                                onClick={() => setComparisonList(comparisonList.filter(c => c.id !== s.id))}
                                                className="absolute top-0 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 block">{s.category || 'General'}</span>
                                            <h3 className="text-lg font-black text-white leading-tight">{s.scheme_name}</h3>
                                        </div>
                                    ))}
                                </div>

                                {/* Data Rows */}
                                {[
                                    { label: 'State Focus', key: 'state', color: 'text-white' },
                                    { label: 'Target Occupation', key: 'occupation', color: 'text-slate-300' },
                                    { label: 'Income Limit', key: 'income_limit', prefix: '₹', fallback: 'No Limit', color: 'text-green-400' },
                                    { label: 'Primary Benefits', key: 'benefits', type: 'text', color: 'text-slate-300' },
                                    { label: 'Eligibility', key: 'eligibility', type: 'text', color: 'text-purple-300' }
                                ].map((row, i) => (
                                    <div key={i} className="flex border-b border-slate-800/50 py-4 hover:bg-slate-800/20 transition-colors">
                                        <div className="w-1/4 pr-4 border-r border-slate-800">
                                            <span className="text-slate-400 font-bold text-sm">{row.label}</span>
                                        </div>
                                        {comparisonList.map(s => (
                                            <div key={s.id} className="w-1/3 px-4">
                                                <p className={`text-sm ${row.color} ${row.type === 'text' ? 'leading-relaxed' : 'font-medium'}`}>
                                                    {s[row.key] ? `${row.prefix || ''}${s[row.key]}` : (row.fallback || 'N/A')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchSchemes;
