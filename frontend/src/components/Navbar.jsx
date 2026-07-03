import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-950 border-b border-slate-800 shadow-sm w-full z-10 sticky top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-white">GovScheme AI</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"><Home className="w-4 h-4 mr-1"/> Home</Link>
                        <Link to="/search" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"><Search className="w-4 h-4 mr-1"/> Schemes</Link>
                        {token ? (
                            <>
                                <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"><LayoutDashboard className="w-4 h-4 mr-1"/> Dashboard</Link>
                                <button onClick={handleLogout} className="text-slate-300 hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium flex items-center"><LogOut className="w-4 h-4 mr-1"/> Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="glass-button inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium">Login / Register</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
