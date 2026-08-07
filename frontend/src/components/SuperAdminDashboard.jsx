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
  ShieldCheck,
  Lock,
  RotateCcw,
  Database,
  Activity,
  FileText,
  Palette,
  HardHat,
  Calculator,
  UserPlus,
  ArrowLeft,
  LogOut,
  AlertTriangle
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/projects/admin-analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch Super Admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-layout" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem' }}>
      {/* Top Header Bar */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Main Portal
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Crown size={32} color="#b45309" /> Admin Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            System Administration • User Access & Role Permissions • Company Overview
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
                👑 Full Access
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn-logout" style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#dc2626', padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="dashboard-main">
        {/* KPI Analytics Cards in 1 Row */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp size={24} color="#b45309" /> System Analytics
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              Live Multi-Branch Overview
            </span>
          </div>

          <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '1rem' }}>
            {/* 1. Total Employees */}
            <div className="kpi-card kpi-card-blue" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '1rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="kpi-icon-box bg-blue-light text-blue" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</span>
                <h2 className="kpi-number" style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.totalEmployees : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Active Employees</span>
              </div>
            </div>

            {/* 2. Total Clients */}
            <div className="kpi-card kpi-card-indigo" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #475569', padding: '1rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="kpi-icon-box bg-indigo-light text-indigo" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Clients</span>
                <h2 className="kpi-number" style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.totalClients : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Registered Accounts</span>
              </div>
            </div>

            {/* 3. Active Projects */}
            <div className="kpi-card kpi-card-amber" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', padding: '1rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="kpi-icon-box bg-amber-light text-amber" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Projects</span>
                <h2 className="kpi-number" style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.activeProjects : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>In Renovation</span>
              </div>
            </div>

            {/* 4. Completed Projects */}
            <div className="kpi-card kpi-card-emerald" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669', padding: '1rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="kpi-icon-box bg-emerald-light text-emerald" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completed</span>
                <h2 className="kpi-number" style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.completedProjects : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivered Projects</span>
              </div>
            </div>

            {/* 5. Total Revenue */}
            <div className="kpi-card kpi-card-purple" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #4f46e5', padding: '1rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="kpi-icon-box bg-purple-light text-purple" style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eef2ff', color: '#3730a3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Revenue</span>
                <h2 className="kpi-number" style={{ fontSize: '1.65rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  {stats ? `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '...'}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Collected Income</span>
              </div>
            </div>
          </div>
        </section>

        {/* Super Admin Master Controls */}
        <div style={{ marginBottom: '2.5rem' }}>
          {/* Master Governance Controls */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={22} color="#2563eb" /> System Management & Controls
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {/* Manage All Staff & Admins */}
              <div className="saas-card">
                <div>
                  <div className="saas-card-title">
                    <Users size={34} color="#2563EB" />
                    <span>Company Staff & Admins</span>
                  </div>
                  <p className="saas-card-desc">Onboard new admins, assign roles, and manage company staff access.</p>
                </div>
                <Link to="/employees" className="saas-btn">
                  <Users size={18} /> Open Staff Directory
                </Link>
              </div>

              {/* Master Financial & Portfolio Overview */}
              <div className="saas-card">
                <div>
                  <div className="saas-card-title">
                    <Briefcase size={34} color="#2563EB" />
                    <span>Project Portfolio</span>
                  </div>
                  <p className="saas-card-desc">Full oversight of all active, in-review, and completed project lifecycles.</p>
                </div>
                <Link to="/projects" className="saas-btn">
                  <Briefcase size={18} /> View All Projects
                </Link>
              </div>

              {/* Client Account Management */}
              <div className="saas-card">
                <div>
                  <div className="saas-card-title">
                    <UserCheck size={34} color="#2563EB" />
                    <span>Client Database</span>
                  </div>
                  <p className="saas-card-desc">Monitor client accounts, active inquiries, and project assignments.</p>
                </div>
                <Link to="/clients" className="saas-btn">
                  <UserCheck size={18} /> Manage Clients
                </Link>
              </div>

              {/* Master Financial Receivables */}
              <div className="saas-card">
                <div>
                  <div className="saas-card-title">
                    <Calculator size={34} color="#2563EB" />
                    <span>Finance & Receivables</span>
                  </div>
                  <p className="saas-card-desc">Full revenue, expense, net profit, and receivables accounting oversight.</p>
                </div>
                <Link to="/accountant" className="saas-btn">
                  <Calculator size={18} /> Open Finance Hub
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Access All 7 Role Modules Shortcuts */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="#b45309" /> Direct Access to All Role Dashboards
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
            <Link to="/pm-dashboard" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <FileText size={24} color="#2563eb" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Project Manager</div>
            </Link>

            <Link to="/designer-studio" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <Palette size={24} color="#7c3aed" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Designer Studio</div>
            </Link>

            <Link to="/site-engineer" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <HardHat size={24} color="#d97706" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Site Engineer</div>
            </Link>

            <Link to="/accountant" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <Calculator size={24} color="#059669" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Accountant</div>
            </Link>

            <Link to="/sales-executive" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <UserPlus size={24} color="#4f46e5" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Sales Executive</div>
            </Link>

            <Link to="/client-portal" style={{ textDecoration: 'none', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', textAlign: 'center', color: '#0f172a' }}>
              <UserCheck size={24} color="#0891b2" style={{ marginBottom: '0.4rem' }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>Client Portal</div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
