import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Database, Star, Plus, Edit2, Trash2, X, Save } from 'lucide-react';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState({ totalUsers: 0, totalSchemes: 0, totalReviews: 0 });
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingScheme, setEditingScheme] = useState(null);
    const [formData, setFormData] = useState({
        scheme_name: '', benefits: '', eligibility: '', category: '', state: '', occupation: '', income_limit: ''
    });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [analyticsRes, schemesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/analytics`, { headers }),
                axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/schemes`, { headers })
            ]);
            
            setAnalytics(analyticsRes.data);
            setSchemes(schemesRes.data);
            setLoading(false);
        } catch (err) {
            setError('Access Denied. Administrator privileges required.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingScheme) {
                await axios.put(`http://localhost:5000/api/admin/schemes/${editingScheme.id}`, formData, { headers });
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/schemes`, formData, { headers });
            }
            
            setShowModal(false);
            setEditingScheme(null);
            fetchData();
        } catch (err) {
            alert('Error saving scheme');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this scheme?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/schemes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            alert('Error deleting scheme');
        }
    };

    const openModal = (scheme = null) => {
        if (scheme) {
            setEditingScheme(scheme);
            setFormData(scheme);
        } else {
            setEditingScheme(null);
            setFormData({ scheme_name: '', benefits: '', eligibility: '', category: '', state: '', occupation: '', income_limit: '' });
        }
        setShowModal(true);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="glass-panel p-8 text-center border-red-500/50">
                    <h2 className="text-2xl font-black text-red-400 mb-2">ACCESS DENIED</h2>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (loading) return <div className="text-center py-20 text-cyan-500 animate-pulse font-mono">INITIALIZING ADMIN PORTAL...</div>;

    return (
        <div className="animate-in fade-in duration-500 pb-12">
            <div className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
                <div>
                    <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase mb-1">System Administration</p>
                    <h1 className="text-4xl font-black text-white tracking-tight">Command <span className="text-slate-500 font-light">| CENTER</span></h1>
                </div>
                <div className="flex gap-4">
                    <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/powerbi/export`} target="_blank" rel="noreferrer" className="glass-button bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 border border-yellow-500/50 px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                        <Database className="w-4 h-4 mr-2" /> Export to Power BI
                    </a>
                    <button onClick={() => openModal()} className="glass-button bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                        <Plus className="w-4 h-4 mr-2" /> Add New Scheme
                    </button>
                </div>
            </div>

            {/* Analytics Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Total Users</p>
                        <p className="text-3xl font-black text-white">{analytics.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-900/50 rounded-full flex items-center justify-center border border-cyan-800">
                        <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Active Schemes</p>
                        <p className="text-3xl font-black text-white">{analytics.totalSchemes}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center border border-purple-800">
                        <Database className="w-6 h-6 text-purple-400" />
                    </div>
                </div>
                <div className="glass-panel p-6 flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-1">Total Reviews</p>
                        <p className="text-3xl font-black text-white">{analytics.totalReviews}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-900/50 rounded-full flex items-center justify-center border border-yellow-800">
                        <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                </div>
            </div>

            {/* Scheme Management Table */}
            <div className="glass-panel overflow-hidden border border-slate-800">
                <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white tracking-widest uppercase text-sm">Scheme Directory Registry</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-800">
                                <th className="p-4 font-bold">ID</th>
                                <th className="p-4 font-bold">Scheme Name</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">State Focus</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schemes.map(scheme => (
                                <tr key={scheme.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 text-slate-400 text-sm font-mono">#{scheme.id}</td>
                                    <td className="p-4 text-white font-bold text-sm">{scheme.scheme_name}</td>
                                    <td className="p-4 text-cyan-400 text-xs font-mono uppercase">{scheme.category || 'General'}</td>
                                    <td className="p-4 text-slate-300 text-sm">{scheme.state || 'All India'}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openModal(scheme)} className="text-slate-400 hover:text-cyan-400 mr-4 transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(scheme.id)} className="text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-2xl border-cyan-500 relative animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                        <div className="p-8">
                            <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">
                                {editingScheme ? 'Edit Scheme Data' : 'Initialize New Scheme'}
                            </h2>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Scheme Name</label>
                                        <input type="text" required value={formData.scheme_name} onChange={e => setFormData({...formData, scheme_name: e.target.value})} className="w-full glass-input p-3 text-sm bg-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Category</label>
                                        <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full glass-input p-3 text-sm bg-slate-900" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">State Focus</label>
                                        <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full glass-input p-3 text-sm bg-slate-900" placeholder="e.g., All India" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Income Limit (₹)</label>
                                        <input type="number" value={formData.income_limit} onChange={e => setFormData({...formData, income_limit: e.target.value})} className="w-full glass-input p-3 text-sm bg-slate-900" placeholder="Optional" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Target Occupation</label>
                                    <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full glass-input p-3 text-sm bg-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Benefits</label>
                                    <textarea required value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} className="w-full glass-input p-3 text-sm h-24 resize-none bg-slate-900"></textarea>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Eligibility</label>
                                    <textarea required value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} className="w-full glass-input p-3 text-sm h-24 resize-none bg-slate-900"></textarea>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="submit" className="glass-button bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center">
                                        <Save className="w-4 h-4 mr-2" /> {editingScheme ? 'Update Record' : 'Commit to Database'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
