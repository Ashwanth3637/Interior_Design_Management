import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import {
  Crown,
  Users,
  UserCheck,
  Briefcase,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Eye,
  Lock,
  UserPlus,
  ArrowLeft,
  LogOut,
  RotateCw,
  FileText,
  Palette,
  HardHat,
  Calculator,
  Building2,
  Edit2,
  Trash2,
  ShieldAlert
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, employees, projects

  const fetchSuperAdminStats = async (showAnim = false) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/projects/admin-analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.data);
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    setIsSpinning(true);
    fetchSuperAdminStats(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  useEffect(() => {
    fetchSuperAdminStats(true);
  }, []);

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem' }}>
      {/* Top Header Bar */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Main Portal
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Crown size={32} color="#b45309" /> Super Admin Console
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            👥 Staff Management (Add / Edit / Delete) • 👁️ View-Only Project & Revenue Monitoring
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <NotificationBell />

          <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fffbe6', border: '1px solid #fef08a', padding: '0.4rem 1rem', borderRadius: '12px' }}>
            <div className="avatar" style={{ background: '#b45309', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              SA
            </div>
            <div className="user-info">
              <span className="user-name" style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{user?.name || 'Super Admin'}</span>
              <span className="role-pill" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309' }}>
                👑 Super Admin Role
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleManualRefresh}
              style={{
                backgroundColor: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              title="Refresh Analytics Stats"
            >
              <RotateCw size={15} className={isSpinning ? 'spin-icon' : ''} style={{ color: '#2563eb' }} /> Refresh
            </button>
            <button onClick={logout} className="btn-logout" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#dc2626', padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Permissions Matrix Notice Banner */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#1e40af' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldAlert size={24} color="#2563eb" />
          <div>
            <strong style={{ fontSize: '0.95rem', display: 'block' }}>Super Admin Security Policy Configuration:</strong>
            <span style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
              • <strong>👥 Employees:</strong> Full Management Access (Add, Edit, Delete Staff)
            </span>
          </div>
        </div>
        <Link to="/employees" style={{ backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <UserPlus size={16} /> Manage Employees
        </Link>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'overview' ? '#b45309' : '#ffffff', color: activeTab === 'overview' ? '#ffffff' : '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
        >
          <TrendingUp size={16} /> Master Overview & Analytics
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'employees' ? '#b45309' : '#ffffff', color: activeTab === 'employees' ? '#ffffff' : '#475569', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}
        >
          <Users size={16} /> 👥 Employee Management (Add / Edit / Delete)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <main className="dashboard-main">
          <section style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={24} color="#b45309" /> Live Operational Telemetry
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                Real-Time Executive Summary
              </span>
            </div>

            <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
              <div className="kpi-card kpi-card-blue" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '1.25rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="kpi-icon-box bg-blue-light text-blue" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={26} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</span>
                  <h2 className="kpi-number" style={{ fontSize: '2rem', fontWeight: '800', margin: '0.2rem 0', color: '#0f172a' }}>{stats ? stats.totalEmployees : '...'}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>✅ Manageable (Add / Edit / Delete)</span>
                </div>
              </div>

              <div className="kpi-card kpi-card-indigo" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #475569', padding: '1.25rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="kpi-icon-box bg-indigo-light text-indigo" style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={26} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label" style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Clients</span>
                  <h2 className="kpi-number" style={{ fontSize: '2rem', fontWeight: '800', margin: '0.2rem 0', color: '#0f172a' }}>{stats ? stats.totalClients : '...'}</h2>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>👁️ Directory Summary</span>
                </div>
              </div>
            </div>
          </section>

          {/* Core Controls */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={22} color="#2563eb" /> Staff Management & Employee Directory
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
              <div className="saas-card" style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1.5rem', backgroundColor: '#eff6ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem', fontSize: '1.1rem' }}>
                    <Users size={26} color="#2563EB" />
                    <span>Company Staff Roster (Add / Edit / Delete)</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>Super Admin has full operational authority to add new employees, assign roles (Admin, PM, Designer, Site Eng, Sales, Accountant), edit salaries, and delete records.</p>
                </div>
                <Link to="/employees" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#2563eb', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '800', fontSize: '0.95rem', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(37,99,235,0.25)' }}>
                  <UserPlus size={18} /> Open Employee Management →
                </Link>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* TAB 2: EMPLOYEE MANAGEMENT (ADD / EDIT / DELETE) */}
      {activeTab === 'employees' && (
        <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={24} color="#2563eb" /> Company Staff Management (Full Access)
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Super Admin has full authority to <strong>Add</strong>, <strong>Edit</strong>, and <strong>Delete</strong> staff records across all roles.
              </p>
            </div>
            <Link
              to="/employees"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.7rem 1.4rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
            >
              <UserPlus size={18} /> + Add / Edit / Delete Staff Roster
            </Link>
          </div>

          <div style={{ padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
            <Users size={48} color="#2563eb" style={{ marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800' }}>Staff Directory Management Console</h4>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
              Click below to open the complete Employee Roster to add new staff, modify assigned roles, update salaries, or delete/deactivate employee accounts.
            </p>
            <Link
              to="/employees"
              style={{ backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Users size={18} /> Launch Employee Roster →
            </Link>
          </div>
        </section>
      )}

      {/* TAB 3: PROJECT MONITORING (VIEW ONLY) */}
      {activeTab === 'projects' && (
        <section style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Eye size={24} color="#b45309" /> Project Portfolio Monitoring (View Only)
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                As configured, Super Admin has <strong>View-Only</strong> permissions for projects. Creation, editing, and deletion are managed by PMs and Admins.
              </p>
            </div>
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={16} /> View Only Mode
            </span>
          </div>

          {!stats?.projects || stats.projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8fafc', borderRadius: '12px', color: '#64748b' }}>
              No active or completed projects found in database.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {stats.projects.map(p => (
                <div key={p._id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#2563eb' }}>{p.projectId} • {p.projectType}</span>
                    <span style={{ backgroundColor: p.status === 'Completed' ? '#dcfce7' : '#eff6ff', color: p.status === 'Completed' ? '#15803d' : '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800' }}>
                      {p.status}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontWeight: '800' }}>{p.projectName}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>Client: <strong>{p.clientName}</strong></div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span>PM:</span> <strong>{p.projectManager || 'Unassigned'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Progress:</span> <strong>{p.progressPercentage || 0}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
