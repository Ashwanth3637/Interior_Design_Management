import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  UserPlus,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowLeft,
  X,
  Users,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  User,
  Lock,
  Eye,
  EyeOff,
  Palette,
  FolderOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowStepper from './WorkflowStepper';
import NotificationBell from './NotificationBell';
import { designImages } from '../assets/images';

const SalesExecutiveDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    password: 'Password123!',
    location: '',
    projectType: 'Residential',
    budget: '500000',
    projectName: '',
    assignedDesigner: '',
    projectManager: '',
  });

  const fetchSalesData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/sales/dashboard', {
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
        if (isInitial) setError(resData.message || 'Failed to fetch Sales dashboard');
      }
    } catch (err) {
      if (isInitial) setError('Network error fetching Sales dashboard');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchSalesData(false);
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
        setIsRegisterModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openRegisterModal = () => {
    setRegisterForm({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      password: 'Password123!',
      location: '',
      projectType: 'Residential',
      budget: '500000',
      projectName: '',
      assignedDesigner: data?.teamOptions?.designers[0]?.fullName || '',
      projectManager: data?.teamOptions?.projectManagers[0]?.fullName || '',
    });
    setShowPassword(false);
    setIsRegisterModalOpen(true);
  };

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      // Clean budget string to numeric string before sending
      const cleanBudget = registerForm.budget ? String(registerForm.budget).replace(/[^0-9]/g, '') : '0';
      const payload = {
        ...registerForm,
        budget: cleanBudget
      };

      const res = await fetch('http://localhost:5001/api/sales/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Client '${registerForm.clientName}' registered & workflow initialized!`);
        setIsRegisterModalOpen(false);
        fetchSalesData();
      } else {
        setError(resData.message || 'Failed to register client lead');
      }
    } catch (err) {
      setError('Network error registering lead');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for budget auto-formatting while typing
  const handleBudgetChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    if (!rawVal) {
      setRegisterForm(prev => ({ ...prev, budget: '' }));
      return;
    }
    const num = parseInt(rawVal, 10);
    const formatted = new Intl.NumberFormat('en-IN').format(num);
    setRegisterForm(prev => ({ ...prev, budget: formatted }));
  };

  // Helper to format currency for display
  const formatCurrency = (val) => {
    if (!val && val !== 0) return '₹0';
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, '') || '0', 10);
    return `₹${new Intl.NumberFormat('en-IN').format(num)}`;
  };

  // Workflow Stage Badge Colors mapping
  const getWorkflowBadgeStyle = (stage) => {
    const s = (stage || '').toLowerCase();
    if (s.includes('lead registered') || s.includes('registration')) {
      return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
    if (s.includes('designer assigned')) {
      return { backgroundColor: '#f3e8ff', color: '#7c3aed', border: '1px solid #ddd6fe' };
    }
    if (s.includes('design upload') || s.includes('designing')) {
      return { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
    }
    if (s.includes('client review') || s.includes('handover') || s.includes('review')) {
      return { backgroundColor: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5' };
    }
    if (s.includes('approved') || s.includes('design approved')) {
      return { backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' };
    }
    if (s.includes('completed')) {
      return { backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' };
    }
    return { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' };
  };

  const summary = data?.summary || { totalLeads: 0, activeProjects: 0, convertedClients: 0 };
  const projectsList = data?.projects || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .btn-modern-hover {
          transition: all 0.2s ease-in-out;
        }
        .btn-modern-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.25) !important;
        }
        .btn-modern-secondary-hover {
          transition: all 0.2s ease-in-out;
        }
        .btn-modern-secondary-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06) !important;
        }
      `}</style>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={16} /> Back to Main Portal
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '48px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem', letterSpacing: '-0.02em' }}>
                <UserPlus size={40} color="#2563eb" /> Sales Executive Dashboard
              </h1>
              <p style={{ margin: '0.4rem 0 0 0', color: '#64748b', fontSize: '15px' }}>
                Logged in as <strong>{user?.name || 'Sales Executive'}</strong>. Register new client leads, initiate project workflows, and hand off project setup to PMs and Designers.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <NotificationBell size={22} />
              <button
                onClick={openRegisterModal}
                className="btn-modern-hover"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.4rem', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <Plus size={19} /> Register Client Lead
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px' }}>
            <span>{error}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setError('')} />
          </div>
        )}
        {successMsg && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px' }}>
            <span>{successMsg}</span>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setSuccessMsg('')} />
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Registered Client Leads</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>{summary.totalLeads}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Active Workflow Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#2563eb', fontSize: '1.75rem', fontWeight: '800' }}>{summary.activeProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Advance Converted (Paid)</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>{summary.convertedClients}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW PIPELINE TABLE */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
            Registered Client Projects & Workflow Progression ({projectsList.length})
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <tr>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Client Name</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Email</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Phone</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Project Name</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Project ID</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Designer Assigned</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Project Manager Assigned</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Budget</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Current Workflow Stage</th>
                </tr>
              </thead>
              <tbody>
                {projectsList.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FolderOpen size={28} color="#94a3b8" />
                        </div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>
                          No client leads registered yet.
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '360px' }}>
                          Click <strong>"Register Client Lead"</strong> to create your first project.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projectsList.map((p) => {
                    const badgeStyle = getWorkflowBadgeStyle(p.workflowStage);
                    return (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#0f172a' }}>{p.clientName}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748b' }}>{p.clientEmail}</td>
                        <td style={{ padding: '1rem 1.25rem', color: '#64748b' }}>{p.clientPhone}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{p.projectName}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#475569' }}>{p.projectId}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{p.assignedDesigner || 'Unassigned'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{p.projectManager || 'Unassigned'}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>
                          {formatCurrency(p.budget)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span style={{ ...badgeStyle, padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-block' }}>
                            {(!p.designs || p.designs.length === 0) && (p.workflowStage === 'Design Upload' || p.workflowStage === 'Designer Assigned')
                              ? 'Designer Assigned (Pending Upload)'
                              : (p.workflowStage || 'Designer Assigned')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DESIGN PORTFOLIO SHOWCASE FOR SALES PITCHES */}
        <div style={{ marginTop: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Sales Pitch Portfolio Showcase</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>High-resolution interior design concepts to showcase to prospective clients.</p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.3rem 0.75rem', borderRadius: '9999px' }}>
              6 Ready Assets
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={designImages.livingRoom} alt="Living Room" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem', background: '#f8fafc' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>Living Room</span>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>Modern Warm Lounge</h4>
              </div>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={designImages.kitchen} alt="Modular Kitchen" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem', background: '#f8fafc' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>Modular Kitchen</span>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>Luxury Oak Countertop</h4>
              </div>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={designImages.bedroom} alt="Master Bedroom" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem', background: '#f8fafc' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>Bedroom</span>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>Penthouse Master Suite</h4>
              </div>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img src={designImages.office} alt="Executive Office" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
              <div style={{ padding: '0.75rem', background: '#f8fafc' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>Office</span>
                <h4 style={{ margin: '0.2rem 0 0 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: '700' }}>Executive Home Office</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTER CLIENT LEAD MODAL */}
      {isRegisterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '820px', width: '100%', padding: '30px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>Register Client Lead & Initiate Workflow</h3>
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '15px' }}>Stage 1: Client Registration</p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegisterClient}>
              
              {/* SECTION 1: Client Information */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="#2563eb" /> Client Information
                  </h4>
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', marginTop: '0.6rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Client Name */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <User size={15} color="#2563eb" /> Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jeffy"
                      value={registerForm.clientName}
                      onChange={(e) => setRegisterForm({ ...registerForm, clientName: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <Mail size={15} color="#2563eb" /> Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jeffy@example.com"
                      value={registerForm.clientEmail}
                      onChange={(e) => setRegisterForm({ ...registerForm, clientEmail: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <Phone size={15} color="#2563eb" /> Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={registerForm.clientPhone}
                      onChange={(e) => setRegisterForm({ ...registerForm, clientPhone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Password with Eye Toggle */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <Lock size={15} color="#2563eb" /> Password *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 2.5rem 0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Project Information */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={18} color="#2563eb" /> Project Information
                  </h4>
                  <div style={{ height: '1px', backgroundColor: '#e2e8f0', marginTop: '0.6rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {/* Address / Location */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <MapPin size={15} color="#2563eb" /> Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter project site address"
                      value={registerForm.location}
                      onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Budget with Auto Formatting */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <DollarSign size={15} color="#2563eb" /> Budget
                    </label>
                    <input
                      type="text"
                      placeholder="Estimated budget (₹)"
                      value={registerForm.budget ? `₹${registerForm.budget}` : ''}
                      onChange={handleBudgetChange}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  {/* Assigned Designer */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <Palette size={15} color="#2563eb" /> Designer
                    </label>
                    <select
                      value={registerForm.assignedDesigner}
                      onChange={(e) => setRegisterForm({ ...registerForm, assignedDesigner: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    >
                      <option value="">-- Select Designer --</option>
                      {data?.teamOptions?.designers.map((d) => (
                        <option key={d._id} value={d.fullName}>{d.fullName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project Manager */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                      <Briefcase size={15} color="#2563eb" /> Project Manager
                    </label>
                    <select
                      value={registerForm.projectManager}
                      onChange={(e) => setRegisterForm({ ...registerForm, projectManager: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '15px', outline: 'none' }}
                    >
                      <option value="">-- Select PM --</option>
                      {data?.teamOptions?.projectManagers.map((pm) => (
                        <option key={pm._id} value={pm.fullName}>{pm.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="btn-modern-secondary-hover"
                  style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', fontSize: '15px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-modern-hover"
                  style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Registering...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesExecutiveDashboard;

