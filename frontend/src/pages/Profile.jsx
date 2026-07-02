import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, CheckCircle, Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

const Profile = () => {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        occupation: '',
        income: '',
        category: '',
        education: '',
        state: '',
        disability_status: 'No',
        marital_status: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Family state
    const [family, setFamily] = useState([]);
    const [showFamilyForm, setShowFamilyForm] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [familyFormData, setFamilyFormData] = useState({
        name: '', relationship: '', age: '', gender: '', occupation: '', income: '',
        category: '', education: '', disability_status: 'No', marital_status: ''
    });
    const [familyStatus, setFamilyStatus] = useState({ type: '', message: '' });

    const navigate = useNavigate();

    const fetchFamily = async (token) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/family`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFamily(res.data);
        } catch (error) {
            console.error('Error fetching family', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setFormData({
                age: res.data.age || '',
                gender: res.data.gender || '',
                occupation: res.data.occupation || '',
                income: res.data.income || '',
                category: res.data.category || '',
                education: res.data.education || '',
                state: res.data.state || '',
                disability_status: res.data.disability_status || 'No',
                marital_status: res.data.marital_status || ''
            });
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setStatus({ type: 'error', message: 'Failed to load profile data.' });
            setLoading(false);
        });

        fetchFamily(token);
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFamilyChange = (e) => {
        setFamilyFormData({ ...familyFormData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus({ type: '', message: '' });
        const token = localStorage.getItem('token');
        
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/users/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', message: 'Profile updated successfully! AI Engine synchronized.' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: error.response?.data?.message || 'Server error while saving profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleFamilySubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        setFamilyStatus({ type: '', message: '' });

        try {
            if (editingMemberId) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/family/${editingMemberId}`, familyFormData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFamilyStatus({ type: 'success', message: 'Family member updated!' });
            } else {
                await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/family`, familyFormData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFamilyStatus({ type: 'success', message: 'Family member added!' });
            }
            setShowFamilyForm(false);
            setEditingMemberId(null);
            setFamilyFormData({ name: '', relationship: '', age: '', gender: '', occupation: '', income: '', category: '', education: '', disability_status: 'No', marital_status: '' });
            fetchFamily(token);
        } catch (error) {
            setFamilyStatus({ type: 'error', message: 'Error saving family member.' });
        }
    };

    const editFamilyMember = (member) => {
        setFamilyFormData({
            name: member.name,
            relationship: member.relationship,
            age: member.age || '',
            gender: member.gender || '',
            occupation: member.occupation || '',
            income: member.income || '',
            category: member.category || '',
            education: member.education || '',
            disability_status: member.disability_status || 'No',
            marital_status: member.marital_status || ''
        });
        setEditingMemberId(member.id);
        setShowFamilyForm(true);
    };

    const deleteFamilyMember = async (id) => {
        if (!window.confirm('Remove this family member?')) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/family/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFamily(token);
        } catch (error) {
            console.error('Error deleting', error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-32 text-cyan-500">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="font-mono tracking-widest uppercase text-sm">Fetching Profile Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Head of Family Profile</h1>
            <p className="text-slate-400 mb-6">Configure the primary applicant's details below.</p>
            
            <div className="glass-panel p-8 mb-10 border-cyan-900/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="glass-input w-full p-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Occupation</label>
                            <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="glass-input w-full p-3" placeholder="e.g. Farmer, Student, Artisan" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Annual Income (₹)</label>
                            <input type="number" name="income" value={formData.income} onChange={handleChange} className="glass-input w-full p-3" required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Education Level</label>
                            <select name="education" value={formData.education} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800" required>
                                <option value="">Select Education</option>
                                <option value="None">None</option>
                                <option value="10th Pass">10th Pass</option>
                                <option value="12th Pass">12th Pass</option>
                                <option value="Undergraduate">Undergraduate</option>
                                <option value="Postgraduate">Postgraduate</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">State / Region</label>
                            <select name="state" value={formData.state} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800" required>
                                <option value="">Select State/UT</option>
                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                <option value="Assam">Assam</option>
                                <option value="Bihar">Bihar</option>
                                <option value="Chhattisgarh">Chhattisgarh</option>
                                <option value="Goa">Goa</option>
                                <option value="Gujarat">Gujarat</option>
                                <option value="Haryana">Haryana</option>
                                <option value="Himachal Pradesh">Himachal Pradesh</option>
                                <option value="Jharkhand">Jharkhand</option>
                                <option value="Karnataka">Karnataka</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                <option value="Maharashtra">Maharashtra</option>
                                <option value="Manipur">Manipur</option>
                                <option value="Meghalaya">Meghalaya</option>
                                <option value="Mizoram">Mizoram</option>
                                <option value="Nagaland">Nagaland</option>
                                <option value="Odisha">Odisha</option>
                                <option value="Punjab">Punjab</option>
                                <option value="Rajasthan">Rajasthan</option>
                                <option value="Sikkim">Sikkim</option>
                                <option value="Tamil Nadu">Tamil Nadu</option>
                                <option value="Telangana">Telangana</option>
                                <option value="Tripura">Tripura</option>
                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                <option value="Uttarakhand">Uttarakhand</option>
                                <option value="West Bengal">West Bengal</option>
                                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                <option value="Chandigarh">Chandigarh</option>
                                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                                <option value="Delhi">Delhi</option>
                                <option value="Lakshadweep">Lakshadweep</option>
                                <option value="Puducherry">Puducherry</option>
                                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                <option value="Ladakh">Ladakh</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Marital Status</label>
                            <select name="marital_status" value={formData.marital_status || ''} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800" required>
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widow">Widow</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Disability Status</label>
                            <select name="disability_status" value={formData.disability_status} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800">
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Category / Caste</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="glass-input w-full p-3 bg-slate-800" required>
                                <option value="">Select Category</option>
                                <option value="General">General</option>
                                <option value="OBC">OBC</option>
                                <option value="SC">SC</option>
                                <option value="ST">ST</option>
                                <option value="Minority">Minority</option>
                                <option value="EWS">EWS</option>
                                <option value="Category 1">Category 1</option>
                                <option value="Category 2A">Category 2A</option>
                                <option value="Category 2B">Category 2B</option>
                                <option value="Category 3A">Category 3A</option>
                                <option value="Category 3B">Category 3B</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-2">Crucial for highly specific AI matching.</p>
                        </div>
                    </div>
                    
                    {status.message && (
                        <div className={`p-4 rounded-lg flex items-center border ${status.type === 'error' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-cyan-900/30 text-cyan-400 border-cyan-800'}`}>
                            {status.type === 'error' ? <ShieldAlert className="w-5 h-5 mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                            {status.message}
                        </div>
                    )}
                    
                    <button type="submit" disabled={saving} className="glass-button w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center">
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                        {saving ? 'SYNCHRONIZING...' : 'SAVE CONFIGURATION'}
                    </button>
                </form>
            </div>

            {/* FAMILY MEMBERS SECTION */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center">
                        👨‍👩‍👧‍👦 Family Members
                    </h2>
                    <p className="text-slate-400 mt-1">Add family members to discover schemes for your entire family.</p>
                </div>
                {!showFamilyForm && (
                    <button onClick={() => { setShowFamilyForm(true); setEditingMemberId(null); setFamilyFormData({name:'', relationship:'', age:'', gender:'', occupation:'', income:'', category:'', education:'', disability_status:'No', marital_status:''}); }} className="glass-button px-4 py-2 rounded-lg text-sm font-bold flex items-center">
                        <Plus className="w-4 h-4 mr-2" /> Add Member
                    </button>
                )}
            </div>

            {familyStatus.message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center border ${familyStatus.type === 'error' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-green-900/30 text-green-400 border-green-800'}`}>
                    {familyStatus.message}
                </div>
            )}

            {showFamilyForm && (
                <div className="glass-panel p-6 mb-8 border-purple-900/50 bg-slate-900/80">
                    <h3 className="text-lg font-bold text-white mb-4">{editingMemberId ? 'Edit Family Member' : 'Add New Family Member'}</h3>
                    <form onSubmit={handleFamilySubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Name *</label>
                                <input type="text" name="name" value={familyFormData.name} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Relationship *</label>
                                <select name="relationship" value={familyFormData.relationship} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm bg-slate-800" required>
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    {formData.marital_status !== 'Single' && <option value="Husband">Husband</option>}
                                    {formData.marital_status !== 'Single' && <option value="Wife">Wife</option>}
                                    {formData.marital_status !== 'Single' && <option value="Son">Son</option>}
                                    {formData.marital_status !== 'Single' && <option value="Daughter">Daughter</option>}
                                    <option value="Brother">Brother</option>
                                    <option value="Sister">Sister</option>
                                    <option value="Grandfather">Grandfather</option>
                                    <option value="Grandmother">Grandmother</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Age *</label>
                                <input type="number" name="age" value={familyFormData.age} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Gender *</label>
                                <select name="gender" value={familyFormData.gender} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm bg-slate-800" required>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Occupation</label>
                                <input type="text" name="occupation" value={familyFormData.occupation} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm" placeholder="e.g. Student, None" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Annual Income</label>
                                <input type="number" name="income" value={familyFormData.income} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Education</label>
                                <select name="education" value={familyFormData.education} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm bg-slate-800">
                                    <option value="">Select</option>
                                    <option value="None">None</option>
                                    <option value="10th Pass">10th Pass</option>
                                    <option value="12th Pass">12th Pass</option>
                                    <option value="Undergraduate">Undergraduate</option>
                                    <option value="Postgraduate">Postgraduate</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Disability Status</label>
                                <select name="disability_status" value={familyFormData.disability_status} onChange={handleFamilyChange} className="glass-input w-full p-2.5 text-sm bg-slate-800">
                                    <option value="No">No</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-700/50">
                            <button type="submit" className="glass-button flex-1 py-2 rounded font-bold text-sm">Save Member</button>
                            <button type="button" onClick={() => setShowFamilyForm(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold text-sm transition-colors">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {family.length === 0 && !showFamilyForm ? (
                    <div className="col-span-full p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                        No family members added yet. Add them to find more schemes!
                    </div>
                ) : (
                    family.map(member => (
                        <div key={member.id} className="glass-panel p-5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-cyan-900/50 text-cyan-400 text-xs px-3 py-1 rounded-bl-lg font-bold">
                                {member.relationship}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{member.name}</h3>
                            <div className="space-y-1 text-sm text-slate-400">
                                <p><span className="text-slate-500 w-24 inline-block">Age/Gender:</span> {member.age || 'N/A'} • {member.gender || 'N/A'}</p>
                                <p><span className="text-slate-500 w-24 inline-block">Occupation:</span> {member.occupation || 'N/A'}</p>
                                <p><span className="text-slate-500 w-24 inline-block">Income:</span> ₹{member.income || '0'}</p>
                            </div>
                            <div className="mt-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => editFamilyMember(member)} className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded transition-colors">
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </button>
                                <button onClick={() => deleteFamilyMember(member.id)} className="flex items-center text-xs bg-red-900/30 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded transition-colors">
                                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;
