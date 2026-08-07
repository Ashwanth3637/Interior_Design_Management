import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import {
  Building2,
  Users,
  UserCheck,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Layers,
  FileText,
  Palette,
  HardHat,
  Calculator,
  UserPlus,
  ArrowLeft,
  LogOut,
  FolderOpen
} from 'lucide-react';

const AdminDashboard = () => {
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
        console.error('Failed to fetch Admin stats:', err);
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
            <Building2 size={32} color="#dc2626" /> Admin Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Company Operations Management • Employee Onboarding & Roles • Client Database Oversight
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <NotificationBell />

          <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.4rem 1rem', borderRadius: '12px' }}>
            <div className="avatar" style={{ background: '#dc2626', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
              AD
            </div>
            <div className="user-info">
              <span className="user-name" style={{ display: 'block', fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{user?.name || 'Admin User'}</span>
              <span className="role-pill" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626' }}>
                🏢 Admin
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
        {/* Company Analytics Overview */}
        <section style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <TrendingUp size={24} color="#dc2626" /> Company Management Analytics & Overview
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              Live Operational Metrics
            </span>
          </div>

          <div className="analytics-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1.25rem' }}>
            {/* 1. Total Employees */}
            <div className="kpi-card kpi-card-blue" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', padding: '1.2rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="kpi-icon-box bg-blue-light text-blue" style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</span>
                <h2 className="kpi-number" style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.totalEmployees : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Registered Employees</span>
              </div>
            </div>

            {/* 2. Total Clients */}
            <div className="kpi-card kpi-card-indigo" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #475569', padding: '1.2rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="kpi-icon-box bg-indigo-light text-indigo" style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#f8fafc', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Clients</span>
                <h2 className="kpi-number" style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.totalClients : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Client Accounts</span>
              </div>
            </div>

            {/* 3. Active Projects */}
            <div className="kpi-card kpi-card-amber" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #d97706', padding: '1.2rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="kpi-icon-box bg-amber-light text-amber" style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#fffbeb', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Active Projects</span>
                <h2 className="kpi-number" style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.activeProjects : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ongoing Projects</span>
              </div>
            </div>

            {/* 4. Completed Projects */}
            <div className="kpi-card kpi-card-emerald" style={{ background: '#fff', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669', padding: '1.2rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="kpi-icon-box bg-emerald-light text-emerald" style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Completed</span>
                <h2 className="kpi-number" style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>{stats ? stats.completedProjects : '...'}</h2>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivered Milestones</span>
              </div>
            </div>
          </div>
        </section>

        {/* Company Operational Modules Grid */}
        <section style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', marginBottom: '2.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={22} color="#dc2626" /> Admin Company Operations & Department Management
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {/* Staff Management */}
            <div className="saas-card">
              <div>
                <div className="saas-card-title">
                  <Users size={34} color="#2563EB" />
                  <span>Employee & Staff Management</span>
                </div>
                <p className="saas-card-desc">Create employee records, assign roles, update designations, and deactivate staff.</p>
              </div>
              <Link to="/employees" className="saas-btn">
                <Users size={18} /> Manage Employees
              </Link>
            </div>

            {/* Client Database */}
            <div className="saas-card">
              <div>
                <div className="saas-card-title">
                  <UserCheck size={34} color="#2563EB" />
                  <span>Client Directory</span>
                </div>
                <p className="saas-card-desc">Maintain complete client contact history, preferences, and project assignments.</p>
              </div>
              <Link to="/clients" className="saas-btn">
                <UserCheck size={18} /> Client Directory
              </Link>
            </div>

            {/* Project Portfolio */}
            <div className="saas-card">
              <div>
                <div className="saas-card-title">
                  <FolderOpen size={34} color="#2563EB" />
                  <span>Project Management</span>
                </div>
                <p className="saas-card-desc">Monitor overall project timelines, budgets, room concepts, and workflow stages.</p>
              </div>
              <Link to="/projects" className="saas-btn">
                <Briefcase size={18} /> Manage Projects
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
