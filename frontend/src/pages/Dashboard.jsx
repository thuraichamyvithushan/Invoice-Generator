import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Layout from '../layouts/Layout';
import { Search, Plus, FileText, Download, Edit, Trash2, Eye, MoreVertical, Filter, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../utils/utils';

const Dashboard = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async (search = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/invoices?search=${search}`);
            setInvoices(res.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInvoices(searchTerm);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await api.delete(`/invoices/${id}`);
                setInvoices(invoices.filter(inv => inv._id !== id));
            } catch (error) {
                alert('Failed to delete invoice');
            }
        }
    };

    const handleDownload = async (id, number) => {
        try {
            const response = await api.get(`/invoices/${id}/download`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download PDF');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Paid': return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400', icon: TrendingUp };
            case 'Overdue': return { color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400', icon: AlertCircle };
            case 'Sent': return { color: 'text-primary bg-primary/10 dark:bg-red-900/20 dark:text-red-400', icon: Clock };
            default: return { color: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400', icon: FileText };
        }
    };

    const filteredInvoices = filter === 'All'
        ? invoices
        : invoices.filter(inv => inv.status === filter);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Layout>
            <div className="space-y-8 px-4 sm:px-0 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400">Manage your business finances with ease.</p>
                    </div>
                    <Link
                        to="/invoices/new"
                        className="inline-flex items-center px-6 py-3 bg-primary hover:bg-red-700 text-white font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Invoice
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Revenue', value: formatCurrency(invoices.reduce((a, b) => a + b.totalAmount, 0)), color: 'red' },
                        { label: 'Pending', value: formatCurrency(invoices.filter(i => i.status !== 'Paid').reduce((a, b) => a + b.totalAmount, 0)), color: 'amber' },
                        { label: 'Total Invoices', value: invoices.length, color: 'slate' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass p-6 rounded-3xl"
                        >
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                        {['All', 'Paid', 'Sent', 'Overdue', 'Draft'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                    filter === f
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg"
                                        : "glass text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-12 pr-4 py-3 glass rounded-2xl outline-none focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>

                {/* Invoice Grid */}
                {loading ? (
                    <div className="flex justify-center p-20 text-slate-400">
                        <Clock className="h-8 w-8 animate-spin mr-3" />
                        <span className="text-xl font-bold">Synchronizing...</span>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredInvoices.map((invoice) => {
                                const status = getStatusInfo(invoice.status);
                                return (
                                    <motion.div
                                        key={invoice._id}
                                        variants={item}
                                        layoutTarget={invoice._id}
                                        className="glass group hover:ring-2 hover:ring-primary/50 transition-all rounded-3xl overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="p-6 space-y-4 flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className="p-3 bg-primary/10 dark:bg-red-900/20 rounded-2xl">
                                                    <FileText className="h-6 w-6 text-primary dark:text-red-400" />
                                                </div>
                                                <div className={cn("px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5", status.color)}>
                                                    <status.icon className="h-3 w-3" />
                                                    {invoice.status.toUpperCase()}
                                                </div>
                                            </div>

                                            <div>
                                                <Link to={`/invoices/view/${invoice._id}`} className="text-lg font-black text-slate-900 dark:text-white hover:text-primary transition-colors">
                                                    {invoice.invoiceNumber}
                                                </Link>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                    {invoice.customerDetails.name}
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                                <div className="space-y-1">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Amount</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</p>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    Due {format(new Date(invoice.dueDate), 'MMM d')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center mt-auto">
                                            <div className="flex gap-2">
                                                <Link to={`/invoices/edit/${invoice._id}`} className="p-2 glass hover:text-primary dark:text-slate-400 dark:hover:text-red-400" title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(invoice._id)} className="p-2 glass hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)} className="p-2 glass hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400" title="Download">
                                                    <Download className="h-4 w-4" />
                                                </button>
                                                <Link to={`/invoices/view/${invoice._id}`} className="inline-flex items-center px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-red-700 transition" title="Preview">
                                                    <Eye className="h-4 w-4 mr-1.5" />
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
