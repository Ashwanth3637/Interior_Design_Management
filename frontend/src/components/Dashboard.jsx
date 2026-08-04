import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
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
  Calculator
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Admin':
      case 'ADMIN':
      case 'Super Admin':
      case 'SUPER_ADMIN':
        return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
      case 'Designer':
      case 'INTERIOR_DESIGNER':
      case 'Interior Designer':
        return { bg: '#f3e8ff', border: '#e9d5ff', text: '#7c3aed' };
      default:
        return { bg: '#eff6ff', border: '#dbeafe', text: '#2563eb' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(user?.role);
  const isAdmin = ['Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role);
  const isDesigner = ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer', 'Admin', 'ADMIN', 'Super Admin', 'SUPER_ADMIN'].includes(user?.role);

  const isUserAdmin = isAdmin;
  const isUserDesigner = ['Designer', 'INTERIOR_DESIGNER', 'Interior Designer'].includes(user?.role);
  const isUserSiteEngineer = ['SITE_ENGINEER', 'Site Engineer'].includes(user?.role);
  const isUserPM = ['PROJECT_MANAGER', 'Project Manager'].includes(user?.role);
  const isUserSales = ['SALES_EXECUTIVE', 'Sales Executive'].includes(user?.role);
  const isUserAccountant = ['ACCOUNTANT', 'Accountant'].includes(user?.role);

  const getPortalTitle = () => {
    if (isUserAdmin) return 'Admin Dashboard';
    if (isUserDesigner) return 'Designer Dashboard';
    if (isUserSiteEngineer) return 'Site Engineer Dashboard';
    if (isUserPM) return 'Project Manager Dashboard';
    if (isUserSales) return 'Sales Executive Dashboard';
    if (isUserAccountant) return 'Accountant Dashboard';
    return 'Client Dashboard';
  };

  const getWelcomeDescription = () => {
    if (isUserAdmin) return 'Manage employee records, project assignments, client databases, and executive reports.';
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
        </section>

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
              <h3>Security & Role Status</h3>
            </div>
            <div className="card-body">
              <div className="detail-item">
                <span className="label">Role Granted:</span>
                <span className="val bold" style={{ color: badgeStyle.text }}>{user?.role}</span>
              </div>
              <div className="detail-item">
                <span className="label">JWT Auth:</span>
                <span className="val badge-success"><CheckCircle2 size={14} /> Active</span>
              </div>
              <div className="detail-item">
                <span className="label">Password Encryption:</span>
                <span className="val">bcryptjs (Salt factor 10)</span>
              </div>
              <div className="detail-item">
                <span className="label">Account Status:</span>
                <span className="val badge-success">{user?.isActive ? 'Active User' : 'Inactive'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Role Based Specific Modules */}
        <section className="role-specific-section">
          <h3>
            <Lock size={20} className="section-icon" /> Role-Based Modules & Authorization
          </h3>

          <div className="role-panels-grid">
            {/* Admin Panel */}
            <div className={`role-panel ${isAdmin ? 'active' : 'disabled'}`}>
              <div className="role-panel-header">
                <Users size={24} className="panel-icon admin" />
                <h4>Admin Control Panel</h4>
              </div>
              <p>System configuration, managing employees, assigning roles, and department workflows.</p>
              {isAdmin && (
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/employees" style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 1rem', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}>
                    <Users size={16} /> Manage Employees
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
