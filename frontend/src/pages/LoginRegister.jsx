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
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="glass-panel p-10 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-slate-500 focus:border-slate-500" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-slate-500 focus:border-slate-500" required />
                    </div>
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-slate-500 focus:border-slate-500" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-slate-500 focus:border-slate-500" required />
                    </div>
                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 transition-colors">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-slate-600 hover:text-slate-500 font-medium">
                        {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
