import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import {
  LogOut,
  User,
  Shield,
  Palette,
  CheckCircle2,
  Lock,
  Layers,
  Settings,
  Briefcase,
  Users,
  HardHat,
  Calculator,
  UserPlus,
  UserCheck,
  TrendingUp,
  DollarSign,
  Crown,
  Building2,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const res = await fetch('http://localhost:5001/api/projects/admin-analytics', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch admin analytics:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, []);

  const isSuperAdmin = ['Super Admin', 'SUPER_ADMIN'].includes(user?.role);
  const isAdminOnly = ['Admin', 'ADMIN'].includes(user?.role);
  const isAdmin = isSuperAdmin || isAdminOnly;
  const isDesigner = ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role);

  const getRoleBadgeStyle = (role) => {
    if (['Super Admin', 'SUPER_ADMIN'].includes(role)) {
      return { bg: '#fffbe6', border: '#fef08a', text: '#b45309' };
    }
    if (['Admin', 'ADMIN'].includes(role)) {
      return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
    }
    if (['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(role)) {
      return { bg: '#f3e8ff', border: '#e9d5ff', text: '#7c3aed' };
    }
    return { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' };
  };

  const badgeStyle = getRoleBadgeStyle(user?.role);

  const isUserDesigner = ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(user?.role);
  const isUserSiteEngineer = ['SITE_ENGINEER', 'Site Engineer'].includes(user?.role);
  const isUserPM = ['PROJECT_MANAGER', 'Project Manager'].includes(user?.role);
  const isUserSales = ['SALES_EXECUTIVE', 'Sales Executive'].includes(user?.role);
  const isUserAccountant = ['ACCOUNTANT', 'Accountant'].includes(user?.role);

  const getPortalTitle = () => {
    if (isSuperAdmin) return '👑 Super Admin Master Dashboard';
    if (isAdminOnly) return '🏢 Admin Dashboard';
    if (isUserDesigner) return 'Designer Dashboard';
    if (isUserSiteEngineer) return 'Site Engineer Dashboard';
    if (isUserPM) return 'Project Manager Dashboard';
    if (isUserSales) return 'Sales Executive Dashboard';
    if (isUserAccountant) return 'Accountant Dashboard';
    return 'Client Dashboard';
  };

  const getWelcomeDescription = () => {
    if (isSuperAdmin) return 'You have full access to manage employees, projects, clients, and company settings.';
    if (isAdminOnly) return 'Manage company operations, employee records, project assignments, client databases, and executive reports.';
    if (isUserDesigner) return 'View your assigned interior projects, upload 2D floor plans & 3D renders, and select material specifications.';
    if (isUserSiteEngineer) return 'Track live site execution, log daily work & workers, upload site photos, and report site issues.';
    if (isUserPM) return 'Monitor project timelines, resource allocation, and milestone approvals.';
    if (isUserSales) return 'Manage client leads, quotations, and contract onboardings.';
    if (isUserAccountant) return 'Track client payments, vendor invoices, and project budgets.';
    return 'Track live renovation progress, approve 2D & 3D room designs, and view invoice billing.';
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="brand-logo">
          <Palette className="brand-icon" size={28} />
          <div>
            <h1>{getPortalTitle()}</h1>
            <span className="subtitle">Interior Design Management System</span>
          </div>
        </div>

        <div className="header-actions">
          <NotificationBell />

          <div className="user-profile-badge">
            <div className="avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span
                className="role-pill"
                style={{
                  backgroundColor: badgeStyle.bg,
                  borderColor: badgeStyle.border,
                  color: badgeStyle.text,
                }}
              >
                {user?.role}
              </span>
            </div>
          </div>

          <button onClick={logout} className="btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="welcome-banner">
          <h2>Welcome back, {user?.name}!</h2>
          <p>
            You are logged in as <strong>{user?.role}</strong>. {getWelcomeDescription()}
          </p>

          {/* Easy Navigation Shortcuts Bar */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginRight: '0.4rem' }}>Quick Navigation:</span>
            <Link to="/checkin" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#0284c7', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Clock size={14} /> Employee Check-In
            </Link>
            <Link to="/projects" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Briefcase size={14} /> Projects
            </Link>
            {isAdmin && (
              <>
                <Link to="/employees" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <Users size={14} /> Employees
                </Link>
                <Link to="/clients" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <UserCheck size={14} /> Clients
                </Link>
              </>
            )}
            {isDesigner && (
              <Link to="/designer-studio" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#7c3aed', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <Palette size={14} /> Designer Studio
              </Link>
            )}
            <Link to="/client-portal" className="hover-btn" style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#059669', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Layers size={14} /> Client Portal
            </Link>
          </div>
        </section>

        {/* Phase 2: Admin Dashboard Analytics & Statistics */}
        {isAdmin && (
          <section className="admin-analytics-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <TrendingUp size={24} color="#2563eb" /> Key System Analytics & Performance Statistics
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                Real-time Live Metrics
              </span>
            </div>

            <div className="analytics-kpi-grid">
              {/* 1. Total Employees */}
              <div className="kpi-card kpi-card-blue">
                <div className="kpi-icon-box bg-blue-light text-blue">
                  <Users size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Employees</span>
                  <h2 className="kpi-number">{stats ? stats.totalEmployees : '...'}</h2>
                  <div className="kpi-footer-tag">Active Company Staff</div>
                </div>
              </div>

              {/* 2. Total Clients */}
              <div className="kpi-card kpi-card-indigo">
                <div className="kpi-icon-box bg-indigo-light text-indigo">
                  <UserCheck size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Clients</span>
                  <h2 className="kpi-number">{stats ? stats.totalClients : '...'}</h2>
                  <div className="kpi-footer-tag">Registered Client Accounts</div>
                </div>
              </div>

              {/* 3. Active Projects */}
              <div className="kpi-card kpi-card-amber">
                <div className="kpi-icon-box bg-amber-light text-amber">
                  <Briefcase size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Active Projects</span>
                  <h2 className="kpi-number">{stats ? stats.activeProjects : '...'}</h2>
                  <div className="kpi-footer-tag">Ongoing Renovation & Planning</div>
                </div>
              </div>

              {/* 4. Completed Projects */}
              <div className="kpi-card kpi-card-emerald">
                <div className="kpi-icon-box bg-emerald-light text-emerald">
                  <CheckCircle2 size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Completed Projects</span>
                  <h2 className="kpi-number">{stats ? stats.completedProjects : '...'}</h2>
                  <div className="kpi-footer-tag">Handed Over Projects</div>
                </div>
              </div>

              {/* 5. Total Revenue */}
              <div className="kpi-card kpi-card-purple">
                <div className="kpi-icon-box bg-purple-light text-purple">
                  <DollarSign size={24} />
                </div>
                <div className="kpi-content">
                  <span className="kpi-label">Total Revenue</span>
                  <h2 className="kpi-number text-purple-heading">
                    {stats ? `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '...'}
                  </h2>
                  <div className="kpi-footer-tag">Received Invoice Income</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* User Details Overview */}
        <div className="grid-cards">
          <div className="dash-card">
            <div className="card-header">
              <User size={20} className="card-icon blue" />
              <h3>User Profile</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <span className="label">Full Name:</span>
                <span className="val">{user?.name}</span>
              </div>
              <div className="detail-item">
                <span className="label">Email Address:</span>
                <span className="val">{user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="val">{user?.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">User ID:</span>
                <span className="val mono">{user?._id}</span>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="card-header">
              <Shield size={20} className="card-icon purple" />
              <h3>Account Information</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <span className="label">Role:</span>
                <span className="val bold" style={{ color: badgeStyle.text }}>{user?.role}</span>
              </div>
              <div className="detail-item">
                <span className="label">Login Status:</span>
                <span className="val badge-success"><CheckCircle2 size={14} /> Active</span>
              </div>
              <div className="detail-item">
                <span className="label">Last Login:</span>
                <span className="val">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Based Specific Modules */}
        <section className="role-specific-section">
          <h3>
            <Lock size={20} className="section-icon" /> System Overview & Modules
          </h3>

          <div className="role-panels-grid">
            {/* Super Admin Module Panel */}
            <div className={`role-panel ${isSuperAdmin ? 'active' : 'disabled'}`} style={{ border: isSuperAdmin ? '2px solid #fef08a' : '1px solid #e2e8f0', background: isSuperAdmin ? '#fffdf0' : '#ffffff' }}>
              <div className="role-panel-header">
                <Crown size={24} className="panel-icon admin" style={{ color: '#b45309' }} />
                <h4 style={{ color: '#b45309' }}>Admin Panel</h4>
              </div>
              <p>System management, overall statistics, audit logs, and user controls.</p>
              {isSuperAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/super-admin" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#b45309', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(180, 83, 9, 0.25)' }}>
                    <Crown size={16} /> Open Admin Panel
                  </Link>
                </div>
              )}
              {isSuperAdmin ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem', color: '#b45309', background: '#fef9c3' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Admin Only
                </div>
              )}
            </div>

            {/* Admin Module Panel */}
            <div className={`role-panel ${isAdmin ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <Building2 size={24} className="panel-icon admin" style={{ color: '#dc2626' }} />
                <h4>Admin Module</h4>
              </div>
              <p>Company management, managing staff rosters, employee onboarding, and client directory.</p>
              {isAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/admin" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#dc2626', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)' }}>
                    <Building2 size={16} /> Open Admin Module
                  </Link>
                </div>
              )}
              {isAdmin ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to Admins
                </div>
              )}
            </div>

            {/* Designer Panel */}
            <div className={`role-panel ${isDesigner || isAdmin ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <Palette size={24} className="panel-icon designer" />
                <h4>Designer Studio</h4>
              </div>
              <p>Create interior 3D concepts, update project timelines, and upload room layout blueprints.</p>
              {(isDesigner || isAdmin) && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/designer-studio" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Palette size={16} /> Open Designer Studio
                  </Link>
                </div>
              )}
              {(isDesigner || isAdmin) ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to Designers & Admins
                </div>
              )}
            </div>

            {/* Project Manager Panel */}
            <div className={`role-panel ${['PROJECT_MANAGER', 'Project Manager', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role) ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <Briefcase size={24} className="panel-icon designer" style={{ color: '#2563eb' }} />
                <h4>Project Manager Portal</h4>
              </div>
              <p>Manage all projects, assign employee teams, track timelines, approve work, and generate reports.</p>
              {(['PROJECT_MANAGER', 'Project Manager', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/pm-dashboard" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Briefcase size={16} /> Open PM Dashboard
                  </Link>
                </div>
              )}
              {(['PROJECT_MANAGER', 'Project Manager', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to PMs & Admins
                </div>
              )}
            </div>

            {/* Sales Executive Panel */}
            <div className={`role-panel ${['SALES_EXECUTIVE', 'Sales Executive', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role) ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <UserPlus size={24} className="panel-icon designer" style={{ color: '#2563eb' }} />
                <h4>Sales Executive Portal</h4>
              </div>
              <p>Register client leads, record budget estimates, and initiate project workflows for PM handoff.</p>
              {(['SALES_EXECUTIVE', 'Sales Executive', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/sales-executive" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <UserPlus size={16} /> Open Sales Dashboard
                  </Link>
                </div>
              )}
              {(['SALES_EXECUTIVE', 'Sales Executive', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to Sales Execs & Admins
                </div>
              )}
            </div>

            {/* Accountant Panel */}
            <div className={`role-panel ${['ACCOUNTANT', 'Accountant', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role) ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <Calculator size={24} className="panel-icon designer" style={{ color: '#2563eb' }} />
                <h4>Accountant Portal</h4>
              </div>
              <p>Manage client invoices, track multi-stage payments, maintain site expenses, and generate reports.</p>
              {(['ACCOUNTANT', 'Accountant', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/accountant" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Calculator size={16} /> Open Accountant Dashboard
                  </Link>
                </div>
              )}
              {(['ACCOUNTANT', 'Accountant', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to Accountants & Admins
                </div>
              )}
            </div>

            {/* Site Engineer Panel */}
            <div className={`role-panel ${['SITE_ENGINEER', 'Site Engineer', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role) ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <HardHat size={24} className="panel-icon designer" style={{ color: 'blue' }} />
                <h4>Site Engineer Portal</h4>
              </div>
              <p>Track site execution, log daily work & workers, upload site photos, and report site issues.</p>
              {(['SITE_ENGINEER', 'Site Engineer', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/site-engineer" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)' }}>
                    <HardHat size={16} /> Open Site Dashboard
                  </Link>
                </div>
              )}
              {(['SITE_ENGINEER', 'Site Engineer', 'Admin', 'ADMIN', 'Super Admin'].includes(user?.role)) ? (
                <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle2 size={16} /> Access Granted
                </div>
              ) : (
                <div className="panel-status restricted">
                  <Lock size={16} /> Restricted to Site Engineers & Admins
                </div>
              )}
            </div>

            {/* Client Panel */}
            <div className="role-panel active">
              <div className="role-panel-header">
                <Briefcase size={24} className="panel-icon client" />
                <h4>Client Portal</h4>
              </div>
              <p>View home design proposals, track renovation milestones, and review budget quotations.</p>
              <div style={{ marginTop: '1rem' }}>
                {isAdmin ? (
                  <Link to="/clients" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Users size={16} /> Manage Clients & Profiles
                  </Link>
                ) : (
                  <Link to="/client-portal" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Briefcase size={16} /> My Project & Progress
                  </Link>
                )}
              </div>
              <div className="panel-status success" style={{ marginTop: '0.75rem' }}>
                <CheckCircle2 size={16} /> Access Granted (All Roles)
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
