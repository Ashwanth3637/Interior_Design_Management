import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Edit3,
  FileText,
  Layers,
  DollarSign,
  ArrowLeft,
  X,
  UserCheck,
  CheckSquare,
  Activity,
  Calendar,
  AlertCircle,
  MessageSquare,
  Award,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDMY = (dateObj) => {
  if (!dateObj) return '15-09-2026';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '15-09-2026';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const getTimelineDays = (p) => {
  const start = p.startDate ? new Date(p.startDate) : new Date(2026, 7, 1);
  const end = p.expectedCompletionDate ? new Date(p.expectedCompletionDate) : new Date(2026, 8, 15);
  const now = new Date();

  const elapsedCalc = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const remainingCalc = Math.max(0, Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsed = elapsedCalc > 0 ? elapsedCalc : 20;
  const remaining = remainingCalc > 0 ? remainingCalc : 25;
  const total = Math.max(1, elapsed + remaining);
  const progressPct = Math.min(100, Math.round((elapsed / total) * 100));

  return {
    startStr: formatDMY(start),
    endStr: formatDMY(end),
    elapsed,
    remaining,
    progressPct
  };
};

const ProjectManagerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState('projects'); // projects, dailyLogs, materials, issues, budget
  const [selectedProject, setSelectedProject] = useState(null);

  // Modals
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update & Reassign Form
  const [updateForm, setUpdateForm] = useState({
    projectName: '',
    assignedDesigner: '',
    siteEngineer: '',
    salesExecutive: '',
    accountant: '',
    status: 'In Progress',
    progressPercentage: 0,
    budget: 0,
    spentAmount: 0,
    expectedCompletionDate: '',
  });

  const fetchPMData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/pm/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData.data);
        if (resData.data?.projects?.length > 0) {
          setSelectedProject((prev) => {
            if (!prev) return resData.data.projects[0];
            return resData.data.projects.find((p) => p.projectId === prev.projectId) || resData.data.projects[0];
          });
        }
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setError(resData.message || 'Failed to fetch Project Manager dashboard');
      }
    } catch (err) {
      setError('Network error fetching PM dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPMData();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Open Update & Reassign Modal
  const openUpdateModal = (p) => {
    setSelectedProject(p);
    setUpdateForm({
      projectName: p.projectName || '',
      assignedDesigner: p.assignedDesigner || '',
      siteEngineer: p.siteEngineer || '',
      salesExecutive: p.salesExecutive || '',
      accountant: p.accountant || '',
      status: p.status || 'In Progress',
      progressPercentage: p.progressPercentage || 0,
      budget: p.budget || 0,
      spentAmount: p.spentAmount || 0,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      expectedCompletionDate: p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toISOString().split('T')[0] : '',
    });
    setIsUpdateModalOpen(true);
  };

  // Submit Update / Reassign Team / Progress
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/pm/projects/${selectedProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateForm),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Project '${selectedProject.projectName}' details & team assignments updated!`);
        setIsUpdateModalOpen(false);
        fetchPMData();
      } else {
        setError(resData.message || 'Failed to update project');
      }
    } catch (err) {
      setError('Network error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  // One-click Mark Project Completed
  const handleMarkCompleted = async (p) => {
    if (!window.confirm(`Mark project '${p.projectName}' as COMPLETED?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/pm/projects/${p._id}/approve-progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ progressPercentage: 100, status: 'Completed' }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(`Project '${p.projectName}' marked as COMPLETED!`);
        fetchPMData();
      } else {
        setError(resData.message || 'Failed to mark project as completed');
      }
    } catch (err) {
      setError('Network error updating completion status');
    }
  };

  // Resolve Site Issue
  const handleResolveIssue = async (projectId, issueId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/pm/issues/${projectId}/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Resolved' }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg('Site issue marked as Resolved!');
        fetchPMData();
      } else {
        setError(resData.message || 'Failed to resolve issue');
      }
    } catch (err) {
      setError('Network error updating issue status');
    }
  };

  const summary = data?.summary || { totalProjects: 0, ongoingProjects: 0, completedProjects: 0, delayedProjects: 0 };
  const projectsList = data?.projects || [];
  const teamOptions = data?.teamOptions || { designers: [], siteEngineers: [], salesExecutives: [], accountants: [] };

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
                <UserCheck size={32} color="#2563eb" /> Project Manager Dashboard
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Project Manager'}</strong>. Manage assigned projects, reassign staff, approve site progress, review daily work logs, and handle site issues.
              </p>
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

        {/* SUMMARY CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Assigned Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>{summary.totalProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Briefcase size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Ongoing Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#2563eb', fontSize: '1.75rem', fontWeight: '800' }}>{summary.ongoingProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Completed Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>{summary.completedProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Delayed Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#dc2626', fontSize: '1.75rem', fontWeight: '800' }}>{summary.delayedProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION MODULE TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'projects', label: 'Assigned Projects & Details', icon: Briefcase },
            { id: 'timeline', label: '📅 Project Timeline', icon: Calendar },
            { id: 'dailyLogs', label: 'Review Daily Logs', icon: FileText },
            { id: 'materials', label: 'Review Material Usage', icon: Layers },
            { id: 'issues', label: 'Handle Site Issues', icon: AlertTriangle },
            { id: 'budget', label: 'Monitor Project Budget', icon: DollarSign },
            { id: 'broadcast', label: '📢 Site Notices Broadcast', icon: MessageSquare },
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

        {/* SELECT ACTIVE PROJECT DROP-DOWN (For Module Review) */}
        {projectsList.length > 0 && activeTab !== 'projects' && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={20} color="#2563eb" />
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Active Selected Project:</span>
            </div>
            <select
              value={selectedProject?.projectId || ''}
              onChange={(e) => {
                const found = projectsList.find((p) => p.projectId === e.target.value);
                if (found) setSelectedProject(found);
              }}
              style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', outline: 'none' }}
            >
              {projectsList.map((p) => (
                <option key={p._id} value={p.projectId}>
                  {p.projectId} - {p.projectName} ({p.clientName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MODULE CONTENTS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading Project Manager workspace...</div>
        ) : projectsList.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, color: '#0f172a' }}>No Assigned Projects</h3>
            <p style={{ color: '#64748b' }}>You currently have no projects assigned under your management ({user?.name}).</p>
          </div>
        ) : (
          <div>
            {/* TAB 1.5: PROJECT TIMELINE TRACKING */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {projectsList.map((p) => {
                  const tm = getTimelineDays(p);
                  return (
                    <div key={p._id} style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          📅 Project Timeline
                        </span>
                        <span style={{ backgroundColor: p.status === 'Completed' ? '#f0fdf4' : '#eff6ff', color: p.status === 'Completed' ? '#16a34a' : '#2563eb', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {p.status}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '800' }}>{p.projectName}</h4>
                      <p style={{ margin: '0 0 1.1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                        Client: <strong>{p.clientName}</strong> ({p.projectId})
                      </p>

                      <div style={{ backgroundColor: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.1rem', marginBottom: '1.25rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.15rem' }}>Start Date</span>
                            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{tm.startStr}</strong>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginBottom: '0.15rem' }}>Expected End</span>
                            <strong style={{ fontSize: '1.05rem', color: '#2563eb' }}>{tm.endStr}</strong>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                          <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', padding: '0.65rem 0.85rem', textCenter: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>Elapsed</span>
                            <strong style={{ fontSize: '1.25rem', color: '#1e40af' }}>{tm.elapsed} Days</strong>
                          </div>
                          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '10px', padding: '0.65rem 0.85rem', textCenter: 'center' }}>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase' }}>Remaining</span>
                            <strong style={{ fontSize: '1.25rem', color: '#15803d' }}>{tm.remaining} Days</strong>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem', fontWeight: '600' }}>
                          <span>Timeline Completion</span>
                          <span style={{ color: '#2563eb' }}>{tm.progressPct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${tm.progressPct}%`, height: '100%', backgroundColor: '#2563eb' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {activeTab === 'projects' && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>Assigned Projects List ({projectsList.length})</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Project Details</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Client Info</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Assigned Team</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Site Progress %</th>
                        <th style={{ padding: '0.9rem 1.25rem' }}>Status</th>
                        <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectsList.map((p) => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{p.projectName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600' }}>{p.projectId} • {p.projectType}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {p.location}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.clientName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.clientEmail}</div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span>🎨 Designer: <strong>{p.assignedDesigner || 'Unassigned'}</strong></span>
                              <span>👷 Engineer: <strong>{p.siteEngineer || 'Unassigned'}</strong></span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ fontWeight: '700', color: '#2563eb', marginBottom: '0.2rem' }}>{p.progressPercentage}%</div>
                            <div style={{ width: '120px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{ width: `${p.progressPercentage}%`, height: '100%', backgroundColor: '#2563eb' }} />
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: p.status === 'Completed' ? '#f0fdf4' : p.status === 'On Hold' ? '#fef2f2' : '#eff6ff', color: p.status === 'Completed' ? '#16a34a' : p.status === 'On Hold' ? '#dc2626' : '#2563eb' }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                              <button
                                onClick={() => openUpdateModal(p)}
                                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.45rem 0.75rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                              >
                                <Edit3 size={14} /> Reassign / Update
                              </button>
                              {p.status !== 'Completed' && (
                                <button
                                  onClick={() => handleMarkCompleted(p)}
                                  style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.45rem 0.65rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <CheckCircle size={14} /> Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: REVIEW DAILY LOGS */}
            {activeTab === 'dailyLogs' && selectedProject && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                  Site Daily Work Logs for {selectedProject.projectName} ({selectedProject.dailyLogs?.length || 0})
                </div>
                {!selectedProject.dailyLogs || selectedProject.dailyLogs.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>No site daily work logs submitted yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Work Completed Summary</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Workers On-Site</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.dailyLogs.map((log, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#2563eb' }}>{new Date(log.date).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#0f172a' }}>{log.workCompleted}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{log.workersPresent} Workers</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{log.remarks || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 3: REVIEW MATERIAL USAGE */}
            {activeTab === 'materials' && selectedProject && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                  Material Stock & On-Site Inventory for {selectedProject.projectName} ({selectedProject.materialUsage?.length || 0})
                </div>
                {!selectedProject.materialUsage || selectedProject.materialUsage.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>No material usage logged yet.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Material Name</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Quantity Used</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Remaining Stock</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Logged Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.materialUsage.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{m.materialName}</td>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#dc2626' }}>{m.quantityUsed} Units</td>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>{m.remainingQuantity} Units</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{new Date(m.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 4: HANDLE SITE ISSUES */}
            {activeTab === 'issues' && selectedProject && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                  Reported Site Issues for {selectedProject.projectName} ({selectedProject.reportedIssues?.length || 0})
                </div>
                {!selectedProject.reportedIssues || selectedProject.reportedIssues.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>No site issues reported for this project.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <tr>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Issue Type</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Description</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Severity</th>
                        <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                        <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProject.reportedIssues.map((iss) => (
                        <tr key={iss._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#dc2626' }}>{iss.issueType}</td>
                          <td style={{ padding: '0.85rem 1.25rem', color: '#0f172a' }}>{iss.description}</td>
                          <td style={{ padding: '0.85rem 1.25rem' }}>
                            <span style={{ padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: iss.severity === 'Critical' || iss.severity === 'High' ? '#fef2f2' : '#fffbeb', color: iss.severity === 'Critical' || iss.severity === 'High' ? '#dc2626' : '#d97706' }}>
                              {iss.severity}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: iss.status === 'Resolved' ? '#16a34a' : '#2563eb' }}>{iss.status}</td>
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            {iss.status !== 'Resolved' && (
                              <button
                                onClick={() => handleResolveIssue(selectedProject.projectId, iss._id)}
                                style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <CheckSquare size={14} /> Resolve Issue
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* TAB 5: MONITOR PROJECT BUDGET */}
            {activeTab === 'budget' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {projectsList.map((p) => {
                  const spent = p.spentAmount || 0;
                  const budget = p.budget || 1;
                  const budgetPct = Math.min(100, Math.round((spent / budget) * 100));
                  const isOverBudget = spent > budget;

                  return (
                    <div key={p._id} style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb' }}>{p.projectId}</span>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {p.status}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '800' }}>{p.projectName}</h4>
                      <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.85rem' }}>Client: <strong>{p.clientName}</strong></p>

                      <div style={{ backgroundColor: '#f8fafc', padding: '1.1rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Allocated Budget:</span>
                          <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>₹{budget.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Spent Amount:</span>
                          <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>₹{spent.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', paddingTop: '0.4rem', borderTop: '1px solid #e2e8f0' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Remaining Balance:</span>
                          <strong style={{ color: (budget - spent) < 0 ? '#dc2626' : '#0f172a', fontSize: '0.95rem' }}>
                            ₹{(budget - spent).toLocaleString('en-IN')}
                          </strong>
                        </div>

                        {/* Budget Usage Progress Bar */}
                        <div style={{ paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                            <span style={{ color: '#334155' }}>Budget Used</span>
                            <span style={{ color: isOverBudget ? '#dc2626' : '#2563eb' }}>{budgetPct}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.35rem' }}>
                            <div style={{ width: `${budgetPct}%`, height: '100%', backgroundColor: isOverBudget ? '#dc2626' : '#2563eb' }} />
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textAlign: 'right' }}>
                            ₹{spent.toLocaleString('en-IN')} / ₹{budget.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 6: SITE NOTICES & BROADCAST */}
            {activeTab === 'broadcast' && selectedProject && (
              <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={22} color="#2563eb" /> Broadcast Site Notice / Team Instruction
                </h4>
                <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.875rem' }}>
                  Send urgent directives directly to assigned Interior Designer (<strong>{selectedProject.assignedDesigner || 'None'}</strong>) and Site Engineer (<strong>{selectedProject.siteEngineer || 'None'}</strong>) for project <strong>{selectedProject.projectName}</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Broadcast Title / Directive Topic *</label>
                    <input
                      type="text"
                      placeholder="e.g. Expedite False Ceiling Inspection before Friday"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Instruction Details *</label>
                    <textarea
                      rows="4"
                      placeholder="Enter detailed site instruction for engineer & designer..."
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => setSuccessMsg(`Broadcast sent to ${selectedProject.assignedDesigner} and ${selectedProject.siteEngineer}!`)}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                    >
                      <MessageSquare size={16} /> Send Broadcast Notice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPDATE PROJECT DETAILS & REASSIGN STAFF MODAL */}
      {isUpdateModalOpen && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '580px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Update Project & Reassign Staff</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{selectedProject.projectName} ({selectedProject.projectId})</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsUpdateModalOpen(false)} />
            </div>

            <form onSubmit={handleUpdateProject} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Project Name</label>
                <input
                  type="text"
                  value={updateForm.projectName}
                  onChange={(e) => setUpdateForm({ ...updateForm, projectName: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Project Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Site Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={updateForm.progressPercentage}
                  onChange={(e) => setUpdateForm({ ...updateForm, progressPercentage: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              {/* Staff Reassignment Inputs */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>🎨 Reassign Designer</label>
                <select
                  value={updateForm.assignedDesigner}
                  onChange={(e) => setUpdateForm({ ...updateForm, assignedDesigner: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- Select Designer --</option>
                  {teamOptions.designers.map((d) => (
                    <option key={d._id} value={d.fullName}>{d.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>👷 Reassign Site Engineer</label>
                <select
                  value={updateForm.siteEngineer}
                  onChange={(e) => setUpdateForm({ ...updateForm, siteEngineer: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="">-- Select Site Engineer --</option>
                  {teamOptions.siteEngineers.map((s) => (
                    <option key={s._id} value={s.fullName}>{s.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Budget (₹)</label>
                <input
                  type="number"
                  value={updateForm.budget}
                  onChange={(e) => setUpdateForm({ ...updateForm, budget: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Spent Amount (₹)</label>
                <input
                  type="number"
                  value={updateForm.spentAmount}
                  onChange={(e) => setUpdateForm({ ...updateForm, spentAmount: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>📅 Project Start Date</label>
                <input
                  type="date"
                  value={updateForm.startDate || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, startDate: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>📅 Expected End Date</label>
                <input
                  type="date"
                  value={updateForm.expectedCompletionDate || ''}
                  onChange={(e) => setUpdateForm({ ...updateForm, expectedCompletionDate: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagerDashboard;
