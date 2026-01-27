import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, FileText, User, Building, MapPin, Phone, Globe, ArrowRight, Loader2, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../utils/utils';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
        address: '',
        phone: '',
        website: '',
        abn: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                email: formData.email,
                password: formData.password,
                companyProfile: {
                    name: formData.companyName,
                    address: formData.address,
                    phone: formData.phone,
                    website: formData.website,
                    abn: formData.abn
                }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const inputFields = [
        { name: 'email', type: 'email', placeholder: 'Email Address', icon: Mail, section: 'auth' },
        { name: 'password', type: 'password', placeholder: 'Password', icon: Lock, section: 'auth' },
        { name: 'companyName', type: 'text', placeholder: 'Company Name', icon: Building, section: 'profile' },
        { name: 'phone', type: 'text', placeholder: 'Phone Number', icon: Phone, section: 'profile' },
        { name: 'website', type: 'text', placeholder: 'Website (Optional)', icon: Globe, section: 'profile' },
        { name: 'abn', type: 'text', placeholder: 'ABN (e.g. 96 678 973 085)', icon: Hash, section: 'profile' },
        { name: 'address', type: 'textarea', placeholder: 'Company Address', icon: MapPin, section: 'profile' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <div className="glass p-8 md:p-12 rounded-3xl shadow-2xl space-y-8">
                    <div className="text-center space-y-2">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="inline-flex p-4 bg-primary rounded-2xl shadow-xl shadow-primary/30 mb-4"
                        >
                            <FileText className="h-8 w-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join iTEK for professional invoicing</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-xl"
                            >
                                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inputFields.map((field) => (
                                <div key={field.name} className={cn("relative group", field.name === 'address' && "md:col-span-2")}>
                                    <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    {field.name === 'address' ? (
                                        <textarea
                                            name={field.name}
                                            rows="2"
                                            placeholder={field.placeholder}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        <input
                                            name={field.name}
                                            type={field.type}
                                            required={field.name !== 'website'}
                                            placeholder={field.placeholder}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white"
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-red-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary dark:text-red-400 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
