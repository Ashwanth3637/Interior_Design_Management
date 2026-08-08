import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  HardHat,
  Briefcase,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  Layers,
  FileText,
  Plus,
  ArrowLeft,
  X,
  Upload,
  Calendar,
  Users,
  Eye,
  Activity,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import WorkflowStepper from './WorkflowStepper';
import { designImages } from '../assets/images';

const SiteEngineerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, projects, logs, photos, materials, issues
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Forms State
  const [progressForm, setProgressForm] = useState({ progressPercentage: 0, currentStage: 'In Progress', status: 'In Progress' });
  const [dailyLogForm, setDailyLogForm] = useState({ workCompleted: '', workersPresent: 1, remarks: '', date: new Date().toISOString().split('T')[0] });
  const [photoForm, setPhotoForm] = useState({ imageUrl: designImages.siteProgress, category: 'During Work', title: 'Site Inspection Framing & Electrical Setup' });
  const [materialForm, setMaterialForm] = useState({ materialName: '', quantityUsed: 1, remainingQuantity: 0 });
  const [issueForm, setIssueForm] = useState({ issueType: 'Delay', description: '', severity: 'Medium' });

  const [submitting, setSubmitting] = useState(false);

  const fetchSiteProjects = async (isInitial = true) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects?engineer=${encodeURIComponent(user?.name || '')}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects(data.data || []);
        if (data.data?.length > 0) {
          setSelectedProject((prev) => {
            if (!prev) return data.data[0];
            return data.data.find((p) => p.projectId === prev.projectId) || data.data[0];
          });
        }
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        if (isInitial) setError(data.message || 'Failed to fetch site engineer projects');
      }
    } catch (err) {
      if (isInitial) setError('Network error connecting to site projects endpoint');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteProjects(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [user]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProgressModalOpen(false);
        setSelectedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Open Progress Update Modal
  const openProgressModal = (p) => {
    setSelectedProject(p);
    setProgressForm({
      progressPercentage: p.progressPercentage || 0,
      currentStage: p.currentStage || 'Plumbing & Electrical',
      status: p.status || 'In Progress'
    });
    setIsProgressModalOpen(true);
  };

  // Submit Progress Update
  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      alert('Error: No project selected.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects/${selectedProject.projectId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message || 'Site work progress updated successfully!'}`);
        setSuccessMsg(data.message || 'Site work progress updated successfully!');
        setIsProgressModalOpen(false);
        fetchSiteProjects(true);
      } else {
        alert(`Error: ${data.message || 'Failed to update progress'}`);
        setError(data.message || 'Failed to update progress');
      }
    } catch (err) {
      console.error('Progress update exception:', err);
      alert('Network error updating progress. Please check server.');
      setError('Network error updating progress');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Daily Work Log
  const handleAddDailyLog = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!dailyLogForm.workCompleted) {
      setError('Please provide a summary of work completed');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects/${selectedProject.projectId}/daily-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dailyLogForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Daily work log recorded successfully!');
        setDailyLogForm({ workCompleted: '', workersPresent: 1, remarks: '', date: new Date().toISOString().split('T')[0] });
        fetchSiteProjects();
      } else {
        setError(data.message || 'Failed to add daily work log');
      }
    } catch (err) {
      setError('Network error recording daily log');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Site Photo
  const handleAddSitePhoto = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!photoForm.imageUrl) {
      setError('Please enter a valid site image URL');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects/${selectedProject.projectId}/site-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(photoForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Site photo (${photoForm.category}) uploaded successfully!`);
        setPhotoForm({ imageUrl: '', category: 'During Work', title: '' });
        fetchSiteProjects();
      } else {
        setError(data.message || 'Failed to upload site photo');
      }
    } catch (err) {
      setError('Network error uploading photo');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Material Usage
  const handleAddMaterialUsage = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!materialForm.materialName) {
      setError('Please specify material name');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects/${selectedProject.projectId}/material-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(materialForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Material usage for '${materialForm.materialName}' logged!`);
        setMaterialForm({ materialName: '', quantityUsed: 1, remainingQuantity: 0 });
        fetchSiteProjects();
      } else {
        setError(data.message || 'Failed to log material usage');
      }
    } catch (err) {
      setError('Network error logging material usage');
    } finally {
      setSubmitting(false);
    }
  };

  // Report Site Issue
  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!issueForm.description) {
      setError('Please provide issue description');
      return;
    }
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/site-engineer/projects/${selectedProject.projectId}/report-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(issueForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Site issue '${issueForm.issueType}' reported successfully!`);
        setIssueForm({ issueType: 'Delay', description: '', severity: 'Medium' });
        fetchSiteProjects();
      } else {
        setError(data.message || 'Failed to report site issue');
      }
    } catch (err) {
      setError('Network error reporting site issue');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for KPI Summary Cards
  const totalProjects = projects.length;
  const ongoingProjects = projects.filter((p) => p.status === 'In Progress').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const totalDailyLogsCount = projects.reduce((acc, p) => acc + (p.dailyLogs?.length || 0), 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
        
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
                <HardHat size={32} color="#2563eb" /> Site Engineer Dashboard
              </h1>
              <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                Logged in as <strong>{user?.name || 'Site Engineer'}</strong>. Manage on-site execution, daily work logs, photo inspections, and issue reporting.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <img 
                src="/engineer_site_inspection_1786024342723.png" 
                alt="Site Inspection Work" 
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

        {/* SUMMARY CARDS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Assigned Projects</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>{totalProjects}</h2>
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
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#2563eb', fontSize: '1.75rem', fontWeight: '800' }}>{ongoingProjects}</h2>
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
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#16a34a', fontSize: '1.75rem', fontWeight: '800' }}>{completedProjects}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Today's Tasks & Logs</span>
                <h2 style={{ margin: '0.2rem 0 0 0', color: '#d97706', fontSize: '1.75rem', fontWeight: '800' }}>{totalDailyLogsCount}</h2>
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
            </div>
          </div>
        </div>



        {/* NAVIGATION MODULE TABS */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.4rem', borderBottom: '1px solid #e2e8f0' }}>
          {[
            { id: 'overview', label: 'My Projects', icon: Briefcase },
            { id: 'logs', label: 'Daily Work Logs', icon: FileText },
            { id: 'photos', label: 'Site Inspection Photos', icon: Camera },
            { id: 'materials', label: 'Material Usage', icon: Layers },
            { id: 'issues', label: 'Reported Site Issues', icon: AlertTriangle },
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

        {/* SELECT ACTIVE PROJECT DROP-DOWN (For Module Operations) */}
        {projects.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={20} color="#2563eb" />
              <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Active Selected Project:</span>
            </div>
            <select
              value={selectedProject?.projectId || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.projectId === e.target.value);
                if (found) setSelectedProject(found);
              }}
              style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600', fontSize: '0.9rem', outline: 'none' }}
            >
              {projects.map((p) => (
                <option key={p._id} value={p.projectId}>
                  {p.projectId} - {p.projectName} ({p.clientName})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* MODULE CONTENT */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>Loading site projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <HardHat size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, color: '#0f172a' }}>No Site Projects Assigned</h3>
            <p style={{ color: '#64748b' }}>You currently have no site execution projects assigned to your account ({user?.name}).</p>
          </div>
        ) : (
          <div>
            {/* TAB 1: MY PROJECTS */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>My Assigned Projects</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.25rem' }}>
                  {projects.map((p) => (
                    <div key={p._id} style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
                          {p.projectId} • {p.projectType}
                        </span>
                        <span style={{ backgroundColor: p.status === 'Completed' ? '#f0fdf4' : '#eff6ff', color: p.status === 'Completed' ? '#16a34a' : '#2563eb', padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                          {p.status}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 0.35rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '700' }}>{p.projectName}</h4>
                      <p style={{ margin: '0 0 0.85rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                        Client: <strong>{p.clientName}</strong> ({p.location})
                      </p>
                      
                      <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.3rem' }}>
                          <span>Approved Budget:</span>
                          <strong style={{ color: '#16a34a', fontSize: '0.85rem' }}>₹{p.budget ? p.budget.toLocaleString('en-IN') : 'TBD'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span>Execution Start Date:</span>
                          <strong>{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN') : 'Immediate'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span>Site Progress:</span>
                          <strong style={{ color: '#2563eb' }}>{p.progressPercentage}%</strong>
                        </div>
                        <div style={{ width: '100%', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progressPercentage}%`, height: '100%', backgroundColor: '#2563eb' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {p.advancePaymentPaid || p.workflowStage === "Advance Payment Received" || (p.invoices && p.invoices.some(i => i.status === 'Paid')) ? (
                          <button
                            onClick={() => openProgressModal(p)}
                            style={{ flex: 1, backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.6rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                          >
                            <Edit3 size={15} /> Update Site Progress
                          </button>
                        ) : (
                          <div style={{ flex: 1, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.55rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.78rem', textAlign: 'center' }}>
                            🔒 Execution Locked (Awaiting Client Advance Payment)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: DAILY WORK LOGS */}
            {activeTab === 'logs' && selectedProject && (
              <div>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={20} color="#2563eb" /> Record Daily Work Log for {selectedProject.projectName}
                  </h4>
                  <form onSubmit={handleAddDailyLog}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Date</label>
                        <input
                          type="date"
                          value={dailyLogForm.date}
                          onChange={(e) => setDailyLogForm({ ...dailyLogForm, date: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Workers Present</label>
                        <input
                          type="number"
                          min="1"
                          value={dailyLogForm.workersPresent}
                          onChange={(e) => setDailyLogForm({ ...dailyLogForm, workersPresent: Number(e.target.value) })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Remarks</label>
                        <input
                          type="text"
                          placeholder="e.g. Electrical wiring completed"
                          value={dailyLogForm.remarks}
                          onChange={(e) => setDailyLogForm({ ...dailyLogForm, remarks: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Work Completed Summary *</label>
                      <textarea
                        rows="3"
                        placeholder="Detail site activities executed today..."
                        required
                        value={dailyLogForm.workCompleted}
                        onChange={(e) => setDailyLogForm({ ...dailyLogForm, workCompleted: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      <Plus size={16} /> Record Daily Log
                    </button>
                  </form>
                </div>

                {/* Past Logs Table */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                    Past Daily Work Logs ({selectedProject.dailyLogs?.length || 0})
                  </div>
                  {!selectedProject.dailyLogs || selectedProject.dailyLogs.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No daily logs recorded yet.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <tr>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Work Completed Summary</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Workers</th>
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
              </div>
            )}

            {/* TAB 3: SITE INSPECTION PHOTOS */}
            {activeTab === 'photos' && selectedProject && (
              <div>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Camera size={20} color="#2563eb" /> Upload Site Inspection Photo (Before, During, After Work)
                  </h4>
                  <form onSubmit={handleAddSitePhoto}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Photo Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Living room wall plastering"
                          value={photoForm.title}
                          onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Work Category *</label>
                        <select
                          value={photoForm.category}
                          onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="Before Work">Before Work (Initial Site Condition)</option>
                          <option value="During Work">During Work (Execution Progress)</option>
                          <option value="After Work">After Work (Finished Outcome)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Select Image File / Upload Device Photo</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPhotoForm(prev => ({ ...prev, imageUrl: reader.result }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Or Image URL Link</label>
                          <input
                            type="text"
                            placeholder="e.g. https://images.unsplash.com/..."
                            value={photoForm.imageUrl}
                            onChange={(e) => setPhotoForm({ ...photoForm, imageUrl: e.target.value })}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}
                          />
                        </div>
                      </div>

                      {photoForm.imageUrl && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 0.85rem', background: '#f1f5f9', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <img src={photoForm.imageUrl} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e293b', display: 'block' }}>📸 Live Image Preview Ready</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Category: {photoForm.category}</span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)', alignSelf: 'flex-start' }}
                      >
                        <Upload size={16} /> Upload Site Image
                      </button>
                    </div>
                  </form>
                </div>

                {/* Photo Gallery Grid */}
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>
                  Site Photo Gallery ({selectedProject.siteImages?.length || 0})
                </h4>
                {!selectedProject.siteImages || selectedProject.siteImages.length === 0 ? (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2.5rem', textAlign: 'center', color: '#64748b', border: '1px solid #e2e8f0' }}>
                    No site images uploaded yet. Use the upload form above.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    {selectedProject.siteImages.map((img, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ height: '140px', backgroundColor: '#f1f5f9', position: 'relative' }}>
                          <img src={img.imageUrl} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: img.category === 'Before Work' ? '#ef4444' : img.category === 'After Work' ? '#16a34a' : '#2563eb', color: '#ffffff', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700' }}>
                            {img.category}
                          </span>
                        </div>
                        <div style={{ padding: '0.85rem' }}>
                          <h5 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.9rem', fontWeight: '700' }}>{img.title}</h5>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem' }}>Uploaded: {new Date(img.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MATERIAL USAGE */}
            {activeTab === 'materials' && selectedProject && (
              <div>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={20} color="#2563eb" /> Log Material Usage on Site
                  </h4>
                  <form onSubmit={handleAddMaterialUsage}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Material Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Cement Bags / Tiles"
                          required
                          value={materialForm.materialName}
                          onChange={(e) => setMaterialForm({ ...materialForm, materialName: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Quantity Used *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={materialForm.quantityUsed}
                          onChange={(e) => setMaterialForm({ ...materialForm, quantityUsed: Number(e.target.value) })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Remaining Stock *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={materialForm.remainingQuantity}
                          onChange={(e) => setMaterialForm({ ...materialForm, remainingQuantity: Number(e.target.value) })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)' }}
                    >
                      <Plus size={16} /> Log Material Usage
                    </button>
                  </form>
                </div>

                {/* Material Usage Table */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                    Material Usage & On-Site Inventory ({selectedProject.materialUsage?.length || 0})
                  </div>
                  {!selectedProject.materialUsage || selectedProject.materialUsage.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No material usage logged yet.</div>
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
              </div>
            )}

            {/* TAB 5: REPORTED SITE ISSUES */}
            {activeTab === 'issues' && selectedProject && (
              <div>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={20} color="#dc2626" /> Report Site Execution Issue
                  </h4>
                  <form onSubmit={handleReportIssue}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Issue Type *</label>
                        <select
                          value={issueForm.issueType}
                          onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="Delay">Delay in Work Schedule</option>
                          <option value="Material Shortage">Material Shortage / Stock Deficit</option>
                          <option value="Safety Issue">Safety Hazard / Precaution Needed</option>
                          <option value="Labour Issue">Labour Availability / Conduct Issue</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Severity Level</label>
                        <select
                          value={issueForm.severity}
                          onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                        >
                          <option value="Low">Low (Minor Impact)</option>
                          <option value="Medium">Medium (Attention Required)</option>
                          <option value="High">High (Serious Delay)</option>
                          <option value="Critical">Critical (Urgent Management Escalation)</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#475569', marginBottom: '0.3rem' }}>Issue Description & Notes *</label>
                      <textarea
                        rows="3"
                        placeholder="Explain the site issue in detail..."
                        required
                        value={issueForm.description}
                        onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <AlertTriangle size={16} /> Report Issue to PM & Admin
                    </button>
                  </form>
                </div>

                {/* Reported Issues List */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '700', color: '#0f172a' }}>
                    Active Reported Site Issues ({selectedProject.reportedIssues?.length || 0})
                  </div>
                  {!selectedProject.reportedIssues || selectedProject.reportedIssues.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No site issues reported for this project.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <tr>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Issue Type</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Description</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Severity</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Reported Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.reportedIssues.map((iss, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#dc2626' }}>{iss.issueType}</td>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#0f172a' }}>{iss.description}</td>
                            <td style={{ padding: '0.85rem 1.25rem' }}>
                              <span style={{ padding: '0.2rem 0.55rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: iss.severity === 'Critical' || iss.severity === 'High' ? '#fef2f2' : '#fffbeb', color: iss.severity === 'Critical' || iss.severity === 'High' ? '#dc2626' : '#d97706' }}>
                                {iss.severity}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#2563eb' }}>{iss.status}</td>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{new Date(iss.reportedAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* UPDATE SITE PROGRESS MODAL */}
      {isProgressModalOpen && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Update Site Progress</h3>
                <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>{selectedProject.projectName} ({selectedProject.projectId})</p>
              </div>
              <X size={22} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsProgressModalOpen(false)} />
            </div>

            <form onSubmit={handleUpdateProgress}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Progress Completion (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 63"
                  value={progressForm.progressPercentage}
                  onChange={(e) => setProgressForm({ ...progressForm, progressPercentage: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '1rem', fontWeight: '700', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Current Site Execution Stage</label>
                <select
                  value={progressForm.currentStage}
                  onChange={(e) => setProgressForm({ ...progressForm, currentStage: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="Site Demolition & Prep">Site Demolition & Prep</option>
                  <option value="Electrical & Plumbing Layout">Electrical & Plumbing Layout</option>
                  <option value="False Ceiling & Partitioning">False Ceiling & Partitioning</option>
                  <option value="Woodwork & Modular Carpentry">Woodwork & Modular Carpentry</option>
                  <option value="Wall Painting & Tile Work">Wall Painting & Tile Work</option>
                  <option value="Fixture Fitting & Final Cleaning">Fixture Fitting & Final Cleaning</option>
                  <option value="Final Quality Handover">Final Quality Handover</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '0.35rem' }}>Overall Project Status</label>
                <select
                  value={progressForm.status}
                  onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsProgressModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' }}
                >
                  {submitting ? 'Updating...' : 'Save Site Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteEngineerDashboard;
