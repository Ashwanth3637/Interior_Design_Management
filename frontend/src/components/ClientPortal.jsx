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
  Layers,
  Package,
  Wrench,
  Armchair,
  Zap,
  RotateCcw,
  CheckCircle2,
  PartyPopper,
  MessageSquare,
  Upload,
  QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowStepper from './WorkflowStepper';
import NotificationBell from './NotificationBell';
import { designImages } from '../assets/images';

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
  const [approvalBanner, setApprovalBanner] = useState(false);

  // Simulated Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Image Preview Modal state
  const [previewImage, setPreviewImage] = useState(null);

  // Payment Receipt Modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Client Site Photo Upload Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    title: '',
    roomType: 'Living Room',
    fileUrl: '',
    sqFeet: 200,
    notes: ''
  });
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const fetchClientPortal = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
        setError('');
      }
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/clients/my-portal', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
        if (result.data?.projects?.[0]?.clientFeedback && isInitial) {
          setFeedback(result.data.projects[0].clientFeedback);
        }
      } else {
        if (isInitial) setError(result.message || 'Unable to load client portal data');
      }
    } catch (err) {
      if (isInitial) setError('Network error fetching your project details');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientPortal(true);
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    const interval = setInterval(() => {
      fetchClientPortal(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsPayModalOpen(false);
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
    if (!project) {
      alert('Error: No active project found to update.');
      return;
    }
    try {
      setIsSubmittingApproval(true);
      setError('');

      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!activeToken) {
        alert('Authentication error: Token missing. Please log in again.');
        return;
      }

      const feedbackContent = feedback && feedback.trim().length > 0 
        ? feedback.trim() 
        : 'Please update design layout as per client requirements.';

      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/approve-design`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          status: statusChoice,
          feedback: feedbackContent
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        if (statusChoice === 'Approved') {
          setApprovalBanner(true);
          setSuccessMsg('🎉 Design Approved Successfully! Project Manager has been notified.');
        } else {
          setApprovalBanner(false);
          setSuccessMsg('✅ Revision Request Submitted! Your feedback has been sent to the Designer Studio.');
        }
        fetchClientPortal(true);
      } else {
        const errMsg = result.message || 'Failed to submit revision request';
        alert(`Error: ${errMsg}`);
        setError(errMsg);
      }
    } catch (err) {
      console.error('Revision Request Exception:', err);
      alert('Network error submitting revision request. Please check backend server.');
      setError('Network error submitting design approval');
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  // Handle Client Accept / Reject Quotation
  const handleRespondQuotation = async (qId, choiceStatus) => {
    if (!project) return;
    try {
      setError('');
      const activeToken = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/respond-quotation`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          quotationId: qId,
          status: choiceStatus // 'Accepted' or 'Rejected'
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(result.message);
        fetchClientPortal(true);
      } else {
        alert(result.message || 'Failed to update quotation status');
      }
    } catch (err) {
      alert('Network error responding to quotation');
    }
  };

  // Handle Request Revision for Specific Design Concept
  const handleRequestConceptRevision = async (designTitle) => {
    if (!project) return;
    const revComment = window.prompt(`Enter revision request notes for design: "${designTitle}"`);
    if (!revComment) return;

    setFeedback(`[For Design Concept: "${designTitle}"] ${revComment}`);
    setActiveTab('approve');
  };

  // Submit Client Site Photo Upload
  const handleUploadSitePhoto = async (e) => {
    e.preventDefault();
    if (!photoForm.fileUrl) {
      alert('Please enter or select a valid site image URL');
      return;
    }
    try {
      setIsUploadingPhoto(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/clients/site-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(photoForm)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(result.message);
        setIsPhotoModalOpen(false);
        setPhotoForm({
          title: '',
          roomType: 'Living Room',
          fileUrl: '',
          sqFeet: 200,
          notes: ''
        });
        fetchClientPortal(true);
      } else {
        setError(result.message || 'Failed to upload site photo');
      }
    } catch (err) {
      setError('Network error uploading site photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle Simulated Payment Execution
  const handleConfirmSimulatedPayment = async () => {
    if (!project || !selectedInvoice) return;
    try {
      setIsProcessingPayment(true);
      setError('');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/projects/${project._id}/invoices/${selectedInvoice._id}/pay`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg(`Payment of ₹${selectedInvoice.amount?.toLocaleString('en-IN')} confirmed! Invoice marked as Paid ✔`);
        setIsPayModalOpen(false);
        setSelectedInvoice(null);
        fetchClientPortal(true);
      } else {
        setError(result.message || 'Payment simulation failed');
      }
    } catch (err) {
      setError('Network error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Default / Real Timeline Data Fallback
  const defaultTimelineEvents = [
    { phase: 'Lead Registered', date: '05 Aug 2026', status: 'Completed', description: 'Client lead registered into sales workflow pipeline.' },
    { phase: 'Designer Assigned', date: '06 Aug 2026', status: 'Completed', description: 'Interior designer assigned to create 2D/3D proposals.' },
    { phase: 'Design Uploaded', date: '08 Aug 2026', status: 'Completed', description: 'Initial 2D floor plans & 3D renders uploaded to portal.' },
    { phase: 'Client Approved', date: '10 Aug 2026', status: project?.designApprovalStatus === 'Approved' ? 'Completed' : 'In Progress', description: 'Final 2D/3D design layout approved by client.' },
    { phase: 'Quotation Sent', date: '12 Aug 2026', status: (project?.quotations?.length || 0) > 0 ? 'Completed' : 'Pending', description: 'Official itemized project budget quotation issued by PM.' },
    { phase: 'Payment Completed', date: '14 Aug 2026', status: project?.advancePaymentPaid ? 'Completed' : 'Pending', description: '10% Booking advance or invoice payment confirmed.' },
    { phase: 'Site Execution', date: '20 Aug 2026', status: (project?.progressPercentage || 0) > 0 ? 'In Progress' : 'Pending', description: 'On-site execution, carpentry, and electrical works.' }
  ];

  const timelineToDisplay = project?.timeline && project.timeline.length > 0 
    ? project.timeline 
    : defaultTimelineEvents;

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 3rem', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .design-card-img-wrapper {
          position: relative;
          overflow: hidden;
          background-color: #0f172a;
          cursor: pointer;
        }
        .design-card-img {
          transition: transform 0.4s ease, opacity 0.4s ease;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .design-card-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .design-card-img-wrapper:hover .design-card-img {
          transform: scale(1.08);
          opacity: 0.85;
        }
        .design-card-img-wrapper:hover .design-card-overlay {
          opacity: 1;
        }
        .btn-modern-hover {
          transition: all 0.2s ease-in-out;
        }
        .btn-modern-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
        }
      `}</style>

      {/* Header Bar with Client Profile Card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Briefcase style={{ color: '#2563eb' }} size={32} /> Client Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
            Track live renovation milestones, approve 2D/3D designs, and pay invoices.
          </p>
        </div>

        {/* Improved Client Header Profile Widget */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '0.65rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                👤 {user?.name || profile?.fullName || 'Benny Thomas'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.1rem' }}>
                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontWeight: '700', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  {project?.projectType || 'Residential'} Project
                </span>
                <span>• {project?.status || 'Active'}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Last Login: Today 10:45 AM
              </div>
            </div>
          </div>
          <NotificationBell size={22} />
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle size={20} /> <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.85rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} /> <span>{error}</span>
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
                <h2 style={{ margin: '0.25rem 0 0.5rem 0', color: '#0f172a', fontSize: '1.65rem', fontWeight: '800' }}>
                  {project.projectName}
                </h2>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Site Location: <strong>{project.location}</strong>
                </span>
              </div>
              <span style={{
                backgroundColor: ['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#f0fdf4' : project.status === 'Completed' ? '#dcfce7' : '#eff6ff',
                border: `1px solid ${['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#bbf7d0' : project.status === 'Completed' ? '#86efac' : '#bfdbfe'}`,
                color: ['Execution Started', 'Work Started', 'Execution in Progress'].includes(project.status) ? '#15803d' : project.status === 'Completed' ? '#166534' : '#2563eb',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontWeight: '800',
                fontSize: '0.85rem'
              }}>
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
                <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>₹{project.budget?.toLocaleString('en-IN')}</strong>
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

            {/* Improved Progress Visualization */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', color: '#334155', marginBottom: '0.5rem' }}>
                <span>Site Execution Progress</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#2563eb' }}>{project.progressPercentage || 0}% Completed</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500', marginLeft: '0.5rem' }}>
                    ({project.progressPercentage === 100 ? 'Completed on 12 Aug 2026' : 'In Progress'})
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', padding: '2px', boxSizing: 'border-box' }}>
                <div style={{ width: `${project.progressPercentage || 0}%`, height: '100%', backgroundColor: '#2563eb', borderRadius: '9999px', transition: 'width 0.5s ease-in-out' }} />
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
              onClick={() => setActiveTab('quotation')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'quotation' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'quotation' ? '#2563eb' : '#ffffff', color: activeTab === 'quotation' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <FileText size={16} /> Official Quotation ({project.quotations?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'invoices' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'invoices' ? '#2563eb' : '#ffffff', color: activeTab === 'invoices' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <CreditCard size={16} /> Invoices & Payments ({project.invoices?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('sitePhotos')}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: activeTab === 'sitePhotos' ? 'none' : '1px solid #cbd5e1', backgroundColor: activeTab === 'sitePhotos' ? '#2563eb' : '#ffffff', color: activeTab === 'sitePhotos' ? '#ffffff' : '#475569', fontWeight: '600', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ImageIcon size={16} /> Upload Site Photos ({project.sitePhotos?.length || 0})
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
                  Uploaded by Interior Designer <strong>{project.assignedDesigner}</strong>. Hover to preview in full details.
                </p>

                {(!project.designs || project.designs.length === 0) ? (
                  <div>
                    <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', marginBottom: '1.5rem', color: '#1e40af', fontSize: '0.85rem' }}>
                      ✨ Showing curated 3D interior design concepts for your project layout:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 260px))', gap: '1.25rem' }}>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div className="design-card-img-wrapper" onClick={() => setPreviewImage({ title: 'Living Room Concept', fileUrl: designImages.livingRoom, designType: '3D Render' })} style={{ height: '140px' }}>
                          <img src={designImages.livingRoom} alt="Living Room" className="design-card-img" />
                          <div className="design-card-overlay">
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Eye size={16} color="#2563eb" /> Preview
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '0.95rem' }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '800' }}>Living Room Modern Concept</h4>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>3D Render • Approved</span>
                        </div>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div className="design-card-img-wrapper" onClick={() => setPreviewImage({ title: 'Luxury Modular Kitchen', fileUrl: designImages.kitchen, designType: '3D Render' })} style={{ height: '140px' }}>
                          <img src={designImages.kitchen} alt="Modular Kitchen" className="design-card-img" />
                          <div className="design-card-overlay">
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Eye size={16} color="#2563eb" /> Preview
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '0.95rem' }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '800' }}>Luxury Oak Modular Kitchen</h4>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>3D Render • Under Review</span>
                        </div>
                      </div>

                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div className="design-card-img-wrapper" onClick={() => setPreviewImage({ title: 'Master Bedroom Suite', fileUrl: designImages.bedroom, designType: '3D Render' })} style={{ height: '140px' }}>
                          <img src={designImages.bedroom} alt="Master Bedroom" className="design-card-img" />
                          <div className="design-card-overlay">
                            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Eye size={16} color="#2563eb" /> Preview
                            </div>
                          </div>
                        </div>
                        <div style={{ padding: '0.95rem' }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '800' }}>Master Bedroom Suite</h4>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>3D Render • Approved</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 260px))', gap: '1.25rem' }}>
                    {project.designs.map((ds, idx) => (
                      <div key={ds._id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          {/* Image Hover Zoom & Overlay */}
                          <div
                            className="design-card-img-wrapper"
                            onClick={() => setPreviewImage(ds)}
                            style={{ height: '140px' }}
                          >
                            <img
                              src={ds.fileUrl}
                              alt={ds.title}
                              className="design-card-img"
                            />
                            <div className="design-card-overlay">
                              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', padding: '0.4rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Eye size={16} color="#2563eb" /> Preview
                              </div>
                            </div>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#ffffff', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700' }}>
                              {ds.designType || '3D Render'}
                            </div>
                          </div>

                          {/* Improved Design Card Content */}
                          <div style={{ padding: '0.95rem' }}>
                            <h4 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '800', lineHeight: '1.3' }}>
                              {ds.title || 'Bedroom Interior'}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                              <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                                {ds.versionName || 'Version 2'}
                              </span>
                              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                                Uploaded: {new Date(ds.uploadedAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons (Replaced confusing red X with Request Revision) */}
                        <div style={{ padding: '0 0.95rem 0.95rem 0.95rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setPreviewImage(ds)}
                              style={{ flex: 1, backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={14} /> Preview
                            </button>
                            <button
                              onClick={() => handleRequestConceptRevision(ds.title)}
                              title="Request Revision for this concept"
                              style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#ea580c', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                            >
                              <RotateCcw size={13} /> Request Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Material Catalogue Table with Friendly Empty State */}
                <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Layers size={18} color="#2563eb" /> Material Catalogue & Cost Breakdown
                  </h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Material details shared by your designer {project.assignedDesigner ? <strong>({project.assignedDesigner})</strong> : null}.
                  </p>

                  {!project.materials || project.materials.length === 0 ? (
                    <div style={{ backgroundColor: '#f8fafc', padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b', borderRadius: '12px', border: '1px border #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        📦
                      </div>
                      <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem', marginTop: '0.2rem' }}>
                        Material catalogue will appear once your designer uploads it.
                      </div>
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
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#16a34a' }}>₹{m.estimatedPrice?.toLocaleString('en-IN')}</td>
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
                              ₹{project.materials.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0).toLocaleString('en-IN')}
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

            {/* 2. DESIGN APPROVAL TAB WITH Rich Success Feedback Banner */}
            {activeTab === 'approve' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckSquare size={20} color="#16a34a" /> Design Approval & Revision Request
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Submit your formal approval or request layout changes directly to designer <strong>{project.assignedDesigner}</strong>.
                </p>

                {approvalBanner && (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      🎉
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', color: '#166534', fontSize: '1.1rem', fontWeight: '800' }}>
                        Design Approved Successfully
                      </h4>
                      <p style={{ margin: 0, color: '#15803d', fontSize: '0.875rem' }}>
                        Project Manager and Interior Designer have been notified to initiate official quotation and site execution phases.
                      </p>
                    </div>
                  </div>
                )}

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
                      className="btn-modern-hover"
                      style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <ThumbsUp size={16} /> Approve Design
                    </button>

                    <button
                      type="button"
                      disabled={isSubmittingApproval}
                      onClick={(e) => {
                        e.preventDefault();
                        handleApproveDesign('Revision Requested');
                      }}
                      style={{ backgroundColor: '#eab308', color: '#ffffff', border: 'none', padding: '0.7rem 1.4rem', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 6px rgba(234, 179, 8, 0.3)' }}
                    >
                      <RotateCcw size={16} /> Request Revision
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
                      Version: <strong>Design Version {project.designVersion || 1}</strong> • Status: <strong style={{ color: project.designApprovalStatus === 'Approved' ? '#16a34a' : project.designApprovalStatus === 'Revision Requested' ? '#eab308' : '#c2410c' }}>{project.designApprovalStatus || 'Pending Review'}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. OFFICIAL ITEMISED QUOTATION TAB WITH Icons */}
            {activeTab === 'quotation' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} color="#2563eb" /> Project Quotation
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Itemized cost estimation provided by your project manager based on approved design requirements.
                </p>

                {!project.quotations || project.quotations.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
                    <Clock size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>Quotation Under Preparation</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Once design layout is approved, your Project Manager will issue the itemized cost breakdown here.</p>
                  </div>
                ) : (
                  <div>
                    {project.quotations.map((q, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                          <div>
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                              Quotation #{idx + 1}
                            </span>
                          </div>
                          <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700' }}>
                            Status: {q.status}
                          </span>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                          <thead style={{ backgroundColor: '#f8fafc', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                            <tr>
                              <th style={{ padding: '0.85rem 1.25rem' }}>Cost Item / Category</th>
                              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Package size={16} color="#2563eb" /> Material Cost
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.materialCost?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wrench size={16} color="#2563eb" /> Labour & Execution Cost
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.labourCost?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Palette size={16} color="#2563eb" /> 2D/3D Design Charges
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.designCharges?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Armchair size={16} color="#2563eb" /> Custom Furniture & Carpentry
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.furnitureCost?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={16} color="#2563eb" /> Electrical & Plumbing Works
                              </td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>₹{q.electricalPlumbingCost?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: '#475569' }}>Subtotal (Before Tax)</td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#475569' }}>₹{(q.materialCost + q.labourCost + q.designCharges + q.furnitureCost + q.electricalPlumbingCost)?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                              <td style={{ padding: '0.85rem 1.25rem', fontWeight: '600', color: '#64748b' }}>🏛️ GST & Government Taxes (18%)</td>
                              <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', fontWeight: '700', color: '#64748b' }}>₹{q.taxGst?.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr style={{ backgroundColor: '#f0fdf4', fontWeight: '800' }}>
                              <td style={{ padding: '1rem 1.25rem', color: '#15803d', fontSize: '1.05rem' }}>Total Contract Price</td>
                              <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#15803d', fontSize: '1.25rem' }}>₹{q.totalAmount?.toLocaleString('en-IN')}</td>
                            </tr>
                          </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f8fafc', padding: '0.85rem 1.25rem', borderRadius: '10px', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <span>Generated by: <strong>{q.generatedBy || 'Project Manager'}</strong></span> • <span>Valid Until: <strong>{q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : '30 Days'}</strong></span>
                          </div>
                          
                          {q.status !== 'Accepted' && (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleRespondQuotation(q._id, 'Accepted')}
                                style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.45rem 1rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)' }}
                              >
                                <CheckCircle size={14} /> Approve Quotation
                              </button>
                              <button
                                onClick={() => handleRespondQuotation(q._id, 'Rejected')}
                                style={{ backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '0.45rem 0.85rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <X size={14} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. INVOICES & PAYMENTS TAB */}
            {activeTab === 'invoices' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CreditCard size={20} color="#2563eb" /> Invoices & Payments
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  View your project invoices and payment status.
                </p>

                {(!project.quotations || !project.quotations.some(q => q.status === 'Accepted')) && (!project.invoices || !project.invoices.some(i => i.status === 'Paid')) ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      📋
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>
                      Advance Payment Invoice will appear after approving the Official Quotation.
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      Please review and click <strong>Approve Quotation</strong> under the <strong>Official Quotation</strong> tab.
                    </div>
                  </div>
                ) : !project.invoices || project.invoices.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
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
                        {project.invoices
                          .filter((inv) => {
                            const isFinal = inv.installmentType === 'Final Installment' || inv.title?.includes('Final');
                            if (isFinal && (project.progressPercentage || 0) < 90) {
                              return false;
                            }
                            return true;
                          })
                          .map((inv) => (
                          <tr key={inv._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '700', color: '#2563eb' }}>{inv.invoiceNumber}</td>
                            <td style={{ padding: '1rem 1.25rem', fontWeight: '600', color: '#0f172a' }}>{inv.title}</td>
                            <td style={{ padding: '1rem 1.25rem', color: '#16a34a', fontWeight: '700' }}>₹{inv.amount?.toLocaleString('en-IN')}</td>
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
                                <button
                                  onClick={() => setSelectedReceipt(inv)}
                                  style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(22, 163, 74, 0.15)' }}
                                >
                                  <Download size={14} /> View Receipt
                                </button>
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

            {/* 5. CLIENT SITE PHOTOS & ESTIMATION TAB */}
            {activeTab === 'sitePhotos' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={20} color="#2563eb" /> Site Photos & Tile Estimator
                    </h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                      Upload room photos and estimated square footage so your assigned designer (<strong>{project.assignedDesigner || 'Designer'}</strong>) can easily calculate tile and material requirements!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.65rem 1.15rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                  >
                    📸 Upload Site Photo
                  </button>
                </div>

                {!project.sitePhotos || project.sitePhotos.length === 0 ? (
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', padding: '3rem 1.5rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📐</div>
                    <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: '700' }}>No Site Photos Uploaded Yet</h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem' }}>Upload your room photos and square footage to help your designer plan tiles and layouts faster.</p>
                    <button
                      onClick={() => setIsPhotoModalOpen(true)}
                      style={{ backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.55rem 1.1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      + Upload First Room Photo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {project.sitePhotos.map((photo, idx) => (
                      <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <img src={photo.fileUrl} alt={photo.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                        <div style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>{photo.roomType}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '0.95rem', fontWeight: '700' }}>{photo.title}</h4>
                          <div style={{ backgroundColor: '#f8fafc', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            <span style={{ color: '#64748b' }}>📐 Area: <strong style={{ color: '#0f172a' }}>{photo.sqFeetEstimate} Sq.Ft</strong></span>
                            <span style={{ color: '#16a34a' }}>🧱 Tiles: <strong style={{ color: '#16a34a' }}>~{photo.tilesCountEstimate} Tiles</strong></span>
                          </div>
                          {photo.notes && <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic' }}>"{photo.notes}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. TIMELINE TAB - REAL VERTICAL TIMELINE */}
            {activeTab === 'timeline' && (
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} color="#2563eb" /> Renovation Phase Timeline
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
                  Live milestone statuses updated by Project Manager <strong>{project.projectManager || 'Project Lead'}</strong>.
                </p>

                <div style={{ position: 'relative', paddingLeft: '1rem' }}>
                  {/* Vertical Connecting Line */}
                  <div style={{ position: 'absolute', left: '23px', top: '10px', bottom: '20px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                    {timelineToDisplay.map((tm, idx) => {
                      const isDone = tm.status === 'Completed';
                      const isInProg = tm.status === 'In Progress';

                      return (
                        <div key={tm._id || idx} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                          {/* Timeline Node Checkmark Icon */}
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isDone ? '#16a34a' : isInProg ? '#2563eb' : '#ffffff',
                            border: `2px solid ${isDone ? '#16a34a' : isInProg ? '#2563eb' : '#cbd5e1'}`,
                            color: isDone || isInProg ? '#ffffff' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justify: 'center',
                            flexShrink: 0,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                            {isDone ? <CheckCircle2 size={16} /> : isInProg ? <Clock size={16} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }} />}
                          </div>

                          {/* Timeline Card Details */}
                          <div style={{
                            flex: 1,
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            padding: '1rem 1.25rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1rem', fontWeight: '800' }}>
                                  {isDone ? '✔' : ''} {tm.phase}
                                </h4>
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  padding: '0.15rem 0.55rem',
                                  borderRadius: '9999px',
                                  backgroundColor: isDone ? '#f0fdf4' : isInProg ? '#eff6ff' : '#f8fafc',
                                  color: isDone ? '#16a34a' : isInProg ? '#2563eb' : '#64748b',
                                  border: `1px solid ${isDone ? '#bbf7d0' : isInProg ? '#bfdbfe' : '#cbd5e1'}`
                                }}>
                                  {tm.status}
                                </span>
                              </div>
                              <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                                {tm.description}
                              </p>
                            </div>

                            <div style={{ color: '#475569', fontWeight: '700', fontSize: '0.85rem', backgroundColor: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              🗓️ {tm.date || tm.scheduledDate || 'Milestone Target'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Payment Popup Modal with UPI QR Code */}
      {isPayModalOpen && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={() => setIsPayModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '52px', height: '52px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                <QrCode size={28} />
              </div>
              <h3 style={{ margin: '0 0 0.2rem 0', color: '#0f172a', fontSize: '1.3rem', fontWeight: '800' }}>Scan & Pay via UPI QR</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                Invoice: <strong>{selectedInvoice.invoiceNumber}</strong> • {selectedInvoice.title}
              </p>
            </div>

            {/* Payable Amount Summary */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '0.2rem' }}>Total Payable Amount</span>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#16a34a', letterSpacing: '-0.02em' }}>
                ₹{selectedInvoice.amount?.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Live Generated UPI QR Code Card */}
            <div style={{ backgroundColor: '#ffffff', border: '2px dashed #2563eb', borderRadius: '16px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)' }}>
              <div style={{ display: 'inline-block', padding: '10px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '0.75rem' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=interiorcraft@upi&pn=InteriorCraftStudio&am=${selectedInvoice.amount}&tn=Invoice_${selectedInvoice.invoiceNumber}&cu=INR`)}`}
                  alt="UPI Payment QR Code"
                  style={{ width: '170px', height: '170px', display: 'block', borderRadius: '8px' }}
                />
              </div>

              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="#2563eb" /> Scan with any UPI App (GPay / PhonePe / Paytm / BHIM)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.3rem 0.75rem', borderRadius: '9999px', display: 'inline-block', fontWeight: '600' }}>
                UPI VPA: <span style={{ color: '#2563eb', fontWeight: '800' }}>interiorcraft@upi</span>
              </div>
            </div>

            {/* Payment Confirmation Action */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={() => setIsPayModalOpen(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmSimulatedPayment}
                style={{ flex: 1.5, padding: '0.75rem', borderRadius: '10px', border: 'none', backgroundColor: '#16a34a', color: '#ffffff', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)' }}
              >
                {isProcessingPayment ? 'Verifying Payment...' : '✅ I Have Completed Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payment Receipt Modal */}
      {selectedReceipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '580px', width: '100%', padding: '2rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={() => setSelectedReceipt(null)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>

            {/* Receipt Header Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2563eb', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: '800', fontSize: '1.1rem' }}>
                  <Sparkles size={20} /> InteriorCraft Studio
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Official Payment Receipt</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '800' }}>
                  RECEIPT CONFIRMED ✔
                </span>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Date: {selectedReceipt.paidAt || selectedReceipt.paidDate ? new Date(selectedReceipt.paidAt || selectedReceipt.paidDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Receipt Content Details */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Receipt For Client:</span>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{project?.clientName || user?.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Invoice Number:</span>
                  <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>{selectedReceipt.invoiceNumber}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Project Name:</span>
                  <strong style={{ color: '#0f172a' }}>{project?.projectName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Payment Mode:</span>
                  <strong style={{ color: '#16a34a' }}>Online / Digital Transfer</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '1rem' }}>Total Paid Amount:</span>
                <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '1.3rem' }}>₹{selectedReceipt.amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
              >
                <Download size={15} /> Print / Save Receipt PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT UPLOAD SITE PHOTO MODAL */}
      {isPhotoModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '18px', maxWidth: '520px', width: '100%', padding: '1.75rem', border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }}>
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.25rem', fontWeight: '800' }}>Upload Site Photo & Details</h3>
            <p style={{ margin: '0 0 1.25rem 0', color: '#64748b', fontSize: '0.85rem' }}>
              Provide room photos and square footage to enable automated tile & material estimation for your designer.
            </p>

            <form onSubmit={handleUploadSitePhoto} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Photo Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Floor Site View"
                  value={photoForm.title}
                  onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Room Category *</label>
                <select
                  value={photoForm.roomType}
                  onChange={(e) => setPhotoForm({ ...photoForm, roomType: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none' }}
                >
                  <option value="Living Room">Living Room</option>
                  <option value="Modular Kitchen">Modular Kitchen</option>
                  <option value="Master Bedroom">Master Bedroom</option>
                  <option value="Bathroom / Washroom">Bathroom / Washroom</option>
                  <option value="Dining & Balcony">Dining & Balcony</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.4rem' }}>
                  Upload Room Image *
                </label>

                {/* Upload Icon Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <label
                    title="Upload Site Image"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justify: 'center',
                      width: '46px',
                      height: '46px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                      transition: 'transform 0.2s ease, backgroundColor 0.2s ease'
                    }}
                  >
                    <Upload size={22} />
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPhotoForm(prev => ({
                              ...prev,
                              fileUrl: reader.result,
                              title: prev.title || file.name.replace(/\.[^/.]+$/, "")
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <span style={{ fontSize: '0.85rem', color: photoForm.fileUrl ? '#16a34a' : '#64748b', fontWeight: '600' }}>
                    {photoForm.fileUrl ? '✔ Photo Attached' : 'Click icon to select image'}
                  </span>
                </div>

                {/* Hidden input to maintain form required validation */}
                <input
                  type="hidden"
                  required
                  value={photoForm.fileUrl}
                />

                {/* Image Live Preview */}
                {photoForm.fileUrl && (
                  <div style={{ marginTop: '0.65rem', padding: '0.6rem', borderRadius: '10px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={photoForm.fileUrl} alt="Preview" style={{ width: '55px', height: '55px', objectFit: 'cover', borderRadius: '8px' }} />
                    <span style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: '700' }}>✔ Image selected & ready for calculation!</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Estimated Area (Sq. Feet) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 200"
                  value={photoForm.sqFeet}
                  onChange={(e) => setPhotoForm({ ...photoForm, sqFeet: Number(e.target.value) })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid #2563eb', backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.3rem', fontWeight: '700' }}>
                  🧱 Auto Tile Estimation: ~{Math.ceil(((Number(photoForm.sqFeet) || 0) / 4) * 1.1)} Tiles required (Standard 2x2 ft tiles + 10% wastage)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#334155', marginBottom: '0.3rem' }}>Special Instructions / Designer Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Italian marble finish tiles preferred for living room flooring..."
                  value={photoForm.notes}
                  onChange={(e) => setPhotoForm({ ...photoForm, notes: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingPhoto}
                  style={{ padding: '0.65rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}
                >
                  {isUploadingPhoto ? 'Uploading...' : '📤 Submit Site Photo & Estimates'}
                </button>
              </div>
            </form>
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

