import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, ArrowLeft, Calculator, User, Building, MapPin, Banknote, Calendar, Clock, Hash, Tag, FileText, Loader2, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../utils/utils';

const InvoiceForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reference: '',
        customerDetails: { name: '', address: '', email: '', website: '' },
        items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
        companyDetails: { name: '', address: '', phone: '', email: '', website: '', abn: '', AmountEnclosed: '' },
        paymentInstructions: { bankName: '', accountNumber: '', bsb: '' },
        status: 'Draft'
    });

    useEffect(() => {
        if (user && !id) {
            setFormData(prev => ({
                ...prev,
                invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                companyDetails: {
                    name: user.companyProfile?.name || '',
                    address: user.companyProfile?.address || '',
                    phone: user.companyProfile?.phone || '',
                    email: user.companyProfile?.email || user.email,
                    website: user.companyProfile?.website || '',
                    abn: user.companyProfile?.abn || '',
                    AmountEnclosed: user.companyDetails?.AmountEnclosed || ''
                },
                paymentInstructions: {
                    bankName: user.companyProfile?.bankName || '',
                    accountNumber: user.companyProfile?.accountNumber || '',
                    bsb: user.companyProfile?.bsb || ''
                }
            }));
        }

        if (id) {
            fetchInvoice();
        }
    }, [id, user]);

    const fetchInvoice = async () => {
        setFetching(true);
        try {
            const res = await api.get(`/invoices/${id}`);
            const inv = res.data;
            setFormData({
                ...inv,
                invoiceDate: new Date(inv.invoiceDate).toISOString().split('T')[0],
                dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
            });
        } catch (error) {
            alert('Failed to fetch invoice');
            navigate('/');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (field, value, section = null) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : newItems[index].quantity;
            const price = field === 'unitPrice' ? parseFloat(value) || 0 : newItems[index].unitPrice;
            newItems[index].total = qty * price;
        }

        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((acc, item) => acc + item.total, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await api.put(`/invoices/${id}`, formData);
            } else {
                await api.post('/invoices', formData);
            }
            navigate('/');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <Layout><div className="flex justify-center p-20 text-slate-400 font-bold">Synchronizing Data...</div></Layout>;

    return (
        <Layout>
            <div className="space-y-6 pb-32">
                {/* Sticky Header */}
                <div className="sticky top-16 z-40 -mx-4 px-4 py-4 glass border-b border-white/20 dark:border-slate-800/50 mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/')} className="p-2 glass hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white">{id ? 'Edit Invoice' : 'New Invoice'}</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{formData.invoiceNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-primary hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span>{id ? 'Update' : 'Create'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* General Info */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl space-y-6">
                            <div className="flex items-center space-x-2 text-primary">
                                <FileText className="h-5 w-5" />
                                <h3 className="font-black uppercase text-xs tracking-widest">General Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Hash className="h-3 w-3" /> Invoice No</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        value={formData.invoiceNumber}
                                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        value={formData.invoiceDate}
                                        onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Clock className="h-3 w-3" /> Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2.5 glass rounded-xl font-bold "
                                        value={formData.dueDate}
                                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Hash className="h-3 w-3" /> ABN</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 96 678 973 085"
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        value={formData.companyDetails.abn}
                                        onChange={(e) => handleInputChange('abn', e.target.value, 'companyDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5"><Hash className="h-3 w-3" /> Amount Enclosed</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 96 678 973 085"
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        value={formData.companyDetails.AmountEnclosed}
                                        onChange={(e) => handleInputChange('AmountEnclosed', e.target.value, 'companyDetails')}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Line Items */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-3xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center space-x-2 text-primary">
                                    <Tag className="h-5 w-5" />
                                    <h3 className="font-black uppercase text-xs tracking-widest">Line Items</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="p-2 bg-primary/10 text-primary rounded-xl hover:scale-110 transition-transform"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <AnimatePresence>
                                    {formData.items.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-2xl group"
                                        >
                                            <div className="col-span-12 md:col-span-6 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Graphic Design Services"
                                                    className="w-full px-4 py-2 glass rounded-xl text-sm"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Qty</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full px-4 py-2 glass rounded-xl text-sm text-center"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase">Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    step="0.01"
                                                    className="w-full px-4 py-2 glass rounded-xl text-sm text-right"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2 flex items-center justify-between pb-2 pl-2">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(item.total)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-1.5 text-slate-300 hover: transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <div className="flex items-center space-x-2 text-slate-400">
                                        <Calculator className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Total Calculation</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 font-medium">Grand Total (USD)</p>
                                        <p className="text-4xl font-black text-primary">{formatCurrency(calculateSubtotal())}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-8">
                        {/* Customer Details */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl space-y-6">
                            <div className="flex items-center space-x-2 text-primary">
                                <User className="h-5 w-5" />
                                <h3 className="font-black uppercase text-xs tracking-widest">Customer Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        placeholder="Enter customer name"
                                        value={formData.customerDetails.name}
                                        onChange={(e) => handleInputChange('name', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Address</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        placeholder="Enter customer address"
                                        value={formData.customerDetails.address}
                                        onChange={(e) => handleInputChange('address', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Email</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        placeholder="Enter customer email"
                                        value={formData.customerDetails.email}
                                        onChange={(e) => handleInputChange('email', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Phone_NO</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        placeholder="Enter customer phone"
                                        value={formData.customerDetails.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value, 'customerDetails')}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Website</label>
                                    <textarea
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        placeholder="Enter customer Website"
                                        value={formData.customerDetails.website}
                                        onChange={(e) => handleInputChange('website', e.target.value, 'customerDetails')}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl space-y-6">
                            <div className="flex items-center space-x-2 text-primary">
                                <Banknote className="h-5 w-5" />
                                <h3 className="font-black uppercase text-xs tracking-widest">Payment Setup</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 glass rounded-xl"
                                        value={formData.paymentInstructions.bankName}
                                        onChange={(e) => handleInputChange('bankName', e.target.value, 'paymentInstructions')}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">BSB</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 glass rounded-xl"
                                            value={formData.paymentInstructions.bsb}
                                            onChange={(e) => handleInputChange('bsb', e.target.value, 'paymentInstructions')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Acc No</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 glass rounded-xl"
                                            value={formData.paymentInstructions.accountNumber}
                                            onChange={(e) => handleInputChange('accountNumber', e.target.value, 'paymentInstructions')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default InvoiceForm;
