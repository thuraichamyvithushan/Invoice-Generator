import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, PlusCircle, LayoutDashboard, Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/utils';
import logo from "../assets/logo/iTek_logo.png";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard },
        { label: 'New Invoice', path: '/invoices/new', icon: PlusCircle },
    ];

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-slate-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2 group">
                            <div className="p-2 rounded-lg shadow-lg shadow-red-500/10 group-hover:scale-110 transition-transform">
                                <img
                                    src={logo}
                                    alt="iTek Solutions"
                                    className="h-10 w-auto sm:h-11 md:h-12 object-contain"
                                />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-black dark:from-red-500 dark:to-white">

                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-4">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                                        location.pathname === item.path
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        <div className="hidden md:flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{user.companyProfile?.name || 'User'}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-16 inset-x-0 glass border-b border-white/20 dark:border-slate-800/50 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={cn(
                                        "flex items-center px-4 py-3 rounded-xl text-base font-medium",
                                        location.pathname === item.path
                                            ? "bg-red-500/10 text-primary dark:bg-red-500/20"
                                            : "text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </Link>
                            ))}
                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center px-4 py-3">
                                    <div className="flex-1">
                                        <p className="text-base font-medium text-slate-900 dark:text-slate-100">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-red-500"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
