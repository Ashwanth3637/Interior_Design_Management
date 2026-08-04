import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  Briefcase,
  User,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Palette,
  Eye,
  CheckSquare,
  CreditCard,
  Calendar,
  ArrowLeft,
  X,
  AlertCircle,
  Sparkles,
  Download,
  ThumbsUp,
  ShieldCheck,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientPortal = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [successMsg, setSuccessMsg] = useState('');

  // Design Approval state
  const [feedback, setFeedback] = useState('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // Simulated Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Image Preview Modal state
  const [previewImage, setPreviewImage] = useState(null);

  const fetchClientPortal = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/clients/my-portal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
        if (result.data?.projects?.[0]?.clientFeedback) {
          setFeedback(result.data.projects[0].clientFeedback);
        }
      } else {
        setError(result.message || 'Unable to load client portal data');
      }
    } catch (err) {
      setError('Network error fetching your project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortal();
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const project = data?.projects?.[0] || null;
  const profile = data?.clientProfile || null;

  // Handle Design Approval Submission
  const handleApproveDesign = async (statusChoice) => {
    if (!project) return;
    try {
      setIsSubmittingApproval(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/approve-design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: statusChoice,
          feedback
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(`Design layout status updated to '${statusChoice}' successfully!`);
        fetchClientPortal();
      } else {
        setError(result.message || 'Failed to submit approval status');
      }
    } catch (err) {
      setError('Network error submitting design approval');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Handle Design Deletion
  const handleDeleteDesign = async (designId) => {
    if (!project || !designId) return;
    if (!window.confirm('Are you sure you want to remove this design file?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/designs/${designId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Design file removed successfully!');
        fetchClientPortal();
      } else {
        setError(data.message || 'Failed to remove design file');
      }
    } catch (err) {
      setError('Network error deleting design file');
    }
  };

  // Handle Simulated Payment Execution
  const handleConfirmSimulatedPayment = async () => {
    if (!project || !selectedInvoice) return;
    try {
      setIsProcessingPayment(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/invoices/${selectedInvoice._id}/pay`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(`Payment of ₹${selectedInvoice.amount?.toLocaleString()} confirmed! Invoice marked as Paid ✔`);
        setIsPayModalOpen(false);
        setSelectedInvoice(null);
        fetchClientPortal();
      } else {
        setError(result.message || 'Payment simulation failed');
      }
    } catch (err) {
      setError('Network error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase style={{ color: '#2563eb' }} size={32} /> Client Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Welcome back, <strong style={{ color: '#0f172a' }}>{user?.name || profile?.fullName}</strong>! Track live renovation milestones, approve 2D/3D designs, and pay invoices.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={18} /> <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '500' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={18} /> <span>{error}</span>
          </div>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', fontSize: '1rem' }}>
          Fetching your project details from database...
        </div>
      ) : !project ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center' }}>
          <Briefcase size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>No Active Project Linked</h3>
          <p style={{ color: '#64748b', margin: 0 }}>Your design consultant has not assigned a project to your account email ({user?.email}) yet.</p>
        </div>
      ) : (
        <div>
          {/* Main Project Overview Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {project.projectId} • {project.projectType}
                </span>
                <h2 style={{ margin: '0.25rem 0 0.5rem 0', color: '#0f172a', fontSize: '1.65rem', fontWeight: '700' }}>
                  {project.projectName}
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Site Location: <strong>{project.location}</strong>
                </span>
              </div>
              <span style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.85rem' }}>
                Status: {project.status}
              </span>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Interior Designer</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.assignedDesigner || 'Rahul'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Site Engineer</span>
                <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project.siteEngineer || project.projectManager || 'Jasper'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Total Contract Budget</span>
                <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>₹{project.budget?.toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>Design Approval Status</span>
                <strong style={{
                  color: project.designApprovalStatus === 'Approved' ? '#16a34a' : project.designApprovalStatus === 'Changes Requested' ? '#dc2626' : '#c2410c',
                  fontSize: '0.95rem'
                }}>
                  {project.designApprovalStatus || 'Pending Review'}
                </strong>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem' }}>
                <span>Site Execution Progress</span>
                <span>{project.progressPercentage || 0}% Completed</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${project.progressPercentage || 0}%`, height: '100%', backgroundColor: '#2563eb', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* Action Tabs Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'overview' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'overview' ? '#2563eb' : '#ffffff', color: activeTab === 'overview' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Eye size={16} /> View Designs ({project.designs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('approve')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'approve' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'approve' ? '#2563eb' : '#ffffff', color: activeTab === 'approve' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CheckSquare size={16} /> Approve Designs
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'invoices' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'invoices' ? '#2563eb' : '#ffffff', color: activeTab === 'invoices' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CreditCard size={16} /> Invoices & Payments ({project.invoices?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'timeline' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'timeline' ? '#2563eb' : '#ffffff', color: activeTab === 'timeline' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Calendar size={16} /> Project Timeline
            </button>
          </div>

          {/* Tab Content Display */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            {/* 1. VIEW DESIGNS TAB */}
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Palette size={20} color="#7c3aed" /> 2D & 3D Design Proposals
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Uploaded by Interior Designer <strong>{project.assignedDesigner}</strong>. Click any design concept to preview in high-res.
                </p>

                {!project.designs || project.designs.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px border #cbd5e1', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <ImageIcon size={40} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <p style={{ margin: 0, fontWeight: '600' }}>No design files uploaded by the designer yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 240px))', gap: '1.25rem' }}>
                    {project.designs.map((ds, idx) => (
                      <div key={ds._id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div
                            onClick={() => setPreviewImage(ds)}
                            style={{ height: '130px', backgroundColor: '#f1f5f9', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}
                          >
                            <img
                              src={ds.fileUrl}
                              alt={ds.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(15, 23, 42, 0.8)', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '600' }}>
                              {ds.designType}
                            </div>
                          </div>
                          <div style={{ padding: '0.85rem' }}>
                            <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.9rem', fontWeight: '700', lineHeight: '1.3' }}>{ds.title}</h4>
                            <p style={{ margin: '0 0 0.75rem 0', color: '#64748b', fontSize: '0.75rem' }}>
                              Uploaded: {new Date(ds.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div style={{ padding: '0 0.85rem 0.85rem 0.85rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => setPreviewImage(ds)}
                              style={{ flex: 1, backgroundColor: '#7c3aed', color: '#ffffff', border: 'none', padding: '0.45rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                            >
                              <Eye size={13} /> Preview
                            </button>
                            <button
                              onClick={() => handleDeleteDesign(ds._id)}
                              title="Delete Design"
                              style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.45rem 0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Material Catalogue Table */}
                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={18} color="#2563eb" /> Material Catalogue & Cost Breakdown
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Specifications & estimated unit prices entered by Interior Designer <strong>{project.assignedDesigner}</strong>.
                  </p>

                  {!project.materials || project.materials.length === 0 ? (
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', borderRadius: '8px' }}>
                      No material specs added by designer yet.
                    </div>
                  ) : (
                    <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <tr>
                            <th style={{ padding: '0.85rem 1.25rem' }}>Material Item</th>
                            <th style={{ padding: '0.85rem 1.25rem' }}>Brand</th>
                            <th style={{ padding: '0.85rem 1.25rem' }}>Quantity</th>
                            <th style={{ padding: '0.85rem 1.25rem' }}>Estimated Cost</th>
                            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.materials.map((m, i) => (
                            <tr key={m._id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{m.materialName}</td>
                              <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>{m.brand}</td>
                              <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{m.quantity} {m.unit}</td>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>₹{m.estimatedPrice?.toLocaleString()}</td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: '#f8fafc', fontWeight: '700' }}>
                            <td colSpan="3" style={{ padding: '0.85rem 1.25rem', color: '#0f172a' }}>Total Estimated Material Cost</td>
                            <td style={{ padding: '0.85rem 1.25rem', color: '#16a34a', fontSize: '1rem' }}>
                              ₹{project.materials.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0).toLocaleString()}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. DESIGN APPROVAL TAB */}
            {activeTab === 'approve' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={20} color="#16a34a" /> Design Approval & Revision Request
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Submit your formal approval or request layout changes directly to designer <strong>{project.assignedDesigner}</strong>.
                </p>

                <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', color: '#334155', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Your Revision Comments / Feedback</label>
                    <textarea
                      rows="4"
                      placeholder="e.g. Approved layout for living room! Please change kitchen countertop marble to dark grey..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '0.9rem', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={isSubmittingApproval}
                      onClick={() => handleApproveDesign('Approved')}
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ThumbsUp size={16} /> Approve Final Design
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingApproval}
                      onClick={() => handleApproveDesign('Changes Requested')}
                      style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <X size={16} /> Request Revisions
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                      Current MongoDB Status: <strong style={{ color: project.designApprovalStatus === 'Approved' ? '#16a34a' : '#c2410c' }}>{project.designApprovalStatus || 'Pending Review'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. INVOICES & PAYMENTS TAB */}
            {activeTab === 'invoices' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="#2563eb" /> Project Invoices & Payment Gateway Simulation
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Milestone billing generated by project accounts. Pay online via simulated gateway to update database status to Paid.
                </p>

                {!project.invoices || project.invoices.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px border #cbd5e1', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No invoices issued by accounts yet.
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <tr>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Invoice #</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Milestone Description</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Amount</th>
                          <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                          <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.invoices.map((inv) => (
                          <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{inv.title}</td>
                            <td style={{ padding: '1rem 1.25rem', color: '#16a34a', fontWeight: '700' }}>₹{inv.amount?.toLocaleString()}</td>
                            <td style={{ padding: '1rem 1.25rem' }}>
                              <span style={{
                                backgroundColor: inv.status === 'Paid' ? '#f0fdf4' : '#fef2f2',
                                border: `1px solid ${inv.status === 'Paid' ? '#bbf7d0' : '#fecaca'}`,
                                color: inv.status === 'Paid' ? '#16a34a' : '#dc2626',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '700'
                              }}>
                                {inv.status === 'Paid' ? 'Paid ✔' : 'Unpaid'}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                              {inv.status === 'Paid' ? (
                                <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: '600' }}>
                                  Receipt Generated ({new Date(inv.paidAt).toLocaleDateString()})
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsPayModalOpen(true);
                                  }}
                                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <CreditCard size={14} /> Pay Now
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 4. TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="#2563eb" /> Renovation Phase Timeline
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Live milestone statuses updated by Project Manager <strong>{project.projectManager || 'Project Lead'}</strong>.
                </p>

                {!project.timeline || project.timeline.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    No timeline phases scheduled.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem' }}>
                    {project.timeline.map((tm, idx) => (
                      <div
                        key={tm._id || idx}
                        style={{
                          borderLeft: `4px solid ${tm.status === 'Completed' ? '#16a34a' : tm.status === 'In Progress' ? '#2563eb' : '#cbd5e1'}`,
                          paddingLeft: '1.25rem',
                          position: 'relative'
                        }}
                      >
                        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700' }}>{tm.phase}</h4>
                        <p style={{ margin: '0 0 0.35rem 0', color: '#64748b', fontSize: '0.85rem' }}>{tm.description}</p>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: tm.status === 'Completed' ? '#16a34a' : tm.status === 'In Progress' ? '#2563eb' : '#64748b',
                          textTransform: 'uppercase'
                        }}>
                          {tm.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simulated Payment Popup Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <ShieldCheck size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.4rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '700' }}>Confirm Payment Simulation</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                Simulating Gateway Checkout for <strong>{selectedInvoice.invoiceNumber}</strong>
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b' }}>Milestone Title:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoice.title}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#0f172a' }}>Total Amount:</span>
                <span style={{ color: '#16a34a' }}>₹{selectedInvoice.amount?.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPayModalOpen(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmSimulatedPayment}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}
              >
                {isProcessingPayment ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '2rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '850px', width: '100%', overflow: 'hidden', position: 'relative' }}>
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
            <img src={previewImage.fileUrl} alt={previewImage.title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', backgroundColor: '#0f172a' }} />
            <div style={{ padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>{previewImage.title}</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Type: {previewImage.designType}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
