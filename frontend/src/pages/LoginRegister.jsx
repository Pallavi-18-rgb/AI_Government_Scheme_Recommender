import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginRegister = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLogin ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/login` : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/register`;
            const res = await axios.post(url, formData);
            if (isLogin) {
                localStorage.setItem('token', res.data.token);
                navigate('/dashboard');
            } else {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-4 py-16 sm:px-6">
            <div className="w-full max-w-xl rounded-[2rem] bg-white border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-sky-600 px-8 py-10 text-white">
                    <h2 className="text-4xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-slate-100 text-sm max-w-xl">Secure access to your personalized welfare recommendations, eligibility tracker, and scheme applications.</p>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="glass-input w-full p-4" required />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="glass-input w-full p-4" required />
                        </div>
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="glass-input w-full p-4" required />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="glass-input w-full p-4" required />
                        </div>
                        <button type="submit" className="glass-button w-full text-white font-semibold text-base">{isLogin ? 'Sign In' : 'Sign Up'}</button>
                    </form>
                    <div className="mt-6 text-center">
                        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-600 hover:text-slate-900 font-semibold">
                            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
