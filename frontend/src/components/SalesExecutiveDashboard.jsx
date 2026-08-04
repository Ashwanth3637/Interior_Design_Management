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
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowStepper from './WorkflowStepper';

const SalesExecutiveDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
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
        setError(resData.message || 'Failed to fetch Sales dashboard');
      }
    } catch (err) {
      setError('Network error fetching Sales dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

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
    setIsRegisterModalOpen(true);
  };

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/sales/register-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerForm),
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

  const summary = data?.summary || { totalLeads: 0, activeProjects: 0, convertedClients: 0 };
  const projectsList = data?.projects || [];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
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
              <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <UserPlus size={32} color="#2563eb" /> Sales Executive Dashboard
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Sales Executive'}</strong>. Register new client leads, initiate project workflows, and hand off project setup to PMs and Designers.
              </p>
            </div>
            <button
              onClick={openRegisterModal}
              style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.7rem 1.25rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
            >
              <Plus size={18} /> Register Client Lead
            </button>
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

        {/* SUMMARY CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Registered Client Leads</span>
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
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Active Workflow Projects</span>
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
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Advance Converted (Paid)</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>{summary.convertedClients}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* WORKFLOW PIPELINE TABLE */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
            Registered Client Projects & Workflow Progression ({projectsList.length})
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <tr>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Client Lead</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Project Info</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Handoff Staff</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Budget</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>Workflow Stage</th>
                </tr>
              </thead>
              <tbody>
                {projectsList.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{p.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.clientEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📞 {p.clientPhone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: '700', color: '#2563eb' }}>{p.projectName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.projectId} • 📍 {p.location}</div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span>🎨 Designer: <strong>{p.assignedDesigner || 'Unassigned'}</strong></span>
                        <span>👷 PM: <strong>{p.projectManager || 'Unassigned'}</strong></span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>
                      ₹{p.budget?.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                        {p.workflowStage || 'Project Setup'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REGISTER CLIENT LEAD MODAL */}
      {isRegisterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '640px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Register Client Lead & Initiate Workflow</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Stage 1: Client Registration</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsRegisterModalOpen(false)} />
            </div>

            <form onSubmit={handleRegisterClient} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Virat Kohli"
                  value={registerForm.clientName}
                  onChange={(e) => setRegisterForm({ ...registerForm, clientName: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Client Email *</label>
                <input
                  type="email"
                  required
                  placeholder="kohli@gmail.com"
                  value={registerForm.clientEmail}
                  onChange={(e) => setRegisterForm({ ...registerForm, clientEmail: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Client Phone</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={registerForm.clientPhone}
                  onChange={(e) => setRegisterForm({ ...registerForm, clientPhone: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Client Portal Password *</label>
                <input
                  type="text"
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Site Location / Address</label>
                <input
                  type="text"
                  placeholder="Jubilee Hills, Hyderabad"
                  value={registerForm.location}
                  onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Estimated Budget (₹)</label>
                <input
                  type="number"
                  value={registerForm.budget}
                  onChange={(e) => setRegisterForm({ ...registerForm, budget: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>🎨 Assign Designer Handoff</label>
                <select
                  value={registerForm.assignedDesigner}
                  onChange={(e) => setRegisterForm({ ...registerForm, assignedDesigner: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- Select Designer --</option>
                  {data?.teamOptions?.designers.map((d) => (
                    <option key={d._id} value={d.fullName}>{d.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>👷 Assign Project Manager Handoff</label>
                <select
                  value={registerForm.projectManager}
                  onChange={(e) => setRegisterForm({ ...registerForm, projectManager: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- Select PM --</option>
                  {data?.teamOptions?.projectManagers.map((pm) => (
                    <option key={pm._id} value={pm.fullName}>{pm.fullName}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Registering...' : 'Register Lead & Initialize Workflow'}
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
