import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  DollarSign,
  FileText,
  CreditCard,
  TrendingUp,
  Plus,
  Trash2,
  Printer,
  Download,
  ArrowLeft,
  X,
  Calculator,
  PieChart,
  CheckCircle,
  Clock,
  AlertCircle,
  Layers,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const AccountantDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('invoices'); // invoices, paymentTracking, expenses, receipts, reports

  // Modals State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [invoiceForm, setInvoiceForm] = useState({
    projectId: '',
    invoiceNumber: '',
    amount: '',
    installmentType: 'Advance Payment',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    paidAmount: '',
    installmentType: 'Advance Payment',
    status: 'Paid',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    projectId: '',
    category: 'Material Cost',
    amount: '',
    vendorName: '',
    remarks: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchAccountantData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/accountant/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData.data);
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(resData.message || 'Failed to fetch Accountant dashboard');
      }
    } catch (err) {
      if (isInitial) setError('Network error fetching Accountant dashboard');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountantData(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchAccountantData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsInvoiceModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsExpenseModalOpen(false);
        setIsReceiptModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open Create Invoice Modal
  const openInvoiceModal = () => {
    setInvoiceForm({
      projectId: data?.projects[0]?.projectId || '',
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: '150000',
      installmentType: 'Advance Payment',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Initial client advance payment invoice',
    });
    setIsInvoiceModalOpen(true);
  };

  // Submit Create Invoice
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/accountant/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceForm),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Invoice '${invoiceForm.invoiceNumber}' generated successfully!`);
        setIsInvoiceModalOpen(false);
        fetchAccountantData();
      } else {
        setError(resData.message || 'Failed to create invoice');
      }
    } catch (err) {
      setError('Network error creating invoice');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Payment Tracking Modal
  const openPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      paidAmount: inv.amount || '',
      installmentType: inv.installmentType || 'Advance Payment',
      status: 'Paid',
      notes: inv.notes || '',
    });
    setIsPaymentModalOpen(true);
  };

  // Submit Payment Receipt Record
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/accountant/invoices/${selectedInvoice.projectId}/${selectedInvoice._id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentForm),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Payment receipt for invoice '${selectedInvoice.invoiceNumber}' recorded successfully!`);
        setIsPaymentModalOpen(false);
        fetchAccountantData();
      } else {
        setError(resData.message || 'Failed to record payment');
      }
    } catch (err) {
      setError('Network error recording payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Expense Modal
  const openExpenseModal = () => {
    setExpenseForm({
      projectId: data?.projects[0]?.projectId || '',
      category: 'Material Cost',
      amount: '',
      vendorName: '',
      remarks: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsExpenseModalOpen(true);
  };

  // Submit Log Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/accountant/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseForm),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Expense of ₹${Number(expenseForm.amount).toLocaleString('en-IN')} logged under ${expenseForm.category}!`);
        setIsExpenseModalOpen(false);
        fetchAccountantData();
      } else {
        setError(resData.message || 'Failed to log expense');
      }
    } catch (err) {
      setError('Network error logging expense');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Invoice
  const handleDeleteInvoice = async (projectId, invoiceId, number) => {
    if (!window.confirm(`Are you sure you want to delete invoice '${number}'?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/accountant/invoices/${projectId}/${invoiceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Invoice '${number}' deleted.`);
        fetchAccountantData();
      } else {
        setError(resData.message || 'Failed to delete invoice');
      }
    } catch (err) {
      setError('Network error deleting invoice');
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/accountant/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg('Expense record deleted.');
        fetchAccountantData();
      } else {
        setError(resData.message || 'Failed to delete expense');
      }
    } catch (err) {
      setError('Network error deleting expense');
    }
  };

  // Open Receipt Print View
  const openReceiptModal = (inv) => {
    setSelectedInvoice(inv);
    setIsReceiptModalOpen(true);
  };

  const summary = data?.summary || { totalRevenue: 0, pendingPayments: 0, paidInvoicesCount: 0, monthlyIncome: 0, totalExpenses: 0, netProfit: 0 };
  const invoicesList = data?.invoices || [];
  const expensesList = data?.expenses || [];
  const projectsList = data?.projects || [];
  const reports = data?.reports || { totalRevenue: 0, totalMaterialCost: 0, totalLabourCost: 0, totalMiscExpenses: 0, totalExpenses: 0, netProfit: 0 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Header with Module Banner Image */}
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Main Portal
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calculator size={32} color="#2563eb" /> Accountant Dashboard
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Accountant'}</strong>. Manage client invoices, track multi-installment payments, maintain site expenses, generate receipts, and produce financial reports.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src="/financial_reports_desk_1786024532449.png" 
                alt="Accountant Financial Work" 
                style={{ width: '130px', height: '75px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
              />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span>{error}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
            <span>{successMsg}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSuccessMsg('')} />
          </div>
        )}

        {/* DASHBOARD CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Total Revenue */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Total Revenue</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>₹{summary.totalRevenue.toLocaleString('en-IN')}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Pending Payments</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#dc2626', fontSize: '1.75rem', fontWeight: '800' }}>₹{summary.pendingPayments.toLocaleString('en-IN')}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Paid Invoices */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Paid Invoices</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#2563eb', fontSize: '1.75rem', fontWeight: '800' }}>{summary.paidInvoicesCount}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          {/* Monthly Income */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Monthly Income</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>₹{summary.monthlyIncome.toLocaleString('en-IN')}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f8fafc', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION MODULE TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'invoices', label: 'Invoice Management', icon: FileText },
            { id: 'paymentTracking', label: 'Payment Tracking', icon: CreditCard },
            { id: 'expenses', label: 'Expense Management', icon: Layers },
            { id: 'receipts', label: 'Receipts', icon: Download },
            { id: 'reports', label: 'Financial Reports', icon: PieChart },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isActive ? '#2563eb' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 1px 3px rgba(0,0,0,0.02)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* MODULE CONTENTS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading Accountant workspace...</div>
        ) : (
          <div>
            {/* TAB 1: INVOICE MANAGEMENT */}
            {activeTab === 'invoices' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Client Invoices Directory ({invoicesList.length})</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Invoice Details</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Project & Client</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Installment Stage</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Total & Paid</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                        <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesList.map((inv) => (
                        <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: '#2563eb', fontSize: '0.95rem' }}>{inv.invoiceNumber}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>{inv.projectName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.clientName} ({inv.projectId})</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                              {inv.installmentType || 'Advance Payment'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>₹{inv.amount?.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.75rem', color: inv.paidAmount >= inv.amount ? '#16a34a' : '#d97706', fontWeight: '600' }}>
                              Received: ₹{(inv.paidAmount || 0).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: inv.status === 'Paid' ? '#f0fdf4' : '#fef2f2', color: inv.status === 'Paid' ? '#16a34a' : '#dc2626' }}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => openPaymentModal(inv)}
                                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                Record Payment
                              </button>
                              <button
                                onClick={() => handleDeleteInvoice(inv.projectId, inv._id, inv.invoiceNumber)}
                                style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT TRACKING */}
            {activeTab === 'paymentTracking' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {invoicesList.map((inv) => {
                  const paid = inv.paidAmount || 0;
                  const total = inv.amount || 1;
                  const pct = Math.min(100, Math.round((paid / total) * 100));

                  return (
                    <div key={inv._id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb' }}>{inv.invoiceNumber}</span>
                        <span style={{ backgroundColor: inv.status === 'Paid' ? '#f0fdf4' : '#fffbeb', color: inv.status === 'Paid' ? '#16a34a' : '#d97706', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {inv.installmentType}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '800' }}>{inv.projectName}</h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Client: {inv.clientName}</p>

                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b' }}>Total Invoice Amount:</span>
                          <strong style={{ color: '#0f172a' }}>₹{total.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b' }}>Collected Payment:</span>
                          <strong style={{ color: '#16a34a' }}>₹{paid.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b' }}>Due Balance:</span>
                          <strong style={{ color: (total - paid) > 0 ? '#dc2626' : '#16a34a' }}>
                            ₹{Math.max(0, total - paid).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>

                      {/* Payment Completion Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', color: '#334155' }}>
                          <span>Installment Completion</span>
                          <span style={{ color: '#2563eb' }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#16a34a' : '#2563eb' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: EXPENSE MANAGEMENT */}
            {activeTab === 'expenses' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Project Expense Log ({expensesList.length})</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Project Name</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Category</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Vendor Name</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Expense Amount</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Date</th>
                        <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesList.map((exp) => (
                        <tr key={exp._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0f172a' }}>
                            {exp.projectName}
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{exp.projectId}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{ padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: exp.category === 'Material Cost' ? '#eff6ff' : exp.category === 'Labour Cost' ? '#fffbeb' : '#fcf6ff', color: exp.category === 'Material Cost' ? '#2563eb' : exp.category === 'Labour Cost' ? '#d97706' : '#9333ea' }}>
                              {exp.category}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>{exp.vendorName || 'N/A'}</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: '800', color: '#dc2626' }}>₹{exp.amount?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '1rem 1.25rem', color: '#64748b' }}>{new Date(exp.date).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteExpense(exp._id)}
                              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: RECEIPTS & DOWNLOAD */}
            {activeTab === 'receipts' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {invoicesList.map((inv) => (
                  <div key={inv._id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#2563eb' }}>{inv.invoiceNumber}</span>
                      <span style={{ backgroundColor: inv.status === 'Paid' ? '#f0fdf4' : '#eff6ff', color: inv.status === 'Paid' ? '#16a34a' : '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {inv.status}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>{inv.projectName}</h4>
                    <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Client: {inv.clientName}</p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Stage:</span>
                        <strong style={{ color: '#0f172a' }}>{inv.installmentType}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Amount Paid:</span>
                        <strong style={{ color: '#16a34a' }}>₹{(inv.paidAmount || 0).toLocaleString('en-IN')}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => openReceiptModal(inv)}
                      style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      <Printer size={16} /> Download Receipt
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: FINANCIAL REPORTS */}
            {activeTab === 'reports' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Revenue vs Profit Report */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} color="#16a34a" /> Profit & Revenue Summary
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>Total Collected Revenue:</span>
                      <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>
                        ₹{reports.totalRevenue.toLocaleString('en-IN')}
                      </h2>
                    </div>

                    <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: '600' }}>Total Project Expenses:</span>
                      <h2 style={{ margin: '0.2rem 0 0 0', color: '#dc2626', fontSize: '1.75rem', fontWeight: '800' }}>
                        ₹{reports.totalExpenses.toLocaleString('en-IN')}
                      </h2>
                    </div>

                    <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: '600' }}>Net Profit (Revenue - Expenses):</span>
                      <h2 style={{ margin: '0.2rem 0 0 0', color: reports.netProfit >= 0 ? '#2563eb' : '#dc2626', fontSize: '1.75rem', fontWeight: '800' }}>
                        ₹{reports.netProfit.toLocaleString('en-IN')}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown Report */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={20} color="#2563eb" /> Expense Breakdown Report
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span>Material Costs</span>
                        <strong>₹{reports.totalMaterialCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${reports.totalExpenses ? (reports.totalMaterialCost / reports.totalExpenses) * 100 : 0}%`, height: '100%', backgroundColor: '#2563eb' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span>Labour Wages & Costs</span>
                        <strong>₹{reports.totalLabourCost.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${reports.totalExpenses ? (reports.totalLabourCost / reports.totalExpenses) * 100 : 0}%`, height: '100%', backgroundColor: '#d97706' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                        <span>Miscellaneous Site Expenses</span>
                        <strong>₹{reports.totalMiscExpenses.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: `${reports.totalExpenses ? (reports.totalMiscExpenses / reports.totalExpenses) * 100 : 0}%`, height: '100%', backgroundColor: '#9333ea' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '540px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Generate New Client Invoice</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Select project and installment stage.</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsInvoiceModalOpen(false)} />
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Select Project *</label>
                <select
                  value={invoiceForm.projectId}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, projectId: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  {projectsList.map((p) => (
                    <option key={p._id} value={p.projectId}>{p.projectId} - {p.projectName} ({p.clientName})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Invoice Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Installment Stage *</label>
                <select
                  value={invoiceForm.installmentType}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, installmentType: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Advance Payment">Advance Payment (50%)</option>
                  <option value="Second Installment">Second Installment (30%)</option>
                  <option value="Final Installment">Final Payment (20%) ✅</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Remarks</label>
                  <input
                    type="text"
                    placeholder="Optional notes"
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Record Payment Installment</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{selectedInvoice.invoiceNumber} ({selectedInvoice.projectName})</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsPaymentModalOpen(false)} />
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Installment Stage</label>
                <select
                  value={paymentForm.installmentType}
                  onChange={(e) => setPaymentForm({ ...paymentForm, installmentType: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Advance Payment">Advance Payment</option>
                  <option value="Second Installment">Second Installment</option>
                  <option value="Final Payment">Final Payment</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Payment Status</label>
                <select
                  value={paymentForm.status}
                  onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Paid">Paid (Full Received)</option>
                  <option value="Pending">Pending Partial</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Saving...' : 'Record Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAINTAIN EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Maintain Project Expense</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Log material, labour, or misc expenses.</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsExpenseModalOpen(false)} />
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Project *</label>
                <select
                  value={expenseForm.projectId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, projectId: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  {projectsList.map((p) => (
                    <option key={p._id} value={p.projectId}>{p.projectId} - {p.projectName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Expense Category *</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  >
                    <option value="Material Cost">Material Cost</option>
                    <option value="Labour Cost">Labour Cost</option>
                    <option value="Miscellaneous Expenses">Miscellaneous Expenses</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Expense Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Asian Paints, Local Carpenter"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Expense Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)' }}
                >
                  {submitting ? 'Saving...' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {isReceiptModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '620px', width: '100%', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem', fontWeight: '800' }}>OFFICIAL PAYMENT RECEIPT</h2>
                <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.85rem' }}>Interior Design ERP Management System</span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Suite 402, Metro Plaza, Sector 4 • GSTIN: 33AAAAA0000A1Z5
                </div>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsReceiptModalOpen(false)} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Receipt / Invoice #:</span>
                  <strong style={{ color: '#2563eb', fontSize: '1rem' }}>{selectedInvoice.invoiceNumber}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'block' }}>Receipt Date:</span>
                  <strong style={{ color: '#0f172a' }}>06 Aug 2026</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Project Name:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoice.projectName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Client Name:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoice.clientName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Installment Stage:</span>
                <strong style={{ color: '#2563eb' }}>{selectedInvoice.installmentType}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Payment Method:</span>
                <strong style={{ color: '#16a34a' }}>Online Bank Transfer (NEFT / UPI)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Collected & Issued By:</span>
                <strong style={{ color: '#334155' }}>{user?.name || 'Varshan'} (Finance Dept)</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Total Invoice Amount:</span>
                <strong style={{ color: '#0f172a' }}>₹{selectedInvoice.amount?.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '10px', color: '#16a34a' }}>
                <span style={{ fontWeight: '700' }}>Amount Received:</span>
                <strong style={{ fontSize: '1.15rem' }}>₹{(selectedInvoice.paidAmount || selectedInvoice.amount)?.toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', marginTop: '0.75rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                Thank you for your business! Official computer-generated receipt. Contact: finance@interiordesign.com | +91 9345262189
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
